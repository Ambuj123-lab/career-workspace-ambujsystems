import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const PRIMARY_MODEL = process.env.GEMINI_PRIMARY_MODEL || "gemini-3.5-flash-lite";
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-3.1-flash-lite-preview";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free";

// ===== CIRCUIT BREAKER STATE MACHINE =====
const CircuitState = {
  CLOSED: "CLOSED",       // Normal: requests go through
  OPEN: "OPEN",           // Tripped: fail fast to protect server
  HALF_OPEN: "HALF_OPEN", // Testing canary request
};

const circuit = {
  state: CircuitState.CLOSED,
  failureCount: 0,
  failureThreshold: 5,        // Trip after 5 consecutive failures
  cooldownPeriodMs: 30000,    // 30s cooldown before trying canary
  lastFailureTime: 0,
  successThreshold: 2,
  consecutiveSuccesses: 0,
};

function checkCircuit() {
  const now = Date.now();
  if (circuit.state === CircuitState.OPEN) {
    if (now - circuit.lastFailureTime > circuit.cooldownPeriodMs) {
      console.warn("[CircuitBreaker] Cooldown elapsed. Transitioning from OPEN to HALF_OPEN.");
      circuit.state = CircuitState.HALF_OPEN;
      return true; // allow canary
    }
    const waitSec = Math.ceil((circuit.cooldownPeriodMs - (now - circuit.lastFailureTime)) / 1000);
    return false; // Circuit is OPEN
  }
  return true;
}

function recordSuccess() {
  if (circuit.state === CircuitState.HALF_OPEN) {
    circuit.consecutiveSuccesses++;
    if (circuit.consecutiveSuccesses >= circuit.successThreshold) {
      console.log("[CircuitBreaker] Canary succeeded. Circuit reset to CLOSED.");
      circuit.state = CircuitState.CLOSED;
      circuit.failureCount = 0;
      circuit.consecutiveSuccesses = 0;
    }
  } else {
    circuit.failureCount = 0;
  }
}

function recordFailure(err) {
  circuit.lastFailureTime = Date.now();
  circuit.failureCount++;
  console.warn(`[CircuitBreaker] Failure recorded (${circuit.failureCount}/${circuit.failureThreshold}): ${err.message}`);

  if (circuit.failureCount >= circuit.failureThreshold || circuit.state === CircuitState.HALF_OPEN) {
    console.error("[CircuitBreaker] Trip condition met. Circuit state is now OPEN.");
    circuit.state = CircuitState.OPEN;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Tertiary fallback using OpenRouter API.
 * Configurable via OPENROUTER_MODEL env var (defaults to nvidia/nemotron-3-ultra-550b-a55b:free).
 * Allows the user to freely change the OpenRouter model in .env or Vercel.
 * Also configures OpenRouter-native fallback models so free-tier pool rate limits don't break generation.
 */
async function callOpenRouter(config, prompt, systemInstruction = null) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const model = process.env.OPENROUTER_MODEL || OPENROUTER_MODEL;
  const messages = [];

  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }

  let userPrompt = prompt;
  if (Array.isArray(prompt)) {
    userPrompt = prompt
      .map((p) => (typeof p === "string" ? p : p.text || JSON.stringify(p)))
      .join("\n\n");
  } else if (typeof prompt !== "string") {
    userPrompt = JSON.stringify(prompt);
  }

  messages.push({ role: "user", content: userPrompt });

  // OpenRouter models array: primary chosen model first, followed by resilient free backups
  const modelList = [model];
  if (model.includes(":free")) {
    if (model !== "nvidia/nemotron-3-ultra-550b-a55b:free") modelList.push("nvidia/nemotron-3-ultra-550b-a55b:free");
    if (model !== "liquid/lfm-2.5-2.6b:free") modelList.push("liquid/lfm-2.5-2.6b:free");
  }

  const payload = {
    model: model,
    models: modelList,
    messages: messages,
    temperature: typeof config?.temperature === "number" ? config.temperature : 0.3,
  };

  if (config?.responseMimeType === "application/json") {
    payload.response_format = { type: "json_object" };
  }

  console.log(`[OpenRouter Fallback] Initiating 3rd-tier fallback with model: ${model} (models list: ${modelList.join(", ")})...`);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://career-workspace-ambujsystems.vercel.app",
      "X-Title": "CoverCraft AI",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const errorMsg = data.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(`[OpenRouter Error] ${errorMsg}`);
  }

  let text = data.choices?.[0]?.message?.content || "";

  // Clean Markdown JSON wrapper if returned (e.g. ```json ... ```)
  if (config?.responseMimeType === "application/json") {
    const trimmed = text.trim();
    if (trimmed.startsWith("```")) {
      text = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    }
  }

  const usage = data.usage || {};
  const tokenUsage = {
    promptTokens: usage.prompt_tokens || 0,
    completionTokens: usage.completion_tokens || 0,
    totalTokens: usage.total_tokens || 0,
  };

  const resolvedModel = data.model || model;
  console.log(`[OpenRouter Fallback] Model ${resolvedModel} succeeded. Tokens: ${tokenUsage.totalTokens} (in: ${tokenUsage.promptTokens}, out: ${tokenUsage.completionTokens})`);

  return { text, model: `openrouter/${resolvedModel}`, tokenUsage };
}

/**
 * 3-Tier Multi-Provider LLM Pipeline:
 * Tier 1: Gemini Primary (gemini-3.5-flash-lite or GEMINI_PRIMARY_MODEL)
 * Tier 2: Gemini Secondary Fallback (gemini-3.1-flash-lite-preview or GEMINI_FALLBACK_MODEL)
 * Tier 3: OpenRouter Tertiary Fallback (nvidia/nemotron-3-ultra-550b-a55b:free or OPENROUTER_MODEL)
 *
 * @param {object} config - { temperature, responseMimeType }
 * @param {string|Array} prompt - The user prompt or content parts
 * @param {string} systemInstruction - Developer/System policy instruction
 * @returns {Promise<{ text: string, model: string, tokenUsage: { promptTokens: number, completionTokens: number, totalTokens: number } }>}
 */
export async function generateWithFallback(config, prompt, systemInstruction = null) {
  const geminiAllowed = checkCircuit();
  let lastError = null;

  // If Gemini circuit is not OPEN, attempt Gemini Tier 1 and Tier 2
  if (geminiAllowed) {
    const models = [PRIMARY_MODEL, FALLBACK_MODEL];

    for (const modelName of models) {
      const maxRetries = 2; // 2 retries with exponential backoff per model

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            const backoffMs = Math.min(500 * Math.pow(2, attempt - 1) + Math.random() * 250, 4000);
            console.log(`[Gemini Retry] ${modelName} attempt ${attempt + 1}/${maxRetries + 1} after ${Math.round(backoffMs)}ms backoff...`);
            await sleep(backoffMs);
          }

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

          // Extract token usage metadata from Gemini response
          const usage = result.response.usageMetadata || {};
          const tokenUsage = {
            promptTokens: usage.promptTokenCount || 0,
            completionTokens: usage.candidatesTokenCount || 0,
            totalTokens: usage.totalTokenCount || 0,
          };

          console.log(`[Gemini] Model ${modelName} succeeded. Tokens: ${tokenUsage.totalTokens} (in: ${tokenUsage.promptTokens}, out: ${tokenUsage.completionTokens})`);
          recordSuccess();

          return { text, model: modelName, tokenUsage };
        } catch (err) {
          lastError = err;
          const isTransient = /503|429|resource exhausted|overloaded|fetch failed|timeout/i.test(err.message);

          console.warn(`[Gemini Attempt Failed] ${modelName} (attempt ${attempt + 1}): ${err.message}`);

          if (!isTransient) {
            break;
          }
        }
      }

      console.warn(`[Gemini Model Exhausted] ${modelName} failed after retries. Moving to next fallback...`);
    }

    // Both Gemini models failed
    recordFailure(lastError);
  } else {
    console.warn("[CircuitBreaker: OPEN] Gemini API experiencing downtime. Skipping to 3rd-tier OpenRouter fallback...");
  }

  // Tier 3: OpenRouter Tertiary Fallback
  if (process.env.OPENROUTER_API_KEY) {
    try {
      console.log(`[Fallback Cascade] Engaging Tier-3 OpenRouter (${process.env.OPENROUTER_MODEL || OPENROUTER_MODEL})...`);
      const openRouterResult = await callOpenRouter(config, prompt, systemInstruction);
      return openRouterResult;
    } catch (openRouterErr) {
      console.error(`[OpenRouter Fallback Failed] ${openRouterErr.message}`);
      lastError = openRouterErr;
    }
  }

  // If all tiers failed
  throw lastError || new Error("All generation providers (Gemini and OpenRouter) failed.");
}
