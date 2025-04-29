export interface OpenRouterConfig {
  apiKey: string;
  model?: string;
  maxRetries?: number;
  timeout?: number;
  baseUrl?: string;
}

export interface FlashcardCreateDto {
  front: string;
  back: string;
  source: "AI";
  candidate: true;
}

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  response_format: {
    type: "json_schema";
    json_schema: {
      name: string;
      strict: boolean;
      schema: {
        type: string;
        items: {
          type: string;
          properties: {
            front: { type: string };
            back: { type: string };
          };
          required: string[];
        };
      };
    };
  };
}

export interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      role: "assistant";
      content: string;
    };
    finish_reason: "stop" | "length" | "content_filter";
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export enum OpenRouterErrorType {
  AUTHENTICATION_ERROR = "błąd_uwierzytelniania",
  RATE_LIMIT_ERROR = "błąd_limitu_żądań",
  MODEL_ERROR = "błąd_modelu",
  VALIDATION_ERROR = "błąd_walidacji",
  GENERATION_ERROR = "błąd_generowania_fiszek",
  NETWORK_ERROR = "błąd_sieci",
  TIMEOUT_ERROR = "błąd_przekroczenia_czasu",
  UNKNOWN_ERROR = "błąd_nieznany",
}

export class OpenRouterError extends Error {
  constructor(
    public type: OpenRouterErrorType,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}
