import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlashcardService } from "../flashcardService";
import type { GenerateFlashcardsCommand, FlashcardCreateDto, FlashcardDto } from "../../../types";
import type { SupabaseClient } from "../../../db/supabase.client";
import type { PostgrestError } from "@supabase/supabase-js";

vi.mock("../openrouter/config", () => ({
  getOpenRouterConfig: vi.fn().mockReturnValue({
    apiKey: "test-api-key",
    baseUrl: "https://api.openrouter.ai/api/v1",
  }),
}));

// Mock global fetch
const mockFetchResponse = {
  ok: true,
  json: async () => ({
    choices: [
      {
        message: {
          content: JSON.stringify([
            {
              front: "Sample question",
              back: "Sample answer",
            },
          ]),
        },
      },
    ],
  }),
};

global.fetch = vi.fn().mockResolvedValue(mockFetchResponse);

vi.mock("../openrouter/client", () => ({
  generateFlashcards: vi.fn().mockResolvedValue([
    {
      front: "Sample question",
      back: "Sample answer",
    },
  ]),
}));

// Type for our minimal mock implementation
type MinimalSupabaseClient = Pick<SupabaseClient, "from">;

// Type for mock Supabase chain
interface MockSupabaseChain {
  data: FlashcardDto[] | FlashcardDto | null;
  error: PostgrestError | null;
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  update?: ReturnType<typeof vi.fn>;
}

describe("FlashcardService", () => {
  const mockSupabaseChain: MockSupabaseChain = {
    data: null,
    error: null,
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(function (this: typeof mockSupabaseChain) {
      return { data: this.data, error: this.error };
    }),
  };

  const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
  const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
  const mockUpsert = vi.fn().mockReturnValue(mockSupabaseChain);

  const mockFrom = vi.fn().mockImplementation(() => ({
    insert: mockInsert,
    upsert: mockUpsert,
    ...mockSupabaseChain,
  }));

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
    const mockUserId = "test-user-id";
    const mockCommand: GenerateFlashcardsCommand = {
      text: "This is a sample text for testing flashcard generation.",
    };

    it("should generate and store flashcards successfully", async () => {
      const mockFlashcards: FlashcardDto[] = [
        {
          id: "1",
          front: "Sample question",
          back: "Sample answer",
          source: "AI" as const,
          candidate: true,
          created_at: "2025-04-12T21:24:01.802Z",
          updated_at: "2025-04-12T21:24:01.803Z",
        },
      ];

      mockSupabaseChain.data = mockFlashcards;
      mockSupabaseChain.error = null;

      const result = await service.generateFlashcards(mockUserId, mockCommand);

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

      await expect(service.generateFlashcards(mockUserId, mockCommand)).rejects.toThrow(
        "Failed to store generated flashcards"
      );
    });

    it("should handle empty response from database", async () => {
      mockSupabaseChain.data = null;
      mockSupabaseChain.error = null;

      const result = await service.generateFlashcards(mockUserId, mockCommand);
      expect(result).toEqual([]);
    });
  });

  describe("createManualFlashcard", () => {
    const mockUserId = "test-user-id";
    const mockCommand: FlashcardCreateDto = {
      front: "Test front",
      back: "Test back",
      source: "MANUAL" as const,
      candidate: false,
    };

    it("should create a flashcard successfully", async () => {
      const mockFlashcard: FlashcardDto = {
        id: "1",
        front: "Test front",
        back: "Test back",
        source: "MANUAL" as const,
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
        user_id: "Asd",
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

  describe("getFlashcardById", () => {
    const mockUserId = "test-user-id";
    const mockFlashcardId = "123e4567-e89b-12d3-a456-426614174000";

    it("should fetch a flashcard successfully", async () => {
      const mockFlashcard: FlashcardDto = {
        id: mockFlashcardId,
        front: "Test front",
        back: "Test back",
        source: "MANUAL" as const,
        candidate: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabaseChain.data = mockFlashcard;
      mockSupabaseChain.error = null;

      const result = await service.getFlashcardById(mockUserId, mockFlashcardId);

      expect(result).toEqual(mockFlashcard);
      expect(mockFrom).toHaveBeenCalledWith("flashcards");
      expect(mockSupabaseChain.select).toHaveBeenCalled();
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith("id", mockFlashcardId);
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith("user_id", mockUserId);
      expect(mockSupabaseChain.single).toHaveBeenCalled();
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

      await expect(service.getFlashcardById(mockUserId, mockFlashcardId)).rejects.toThrow("Failed to fetch flashcard");
    });

    it("should throw error when flashcard is not found", async () => {
      mockSupabaseChain.data = null;
      mockSupabaseChain.error = null;

      await expect(service.getFlashcardById(mockUserId, mockFlashcardId)).rejects.toThrow("Flashcard not found");
    });

    it("should throw error when userId is empty", async () => {
      await expect(service.getFlashcardById("", mockFlashcardId)).rejects.toThrow("Missing required parameters");
    });

    it("should throw error when flashcardId is empty", async () => {
      await expect(service.getFlashcardById(mockUserId, "")).rejects.toThrow("Missing required parameters");
    });
  });

  describe("listCandidateFlashcards", () => {
    const mockFlashcards = [
      {
        id: "1",
        front: "Test front 1",
        back: "Test back 1",
        source: "AI",
        candidate: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "2",
        front: "Test front 2",
        back: "Test back 2",
        source: "AI",
        candidate: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should return paginated candidate flashcards", async () => {
      const mockSupabaseChain = {
        data: mockFlashcards,
        error: null,
        count: mockFlashcards.length,
        range: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: mockSelect,
        }),
      } as unknown as SupabaseClient;

      const service = new FlashcardService(mockSupabase);
      const result = await service.listCandidateFlashcards("test-user", {
        page: 1,
        limit: 20,
      });

      expect(result.data).toEqual(mockFlashcards);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: mockFlashcards.length,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
      expect(mockSelect).toHaveBeenCalledWith("*", { count: "exact" });
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith("user_id", "test-user");
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith("candidate", true);
    });

    it("should handle database errors", async () => {
      const mockSupabaseChain = {
        data: null,
        error: {
          message: "Database error",
          details: "",
          hint: "",
          code: "23505",
          name: "PostgrestError",
        },
        count: 0,
        range: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: mockSelect,
        }),
      } as unknown as SupabaseClient;

      const service = new FlashcardService(mockSupabase);

      await expect(
        service.listCandidateFlashcards("test-user", {
          page: 1,
          limit: 20,
        })
      ).rejects.toThrow("Failed to fetch candidate flashcards");
    });

    it("should apply sorting when specified", async () => {
      const mockSupabaseChain = {
        data: mockFlashcards,
        error: null,
        count: mockFlashcards.length,
        range: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: mockSelect,
        }),
      } as unknown as SupabaseClient;

      const service = new FlashcardService(mockSupabase);
      await service.listCandidateFlashcards("test-user", {
        page: 1,
        limit: 20,
        sort: "created_at_desc",
      });

      expect(mockSupabaseChain.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
    });
  });

  describe("updateFlashcard", () => {
    const mockUserId = "test-user-id";
    const mockFlashcardId = "123e4567-e89b-12d3-a456-426614174000";

    const mockFlashcard: FlashcardDto = {
      id: mockFlashcardId,
      front: "Test Question",
      back: "Test Answer",
      source: "AI" as const,
      candidate: true,
      created_at: "2024-02-20T12:00:00Z",
      updated_at: "2024-02-20T12:00:00Z",
    };

    beforeEach(() => {
      vi.clearAllMocks();
      mockSupabaseChain.data = null;
      mockSupabaseChain.error = null;
    });

    it("should update a flashcard successfully", async () => {
      // Setup mock for fetching existing flashcard
      mockSupabaseChain.data = mockFlashcard;
      mockSupabaseChain.error = null;

      const updateCommand = {
        front: "Updated front",
        back: "Updated back",
        candidate: false,
      };

      const expectedUpdate: FlashcardDto = {
        ...mockFlashcard,
        ...updateCommand,
        source: "AI_EDITED", // Should change from AI to AI_EDITED
        updated_at: expect.any(String),
      };

      // Setup mock for update operation
      const mockUpdateChain = {
        ...mockSupabaseChain,
        data: expectedUpdate,
        error: null,
      };

      mockSupabaseChain.update = vi.fn().mockReturnValue(mockUpdateChain);

      const result = await service.updateFlashcard(mockUserId, mockFlashcardId, updateCommand);

      expect(result).toEqual(expectedUpdate);
      expect(mockFrom).toHaveBeenCalledWith("flashcards");
      expect(mockSupabaseChain.select).toHaveBeenCalled();
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith("id", mockFlashcardId);
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith("user_id", mockUserId);
      expect(mockSupabaseChain.update).toHaveBeenCalledWith({
        ...updateCommand,
        source: "AI_EDITED",
        updated_at: expect.any(String),
      });
    });

    it("should preserve source if not AI", async () => {
      const mockDate = "2024-02-20T12:00:00Z";
      const updateCommand = {
        front: "Updated front",
        back: "Updated back",
        source: "MANUAL" as const,
      };

      const existingFlashcard: FlashcardDto = {
        id: mockFlashcardId,
        front: "Old front",
        back: "Old back",
        source: "AI",
        candidate: false,
        created_at: mockDate,
        updated_at: mockDate,
      };

      mockSupabaseChain.data = existingFlashcard;
      mockSupabaseChain.error = null;

      const expectedUpdate: FlashcardDto = {
        ...existingFlashcard,
        front: updateCommand.front,
        back: updateCommand.back,
        source: "AI_EDITED",
        updated_at: expect.any(String),
      };

      const result = await service.updateFlashcard(mockUserId, mockFlashcardId, updateCommand);

      expect(result).toEqual(expectedUpdate);
      expect(mockSupabaseChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          front: updateCommand.front,
          back: updateCommand.back,
          source: "AI_EDITED",
          updated_at: expect.any(String),
        })
      );
    });

    it("should preserve candidate status if not explicitly set to false", async () => {
      mockSupabaseChain.data = mockFlashcard;
      mockSupabaseChain.error = null;

      const updateCommand = {
        front: "Updated front",
        back: "Updated back",
        // candidate not specified
      };

      const expectedUpdate: FlashcardDto = {
        ...mockFlashcard,
        ...updateCommand,
        candidate: true, // Should remain true
        source: "AI_EDITED",
        updated_at: expect.any(String),
      };

      const mockUpdateChain = {
        ...mockSupabaseChain,
        data: expectedUpdate,
        error: null,
      };

      mockSupabaseChain.update = vi.fn().mockReturnValue(mockUpdateChain);

      const result = await service.updateFlashcard(mockUserId, mockFlashcardId, updateCommand);

      expect(result).toEqual(expectedUpdate);
      expect(mockSupabaseChain.update).toHaveBeenCalledWith({
        ...updateCommand,
        candidate: true,
        source: "AI_EDITED",
        updated_at: expect.any(String),
      });
    });

    it("should throw error when flashcard is not found", async () => {
      mockSupabaseChain.data = null;
      mockSupabaseChain.error = null;

      const updateCommand = {
        front: "Updated front",
        back: "Updated back",
      };

      await expect(service.updateFlashcard(mockUserId, mockFlashcardId, updateCommand)).rejects.toThrow(
        "Flashcard not found"
      );
    });

    it("should throw error when fetch operation fails", async () => {
      const mockError: PostgrestError = {
        message: "Database error",
        details: "",
        hint: "",
        code: "23505",
        name: "PostgrestError",
      };
      mockSupabaseChain.data = null;
      mockSupabaseChain.error = mockError;

      const updateCommand = {
        front: "Updated front",
        back: "Updated back",
      };

      await expect(service.updateFlashcard(mockUserId, mockFlashcardId, updateCommand)).rejects.toThrow(
        "Failed to fetch flashcard"
      );
    });

    it("should throw error when update operation fails", async () => {
      mockSupabaseChain.data = mockFlashcard;
      mockSupabaseChain.error = null;

      const updateCommand = {
        front: "Updated front",
        back: "Updated back",
      };

      const mockError: PostgrestError = {
        message: "Database error",
        details: "",
        hint: "",
        code: "23505",
        name: "PostgrestError",
      };

      const mockUpdateChain = {
        ...mockSupabaseChain,
        data: null,
        error: mockError,
      };

      mockSupabaseChain.update = vi.fn().mockReturnValue(mockUpdateChain);

      await expect(service.updateFlashcard(mockUserId, mockFlashcardId, updateCommand)).rejects.toThrow(
        "Failed to update flashcard"
      );
    });
  });

  describe("acceptGeneratedFlashcard", () => {
    const userId = "test-user-id";
    const flashcardId = "test-flashcard-id";

    it("should accept a candidate flashcard successfully", async () => {
      const mockFlashcard = {
        id: flashcardId,
        user_id: userId,
        front: "Test front",
        back: "Test back",
        source: "AI",
        candidate: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockUpdatedFlashcard = {
        ...mockFlashcard,
        candidate: false,
        updated_at: new Date().toISOString(),
      };

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => ({
          data: mockFlashcard,
          error: null,
        })),
      };

      mockSupabase.update.mockImplementation(() => ({
        ...mockSupabase,
        single: vi.fn().mockImplementation(() => ({
          data: mockUpdatedFlashcard,
          error: null,
        })),
      }));

      const service = new FlashcardService(mockSupabase as unknown as SupabaseClient);
      const result = await service.acceptGeneratedFlashcard(userId, flashcardId);

      expect(result).toEqual(mockUpdatedFlashcard);
      expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith("id", flashcardId);
      expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", userId);
      expect(mockSupabase.eq).toHaveBeenCalledWith("candidate", true);
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          candidate: false,
          updated_at: expect.any(String),
        })
      );
    });

    it("should throw error when flashcard is not found", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => ({
          data: null,
          error: null,
        })),
      };

      const service = new FlashcardService(mockSupabase as unknown as SupabaseClient);
      await expect(service.acceptGeneratedFlashcard(userId, flashcardId)).rejects.toThrow("Flashcard not found");
    });

    it("should throw error when database operation fails", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => ({
          data: null,
          error: new Error("Database error"),
        })),
      };

      const service = new FlashcardService(mockSupabase as unknown as SupabaseClient);
      await expect(service.acceptGeneratedFlashcard(userId, flashcardId)).rejects.toThrow("Failed to fetch flashcard");
    });
  });
});
