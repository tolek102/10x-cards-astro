# API Endpoint Implementation Plan: Create Manual Flashcard

## 1. Przegląd punktu końcowego

Endpoint umożliwia tworzenie pojedynczej fiszki (flashcard) w trybie manualnym. Fiszki utworzone manualnie są automatycznie oznaczane jako zweryfikowane (candidate=false) i mają źródło ustawione na "MANUAL". Endpoint wymaga uwierzytelnienia użytkownika.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- URL: `/api/flashcards`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer {token}` (Supabase JWT)
- Request Body:
  ```typescript
  {
    front: string; // max 200 znaków
    back: string; // max 500 znaków
    source: "MANUAL"; // stała wartość
    candidate: false; // stała wartość
  }
  ```

## 3. Wykorzystywane typy

```typescript
// Existing types from types.ts
import type { FlashcardCreateDto, FlashcardDto } from "../types";

// New Zod validation schema
const createManualFlashcardSchema = z.object({
  front: z.string().min(1).max(200),
  back: z.string().min(1).max(500),
  source: z.literal("MANUAL"),
  candidate: z.literal(false),
});
```

## 4. Szczegóły odpowiedzi

- Sukces (201 Created):
  ```typescript
  {
    id: number;
    front: string;
    back: string;
    source: "MANUAL";
    candidate: false;
    created_at: string;
    updated_at: string;
  }
  ```
- Błędy:
  - 400: Nieprawidłowe dane wejściowe
  - 401: Brak autoryzacji
  - 500: Błąd serwera

## 5. Przepływ danych

1. Walidacja żądania HTTP
2. Autoryzacja użytkownika przez Supabase
3. Walidacja danych wejściowych (Zod)
4. Utworzenie fiszki w bazie danych
5. Aktualizacja statystyk użytkownika
6. Zwrócenie utworzonej fiszki

## 6. Względy bezpieczeństwa

1. Autoryzacja:

   - Wymagane uwierzytelnienie przez Supabase
   - Weryfikacja tokena JWT
   - Dostęp tylko do własnych fiszek

2. Walidacja danych:

   - Sanityzacja danych wejściowych
   - Ścisła walidacja długości pól
   - Walidacja typów danych

3. Bezpieczeństwo bazy danych:
   - Używanie prepared statements
   - Walidacja foreign keys
   - Transakcyjne operacje na wielu tabelach

## 7. Obsługa błędów

1. Walidacja wejścia:

   ```typescript
   {
     error: "Validation failed",
     details: [
       { field: "front", message: "Text too long (max 200 chars)" }
     ]
   }
   ```

2. Błędy autoryzacji:

   ```typescript
   {
     error: "Unauthorized",
     message: "Please log in to create flashcards"
   }
   ```

3. Błędy systemowe:
   ```typescript
   {
     error: "Internal server error",
     message: "Failed to create flashcard"
   }
   ```

## 8. Rozważania dotyczące wydajności

1. Indeksowanie:

   - Wykorzystanie istniejącego indeksu na user_id
   - Indeks na created_at dla sortowania

2. Cachowanie:

   - Brak potrzeby cachowania dla operacji tworzenia
   - Możliwe cachowanie statystyk użytkownika

3. Optymalizacje:
   - Batch updates dla statystyk
   - Przygotowane zapytania Supabase

## 9. Etapy wdrożenia

### 1. Przygotowanie typów i schematów

1. Zweryfikować istniejące typy w types.ts
2. Utworzyć schemat walidacji Zod
3. Dodać nowe typy błędów (jeśli potrzebne)

### 2. Rozszerzenie FlashcardService

1. Dodać metodę createManualFlashcard:
   ```typescript
   async createManualFlashcard(
     userId: string,
     command: FlashcardCreateDto
   ): Promise<FlashcardDto>
   ```
2. Zaimplementować logikę tworzenia fiszki
3. Dodać aktualizację statystyk

### 3. Implementacja endpointu

1. Utworzyć plik src/pages/api/flashcards/index.ts
2. Zaimplementować handler POST
3. Dodać walidację i obsługę błędów
4. Zintegrować z FlashcardService

### 4. Testy

1. Testy jednostkowe dla FlashcardService
2. Testy integracyjne dla endpointu
3. Testy wydajnościowe
4. Testy bezpieczeństwa

### 5. Dokumentacja

1. Zaktualizować dokumentację API
2. Dodać przykłady użycia
3. Zaktualizować README

### 6. Wdrożenie

1. Code review
2. Testy na środowisku staging
3. Wdrożenie na produkcję
4. Monitoring po wdrożeniu
