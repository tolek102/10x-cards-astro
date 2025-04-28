import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIContext } from "astro";
import type { AstroCookies } from "astro";
import type { SupabaseClient } from "../../../../db/supabase.client";
import type { PostgrestError } from "@supabase/supabase-js";
import { GET } from "../candidates";
import type { FlashcardDto } from "../../../../types";

vi.mock("../../../../lib/services/loggerService", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("GET /api/flashcards/candidates", () => {
  const mockFlashcards: FlashcardDto[] = [
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

  const mockRequest = (queryParams: Record<string, string> = {}) => {
    const url = new URL("http://localhost/api/flashcards/candidates");
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    return new Request(url, {
      method: "GET",
    });
  };

  const mockSupabaseChain = {
    data: null as FlashcardDto[] | null,
    error: null as PostgrestError | null,
    count: 0,
    range: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockImplementation(function (this: typeof mockSupabaseChain) {
      return { data: this.data, error: this.error, count: this.count };
    }),
  };

  const mockSelect = vi.fn().mockReturnValue(mockSupabaseChain);

  const mockSupabase = {
    from: vi.fn().mockReturnValue({
      select: mockSelect,
    }),
  } as unknown as SupabaseClient;

  const createMockAPIContext = (searchParams?: Record<string, string>, requestInit?: RequestInit): APIContext => ({
    request: new Request(
      "http://localhost/api/flashcards/candidates" + (searchParams ? "?" + new URLSearchParams(searchParams).toString() : ""),
      requestInit
    ),
    locals: { 
      supabase: mockSupabase,
      user: { id: "test-user-id", email: "test@example.com" }
    },
    cookies: {
      get: vi.fn(),
      has: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      headers: () => new Headers(),
    } as unknown as AstroCookies,
    url: new URL("http://localhost/api/flashcards/candidates" + (searchParams ? "?" + new URLSearchParams(searchParams).toString() : "")),
    site: new URL("http://localhost"),
    generator: "test",
    params: {},
    props: {},
    redirect: () => new Response(null, { status: 302 }),
    currentLocale: "en",
    preferredLocale: "en",
    preferredLocaleList: ["en"],
    rewrite: vi.fn(),
    clientAddress: "127.0.0.1",
    routePattern: "/api/flashcards/candidates",
    originPathname: "/api/flashcards/candidates",
    getActionResult: vi.fn(),
    callAction: vi.fn(),
    isPrerendered: false,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseChain.data = null;
    mockSupabaseChain.error = null;
    mockSupabaseChain.count = 0;
  });

  it("should return candidate flashcards with default pagination", async () => {
    mockSupabaseChain.data = mockFlashcards;
    mockSupabaseChain.count = mockFlashcards.length;
    mockSupabaseChain.error = null;

    const request = mockRequest();
    const response = await GET(createMockAPIContext(undefined, request));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual(mockFlashcards);
    expect(data.pagination).toEqual({
      page: 1,
      limit: 20,
      total: mockFlashcards.length,
    });
  });

  it("should handle custom pagination parameters", async () => {
    mockSupabaseChain.data = mockFlashcards;
    mockSupabaseChain.error = null;
    mockSupabaseChain.count = mockFlashcards.length;

    const response = await GET(createMockAPIContext({ page: "2", pageSize: "5" }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual(mockFlashcards);
    expect(data.pagination).toEqual({
      page: 2,
      limit: 20,
      total: mockFlashcards.length,
    });
  });

  it("should return 400 for invalid pagination parameters", async () => {
    const response = await GET(createMockAPIContext({ page: "-1", pageSize: "0" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
    expect(data.details).toBeDefined();
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

    const request = mockRequest();
    const response = await GET(createMockAPIContext(undefined, request));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
