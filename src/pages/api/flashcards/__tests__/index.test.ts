import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIContext } from "astro";
import type { AstroCookies } from "astro";
import type { SupabaseClient } from "../../../../db/supabase.client";
import type { PostgrestError } from "@supabase/supabase-js";
import { POST } from "../index";
import type { FlashcardCreateDto, FlashcardDto } from "../../../../types";

vi.mock("../../../../lib/services/loggerService", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../../lib/services/statisticsService", () => ({
  createStatisticsService: () => ({
    trackFlashcardsGeneration: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe("POST /api/flashcards", () => {
  const mockFlashcard: FlashcardDto = {
    id: "1",
    front: "Test front",
    back: "Test back",
    source: "MANUAL",
    candidate: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockRequest = (body: unknown) =>
    new Request("http://localhost/api/flashcards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

  const mockSupabaseChain = {
    data: null as FlashcardDto | null,
    error: null as PostgrestError | null,
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(function (this: typeof mockSupabaseChain) {
      return { data: this.data, error: this.error };
    }),
  };

  const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);
  const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

  const mockSupabase = {
    from: vi.fn().mockReturnValue({
      insert: mockInsert,
    }),
  } as unknown as SupabaseClient;

  const createMockAPIContext = (request: Request): APIContext => ({
    request,
    locals: { supabase: mockSupabase },
    cookies: {
      get: vi.fn(),
      has: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      headers: () => new Headers(),
    } as unknown as AstroCookies,
    url: new URL(request.url),
    site: new URL(request.url),
    generator: "test",
    params: {},
    props: {},
    redirect: () => new Response(null, { status: 302 }),
    currentLocale: "en",
    preferredLocale: "en",
    preferredLocaleList: ["en"],
    rewrite: vi.fn(),
    clientAddress: "127.0.0.1",
    routePattern: "/api/flashcards",
    originPathname: "/api/flashcards",
    getActionResult: vi.fn(),
    callAction: vi.fn(),
    isPrerendered: false,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseChain.data = null;
    mockSupabaseChain.error = null;
  });

  it("should create a flashcard successfully", async () => {
    const validCommand: FlashcardCreateDto = {
      front: "Test front",
      back: "Test back",
      source: "MANUAL",
      candidate: false,
    };

    mockSupabaseChain.data = mockFlashcard;
    mockSupabaseChain.error = null;

    const request = mockRequest(validCommand);
    const response = await POST(createMockAPIContext(request));
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(mockFlashcard);
  });

  it("should return 400 for invalid input", async () => {
    const invalidCommand = {
      front: "", // Invalid - empty string
      back: "Test back",
      source: "MANUAL",
      candidate: false,
    };

    const request = mockRequest(invalidCommand);
    const response = await POST(createMockAPIContext(request));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
    expect(data.details).toBeDefined();
  });

  it("should return 500 when database operation fails", async () => {
    const validCommand: FlashcardCreateDto = {
      front: "Test front",
      back: "Test back",
      source: "MANUAL",
      candidate: false,
    };

    mockSupabaseChain.data = null;
    mockSupabaseChain.error = {
      message: "Database error",
      details: "",
      hint: "",
      code: "23505",
      name: "PostgrestError",
    };

    const request = mockRequest(validCommand);
    const response = await POST(createMockAPIContext(request));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
