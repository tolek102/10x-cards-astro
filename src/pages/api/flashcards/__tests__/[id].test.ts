import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIContext } from "astro";
import type { AstroCookies } from "astro";
import type { SupabaseClient } from "../../../../db/supabase.client";
import { GET, PATCH, DELETE } from "../[id]";
import type { FlashcardDto } from "../../../../types";
import { createFlashcardService } from "../../../../lib/services/flashcardService";
import { logger } from "../../../../lib/services/loggerService";

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
    locals: { 
      supabase: {} as SupabaseClient,
      user: { id: "test-user-id", email: "test@example.com" }
    },
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

describe("PATCH /api/flashcards/[id]", () => {
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
    locals: { 
      supabase: {} as SupabaseClient,
      user: { id: "test-user-id", email: "test@example.com" }
    },
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

    const response = await PATCH(
      createMockAPIContext(
        { id: mockFlashcard.id },
        {
          method: "PATCH",
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

    const response = await PATCH(
      createMockAPIContext(
        { id: mockFlashcard.id },
        {
          method: "PATCH",
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

    const response = await PATCH(
      createMockAPIContext(
        { id: mockFlashcard.id },
        {
          method: "PATCH",
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
    const response = await PATCH(
      createMockAPIContext(
        { id: mockFlashcard.id },
        {
          method: "PATCH",
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
    const response = await PATCH(
      createMockAPIContext(
        { id: "invalid-uuid" },
        {
          method: "PATCH",
          body: JSON.stringify({ front: "Updated front" }),
        }
      )
    );

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

    const response = await PATCH(
      createMockAPIContext(
        { id: "123e4567-e89b-12d3-a456-426614174001" },
        {
          method: "PATCH",
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

    const response = await PATCH(
      createMockAPIContext(
        { id: mockFlashcard.id },
        {
          method: "PATCH",
          body: JSON.stringify({ front: "Updated front" }),
        }
      )
    );

    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
    expect(data.message).toBe("Failed to process the request");
  });
});

describe("DELETE /api/flashcards/[id]", () => {
  const mockFlashcardId = "123e4567-e89b-12d3-a456-426614174000";
  const mockInvalidId = "invalid-uuid";

  const createMockAPIContext = (params: Record<string, string>, requestInit?: RequestInit): APIContext => ({
    request: new Request("http://localhost/api/flashcards/" + params.id, requestInit),
    locals: { 
      supabase: {} as SupabaseClient,
      user: { id: "test-user-id", email: "test@example.com" }
    },
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

  it("should return 204 when flashcard is successfully deleted", async () => {
    const mockDeleteFlashcard = vi.fn().mockResolvedValue(undefined);
    vi.mocked(createFlashcardService).mockReturnValue({
      deleteFlashcard: mockDeleteFlashcard,
      generateFlashcards: vi.fn(),
      createManualFlashcard: vi.fn(),
      getFlashcardById: vi.fn(),
      listAcceptedFlashcards: vi.fn(),
      listCandidateFlashcards: vi.fn(),
      updateFlashcard: vi.fn(),
    } as unknown as ReturnType<typeof createFlashcardService>);

    const response = await DELETE(createMockAPIContext({ id: mockFlashcardId }, { method: "DELETE" }));

    expect(response.status).toBe(204);
    expect(response.body).toBeNull();
    expect(mockDeleteFlashcard).toHaveBeenCalledTimes(1);
    expect(mockDeleteFlashcard).toHaveBeenCalledWith(expect.any(String), mockFlashcardId);
  });

  it("should return 400 when flashcard ID is invalid", async () => {
    const response = await DELETE(createMockAPIContext({ id: mockInvalidId }, { method: "DELETE" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: "Validation failed",
      details: expect.any(Array),
    });
    expect(vi.mocked(logger).warn).toHaveBeenCalledWith(
      "Validation failed for flashcard ID",
      expect.objectContaining({
        providedId: mockInvalidId,
      })
    );
  });

  it("should return 404 when flashcard is not found", async () => {
    const mockDeleteFlashcard = vi.fn().mockRejectedValue(new Error("Flashcard not found"));
    vi.mocked(createFlashcardService).mockReturnValue({
      deleteFlashcard: mockDeleteFlashcard,
      generateFlashcards: vi.fn(),
      createManualFlashcard: vi.fn(),
      getFlashcardById: vi.fn(),
      listAcceptedFlashcards: vi.fn(),
      listCandidateFlashcards: vi.fn(),
      updateFlashcard: vi.fn(),
    } as unknown as ReturnType<typeof createFlashcardService>);

    const response = await DELETE(createMockAPIContext({ id: mockFlashcardId }, { method: "DELETE" }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({
      error: "Not found",
      message: "Flashcard not found or you don't have access to it",
    });
    expect(vi.mocked(logger).warn).toHaveBeenCalledWith(
      "Flashcard not found",
      expect.objectContaining({
        flashcardId: mockFlashcardId,
      })
    );
  });

  it("should return 500 when an unexpected error occurs", async () => {
    const mockError = new Error("Database connection failed");
    const mockDeleteFlashcard = vi.fn().mockRejectedValue(mockError);
    vi.mocked(createFlashcardService).mockReturnValue({
      deleteFlashcard: mockDeleteFlashcard,
      generateFlashcards: vi.fn(),
      createManualFlashcard: vi.fn(),
      getFlashcardById: vi.fn(),
      listAcceptedFlashcards: vi.fn(),
      listCandidateFlashcards: vi.fn(),
      updateFlashcard: vi.fn(),
    } as unknown as ReturnType<typeof createFlashcardService>);

    const response = await DELETE(createMockAPIContext({ id: mockFlashcardId }, { method: "DELETE" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      error: "Internal server error",
      message: "Failed to process the request",
    });
    expect(vi.mocked(logger).error).toHaveBeenCalledWith(
      "Error deleting flashcard",
      expect.objectContaining({
        error: mockError,
      })
    );
  });
});
