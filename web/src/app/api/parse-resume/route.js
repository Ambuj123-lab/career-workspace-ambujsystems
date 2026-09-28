import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB ceiling
const MAX_RESUME_CHARS = 15000;
const PARSE_TIMEOUT_MS = 20000;

/**
 * Extract text from PDF buffer using:
 * 1. Primary: unpdf (Serverless-optimized, worker-free, pure JS)
 * 2. Secondary: Gemini Multimodal Vision / Document OCR (Handles scanned PDFs, image-only resumes, custom font encodings)
 * 3. Fallback: Stream text tokens from raw binary buffer
 */
async function parsePdfBuffer(buffer) {
  // 1. Primary: unpdf (Instant, serverless-safe, zero external binaries)
  try {
    const { getDocumentProxy, extractText } = await import("unpdf");
    const uint8 = new Uint8Array(buffer);
    const pdf = await getDocumentProxy(uint8);
    const { text } = await extractText(pdf, { mergePages: true });
    if (text && text.trim().length > 20) {
      return text.trim();
    }
    console.warn("[parsePdfBuffer] unpdf returned short/empty text, attempting Gemini OCR...");
  } catch (err) {
    console.warn("[parsePdfBuffer] unpdf extraction warning:", err?.message || err);
  }

  // 2. Secondary: Gemini Multimodal Vision OCR Fallback
  // Perfect for scanned resumes or PDFs with non-standard font maps
  try {
    if (process.env.GEMINI_API_KEY) {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
      const base64Data = buffer.toString("base64");
      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Data,
            mimeType: "application/pdf",
          },
        },
        "Extract all readable text, experience, skills, education, and contact details from this resume document. Output ONLY the extracted text in plain text, preserving headings and line breaks. Do not summarize or add commentary.",
      ]);
      const geminiText = result?.response?.text();
      if (geminiText && geminiText.trim().length > 20) {
        return geminiText.trim();
      }
    }
  } catch (geminiErr) {
    console.warn("[parsePdfBuffer] Gemini OCR fallback warning:", geminiErr?.message || geminiErr);
  }

  // 3. Fallback: Stream text tokens from raw PDF buffer
  const str = buffer.toString("binary");
  const textMatches = [];
  const regex = /\(([^)]+)\)\s*Tj/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    if (match[1] && match[1].length > 1) {
      textMatches.push(match[1]);
    }
  }
  const fallbackText = textMatches.join(" ").trim();
  if (fallbackText.length > 20) return fallbackText;

  throw new Error("Could not extract readable text from PDF. Ensure the PDF contains readable text or upload DOCX/TXT.");
}

export async function POST(req) {
  try {
    // 1. IP Rate Limiting
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(clientIp, { limit: 15, windowMs: 60000 });
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

    // 3. File Type Whitelist
    const allowedExts = ["pdf", "docx", "txt", "md"];
    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file format (.${ext}). Only PDF (.pdf), Word (.docx), or Text (.txt) files are accepted.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Magic Byte Integrity Check
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

    // 5. Document Parser with Decompression Timeout Guard
    const parsePromise = (async () => {
      if (ext === "pdf") {
        return await parsePdfBuffer(buffer);
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

    // Smart Contact & Identity Entity Extraction
    const lines = sanitizedText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    let detectedName = null;
    if (lines.length > 0 && lines[0].length < 50 && !/resume|curriculum|cv|profile|contact/i.test(lines[0])) {
      detectedName = lines[0].replace(/[^a-zA-Z\s.-]/g, "").trim();
    }

    const emailMatch = sanitizedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const githubMatch = sanitizedText.match(/github\.com\/([a-zA-Z0-9_-]+)/i);
    const linkedinMatch = sanitizedText.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);

    const entities = {
      name: detectedName,
      email: emailMatch ? emailMatch[0] : null,
      github: githubMatch ? `https://github.com/${githubMatch[1]}` : null,
      linkedin: linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : null,
    };

    return NextResponse.json({
      success: true,
      entities,
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
