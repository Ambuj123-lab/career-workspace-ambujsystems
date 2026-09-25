import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const PRIMARY_MODEL = "gemini-3.5-flash-lite";
const FALLBACK_MODEL = "gemini-3.8-flash";

/**
 * Attempt generation with primary model, fall back to secondary on failure.
 * @param {object} config - { temperature, responseMimeType }
 * @param {string} prompt - The prompt to send
 * @returns {string} - Raw text response
 */
export async function generateWithFallback(config, prompt) {
  const models = [PRIMARY_MODEL, FALLBACK_MODEL];

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: config,
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Tag which model was used (for debugging / confidence notes)
      console.log(`[Gemini] Used model: ${modelName}`);
      return { text, model: modelName };
    } catch (err) {
      console.warn(`[Gemini] ${modelName} failed: ${err.message}. Trying fallback...`);
      if (modelName === FALLBACK_MODEL) {
        throw err; // Both failed
      }
    }
  }
}
