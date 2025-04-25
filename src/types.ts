import type { Database } from "./db/database.types";
import type { SupabaseClient } from "./db/supabase.client";

// Extract database table rows for type derivation

type UserRow = Database["public"]["Tables"]["users"]["Row"];
type FlashcardRow = Database["public"]["Tables"]["flashcards"]["Row"];
type StatisticsRow = Database["public"]["Tables"]["statistics"]["Row"];

/**
 * User DTOs and Commands
 */

// Basic user information returned by Supabase Auth
export interface UserDto {
  id: string;
  email: string;
}

// Full user information from database
export type UserDbDto = Omit<UserRow, "password">;

// Command for registering a user
export type RegisterUserCommand = Pick<UserRow, "email" | "password">;

// Command for logging in a user
export type LoginUserCommand = Pick<UserRow, "email" | "password">;

// Response DTO for a successful login including token and user details
export interface LoginUserResponseDto {
  token: string;
  user: UserDto;
}

declare global {
  namespace App {
    interface Locals {
      user: UserDto | null;
      supabase: SupabaseClient;
    }
  }
}

/**
 * Generic Pagination DTO
 */

export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
}

/**
 * Flashcard DTOs and Commands
 */

export type Source = "MANUAL" | "AI" | "AI_EDITED";

// Flashcard DTO mirroring the flashcards table
export interface FlashcardDto {
  id: string;
  front: string;
  back: string;
  source: Source;
  candidate: boolean;
  created_at: string;
  updated_at: string;
}

export interface FlashcardsListResponseDto {
  data: FlashcardDto[];
  pagination: PaginationDto;
}

export interface FlashcardCreateDto {
  front: string;
  back: string;
  source: Source;
  candidate: boolean;
}

// Command for creating multiple flashcards at once
export interface FlashcardsCreateCommand {
  flashcards: FlashcardCreateDto[];
}

export type FlashcardUpdateDto = Partial<FlashcardCreateDto>;

// Command for generating flashcards via AI by providing a long text input
export interface GenerateFlashcardsCommand {
  text: string;
}

// Alias for generated flashcards DTO, identical to FlashcardDto
export type GeneratedFlashcardDto = FlashcardDto[];

/**
 * Statistics DTO
 */

export type StatisticsDto = StatisticsRow;
