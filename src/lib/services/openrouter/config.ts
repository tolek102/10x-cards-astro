import type { OpenRouterConfig } from "./types";

function validateEnvConfig() {
  const apiKey = import.meta.env.PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("PUBLIC_OPENROUTER_API_KEY is not set in environment variables");
  }

  // Log configuration for debugging
  console.debug("OpenRouter Configuration:", {
    apiKey: apiKey ? "***" : undefined,
    model: import.meta.env.PUBLIC_OPENROUTER_MODEL,
    maxRetries: import.meta.env.PUBLIC_OPENROUTER_MAX_RETRIES,
    timeout: import.meta.env.PUBLIC_OPENROUTER_TIMEOUT,
    baseUrl: import.meta.env.PUBLIC_OPENROUTER_BASE_URL,
  });

  return true;
}

export function getOpenRouterConfig(): OpenRouterConfig {
  validateEnvConfig();

  return {
    apiKey: import.meta.env.PUBLIC_OPENROUTER_API_KEY,
    model: import.meta.env.PUBLIC_OPENROUTER_MODEL,
    maxRetries: Number(import.meta.env.PUBLIC_OPENROUTER_MAX_RETRIES) || 3,
    timeout: Number(import.meta.env.PUBLIC_OPENROUTER_TIMEOUT) || 30000,
    baseUrl: import.meta.env.PUBLIC_OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  };
}
