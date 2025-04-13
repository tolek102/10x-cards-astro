import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIContext } from "astro";
import type { AstroCookies } from "astro";
import type { SupabaseClient } from "../../../../db/supabase.client";
import { GET, PUT } from "../[id]";
import type { FlashcardDto } from "../../../../types";
import { createFlashcardService } from "../../../../lib/services/flashcardService";

vi.mock("../../../../lib/services/loggerService", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../../lib/services/flashcardService");

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

  const createMockAPIContext = (params: Record<string, string>, requestInit?: RequestInit): APIContext => ({
    request: new Request("http://localhost/api/flashcards/" + params.id, requestInit),
    locals: { supabase: {} as SupabaseClient },
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
  });

  it("should return a flashcard successfully", async () => {
    const mockGetFlashcardById = vi.fn().mockResolvedValue(mockFlashcard);

    vi.mocked(createFlashcardService).mockReturnValue({
      getFlashcardById: mockGetFlashcardById,
      updateFlashcard: vi.fn(),
      generateFlashcards: vi.fn(),
      createManualFlashcard: vi.fn(),
      listAcceptedFlashcards: vi.fn(),
      listCandidateFlashcards: vi.fn(),
    } as unknown as ReturnType<typeof createFlashcardService>);

    const response = await GET(createMockAPIContext({ id: mockFlashcard.id }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockFlashcard);
    expect(mockGetFlashcardById).toHaveBeenCalledWith(expect.any(String), mockFlashcard.id);
  });

  it("should return 400 for invalid UUID format", async () => {
    const response = await GET(createMockAPIContext({ id: "invalid-uuid" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
    expect(data.details).toBeDefined();
  });

  it("should return 404 when flashcard is not found", async () => {
    const mockGetFlashcardById = vi.fn().mockRejectedValue(new Error("Flashcard not found"));

    vi.mocked(createFlashcardService).mockReturnValue({
      getFlashcardById: mockGetFlashcardById,
      updateFlashcard: vi.fn(),
      generateFlashcards: vi.fn(),
      createManualFlashcard: vi.fn(),
      listAcceptedFlashcards: vi.fn(),
      listCandidateFlashcards: vi.fn(),
    } as unknown as ReturnType<typeof createFlashcardService>);

    const response = await GET(createMockAPIContext({ id: "123e4567-e89b-12d3-a456-426614174001" }));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Not found");
    expect(data.message).toBe("Flashcard not found");
  });

  it("should return 500 when database operation fails", async () => {
    const mockGetFlashcardById = vi.fn().mockRejectedValue(new Error("Database error"));

    vi.mocked(createFlashcardService).mockReturnValue({
      getFlashcardById: mockGetFlashcardById,
      updateFlashcard: vi.fn(),
      generateFlashcards: vi.fn(),
      createManualFlashcard: vi.fn(),
      listAcceptedFlashcards: vi.fn(),
      listCandidateFlashcards: vi.fn(),
    } as unknown as ReturnType<typeof createFlashcardService>);

    const response = await GET(createMockAPIContext({ id: mockFlashcard.id }));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
    expect(data.message).toBe("Failed to process the request");
  });
});

describe("PUT /api/flashcards/[id]", () => {
  const mockFlashcard = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    front: "Test Question",
    back: "Test Answer",
    source: "AI",
    candidate: true,
    created_at: "2024-02-20T12:00:00Z",
    updated_at: "2024-02-20T12:00:00Z",
  };

  const validUpdateCommand = {
    front: "Updated Question",
    back: "Updated Answer",
    candidate: false,
  };

  const createMockAPIContext = (params: Record<string, string>, requestInit?: RequestInit): APIContext => ({
    request: new Request("http://localhost/api/flashcards/" + params.id, requestInit),
    locals: { supabase: {} as SupabaseClient },
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
  });

  it("should successfully update a flashcard with all fields", async () => {
    const mockUpdateFlashcard = vi.fn().mockResolvedValue({
      ...mockFlashcard,
      ...validUpdateCommand,
      source: "AI_EDITED",
    });

    vi.mocked(createFlashcardService).mockReturnValue({
      updateFlashcard: mockUpdateFlashcard,
      generateFlashcards: vi.fn(),
      createManualFlashcard: vi.fn(),
      getFlashcardById: vi.fn(),
      listAcceptedFlashcards: vi.fn(),
      listCandidateFlashcards: vi.fn(),
    } as unknown as ReturnType<typeof createFlashcardService>);

    const response = await PUT(
      createMockAPIContext(
        { id: mockFlashcard.id },
        {
          method: "PUT",
          body: JSON.stringify(validUpdateCommand),
        }
      )
    );

    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toMatchObject({
      ...mockFlashcard,
      ...validUpdateCommand,
      source: "AI_EDITED",
    });
  });

  it("should successfully update only the front field", async () => {
    const partialUpdate = { front: "Updated front only" };
    const mockUpdateFlashcard = vi.fn().mockResolvedValue({
      ...mockFlashcard,
      ...partialUpdate,
      source: "AI_EDITED",
    });

    vi.mocked(createFlashcardService).mockReturnValue({
      updateFlashcard: mockUpdateFlashcard,
      generateFlashcards: vi.fn(),
      createManualFlashcard: vi.fn(),
      getFlashcardById: vi.fn(),
      listAcceptedFlashcards: vi.fn(),
      listCandidateFlashcards: vi.fn(),
    } as unknown as ReturnType<typeof createFlashcardService>);

    const response = await PUT(
      createMockAPIContext(
        { id: mockFlashcard.id },
        {
          method: "PUT",
          body: JSON.stringify(partialUpdate),
        }
      )
    );

    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toMatchObject({
      ...mockFlashcard,
      ...partialUpdate,
      source: "AI_EDITED",
    });
  });

  it("should successfully update only the back field", async () => {
    const partialUpdate = { back: "Updated back only" };
    const mockUpdateFlashcard = vi.fn().mockResolvedValue({
      ...mockFlashcard,
      ...partialUpdate,
      source: "AI_EDITED",
    });

    vi.mocked(createFlashcardService).mockReturnValue({
      updateFlashcard: mockUpdateFlashcard,
      generateFlashcards: vi.fn(),
      createManualFlashcard: vi.fn(),
      getFlashcardById: vi.fn(),
      listAcceptedFlashcards: vi.fn(),
      listCandidateFlashcards: vi.fn(),
    } as unknown as ReturnType<typeof createFlashcardService>);

    const response = await PUT(
      createMockAPIContext(
        { id: mockFlashcard.id },
        {
          method: "PUT",
          body: JSON.stringify(partialUpdate),
        }
      )
    );

    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toMatchObject({
      ...mockFlashcard,
      ...partialUpdate,
      source: "AI_EDITED",
    });
  });

  it("should return 400 when no fields are provided for update", async () => {
    const response = await PUT(
      createMockAPIContext(
        { id: mockFlashcard.id },
        {
          method: "PUT",
          body: JSON.stringify({}),
        }
      )
    );

    expect(response.status).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.error).toBe("Validation failed");
    expect(responseBody.details).toBeDefined();
  });

  it("should return 400 for invalid UUID format", async () => {
    const response = await PUT(createMockAPIContext({ id: "invalid-uuid" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
    expect(data.details).toBeDefined();
  });

  it("should return 404 when flashcard is not found", async () => {
    const mockUpdateFlashcard = vi.fn().mockRejectedValue(new Error("Flashcard not found"));

    vi.mocked(createFlashcardService).mockReturnValue({
      updateFlashcard: mockUpdateFlashcard,
      generateFlashcards: vi.fn(),
      createManualFlashcard: vi.fn(),
      getFlashcardById: vi.fn(),
      listAcceptedFlashcards: vi.fn(),
      listCandidateFlashcards: vi.fn(),
    } as unknown as ReturnType<typeof createFlashcardService>);

    const response = await PUT(
      createMockAPIContext(
        { id: "123e4567-e89b-12d3-a456-426614174001" },
        {
          method: "PUT",
          body: JSON.stringify({ front: "Updated front" }),
        }
      )
    );

    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Not found");
    expect(data.message).toBe("Flashcard not found");
  });

  it("should return 500 when database operation fails", async () => {
    const mockUpdateFlashcard = vi.fn().mockRejectedValue(new Error("Database error"));

    vi.mocked(createFlashcardService).mockReturnValue({
      updateFlashcard: mockUpdateFlashcard,
      generateFlashcards: vi.fn(),
      createManualFlashcard: vi.fn(),
      getFlashcardById: vi.fn(),
      listAcceptedFlashcards: vi.fn(),
      listCandidateFlashcards: vi.fn(),
    } as unknown as ReturnType<typeof createFlashcardService>);

    const response = await PUT(createMockAPIContext({ id: mockFlashcard.id }));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
    expect(data.message).toBe("Failed to process the request");
  });
});
