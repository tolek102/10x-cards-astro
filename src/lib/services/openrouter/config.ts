import type { OpenRouterConfig } from "./types";
import { logger } from "../loggerService";

function validateEnvConfig() {
  const apiKey = import.meta.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables");
  }

  // Log configuration for debugging
  logger.debug("OpenRouter Configuration:", {
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
    apiKey: import.meta.env.OPENROUTER_API_KEY,
    model: import.meta.env.PUBLIC_OPENROUTER_MODEL,
    maxRetries: Number(import.meta.env.PUBLIC_OPENROUTER_MAX_RETRIES) || 3,
    timeout: Number(import.meta.env.PUBLIC_OPENROUTER_TIMEOUT) || 30000,
    baseUrl: import.meta.env.PUBLIC_OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  };
}
