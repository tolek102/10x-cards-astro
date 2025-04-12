import type { Database } from "./db/database.types";

// Extract database table rows for type derivation

type UserRow = Database["public"]["Tables"]["users"]["Row"];
type FlashcardRow = Database["public"]["Tables"]["flashcards"]["Row"];
type StatisticsRow = Database["public"]["Tables"]["statistics"]["Row"];

/**
 * User DTOs and Commands
 */

// User DTO omitting sensitive data
export type UserDto = Omit<UserRow, "password">;

// Command for registering a user
export type RegisterUserCommand = Pick<UserRow, "email" | "password">;

// Command for logging in a user
export type LoginUserCommand = Pick<UserRow, "email" | "password">;

// Response DTO for a successful login including token and user details
export interface LoginUserResponseDto {
  token: string;
  user: UserDto;
}

/**
 * Flashcard DTOs and Commands
 */

// Flashcard DTO mirroring the flashcards table
export type FlashcardDto = FlashcardRow;

// Command for creating a manual flashcard. Excludes auto-generated fields from the DB.
export type CreateFlashcardCommand = Omit<FlashcardDto, "id" | "user_id" | "created_at" | "updated_at"> & {
  source: "MANUAL";
  candidate: false;
};

// Command for updating an existing flashcard. The id is required to identify the flashcard.
export type UpdateFlashcardCommand = Pick<FlashcardDto, "id" | "front" | "back"> & {
  candidate: false;
};

// Command for generating flashcards via AI by providing a long text input
export interface GenerateFlashcardsCommand {
  text: string;
}

// Alias for generated flashcards DTO, identical to FlashcardDto
export type GeneratedFlashcardDto = FlashcardDto;

/**
 * Generic Pagination DTO
 */

export interface PaginatedResult<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

/**
 * Statistics DTO
 */

export type StatisticsDto = StatisticsRow;
