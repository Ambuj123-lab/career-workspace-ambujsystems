import { Langfuse } from "langfuse";

let langfuseInstance = null;

export function getLangfuse() {
  if (langfuseInstance) return langfuseInstance;

  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const baseUrl = process.env.LANGFUSE_BASE_URL || "https://us.cloud.langfuse.com";

  if (!publicKey || !secretKey) {
    return null;
  }

  try {
    langfuseInstance = new Langfuse({
      publicKey,
      secretKey,
      baseUrl,
      flushAt: 1,
      flushInterval: 200,
    });
    return langfuseInstance;
  } catch (err) {
    console.warn("[Langfuse] Failed to initialize client:", err.message);
    return null;
  }
}

/**
 * Safely record an LLM generation trace with evaluation scores
 */
export async function recordTrace({
  name,
  input,
  output,
  model = "gemini-3.5-flash-lite",
  metadata = {},
  scores = [],
}) {
  const langfuse = getLangfuse();
  if (!langfuse) return null;

  try {
    const trace = langfuse.trace({
      name,
      input,
      output,
      metadata: {
        timestamp: new Date().toISOString(),
        runtime: "nextjs-app-router",
        ...metadata,
      },
    });

    trace.generation({
      name: `${name}-generation`,
      model,
      input,
      output,
      metadata,
    });

    if (Array.isArray(scores)) {
      for (const score of scores) {
        if (score.name && score.value !== undefined) {
          trace.score({
            name: score.name,
            value: score.value,
            comment: score.comment,
          });
        }
      }
    }

    langfuse.flushAsync().catch(() => {});
    return trace;
  } catch (err) {
    console.warn(`[Langfuse] Error recording trace for "${name}":`, err.message);
    return null;
  }
}
