import type { SupabaseClient } from "../../db/supabase.client";
import { logger } from "./loggerService";

export class StatisticsService {
  constructor(private readonly supabase: SupabaseClient) {}

  async trackFlashcardsGeneration(userId: string, flashcardsCount: number): Promise<void> {
    try {
      const { error } = await this.supabase.from("statistics").upsert(
        {
          user_id: userId,
          generated_count: flashcardsCount,
          accepted_edited_count: 0,
          accepted_unedited_count: 0,
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) {
        logger.error("Failed to update statistics", { error, userId });
        throw new Error("Failed to update statistics");
      }

      logger.info("Statistics updated successfully", { userId, flashcardsCount });
    } catch (error) {
      logger.error("Error tracking flashcards generation", { error, userId });
      throw error;
    }
  }
}

// Factory function to create StatisticsService instance
export const createStatisticsService = (supabase: SupabaseClient): StatisticsService => {
  return new StatisticsService(supabase);
};
