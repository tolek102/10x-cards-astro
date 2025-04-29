import type {
  FlashcardDto,
  FlashcardsCreateCommand,
  FlashcardsListResponseDto,
  GenerateFlashcardsCommand,
} from "@/types";

const API_BASE_URL = "/api";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FlashcardsService {
  static async generateFlashcards(command: GenerateFlashcardsCommand): Promise<FlashcardDto[]> {
    const response = await fetch(`${API_BASE_URL}/flashcards/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      throw new Error("Wystąpił problem podczas generowania fiszek. Sprawdź wprowadzony tekst i spróbuj ponownie.");
    }

    return response.json();
  }

  static async createFlashcards(command: FlashcardsCreateCommand): Promise<FlashcardDto[]> {
    const response = await fetch(`${API_BASE_URL}/flashcards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command.flashcards[0]),
    });

    if (!response.ok) {
      throw new Error("Wystąpił problem podczas tworzenia fiszki. Sprawdź wprowadzone dane i spróbuj ponownie.");
    }

    const flashcard = await response.json();
    return [flashcard];
  }

  static async getFlashcards(page = 1, limit = 10): Promise<FlashcardsListResponseDto> {
    const response = await fetch(`${API_BASE_URL}/flashcards?page=${page}&limit=${limit}`);

    if (!response.ok) {
      throw new Error("Wystąpił problem podczas pobierania fiszek. Spróbuj odświeżyć stronę.");
    }

    return response.json();
  }

  static async getCandidates(page = 1, limit = 10): Promise<FlashcardsListResponseDto> {
    const response = await fetch(`${API_BASE_URL}/flashcards/candidates?page=${page}&limit=${limit}`);

    if (!response.ok) {
      throw new Error("Wystąpił problem podczas pobierania kandydatów na fiszki. Spróbuj odświeżyć stronę.");
    }

    return response.json();
  }

  static async updateFlashcard(id: string, flashcard: Partial<FlashcardDto>): Promise<FlashcardDto> {
    const response = await fetch(`${API_BASE_URL}/flashcards/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(flashcard),
    });

    if (!response.ok) {
      throw new Error("Wystąpił problem podczas aktualizacji fiszki. Sprawdź wprowadzone dane i spróbuj ponownie.");
    }

    return response.json();
  }

  static async deleteFlashcard(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/flashcards/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Wystąpił problem podczas usuwania fiszki. Spróbuj ponownie później.");
    }
  }

  static async acceptFlashcard(id: string): Promise<FlashcardDto> {
    const response = await fetch(`${API_BASE_URL}/flashcards/${id}/accept`, {
      method: "PATCH",
    });

    if (!response.ok) {
      throw new Error("Wystąpił problem podczas akceptowania fiszki. Spróbuj ponownie później.");
    }

    return response.json();
  }

  static async discardFlashcard(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/flashcards/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Wystąpił problem podczas odrzucania fiszki. Spróbuj ponownie później.");
    }
  }
}
