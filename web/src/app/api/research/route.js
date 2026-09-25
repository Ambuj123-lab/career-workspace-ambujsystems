import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req) {
  try {
    const { company_name } = await req.json();
    if (!company_name) return NextResponse.json({ error: "Company name required" }, { status: 400 });
    if (company_name.length > 200) return NextResponse.json({ error: "Company name too long" }, { status: 400 });
    
    // Use Gemini with google search grounding
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      tools: [{ googleSearch: {} }],
      generationConfig: { temperature: 0.3 },
    });
    
    const prompt = `Research "${company_name}": what they do, their tech stack, recent developments, and engineering culture. ONLY state facts you can verify. If you cannot find information, say "Not found."`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract grounding metadata for sources
    const sources = [];
    const candidate = result.response.candidates?.[0];
    const grounding = candidate?.groundingMetadata;
    if (grounding?.groundingChunks) {
      grounding.groundingChunks.forEach((chunk) => {
        if (chunk.web) {
          sources.push({ url: chunk.web.uri || "", title: chunk.web.title || "", snippet: "" });
        }
      });
    }
    
    // Parse into structured format
    const structModel = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
    });
    
    const structPrompt = `Convert this company research into JSON. ONLY use info from the text below. If something is not mentioned, use empty array or "Not found in sources".

Text:
${text}

Return JSON:
{"description": "...", "tech_stack": ["..."], "recent_news": ["..."], "culture_notes": "..."}`;
    
    const structResult = await structModel.generateContent(structPrompt);
    const data = JSON.parse(structResult.response.text());
    
    return NextResponse.json({
      company: company_name,
      ...data,
      raw_sources: sources,
      confidence: sources.length >= 3 ? "HIGH" : sources.length >= 1 ? "MEDIUM" : "LOW",
    });
  } catch (err) {
    return NextResponse.json({ error: err.message, company: "", raw_sources: [], confidence: "LOW" }, { status: 500 });
  }
}
