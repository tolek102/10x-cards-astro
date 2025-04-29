# API Endpoint Implementation Plan: List Candidate Flashcards

## 1. Przegląd punktu końcowego

Endpoint odpowiada za pobieranie karty kandydackich (candidate = true) dla uwierzytelnionego użytkownika. Umożliwia paginację oraz sortowanie wyników i stanowi część zarządzania flashcards.

## 2. Szczegóły żądania

- **Metoda HTTP:** GET
- **URL:** `/api/flashcards/candidates`
- **Parametry zapytania:**
  - `page` (opcjonalne, domyślnie 1): numer strony
  - `limit` (opcjonalne, domyślnie 20): liczba wyników na stronę
  - `sort` (opcjonalne, np. `created_at_desc` lub `created_at_asc`): kryterium sortowania
- **Request Body:** Brak

## 3. Wykorzystywane typy

- **FlashcardDto:** zawiera pola: `id`, `front`, `back`, `source`, `candidate`, `created_at`, `updated_at`.
- **PaginationDto:** zawiera pola: `page`, `limit`, `total`.
- **FlashcardsListResponseDto:** struktura odpowiedzi zawierająca listę flashcards (`data: FlashcardDto[]`) oraz metadane paginacji (`pagination: PaginationDto`).

## 4. Szczegóły odpowiedzi

- **200 OK:** Zwraca poprawnie sformatowaną listę flashcards kandydackich wraz z danymi paginacyjnymi.
- **401 Unauthorized:** Jeśli użytkownik nie jest uwierzytelniony.
- **Struktura odpowiedzi:**
  ```json
  {
    "data": [
      {
        "id": 1,
        "front": "Przykładowe pytanie",
        "back": "Przykładowa odpowiedź",
        "source": "AI",
        "candidate": true,
        "created_at": "2023-10-01T12:00:00Z",
        "updated_at": "2023-10-01T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100
    }
  }
  ```

## 5. Przepływ danych

1. **Autentykacja:** Weryfikacja tokenu użytkownika (np. z `context.locals`). Jeśli token nie jest prawidłowy, zwracane jest 401 Unauthorized.
2. **Zapytanie do bazy danych:** Wyszukiwanie rekordów w tabeli `flashcards` z warunkiem `candidate = true` i filtrowaniem po `user_id`.
3. **Pagacja i sortowanie:** Użycie przekazanych parametrów `page`, `limit` oraz `sort` przy budowie zapytania SQL.
4. **Mapowanie wyników:** Konwersja wyników z bazy danych na strukturę `FlashcardDto` i utworzenie obiektu `FlashcardsListResponseDto`.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie i autoryzacja:** Weryfikacja poprawności tokena użytkownika, korzystając z mechanizmu np. Supabase Auth oraz `context.locals`.
- **Walidacja parametrów:** Użycie narzędzia do walidacji (Zod) w celu sprawdzenia, czy parametry `page`, `limit` i `sort` mają prawidłowe typy i wartości.
- **Bezpieczeństwo zapytań do bazy:** Używanie zapytań parametryzowanych zapobiegających SQL Injection.
- **Rate Limiting:** Opcjonalne wdrożenie ograniczeń na liczbę zapytań w jednostce czasu.

## 7. Obsługa błędów

- **401 Unauthorized:** Brak lub nieprawidłowy token użytkownika.
- **400 Bad Request:** Nieprawidłowe lub brakujące parametry zapytania (np. `page` lub `limit` poza dozwolonym zakresem).
- **500 Internal Server Error:** Błąd po stronie serwera lub problem z bazą danych.
- **Logowanie:** Każdy błąd powinien być logowany przy użyciu centralnego systemu logowania, co pozwala na monitorowanie i debugowanie problemów.

## 8. Rozważania dotyczące wydajności

- **Indeksacja:** Kolumna `user_id` w tabeli `flashcards` jest indeksowana, co przyspiesza filtrowanie wyników.
- **Pagacja:** Ograniczenie liczby wyników na stronę zmniejsza obciążenie serwera oraz transfer danych.
- **Optymalizacja zapytań:** Upewnienie się, że zapytania są zoptymalizowane, a sortowanie odbywa się po indeksowanych polach.
- **Cache:** Rozważenie buforowania wyników, jeśli zapytania stają się częste.

## 9. Etapy wdrożenia

1. **Konfiguracja endpointu:** Utworzenie pliku endpointu w `src/pages/api/flashcards/candidates.ts`.
2. **Walidacja zapytań:** Implementacja walidacji parametrów zapytania przy użyciu Zod.
3. **Dostęp do bazy danych:** Nawiązanie połączenia z bazą danych przy użyciu odpowiedniego klienta (np. SupabaseClient z `src/db/supabase.client.ts`) i pobranie flashcards dla uwierzytelnionego użytkownika.
4. **Implementacja paginacji i sortowania:** Dynamiczne budowanie zapytań SQL z wykorzystaniem przekazanych parametrów.
5. **Mapowanie wyników:** Przekształcenie wyników bazy danych do obiektu `FlashcardsListResponseDto`.
6. **Logika błędów:** Dodanie odpowiedniej obsługi błędów oraz systemu logowania.
7. **Testy:** Przeprowadzenie testów jednostkowych i integracyjnych endpointu.
8. **Code Review i wdrożenie:** Przegląd kodu przez zespół i wdrożenie do środowiska produkcyjnego.
