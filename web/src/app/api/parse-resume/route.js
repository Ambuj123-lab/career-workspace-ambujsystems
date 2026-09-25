import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_RESUME_CHARS = 15000;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = file.name || "uploaded_resume";
    const sizeBytes = file.size || 0;
    const ext = filename.split(".").pop()?.toLowerCase();

    // 1. File Size Security Boundary
    if (sizeBytes > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size (${(sizeBytes / 1024 / 1024).toFixed(1)}MB) exceeds maximum 5MB security limit.` },
        { status: 400 }
      );
    }

    // 2. File Type Whitelist
    const allowedExts = ["pdf", "docx", "txt", "md"];
    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file format (.${ext}). Please upload a PDF (.pdf), Word (.docx), or Text (.txt) file.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let extractedText = "";

    // 3. Document Parser Selection
    if (ext === "pdf") {
      try {
        const uint8 = new Uint8Array(buffer);
        const parser = new PDFParse(uint8);
        await parser.load();
        const res = await parser.getText();
        extractedText = typeof res === "string" ? res : res.text || "";
      } catch (pdfErr) {
        console.error("PDF parse error:", pdfErr);
        return NextResponse.json(
          { error: "Could not parse PDF file. Ensure the PDF is not encrypted or password-protected." },
          { status: 422 }
        );
      }
    } else if (ext === "docx") {
      try {
        const docxRes = await mammoth.extractRawText({ buffer });
        extractedText = docxRes.value || "";
      } catch (docxErr) {
        console.error("DOCX parse error:", docxErr);
        return NextResponse.json(
          { error: "Could not parse DOCX document. Please export as PDF or plain text." },
          { status: 422 }
        );
      }
    } else {
      // txt or md
      extractedText = buffer.toString("utf-8");
    }

    // 4. Security Sanitization & Cleaning
    // Remove null bytes and non-printable control characters
    let sanitizedText = extractedText
      .replace(/\0/g, "")
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .trim();

    // Prompt injection check
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

    // 5. Semantic Section & Metric Metadata Extraction
    const sections = [];
    if (/experience|work history|employment/i.test(sanitizedText)) sections.push("Work Experience");
    if (/projects?|portfolio/i.test(sanitizedText)) sections.push("Key Projects");
    if (/skills?|technologies|tools|stack/i.test(sanitizedText)) sections.push("Technical Skills");
    if (/education|degree|university/i.test(sanitizedText)) sections.push("Education");

    const metricMatches = sanitizedText.match(/\b\d+(?:\.\d+)?(?:%|\+|x|k|M|ms|s)?\b/g) || [];
    const wordCount = sanitizedText.split(/\s+/).filter(Boolean).length;
    const charCount = sanitizedText.length;

    // Boundary Truncation Check
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
