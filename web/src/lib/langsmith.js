import { Client } from "langsmith";
import crypto from "crypto";

let langsmithClient = null;

export function getLangsmithClient() {
  if (langsmithClient) return langsmithClient;

  const apiKey = process.env.LANGCHAIN_API_KEY;
  if (!apiKey || process.env.LANGCHAIN_TRACING_V2 !== "true") {
    return null;
  }

  try {
    langsmithClient = new Client({
      apiKey,
      apiUrl: process.env.LANGCHAIN_ENDPOINT || "https://api.smith.langchain.com",
    });
    return langsmithClient;
  } catch (err) {
    console.warn("[LangSmith] Failed to initialize client:", err.message);
    return null;
  }
}

/**
 * Safely record an LLM or Agent run in LangSmith
 */
export async function recordLangsmithRun({
  name,
  runType = "chain",
  inputs = {},
  outputs = {},
  extra = {},
  sessionId = null,
}) {
  const client = getLangsmithClient();
  if (!client) return null;

  try {
    const projectName = process.env.LANGCHAIN_PROJECT || "CoverCraft-AI";
    const startTime = Date.now() - 350;
    const endTime = Date.now();

    await client.createRun({
      id: crypto.randomUUID(),
      name,
      run_type: runType,
      inputs,
      outputs,
      project_name: projectName,
      start_time: startTime,
      end_time: endTime,
      extra: {
        runtime: "nextjs-app-router",
        session_id: sessionId || undefined,
        ...extra,
      },
    });

    if (client.awaitPendingTraceBatches) {
      await client.awaitPendingTraceBatches();
    }
  } catch (err) {
    console.warn(`[LangSmith] Error recording run "${name}":`, err.message);
    return null;
  }
}
