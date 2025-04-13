import type {
  FlashcardCreateDto,
  GenerateFlashcardsCommand,
  GeneratedFlashcardDto,
  FlashcardDto,
  FlashcardsListResponseDto,
  FlashcardUpdateDto,
} from "../../types";
import type { SupabaseClient } from "../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import { logger } from "./loggerService";
import { createStatisticsService } from "./statisticsService";

export class FlashcardService {
  constructor(private readonly supabase: SupabaseClient) {}

  async generateFlashcards(command: GenerateFlashcardsCommand): Promise<GeneratedFlashcardDto> {
    try {
      logger.info("Starting flashcards generation", { textLength: command.text.length });

      // Mock AI response for development - in the future, this will use the command.text
      // to generate relevant flashcards using AI
      const mockFlashcards: (FlashcardCreateDto & { user_id: string })[] = [
        {
          front: "Sample question from text: " + command.text.substring(0, 50) + "...",
          back: "Sample answer",
          source: "AI",
          candidate: true,
          user_id: DEFAULT_USER_ID,
        },
        {
          front: "Another sample question",
          back: "Another sample answer",
          source: "AI",
          candidate: true,
          user_id: DEFAULT_USER_ID,
        },
      ];

      logger.debug("Generated mock flashcards", { count: mockFlashcards.length });

      // Store flashcards in database
      const { data: flashcards, error } = await this.supabase.from("flashcards").insert(mockFlashcards).select();

      if (error) {
        logger.error("Error storing flashcards", { error });
        throw new Error("Failed to store generated flashcards");
      }

      const generatedFlashcards = flashcards || [];

      // Update statistics
      const statisticsService = createStatisticsService(this.supabase);
      await statisticsService.trackFlashcardsGeneration(DEFAULT_USER_ID, generatedFlashcards.length);

      logger.info("Successfully generated and stored flashcards", {
        count: generatedFlashcards.length,
      });

      return generatedFlashcards;
    } catch (error) {
      logger.error("Error in generateFlashcards", { error });
      throw error;
    }
  }

  async createManualFlashcard(userId: string, command: FlashcardCreateDto): Promise<FlashcardDto> {
    try {
      logger.info("Creating manual flashcard", { userId });

      const flashcardData = {
        ...command,
        user_id: userId,
      };

      const { data: flashcard, error } = await this.supabase.from("flashcards").insert(flashcardData).select().single();

      if (error) {
        logger.error("Error creating flashcard", { error });
        throw new Error("Failed to create flashcard");
      }

      if (!flashcard) {
        throw new Error("Flashcard was not created");
      }

      // Update statistics
      const statisticsService = createStatisticsService(this.supabase);
      await statisticsService.trackFlashcardsGeneration(userId, 1);

      logger.info("Successfully created manual flashcard", { flashcardId: flashcard.id });

      return flashcard;
    } catch (error) {
      logger.error("Error in createManualFlashcard", { error });
      throw error;
    }
  }

  async getFlashcardById(userId: string, flashcardId: string): Promise<FlashcardDto> {
    try {
      logger.info("Fetching flashcard by id", { userId, flashcardId });

      if (!userId || !flashcardId) {
        logger.error("Missing required parameters", { userId, flashcardId });
        throw new Error("Missing required parameters");
      }

      const { data: flashcard, error } = await this.supabase
        .from("flashcards")
        .select()
        .eq("id", flashcardId)
        .eq("user_id", userId)
        .single();

      if (error) {
        logger.error("Error fetching flashcard", { error });
        throw new Error("Failed to fetch flashcard");
      }

      if (!flashcard) {
        logger.warn("Flashcard not found", { flashcardId });
        throw new Error("Flashcard not found");
      }

      return flashcard;
    } catch (error) {
      logger.error("Error in getFlashcardById", { error });
      throw error;
    }
  }

  async listAcceptedFlashcards(
    userId: string,
    params: { page: number; limit: number; sort?: "created_at_desc" | "created_at_asc" }
  ): Promise<FlashcardsListResponseDto> {
    try {
      logger.info("Fetching accepted flashcards", { userId, ...params });

      // Calculate offset for pagination
      const offset = (params.page - 1) * params.limit;

      // Build query
      let query = this.supabase
        .from("flashcards")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .eq("candidate", false)
        .range(offset, offset + params.limit - 1);

      // Apply sorting if specified
      if (params.sort) {
        const [field, direction] = params.sort.split("_").reduce(
          ([acc, dir], part) => {
            if (part === "asc" || part === "desc") {
              return [acc, part];
            }
            return [acc ? `${acc}_${part}` : part, dir];
          },
          ["", ""] as [string, string]
        );
        query = query.order(field, { ascending: direction === "asc" });
      } else {
        // Default sorting
        query = query.order("created_at", { ascending: false });
      }

      // Execute query
      const { data: flashcards, error, count } = await query;

      if (error) {
        logger.error("Error fetching flashcards", { error });
        throw new Error("Failed to fetch flashcards");
      }

      if (!count) {
        logger.warn("No flashcards found or count not available");
        throw new Error("Failed to get flashcards count");
      }

      logger.info("Successfully fetched flashcards", {
        count: flashcards?.length,
        total: count,
      });

      return {
        data: flashcards || [],
        pagination: {
          page: params.page,
          limit: params.limit,
          total: count,
        },
      };
    } catch (error) {
      logger.error("Error in listAcceptedFlashcards", { error });
      throw error;
    }
  }

  async listCandidateFlashcards(
    userId: string,
    params: { page: number; limit: number; sort?: "created_at_desc" | "created_at_asc" }
  ): Promise<FlashcardsListResponseDto> {
    try {
      logger.info("Fetching candidate flashcards", { userId, ...params });

      // Calculate offset for pagination
      const offset = (params.page - 1) * params.limit;

      // Build query
      let query = this.supabase
        .from("flashcards")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .eq("candidate", true)
        .range(offset, offset + params.limit - 1);

      // Apply sorting if specified
      if (params.sort) {
        const [field, direction] = params.sort.split("_").reduce(
          ([acc, dir], part) => {
            if (part === "asc" || part === "desc") {
              return [acc, part];
            }
            return [acc ? `${acc}_${part}` : part, dir];
          },
          ["", ""] as [string, string]
        );
        query = query.order(field, { ascending: direction === "asc" });
      } else {
        // Default sorting
        query = query.order("created_at", { ascending: false });
      }

      // Execute query
      const { data: flashcards, error, count } = await query;

      if (error) {
        logger.error("Error fetching candidate flashcards", { error });
        throw new Error("Failed to fetch candidate flashcards");
      }

      if (!count) {
        logger.warn("No candidate flashcards found or count not available");
        throw new Error("Failed to get candidate flashcards count");
      }

      logger.info("Successfully fetched candidate flashcards", {
        count: flashcards?.length,
        total: count,
      });

      return {
        data: flashcards || [],
        pagination: {
          page: params.page,
          limit: params.limit,
          total: count,
        },
      };
    } catch (error) {
      logger.error("Error in listCandidateFlashcards", { error });
      throw error;
    }
  }

  async updateFlashcard(userId: string, flashcardId: string, command: FlashcardUpdateDto): Promise<FlashcardDto> {
    try {
      logger.info("Updating flashcard", { userId, flashcardId });

      // First, get the existing flashcard to check ownership and current state
      const { data: existingFlashcard, error: fetchError } = await this.supabase
        .from("flashcards")
        .select()
        .eq("id", flashcardId)
        .eq("user_id", userId)
        .single();

      if (fetchError) {
        logger.error("Error fetching flashcard for update", { error: fetchError });
        throw new Error("Failed to fetch flashcard");
      }

      if (!existingFlashcard) {
        logger.warn("Flashcard not found or unauthorized", { flashcardId });
        throw new Error("Flashcard not found");
      }

      // Prepare update data with business logic
      const updateData = {
        ...command,
        // If flashcard was a candidate, set it to false
        candidate: command.candidate === false ? false : existingFlashcard.candidate,
        // If source was AI, change to AI_EDITED
        source: existingFlashcard.source === "AI" ? "AI_EDITED" : existingFlashcard.source,
        updated_at: new Date().toISOString(),
      };

      // Update the flashcard
      const { data: updatedFlashcard, error: updateError } = await this.supabase
        .from("flashcards")
        .update(updateData)
        .eq("id", flashcardId)
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError) {
        logger.error("Error updating flashcard", { error: updateError });
        throw new Error("Failed to update flashcard");
      }

      if (!updatedFlashcard) {
        throw new Error("Flashcard update failed");
      }

      logger.info("Successfully updated flashcard", { flashcardId });

      return updatedFlashcard;
    } catch (error) {
      logger.error("Error in updateFlashcard", { error });
      throw error;
    }
  }

  async deleteFlashcard(userId: string, flashcardId: string): Promise<void> {
    try {
      logger.info("Deleting flashcard", { userId, flashcardId });

      // First, get the existing flashcard to check ownership
      const { data: existingFlashcard, error: fetchError } = await this.supabase
        .from("flashcards")
        .select()
        .eq("id", flashcardId)
        .eq("user_id", userId)
        .single();

      if (fetchError) {
        logger.error("Error fetching flashcard for deletion", { error: fetchError });
        throw new Error("Failed to fetch flashcard");
      }

      if (!existingFlashcard) {
        logger.warn("Flashcard not found or unauthorized", { flashcardId });
        throw new Error("Flashcard not found");
      }

      // Delete the flashcard
      const { error: deleteError } = await this.supabase
        .from("flashcards")
        .delete()
        .eq("id", flashcardId)
        .eq("user_id", userId);

      if (deleteError) {
        logger.error("Error deleting flashcard", { error: deleteError });
        throw new Error("Failed to delete flashcard");
      }

      logger.info("Successfully deleted flashcard", { flashcardId });
    } catch (error) {
      logger.error("Error in deleteFlashcard", { error });
      throw error;
    }
  }
}

// Factory function to create FlashcardService instance
export const createFlashcardService = (supabase: SupabaseClient): FlashcardService => {
  return new FlashcardService(supabase);
};
