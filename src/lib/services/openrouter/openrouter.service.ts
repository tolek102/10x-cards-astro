import { OpenRouterError, OpenRouterErrorType } from "./types";
import type { OpenRouterConfig, OpenRouterRequest, OpenRouterResponse, FlashcardCreateDto } from "./types";
import { logger } from "../loggerService";

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly maxRetries: number;
  private readonly timeout: number;
  private readonly baseUrl: string;

  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model ?? "meta-llama/llama-4-maverick:free";
    this.maxRetries = config.maxRetries ?? 3;
    this.timeout = config.timeout ?? 30000;
    this.baseUrl = config.baseUrl ?? "https://openrouter.ai/api/v1";
  }

  public async generateFlashcards(text: string): Promise<FlashcardCreateDto[]> {
    try {
      const response = await this.retryRequest(() => this.makeRequest(text), this.maxRetries);
      const flashcards = await this.parseAIResponse(response);
      return await this.validateGeneratedFlashcards(flashcards);
    } catch (error) {
      this.handleApiError(error as Error);
      throw error;
    }
  }

  private async makeRequest(text: string): Promise<OpenRouterResponse> {
    const request = this.formatPrompt(text);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new OpenRouterError(
          this.getErrorTypeFromStatus(response.status),
          `API request failed with status ${response.status}: ${response.statusText}. Response: ${responseText}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof OpenRouterError) {
        throw error;
      }
      if ((error as Error).name === "AbortError") {
        throw new OpenRouterError(OpenRouterErrorType.TIMEOUT_ERROR, "Request timed out", error);
      }
      throw new OpenRouterError(OpenRouterErrorType.NETWORK_ERROR, "Failed to communicate with OpenRouter API", error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async parseAIResponse(response: OpenRouterResponse): Promise<FlashcardCreateDto[]> {
    try {
      if (!response.choices || !Array.isArray(response.choices) || response.choices.length === 0) {
        throw new OpenRouterError(
          OpenRouterErrorType.GENERATION_ERROR,
          `Invalid response structure: missing or empty choices array. Response: ${JSON.stringify(response)}`
        );
      }

      const firstChoice = response.choices[0];
      if (!firstChoice.message || typeof firstChoice.message.content !== "string") {
        throw new OpenRouterError(
          OpenRouterErrorType.GENERATION_ERROR,
          `Invalid message structure in first choice. Choice: ${JSON.stringify(firstChoice)}`
        );
      }

      const content = firstChoice.message.content;
      if (!content) {
        throw new OpenRouterError(OpenRouterErrorType.GENERATION_ERROR, "Empty content in AI response");
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(content) as { front: string; back: string }[];
      } catch (parseError) {
        throw new OpenRouterError(
          OpenRouterErrorType.GENERATION_ERROR,
          `Failed to parse content as JSON: ${content}`,
          parseError
        );
      }

      if (!Array.isArray(parsedContent)) {
        throw new OpenRouterError(
          OpenRouterErrorType.GENERATION_ERROR,
          `Expected array of flashcards, got: ${typeof parsedContent}`
        );
      }

      return parsedContent.map((card) => ({
        ...card,
        source: "AI" as const,
        candidate: true,
      }));
    } catch (error) {
      if (error instanceof OpenRouterError) {
        throw error;
      }
      throw new OpenRouterError(OpenRouterErrorType.GENERATION_ERROR, "Failed to parse AI response", error);
    }
  }

  private async validateGeneratedFlashcards(flashcards: FlashcardCreateDto[]): Promise<FlashcardCreateDto[]> {
    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      throw new OpenRouterError(OpenRouterErrorType.VALIDATION_ERROR, "No valid flashcards generated");
    }

    const validatedCards = flashcards.filter(
      (card) =>
        typeof card.front === "string" &&
        typeof card.back === "string" &&
        card.front.trim().length > 0 &&
        card.back.trim().length > 0
    );

    if (validatedCards.length === 0) {
      throw new OpenRouterError(OpenRouterErrorType.VALIDATION_ERROR, "All generated flashcards were invalid");
    }

    return validatedCards;
  }

  private handleApiError(error: Error): void {
    // In a real implementation, this would log to a monitoring service
    logger.error("OpenRouter API Error:", { error });
  }

  private formatPrompt(text: string): OpenRouterRequest {
    return {
      model: this.model,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI that creates high-quality educational flashcards. " +
            "Generate concise, clear, and accurate flashcards from the provided text. " +
            "Each flashcard should have a clear question on the front and a comprehensive answer on the back. " +
            "Return the flashcards only in requested JSON response format without any other text or thinking section. ",
          // "Don`t put response in ```json``` tags. " +
          // "Only allowed format is: " +
          // "{" +
          // "  \"flashcards\": [" +
          // "    {" +
          // "      \"front\": \"Question\"," +
          // "      \"back\": \"Answer\"" +
          // "    }" +
          // "  ]" +
          // "}"
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "flashcards",
          strict: true,
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                front: { type: "string" },
                back: { type: "string" },
              },
              required: ["front", "back"],
            },
          },
        },
      },
    };
  }

  private getErrorTypeFromStatus(status: number): OpenRouterErrorType {
    switch (status) {
      case 401:
        return OpenRouterErrorType.AUTHENTICATION_ERROR;
      case 429:
        return OpenRouterErrorType.RATE_LIMIT_ERROR;
      case 400:
        return OpenRouterErrorType.VALIDATION_ERROR;
      case 500:
        return OpenRouterErrorType.MODEL_ERROR;
      default:
        return OpenRouterErrorType.UNKNOWN_ERROR;
    }
  }

  private async retryRequest<T>(fn: () => Promise<T>, retries: number): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        await this.delay(this.getRetryDelay(this.maxRetries - retries));
        return this.retryRequest(fn, retries - 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof OpenRouterError) {
      return error.type === OpenRouterErrorType.NETWORK_ERROR || error.type === OpenRouterErrorType.RATE_LIMIT_ERROR;
    }
    return false;
  }

  private getRetryDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 10000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
