import { describe, expect, it, vi, beforeEach } from "vitest";
import { PATCH } from "../[id]/accept";
import type { FlashcardDto } from "../../../../types";
import type { APIContext, AstroCookies } from "astro";
import type { SupabaseClient } from "@supabase/supabase-js";

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

    const context = createMockAPIContext({ id: "test-id" });

    const response = await PATCH(context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockFlashcard);
    expect(mockAcceptGeneratedFlashcard).toHaveBeenCalledWith(expect.any(String), "test-id");
  });

  it("should return 400 for invalid flashcard ID", async () => {
    const context = createMockAPIContext({}, { method: "POST" });

    const response = await PATCH(context);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("should return 404 when flashcard is not found", async () => {
    mockAcceptGeneratedFlashcard.mockRejectedValue(new Error("Flashcard not found"));

    const context = createMockAPIContext({ id: "non-existent-id" });

    const response = await PATCH(context);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Not found");
    expect(data.message).toBe("Flashcard not found or does not belong to the user");
  });

  it("should return 404 when flashcard is not a candidate", async () => {
    mockAcceptGeneratedFlashcard.mockRejectedValue(new Error("Flashcard not found"));

    const context = createMockAPIContext({ id: "non-candidate-id" });

    const response = await PATCH(context);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Not found");
    expect(data.message).toBe("Flashcard not found or does not belong to the user");
    expect(mockAcceptGeneratedFlashcard).toHaveBeenCalledWith(expect.any(String), "non-candidate-id");
  });

  it("should return 500 for unexpected errors", async () => {
    mockAcceptGeneratedFlashcard.mockRejectedValue(new Error("Unexpected error"));

    const context = createMockAPIContext({ id: "test-id" });

    const response = await PATCH(context);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
    expect(data.message).toBe("Failed to process the request");
  });
});

const createMockAPIContext = (params: Record<string, string>, requestInit?: RequestInit): APIContext => ({
  request: new Request("http://localhost/api/flashcards/" + params.id + "/accept", requestInit),
  locals: {
    supabase: {} as SupabaseClient,
    user: { id: "test-user-id", email: "test@example.com" },
  },
  cookies: {
    get: vi.fn(),
    has: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    headers: () => new Headers(),
  } as unknown as AstroCookies,
  url: new URL("http://localhost/api/flashcards/" + params.id + "/accept"),
  site: new URL("http://localhost"),
  generator: "test",
  params,
  props: {},
  redirect: () => new Response(null, { status: 302 }),
  currentLocale: "en",
  preferredLocale: "en",
  preferredLocaleList: ["en"],
  rewrite: vi.fn(),
  clientAddress: "127.0.0.1",
  routePattern: "/api/flashcards/[id]/accept",
  originPathname: "/api/flashcards/" + params.id + "/accept",
  getActionResult: vi.fn(),
  callAction: vi.fn(),
  isPrerendered: false,
});
