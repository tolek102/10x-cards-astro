import type { OpenRouterConfig } from "./types";

async function getEnvVariable(name: string): Promise<string | undefined> {
  try {
    // Próba użycia astro:env w środowisku produkcyjnym
    const { getSecret } = await import("astro:env/server");
    return getSecret(name);
  } catch {
    // Fallback na standardowe zmienne środowiskowe w środowisku testowym
    return import.meta.env[name];
  }
}

async function validateEnvConfig() {
  const apiKey = await getEnvVariable("OPENROUTER_API_KEY");
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables");
  }

  return true;
}

export async function getOpenRouterConfig(): Promise<OpenRouterConfig> {
  await validateEnvConfig();

  const apiKey = await getEnvVariable("OPENROUTER_API_KEY");
  return {
    apiKey: apiKey || "",
    model: import.meta.env.PUBLIC_OPENROUTER_MODEL,
    maxRetries: Number(import.meta.env.PUBLIC_OPENROUTER_MAX_RETRIES) || 3,
    timeout: Number(import.meta.env.PUBLIC_OPENROUTER_TIMEOUT) || 30000,
    baseUrl: import.meta.env.PUBLIC_OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  };
}
