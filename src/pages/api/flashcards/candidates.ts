import type { APIRoute } from "astro";
import { z } from "zod";
import type { FlashcardsListResponseDto } from "../../../types";
import { createFlashcardService } from "../../../lib/services/flashcardService";
import { logger } from "../../../lib/services/loggerService";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

// Validation schema for query parameters
const listCandidateFlashcardsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(["created_at_desc", "created_at_asc"]).optional(),
});

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    // Parse and validate query parameters
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validationResult = listCandidateFlashcardsQuerySchema.safeParse(queryParams);

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

    // Create service instance and fetch candidate flashcards
    const flashcardService = createFlashcardService(locals.supabase);
    const response: FlashcardsListResponseDto = await flashcardService.listCandidateFlashcards(DEFAULT_USER_ID, {
      page,
      limit,
      sort,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Error fetching candidate flashcards", { error });
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
