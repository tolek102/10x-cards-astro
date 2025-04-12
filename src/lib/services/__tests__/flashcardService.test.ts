import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlashcardService } from "../flashcardService";
import { createMockSupabaseClient } from "./setup";
import type { GenerateFlashcardsCommand } from "../../../types";

describe("FlashcardService", () => {
  const mockSupabase = createMockSupabaseClient();
  let service: FlashcardService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FlashcardService(mockSupabase);
  });

  describe("generateFlashcards", () => {
    const mockCommand: GenerateFlashcardsCommand = {
      text: "This is a sample text for testing flashcard generation.",
    };

    it("should generate and store flashcards successfully", async () => {
      const mockFlashcards = [
        {
          id: "1",
          front: "Sample question",
          back: "Sample answer",
          source: "AI",
          candidate: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockResponse = {
        data: mockFlashcards,
        error: null,
      };

      mockSupabase.from().insert().select.mockResolvedValueOnce(mockResponse);

      const result = await service.generateFlashcards(mockCommand);

      expect(result).toEqual(mockFlashcards);
      expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
    });

    it("should throw error when database operation fails", async () => {
      const mockError = new Error("Database error");
      const mockResponse = {
        data: null,
        error: mockError,
      };

      mockSupabase.from().insert().select.mockResolvedValueOnce(mockResponse);

      await expect(service.generateFlashcards(mockCommand)).rejects.toThrow("Failed to store generated flashcards");
    });

    it("should handle empty response from database", async () => {
      const mockResponse = {
        data: null,
        error: null,
      };

      mockSupabase.from().insert().select.mockResolvedValueOnce(mockResponse);

      const result = await service.generateFlashcards(mockCommand);
      expect(result).toEqual([]);
    });
  });
});
