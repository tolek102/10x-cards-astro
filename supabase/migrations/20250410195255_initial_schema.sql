-- Migration: Initial Schema Setup
-- Description: Creates the initial database schema including users, flashcards, and statistics tables
-- with proper constraints, indexes, and Row Level Security policies.

-- Enable pgcrypto extension for UUID generation
create extension if not exists "pgcrypto";

-- Create users table
create table users (
    id uuid primary key default gen_random_uuid(),
    email varchar not null unique,
    password varchar not null,
    created_at timestamptz not null default now()
);

-- Enable RLS for users table
alter table users enable row level security;

-- Create RLS policies for users
create policy "Users can view their own data" on users
    for select using (auth.uid() = id);

create policy "Users can update their own data" on users
    for update using (auth.uid() = id);

-- Create flashcards table
create table flashcards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    front varchar(200) not null,
    back varchar(500) not null,
    source varchar not null check (source in ('AI', 'AI_EDITED', 'MANUAL')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create index on user_id for better query performance
create index flashcards_user_id_idx on flashcards(user_id);

-- Enable RLS for flashcards table
alter table flashcards enable row level security;

-- Create RLS policies for flashcards
create policy "Users can view their own flashcards" on flashcards
    for select using (auth.uid() = user_id);

create policy "Users can create their own flashcards" on flashcards
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own flashcards" on flashcards
    for update using (auth.uid() = user_id);

create policy "Users can delete their own flashcards" on flashcards
    for delete using (auth.uid() = user_id);

-- Create statistics table
create table statistics (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    generated_count integer not null default 0,
    accepted_unedited_count integer not null default 0,
    accepted_edited_count integer not null default 0,
    constraint statistics_user_id_unique unique (user_id)
);

-- Create index on user_id for better query performance
create index statistics_user_id_idx on statistics(user_id);

-- Enable RLS for statistics table
alter table statistics enable row level security;

-- Create RLS policies for statistics
create policy "Users can view their own statistics" on statistics
    for select using (auth.uid() = user_id);

create policy "Users can insert their own statistics" on statistics
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own statistics" on statistics
    for update using (auth.uid() = user_id);

-- Create trigger function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for flashcards table
create trigger update_flashcards_updated_at
    before update on flashcards
    for each row
    execute function update_updated_at_column(); 