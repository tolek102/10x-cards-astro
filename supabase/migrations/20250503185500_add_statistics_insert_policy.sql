-- Migration: Add INSERT policy for statistics table
-- Description: Adds missing RLS policy to allow users to insert their own statistics records

-- Add INSERT policy for statistics table
create policy "Users can insert their own statistics" on statistics
    for insert with check (auth.uid() = user_id); 