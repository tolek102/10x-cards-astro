import type { APIRoute } from "astro";
import { z } from "zod";
import { createFlashcardService } from "../../../../lib/services/flashcardService";
import { logger } from "../../../../lib/services/loggerService";

// Validation schema for the flashcard ID parameter
const acceptFlashcardParamsSchema = z.object({
  id: z.string().min(1, "Flashcard ID is required"),
});

export const PATCH: APIRoute = async ({ params, locals }) => {
  try {
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "Authentication required",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate the flashcard ID parameter
    const validationResult = acceptFlashcardParamsSchema.safeParse(params);

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

    const { id } = validationResult.data;

    // Create service instance and accept the flashcard
    const flashcardService = createFlashcardService(locals.supabase);
    const flashcard = await flashcardService.acceptGeneratedFlashcard(locals.user.id, id);

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Error accepting flashcard", { error });

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message === "Flashcard not found") {
        return new Response(
          JSON.stringify({
            error: "Not found",
            message: "Flashcard not found or does not belong to the user",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

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
