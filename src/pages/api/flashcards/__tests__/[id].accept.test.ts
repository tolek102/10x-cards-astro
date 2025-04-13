import { describe, expect, it, vi, beforeEach } from "vitest";
import { PATCH } from "../[id]/accept";
import type { FlashcardDto } from "../../../../types";
import type { APIContext } from "astro";

vi.mock("../../../../lib/services/loggerService", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock the flashcard service module
const mockAcceptGeneratedFlashcard = vi.fn();
vi.mock("../../../../lib/services/flashcardService", () => ({
  createFlashcardService: () => ({
    acceptGeneratedFlashcard: mockAcceptGeneratedFlashcard,
  }),
}));

describe("PATCH /api/flashcards/:id/accept", () => {
  const mockFlashcard: FlashcardDto = {
    id: "test-id",
    front: "Test front",
    back: "Test back",
    source: "AI",
    candidate: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should accept a flashcard successfully", async () => {
    mockAcceptGeneratedFlashcard.mockResolvedValue(mockFlashcard);

    const context = {
      params: { id: "test-id" },
      locals: { supabase: {} },
    } as unknown as APIContext;

    const response = await PATCH(context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockFlashcard);
    expect(mockAcceptGeneratedFlashcard).toHaveBeenCalledWith(expect.any(String), "test-id");
  });

  it("should return 400 for invalid flashcard ID", async () => {
    const context = {
      params: {},
      locals: { supabase: {} },
    } as unknown as APIContext;

    const response = await PATCH(context);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("should return 404 when flashcard is not found", async () => {
    mockAcceptGeneratedFlashcard.mockRejectedValue(new Error("Flashcard not found"));

    const context = {
      params: { id: "non-existent-id" },
      locals: { supabase: {} },
    } as unknown as APIContext;

    const response = await PATCH(context);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Not found");
    expect(data.message).toBe("Flashcard not found or does not belong to the user");
  });

  it("should return 404 when flashcard is not a candidate", async () => {
    mockAcceptGeneratedFlashcard.mockRejectedValue(new Error("Flashcard not found"));

    const context = {
      params: { id: "non-candidate-id" },
      locals: { supabase: {} },
    } as unknown as APIContext;

    const response = await PATCH(context);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Not found");
    expect(data.message).toBe("Flashcard not found or does not belong to the user");
    expect(mockAcceptGeneratedFlashcard).toHaveBeenCalledWith(expect.any(String), "non-candidate-id");
  });

  it("should return 500 for unexpected errors", async () => {
    mockAcceptGeneratedFlashcard.mockRejectedValue(new Error("Unexpected error"));

    const context = {
      params: { id: "test-id" },
      locals: { supabase: {} },
    } as unknown as APIContext;

    const response = await PATCH(context);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
    expect(data.message).toBe("Failed to process the request");
  });
});
