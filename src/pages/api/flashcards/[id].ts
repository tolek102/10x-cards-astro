import type { APIRoute } from "astro";
import { z } from "zod";
import { createFlashcardService } from "../../../lib/services/flashcardService";
import { logger } from "../../../lib/services/loggerService";
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
    const flashcard = await flashcardService.getFlashcardById(locals.user.id, flashcardId);

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Flashcard not found") {
      logger.warn("Flashcard not found", {
        flashcardId: params.id,
        userId: locals.user?.id,
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

export const PATCH: APIRoute = async ({ params, request, locals }) => {
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

    // Parse and validate request body
    const body = await request.json();
    const updateResult = updateFlashcardSchema.safeParse(body);

    if (!updateResult.success) {
      logger.warn("Validation failed for flashcard update", {
        errors: updateResult.error.errors,
        body,
      });

      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: updateResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const command: FlashcardUpdateDto = updateResult.data;

    // Create service instance and update flashcard
    const flashcardService = createFlashcardService(locals.supabase);

    try {
      const flashcard = await flashcardService.updateFlashcard(locals.user.id, flashcardId, command);
      return new Response(JSON.stringify(flashcard), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (serviceError) {
      if (serviceError instanceof Error && serviceError.message === "Flashcard not found") {
        logger.warn("Flashcard not found", {
          flashcardId,
          userId: locals.user.id,
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

export const DELETE: APIRoute = async ({ params, locals }) => {
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

    // Create service instance and delete flashcard
    const flashcardService = createFlashcardService(locals.supabase);
    await flashcardService.deleteFlashcard(locals.user.id, flashcardId);

    // Return 204 No Content on successful deletion
    return new Response(null, { status: 204 });
  } catch (error) {
    logger.error("Error deleting flashcard", { error });

    // Handle specific error types
    if (error instanceof Error && error.message === "Flashcard not found") {
      logger.warn("Flashcard not found", {
        flashcardId: params.id,
        userId: locals.user.id,
      });

      return new Response(
        JSON.stringify({
          error: "Not found",
          message: "Flashcard not found or you don't have access to it",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
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
