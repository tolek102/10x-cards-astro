import type { FlashcardCreateDto, GenerateFlashcardsCommand, GeneratedFlashcardDto } from "../../types";
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
}

// Factory function to create FlashcardService instance
export const createFlashcardService = (supabase: SupabaseClient): FlashcardService => {
  return new FlashcardService(supabase);
};
