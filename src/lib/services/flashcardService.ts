import type { FlashcardCreateDto, GenerateFlashcardsCommand, GeneratedFlashcardDto, FlashcardDto } from "../../types";
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
}

// Factory function to create FlashcardService instance
export const createFlashcardService = (supabase: SupabaseClient): FlashcardService => {
  return new FlashcardService(supabase);
};
