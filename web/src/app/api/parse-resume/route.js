import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB ceiling
const MAX_RESUME_CHARS = 15000;
const MAX_PDF_PAGES = 10;
const PARSE_TIMEOUT_MS = 5000; // 5s timeout defense against decompression bombs

export async function POST(req) {
  try {
    // 1. IP Rate Limiting (Defense against automated bombing scripts)
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(clientIp, { limit: 10, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Please wait ${rateCheck.resetSeconds} seconds before uploading another document.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetSeconds) } }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = file.name || "uploaded_resume";
    const sizeBytes = file.size || 0;
    const ext = filename.split(".").pop()?.toLowerCase();

    // 2. Strict File Size Boundary
    if (sizeBytes > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size (${(sizeBytes / 1024 / 1024).toFixed(1)}MB) exceeds maximum 5MB security limit.` },
        { status: 400 }
      );
    }

    // 3. File Type Whitelist (Strict: No zip, tar, exe, bin)
    const allowedExts = ["pdf", "docx", "txt", "md"];
    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file format (.${ext}). Only PDF (.pdf), Word (.docx), or Text (.txt) files are accepted.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Magic Byte Integrity Check: Prevent fake renamed ZIP bombs pretending to be PDFs
    if (ext === "pdf") {
      const headerStr = buffer.slice(0, 5).toString("ascii");
      if (!headerStr.startsWith("%PDF-")) {
        return NextResponse.json(
          { error: "Invalid file signature. File is not a valid PDF document." },
          { status: 422 }
        );
      }
    }

    let extractedText = "";

    // 5. Document Parser with Decompression Timeout Guard (PDF Bomb Defense)
    const parsePromise = (async () => {
      if (ext === "pdf") {
        const uint8 = new Uint8Array(buffer);
        const parser = new PDFParse(uint8);
        await parser.load();

        // Page Count Guard
        const numPages = parser.doc?.numPages || 1;
        if (numPages > MAX_PDF_PAGES) {
          throw new Error(`Document contains ${numPages} pages. Resumes cannot exceed ${MAX_PDF_PAGES} pages.`);
        }

        const res = await parser.getText();
        return typeof res === "string" ? res : res.text || "";
      } else if (ext === "docx") {
        const docxRes = await mammoth.extractRawText({ buffer });
        return docxRes.value || "";
      } else {
        return buffer.toString("utf-8");
      }
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Document parsing timed out. Possible complex or malformed file.")), PARSE_TIMEOUT_MS)
    );

    try {
      extractedText = await Promise.race([parsePromise, timeoutPromise]);
    } catch (parseErr) {
      console.error("Document parse failed:", parseErr.message);
      return NextResponse.json(
        { error: parseErr.message || "Failed to process document content." },
        { status: 422 }
      );
    }

    // 6. Security Sanitization & Prompt Injection Scrubbing
    let sanitizedText = extractedText
      .replace(/\0/g, "")
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .trim();

    const injectionPatterns = [
      /ignore (all )?previous instructions/i,
      /you are now DAN/i,
      /<\|im_start\|>/i,
      /system prompt:/i,
    ];
    let injectionCount = 0;
    injectionPatterns.forEach((p) => {
      if (p.test(sanitizedText)) {
        injectionCount++;
        sanitizedText = sanitizedText.replace(p, "[REDACTED_PROMPT_INJECTION]");
      }
    });

    // 7. Structural Metadata Extraction
    const sections = [];
    if (/experience|work history|employment/i.test(sanitizedText)) sections.push("Work Experience");
    if (/projects?|portfolio/i.test(sanitizedText)) sections.push("Key Projects");
    if (/skills?|technologies|tools|stack/i.test(sanitizedText)) sections.push("Technical Skills");
    if (/education|degree|university/i.test(sanitizedText)) sections.push("Education");

    const metricMatches = sanitizedText.match(/\b\d+(?:\.\d+)?(?:%|\+|x|k|M|ms|s)?\b/g) || [];
    const wordCount = sanitizedText.split(/\s+/).filter(Boolean).length;

    // Hard ceiling truncation
    let truncated = false;
    if (sanitizedText.length > MAX_RESUME_CHARS) {
      sanitizedText = sanitizedText.substring(0, MAX_RESUME_CHARS);
      truncated = true;
    }

    return NextResponse.json({
      success: true,
      filename,
      size_kb: Math.round(sizeBytes / 1024),
      char_count: sanitizedText.length,
      word_count: wordCount,
      truncated,
      text: sanitizedText,
      metadata: {
        sections_detected: sections,
        metrics_count: metricMatches.length,
        clean_security_scan: injectionCount === 0,
        injection_markers: injectionCount,
        format: ext.toUpperCase(),
      },
    });
  } catch (err) {
    console.error("Parse resume error:", err);
    return NextResponse.json({ error: err.message || "Failed to process resume file" }, { status: 500 });
  }
}
