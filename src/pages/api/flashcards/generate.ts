import type { APIRoute } from "astro";
import { z } from "zod";
import type { GenerateFlashcardsCommand } from "../../../types";
import { createFlashcardService } from "../../../lib/services/flashcardService";
import { logger } from "../../../lib/services/loggerService";

// Validation schema for the request body
const generateFlashcardsSchema = z.object({
  text: z
    .string()
    .min(1000, "Text must be at least 1000 characters long")
    .max(10000, "Text cannot exceed 10000 characters"),
});

export const POST: APIRoute = async ({ request, locals }) => {
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

    // Parse and validate the request body
    const body = await request.json();
    const validationResult = generateFlashcardsSchema.safeParse(body);

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

    const command: GenerateFlashcardsCommand = validationResult.data;

    // Create service instance and generate flashcards
    const flashcardService = createFlashcardService(locals.supabase);
    const generatedFlashcards = await flashcardService.generateFlashcards(locals.user.id, command);

    return new Response(JSON.stringify(generatedFlashcards), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Error generating flashcards", {
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
      userId: locals.user?.id,
      requestUrl: request.url,
    });

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Failed to process the request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
