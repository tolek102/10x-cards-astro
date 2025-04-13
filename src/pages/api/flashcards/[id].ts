import type { APIRoute } from "astro";
import { z } from "zod";
import { createFlashcardService } from "../../../lib/services/flashcardService";
import { logger } from "../../../lib/services/loggerService";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";
import type { FlashcardUpdateDto } from "../../../types";

// Validation schema for flashcard ID
const flashcardIdSchema = z.string().uuid("Invalid flashcard ID format");

// Validation schema for flashcard update
const updateFlashcardSchema = z
  .object({
    front: z
      .string()
      .min(1, "Front content is required")
      .max(200, "Front content cannot exceed 200 characters")
      .trim()
      .optional(),
    back: z
      .string()
      .min(1, "Back content is required")
      .max(500, "Back content cannot exceed 500 characters")
      .trim()
      .optional(),
    candidate: z.boolean().default(false).describe("If true, marks the flashcard as a candidate for review").optional(),
  })
  .refine(
    (data) => {
      // Ensure at least one field is provided
      return Object.keys(data).length > 0;
    },
    {
      message: "At least one field must be provided for update",
    }
  );

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

export const PUT: APIRoute = async ({ params, request, locals }) => {
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

    // Parse and validate the request body
    const body = await request.json();
    const bodyValidation = updateFlashcardSchema.safeParse(body);

    if (!bodyValidation.success) {
      logger.warn("Validation failed for update data", {
        errors: bodyValidation.error.errors,
      });

      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: bodyValidation.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const command: FlashcardUpdateDto = bodyValidation.data;

    // Create service instance and update flashcard
    const flashcardService = createFlashcardService(locals.supabase);

    try {
      const flashcard = await flashcardService.updateFlashcard(DEFAULT_USER_ID, flashcardId, command);
      return new Response(JSON.stringify(flashcard), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (serviceError) {
      if (serviceError instanceof Error && serviceError.message === "Flashcard not found") {
        logger.warn("Flashcard not found", {
          flashcardId,
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
      throw serviceError; // Re-throw other errors to be handled by the outer catch block
    }
  } catch (error) {
    logger.error("Error updating flashcard", { error });
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
