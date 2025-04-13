import type { APIRoute } from "astro";
import { z } from "zod";
import { createFlashcardService } from "../../../lib/services/flashcardService";
import { logger } from "../../../lib/services/loggerService";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

// Validation schema for flashcard ID
const flashcardIdSchema = z.string().uuid("Invalid flashcard ID format");

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    // Validate flashcard ID
    const validationResult = flashcardIdSchema.safeParse(params.id);

    if (!validationResult.success) {
      logger.warn("Validation failed for flashcard ID", {
        errors: validationResult.error.errors,
        providedId: params.id,
      });

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

    const flashcardId = validationResult.data;

    // Create service instance and fetch flashcard
    const flashcardService = createFlashcardService(locals.supabase);
    const flashcard = await flashcardService.getFlashcardById(DEFAULT_USER_ID, flashcardId);

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Flashcard not found") {
      logger.warn("Flashcard not found", {
        flashcardId: params.id,
        userId: DEFAULT_USER_ID,
      });

      return new Response(
        JSON.stringify({
          error: "Not found",
          message: "Flashcard not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    logger.error("Error fetching flashcard", { error });
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
