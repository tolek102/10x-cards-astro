# Schemat bazy danych - 10x-cards-astro

## 1. Lista tabel z kolumnami, typami danych i ograniczeniami

### 1.1. Tabela `users`

- `id`: SERIAL, PRIMARY KEY
- `email`: VARCHAR NOT NULL UNIQUE
- `password`: VARCHAR NOT NULL
- `created_at`: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

### 1.2. Tabela `flashcards`

- `id`: SERIAL, PRIMARY KEY
- `user_id`: INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `front`: VARCHAR(200) NOT NULL
- `back`: VARCHAR(500) NOT NULL
- `source`: VARCHAR NOT NULL CHECK (source IN ('AI', 'AI_EDITED', 'MANUAL'))
- `candidate`: BOOLEAN NOT NULL DEFAULT TRUE
- `created_at`: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

  **Indeks:** INDEX na kolumnie `user_id` dla optymalizacji zapytań

### 1.3. Tabela `statistics`

- `id`: SERIAL, PRIMARY KEY
- `user_id`: INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
- `generated_count`: INTEGER NOT NULL DEFAULT 0
- `accepted_unedited_count`: INTEGER NOT NULL DEFAULT 0
- `accepted_edited_count`: INTEGER NOT NULL DEFAULT 0

## 2. Relacje między tabelami

- Relacja 1-do-wielu: `users` → `flashcards` (`users.id` odpowiada `flashcards.user_id`)
- Relacja 1-do-1: `users` → `statistics` (`users.id` odpowiada unikalnemu `statistics.user_id`)

## 3. Indeksy

- PRIMARY KEY na każdej tabeli
- Unikalny indeks na `users.email`
- Indeks na `flashcards.user_id`
- Unikalny indeks na `statistics.user_id`

## 4. Zasady PostgreSQL (Row-Level Security - RLS)

- Włącz RLS dla tabeli `flashcards`:

  ```sql
  ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
  CREATE POLICY user_flashcards_policy ON flashcards
      USING (user_id = current_setting('app.current_user_id')::INTEGER);
  ```

  (Aplikacja musi ustawiać zmienną sesyjną `app.current_user_id` zgodnie z aktualnym użytkownikiem.)

- Opcjonalnie, RLS można zaimplementować także dla tabeli `statistics`.

## 5. Dodatkowe uwagi

- Wszystkie kolumny czasowe korzystają z typu `TIMESTAMP WITH TIME ZONE` dla prawidłowej obsługi stref czasowych.
- Schemat jest znormalizowany do 3NF, co zapewnia wydajność i skalowalność.
- Mechanizm RLS gwarantuje, że użytkownik ma dostęp jedynie do swoich danych.
