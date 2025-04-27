-- Migration: Remove users table and update foreign key constraints
-- Description: Removes the users table and updates foreign key constraints to use Supabase Auth

-- Drop foreign key constraints
ALTER TABLE flashcards DROP CONSTRAINT flashcards_user_id_fkey;
ALTER TABLE statistics DROP CONSTRAINT statistics_user_id_fkey;

-- Drop users table
DROP TABLE users;

-- Update RLS policies for flashcards
DROP POLICY IF EXISTS "Users can view their own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can create their own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can update their own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can delete their own flashcards" ON flashcards;

CREATE POLICY "Users can view their own flashcards" ON flashcards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flashcards" ON flashcards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcards" ON flashcards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcards" ON flashcards
    FOR DELETE USING (auth.uid() = user_id);

-- Update RLS policies for statistics
DROP POLICY IF EXISTS "Users can view their own statistics" ON statistics;
DROP POLICY IF EXISTS "Users can update their own statistics" ON statistics;

CREATE POLICY "Users can view their own statistics" ON statistics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics" ON statistics
    FOR UPDATE USING (auth.uid() = user_id);

-- Add comment explaining the change
COMMENT ON TABLE flashcards IS 'Flashcards table with user_id referencing Supabase Auth users';
COMMENT ON TABLE statistics IS 'Statistics table with user_id referencing Supabase Auth users'; 