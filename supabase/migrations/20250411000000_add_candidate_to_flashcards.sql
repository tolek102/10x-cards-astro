-- Migration: Add candidate field to flashcards table
-- Description: Adds a boolean field 'candidate' to the flashcards table with a default value of true

-- Add candidate column to flashcards table
ALTER TABLE flashcards ADD COLUMN candidate BOOLEAN NOT NULL DEFAULT TRUE;

-- Add comment to explain the purpose of the candidate field
COMMENT ON COLUMN flashcards.candidate IS 'Indicates whether the flashcard is a candidate for review or has been accepted by user'; 