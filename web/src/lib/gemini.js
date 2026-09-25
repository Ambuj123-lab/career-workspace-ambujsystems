import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const PRIMARY_MODEL = "gemini-3.5-flash-lite";
const FALLBACK_MODEL = "gemini-3.8-flash";

/**
 * Attempt generation with primary model, fall back to secondary on failure.
 * Strict trust boundary: passes developer systemInstruction separately from user data.
 * @param {object} config - { temperature, responseMimeType }
 * @param {string|Array} prompt - The user prompt or content parts
 * @param {string} systemInstruction - Developer/System policy instruction
 * @returns {Promise<{ text: string, model: string }>}
 */
export async function generateWithFallback(config, prompt, systemInstruction = null) {
  const models = [PRIMARY_MODEL, FALLBACK_MODEL];

  for (const modelName of models) {
    try {
      const modelOptions = {
        model: modelName,
        generationConfig: config,
      };

      if (systemInstruction) {
        modelOptions.systemInstruction = systemInstruction;
      }

      const model = genAI.getGenerativeModel(modelOptions);
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      console.log(`[Gemini] Used model: ${modelName}`);
      return { text, model: modelName };
    } catch (err) {
      console.warn(`[Gemini] ${modelName} failed: ${err.message}. Trying fallback...`);
      if (modelName === FALLBACK_MODEL) {
        throw err; // Both models failed
      }
    }
  }
}
