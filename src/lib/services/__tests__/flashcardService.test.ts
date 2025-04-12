import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlashcardService } from "../flashcardService";
import type { GenerateFlashcardsCommand, FlashcardCreateDto, FlashcardDto } from "../../../types";
import type { SupabaseClient } from "../../../db/supabase.client";
import type { PostgrestError } from "@supabase/supabase-js";

// Type for our minimal mock implementation
type MinimalSupabaseClient = Pick<SupabaseClient, "from">;

describe("FlashcardService", () => {
  const mockSupabaseChain = {
    data: null as FlashcardDto[] | FlashcardDto | null,
    error: null as PostgrestError | null,
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
  };

  const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
  const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
  const mockUpsert = vi.fn().mockReturnValue(mockSupabaseChain);

  const mockFrom = vi.fn().mockReturnValue({
    insert: mockInsert,
    upsert: mockUpsert,
  });

  const mockSupabase: MinimalSupabaseClient = {
    from: mockFrom,
  };

  let service: FlashcardService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseChain.data = null;
    mockSupabaseChain.error = null;
    service = new FlashcardService(mockSupabase as SupabaseClient);
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
          created_at: "2025-04-12T21:24:01.802Z",
          updated_at: "2025-04-12T21:24:01.803Z",
        },
      ];

      mockSupabaseChain.data = mockFlashcards;
      mockSupabaseChain.error = null;

      const result = await service.generateFlashcards(mockCommand);

      expect(result).toEqual(mockFlashcards);
      expect(mockFrom).toHaveBeenCalledWith("flashcards");
      expect(mockInsert).toHaveBeenCalled();
      expect(mockSelect).toHaveBeenCalled();
    });

    it("should throw error when database operation fails", async () => {
      const mockError: PostgrestError = {
        message: "Database error",
        details: "",
        hint: "",
        code: "23505",
        name: "PostgrestError",
      };
      mockSupabaseChain.data = null;
      mockSupabaseChain.error = mockError;

      await expect(service.generateFlashcards(mockCommand)).rejects.toThrow("Failed to store generated flashcards");
    });

    it("should handle empty response from database", async () => {
      mockSupabaseChain.data = null;
      mockSupabaseChain.error = null;

      const result = await service.generateFlashcards(mockCommand);
      expect(result).toEqual([]);
    });
  });

  describe("createManualFlashcard", () => {
    const mockUserId = "test-user-id";
    const mockCommand: FlashcardCreateDto = {
      front: "Test front",
      back: "Test back",
      source: "MANUAL",
      candidate: false,
    };

    it("should create a flashcard successfully", async () => {
      const mockFlashcard: FlashcardDto = {
        id: "1",
        front: "Test front",
        back: "Test back",
        source: "MANUAL",
        candidate: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabaseChain.data = mockFlashcard;
      mockSupabaseChain.error = null;

      const result = await service.createManualFlashcard(mockUserId, mockCommand);

      expect(result).toEqual(mockFlashcard);
      expect(mockFrom).toHaveBeenCalledWith("flashcards");
      expect(mockInsert).toHaveBeenCalledWith({
        ...mockCommand,
        user_id: mockUserId,
      });
      expect(mockSelect).toHaveBeenCalled();
    });

    it("should throw error when database operation fails", async () => {
      const mockError: PostgrestError = {
        message: "Database error",
        details: "",
        hint: "",
        code: "23505",
        name: "PostgrestError",
      };
      mockSupabaseChain.data = null;
      mockSupabaseChain.error = mockError;

      await expect(service.createManualFlashcard(mockUserId, mockCommand)).rejects.toThrow(
        "Failed to create flashcard"
      );
    });

    it("should throw error when no flashcard is returned", async () => {
      mockSupabaseChain.data = null;
      mockSupabaseChain.error = null;

      await expect(service.createManualFlashcard(mockUserId, mockCommand)).rejects.toThrow("Flashcard was not created");
    });
  });
});
