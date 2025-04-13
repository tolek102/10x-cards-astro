import type { APIRoute } from "astro";
import { z } from "zod";
import type { FlashcardCreateDto, FlashcardsListResponseDto } from "../../../types";
import { createFlashcardService } from "../../../lib/services/flashcardService";
import { logger } from "../../../lib/services/loggerService";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

// Validation schema for query parameters
const listFlashcardsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(["created_at_desc", "created_at_asc"]).optional(),
});

// Validation schema for manual flashcard creation
const createManualFlashcardSchema = z.object({
  front: z.string().min(1).max(200),
  back: z.string().min(1).max(500),
  source: z.literal("MANUAL"),
  candidate: z.literal(false),
});

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    // Parse and validate query parameters
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validationResult = listFlashcardsQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { page, limit, sort } = validationResult.data;

    // Create service instance and fetch flashcards
    const flashcardService = createFlashcardService(locals.supabase);
    const response: FlashcardsListResponseDto = await flashcardService.listAcceptedFlashcards(DEFAULT_USER_ID, {
      page,
      limit,
      sort,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Error fetching flashcards", { error });
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to process the request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validationResult = createManualFlashcardSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const command: FlashcardCreateDto = validationResult.data;

    // Create service instance and create flashcard
    const flashcardService = createFlashcardService(locals.supabase);
    const flashcard = await flashcardService.createManualFlashcard(DEFAULT_USER_ID, command);

    return new Response(JSON.stringify(flashcard), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Error creating manual flashcard", { error });
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to process the request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
