import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const PRIMARY_MODEL = "gemini-3.5-flash-lite";
const FALLBACK_MODEL = "gemini-3.8-flash";

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
    throw new Error(`[CircuitBreaker: OPEN] Gemini API service experiencing elevated downtime. Cooling down for ${waitSec}s to prevent cascading failure.`);
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
 * Attempt generation with primary model, retry with exponential backoff, and fall back to secondary model.
 * @param {object} config - { temperature, responseMimeType }
 * @param {string|Array} prompt - The user prompt or content parts
 * @param {string} systemInstruction - Developer/System policy instruction
 * @returns {Promise<{ text: string, model: string, tokenUsage: { promptTokens: number, completionTokens: number, totalTokens: number } }>}
 */
export async function generateWithFallback(config, prompt, systemInstruction = null) {
  checkCircuit();

  const models = [PRIMARY_MODEL, FALLBACK_MODEL];
  let lastError = null;

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

        // If not transient (e.g. invalid argument or fatal prompt rejection), don't retry same model
        if (!isTransient) {
          break;
        }
      }
    }

    console.warn(`[Gemini Model Exhausted] ${modelName} failed after retries. Moving to next fallback...`);
  }

  // If all models and retries failed
  recordFailure(lastError);
  throw lastError;
}
