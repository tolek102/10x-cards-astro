import type {
  FlashcardCreateDto,
  GenerateFlashcardsCommand,
  GeneratedFlashcardDto,
  FlashcardDto,
  FlashcardsListResponseDto,
  FlashcardUpdateDto,
  Source,
} from "../../types";
import type { SupabaseClient } from "../../db/supabase.client";
import type { Database } from "../../db/database.types";
import { logger } from "./loggerService";
import { createStatisticsService } from "./statisticsService";
import { getOpenRouterConfig } from "../services/openrouter/config";
import { OpenRouterService } from "../services/openrouter";

type DatabaseFlashcard = Database["public"]["Tables"]["flashcards"]["Row"];

const mapDatabaseFlashcardToDto = (flashcard: DatabaseFlashcard): FlashcardDto => ({
  ...flashcard,
  source: flashcard.source as Source,
});

export class FlashcardService {
  constructor(private readonly supabase: SupabaseClient) {}

  async generateFlashcards(userId: string, command: GenerateFlashcardsCommand): Promise<GeneratedFlashcardDto> {
    try {
      logger.info("Starting flashcards generation", { userId, textLength: command.text.length });

      // Generuj fiszki przez OpenRouter
      const config = getOpenRouterConfig();
      const openRouterService = new OpenRouterService(config);
      const generatedFlashcards = await openRouterService.generateFlashcards(command.text);

      // Przygotuj dane do zapisu w bazie
      const flashcardsToSave = generatedFlashcards.map((flashcard: FlashcardCreateDto) => ({
        ...flashcard,
        user_id: userId,
        source: "AI" as Source,
        candidate: true,
      }));

      // Store flashcards in database
      const { data: flashcards, error } = await this.supabase.from("flashcards").insert(flashcardsToSave).select();

      if (error) {
        logger.error("Error storing flashcards", { error });
        throw new Error("Failed to store generated flashcards");
      }

      const savedFlashcards = (flashcards || []).map(mapDatabaseFlashcardToDto);

      // Update statistics
      const statisticsService = createStatisticsService(this.supabase);
      await statisticsService.trackFlashcardsGeneration(userId, savedFlashcards.length);

      logger.info("Successfully generated and stored flashcards", {
        count: savedFlashcards.length,
      });

      return savedFlashcards;
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

      const mappedFlashcard = mapDatabaseFlashcardToDto(flashcard);

      // Update statistics
      const statisticsService = createStatisticsService(this.supabase);
      await statisticsService.trackFlashcardsGeneration(userId, 1);

      logger.info("Successfully created manual flashcard", { flashcardId: mappedFlashcard.id });

      return mappedFlashcard;
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

      return mapDatabaseFlashcardToDto(flashcard);
    } catch (error) {
      logger.error("Error in getFlashcardById", { error });
      throw error;
    }
  }

  private async listFlashcards(
    userId: string,
    params: { page: number; limit: number; sort?: "created_at_desc" | "created_at_asc" },
    isCandidate: boolean
  ): Promise<FlashcardsListResponseDto> {
    try {
      logger.info(`Fetching ${isCandidate ? "candidate" : "accepted"} flashcards`, { userId, ...params });

      // Calculate offset for pagination
      const offset = (params.page - 1) * params.limit;

      // Build query
      let query = this.supabase
        .from("flashcards")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .eq("candidate", isCandidate)
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
        query = query.order("updated_at", { ascending: false });
      }

      // Execute query
      const { data: flashcards, error, count } = await query;

      if (error) {
        logger.error(`Error fetching ${isCandidate ? "candidate" : ""} flashcards`, { error });
        throw new Error(`Failed to fetch ${isCandidate ? "candidate" : ""} flashcards`);
      }

      const totalCount = count ?? 0;
      const mappedFlashcards = (flashcards || []).map(mapDatabaseFlashcardToDto);

      logger.info(`Successfully fetched ${isCandidate ? "candidate" : ""} flashcards`, {
        count: mappedFlashcards.length,
        total: totalCount,
      });

      return {
        data: mappedFlashcards,
        pagination: {
          page: params.page,
          limit: params.limit,
          total: totalCount,
        },
      };
    } catch (error) {
      logger.error(`Error in list${isCandidate ? "Candidate" : "Accepted"}Flashcards`, { error });
      throw error;
    }
  }

  async listAcceptedFlashcards(
    userId: string,
    params: { page: number; limit: number; sort?: "created_at_desc" | "created_at_asc" }
  ): Promise<FlashcardsListResponseDto> {
    return this.listFlashcards(userId, params, false);
  }

  async listCandidateFlashcards(
    userId: string,
    params: { page: number; limit: number; sort?: "created_at_desc" | "created_at_asc" }
  ): Promise<FlashcardsListResponseDto> {
    return this.listFlashcards(userId, params, true);
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
        // If flashcard was a candidate, set it to false as it's being edited
        candidate: existingFlashcard.candidate ? false : (command.candidate ?? existingFlashcard.candidate),
        // If source was AI, change to AI_EDITED
        source: existingFlashcard.source === "AI" ? ("AI_EDITED" as Source) : existingFlashcard.source,
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

      return mapDatabaseFlashcardToDto(updatedFlashcard);
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

  async acceptGeneratedFlashcard(userId: string, flashcardId: string): Promise<FlashcardDto> {
    try {
      logger.info("Accepting generated flashcard", { userId, flashcardId });

      // First, get the existing flashcard to check ownership and candidate status
      const { data: existingFlashcard, error: fetchError } = await this.supabase
        .from("flashcards")
        .select()
        .eq("id", flashcardId)
        .eq("user_id", userId)
        .eq("candidate", true)
        .single();

      if (fetchError) {
        logger.error("Error fetching flashcard for acceptance", { error: fetchError });
        throw new Error("Failed to fetch flashcard");
      }

      if (!existingFlashcard) {
        logger.warn("Flashcard not found or not a candidate", { flashcardId });
        throw new Error("Flashcard not found");
      }

      // Update the flashcard to mark it as accepted
      const { data: updatedFlashcard, error: updateError } = await this.supabase
        .from("flashcards")
        .update({ candidate: false, updated_at: new Date().toISOString() })
        .eq("id", flashcardId)
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError) {
        logger.error("Error accepting flashcard", { error: updateError });
        throw new Error("Failed to accept flashcard");
      }

      if (!updatedFlashcard) {
        throw new Error("Flashcard update failed");
      }

      logger.info("Successfully accepted flashcard", { flashcardId });

      return mapDatabaseFlashcardToDto(updatedFlashcard);
    } catch (error) {
      logger.error("Error in acceptGeneratedFlashcard", { error });
      throw error;
    }
  }
}

// Factory function to create FlashcardService instance
export const createFlashcardService = (supabase: SupabaseClient): FlashcardService => {
  return new FlashcardService(supabase);
};
