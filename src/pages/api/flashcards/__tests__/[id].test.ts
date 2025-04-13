import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIContext } from "astro";
import type { AstroCookies } from "astro";
import type { SupabaseClient } from "../../../../db/supabase.client";
import type { PostgrestError } from "@supabase/supabase-js";
import { GET } from "../[id]";
import type { FlashcardDto } from "../../../../types";

vi.mock("../../../../lib/services/loggerService", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("GET /api/flashcards/[id]", () => {
  const mockFlashcard: FlashcardDto = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    front: "Test front",
    back: "Test back",
    source: "MANUAL",
    candidate: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockSupabaseChain = {
    data: null as FlashcardDto | null,
    error: null as PostgrestError | null,
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(function (this: typeof mockSupabaseChain) {
      return { data: this.data, error: this.error };
    }),
  };

  const mockFrom = vi.fn().mockReturnValue(mockSupabaseChain);

  const mockSupabase = {
    from: mockFrom,
  } as unknown as SupabaseClient;

  const createMockAPIContext = (params: Record<string, string>): APIContext => ({
    request: new Request("http://localhost/api/flashcards/" + params.id),
    locals: { supabase: mockSupabase },
    cookies: {
      get: vi.fn(),
      has: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      headers: () => new Headers(),
    } as unknown as AstroCookies,
    url: new URL("http://localhost/api/flashcards/" + params.id),
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
    routePattern: "/api/flashcards/[id]",
    originPathname: "/api/flashcards/" + params.id,
    getActionResult: vi.fn(),
    callAction: vi.fn(),
    isPrerendered: false,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseChain.data = null;
    mockSupabaseChain.error = null;
  });

  it("should return a flashcard successfully", async () => {
    mockSupabaseChain.data = mockFlashcard;
    mockSupabaseChain.error = null;

    const response = await GET(createMockAPIContext({ id: mockFlashcard.id }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockFlashcard);
    expect(mockFrom).toHaveBeenCalledWith("flashcards");
  });

  it("should return 400 for invalid UUID format", async () => {
    const response = await GET(createMockAPIContext({ id: "invalid-uuid" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
    expect(data.details).toBeDefined();
  });

  it("should return 404 when flashcard is not found", async () => {
    mockSupabaseChain.data = null;
    mockSupabaseChain.error = null;

    const response = await GET(createMockAPIContext({ id: "123e4567-e89b-12d3-a456-426614174001" }));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Not found");
    expect(data.message).toBe("Flashcard not found");
  });

  it("should return 500 when database operation fails", async () => {
    mockSupabaseChain.data = null;
    mockSupabaseChain.error = {
      message: "Database error",
      details: "",
      hint: "",
      code: "23505",
      name: "PostgrestError",
    };

    const response = await GET(createMockAPIContext({ id: mockFlashcard.id }));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
    expect(data.message).toBe("Failed to process the request");
  });
});
