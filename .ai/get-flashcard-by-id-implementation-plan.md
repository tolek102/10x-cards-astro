# API Endpoint Implementation Plan: Get Flashcard by ID

## 1. Przegląd punktu końcowego
Endpoint służy do pobierania szczegółów konkretnej fiszki na podstawie jej identyfikatora. Umożliwia autoryzowanym użytkownikom odczyt danych fiszki oraz weryfikację, czy fiszka należy do zalogowanego użytkownika.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET
- **Struktura URL:** /api/flashcards/{id}
- **Parametry:**
  - **Wymagane:**
    - `id` (parametr ścieżki, liczbowy) – unikalny identyfikator fiszki
  - **Opcjonalne:** brak
- **Request Body:** Brak (GET method)

## 3. Szczegóły odpowiedzi
- **200 OK:** Zwracane są szczegóły fiszki w formacie JSON zgodnym z typem `FlashcardDto`.
- **401 Unauthorized:** Użytkownik nie jest uwierzytelniony.
- **404 Not Found:** Fiszka o podanym `id` nie została znaleziona.
- **500 Internal Server Error:** Wystąpił błąd po stronie serwera.

## 4. Przepływ danych
1. Klient wysyła zapytanie GET do `/api/flashcards/{id}` z odpowiednimi nagłówkami autoryzacji.
2. Middleware lub endpoint weryfikuje token uwierzytelniający i ekstrahuje dane użytkownika.
3. Parametr `id` jest walidowany (sprawdzenie czy jest liczbą).
4. Usługa (`flashcardService`) wykonuje zapytanie do bazy danych za pomocą klienta Supabase, pobierając rekord fiszki odpowiadający podanemu `id`.
5. Weryfikacja, czy pobrana fiszka należy do uwierzytelnionego użytkownika.
6. Wynik jest mapowany do struktury `FlashcardDto` i zwracany w odpowiedzi.

## 5. Względy bezpieczeństwa
- **Uwierzytelnienie i autoryzacja:** Endpoint wymaga poprawnego tokena JWT; tylko autoryzowani użytkownicy mogą uzyskać dostęp.
- **Walidacja danych wejściowych:** Sprawdzenie, czy `id` jest liczbą.
- **Weryfikacja własności:** Upewnienie się, że pobierana fiszka należy do użytkownika wysyłającego żądanie.
- **Bezpieczne zapytania do bazy:** Użycie mechanizmów Supabase dla parametryzowanych zapytań.

## 6. Obsługa błędów
- **400 Bad Request:** W przypadku nieprawidłowego formatu `id`.
- **401 Unauthorized:** Gdy użytkownik nie jest uwierzytelniony.
- **404 Not Found:** Jeśli fiszka o podanym `id` nie istnieje.
- **500 Internal Server Error:** Dla nieoczekiwanych błędów; błędy logowane poprzez `loggerService`.

## 7. Wydajność
- Wykorzystanie indeksowania na kolumnach `id` i `user_id` zapewnia szybkie wyszukiwanie.
- Optymalizacja zapytań dzięki wykorzystaniu wbudowanych mechanizmów Supabase.
- Możliwość wdrożenia cache'owania wyników dla często pobieranych fiszek.

## 8. Kroki implementacji
1. Utworzenie nowego pliku endpointa, np. `src/pages/api/flashcards/[id].ts`.
2. Implementacja walidacji parametru `id` (sprawdzenie, czy jest liczbowy).
3. Weryfikacja uwierzytelnienia użytkownika (sprawdzenie tokena JWT).
4. Inicjalizacja usługi `flashcardService` przy użyciu `locals.supabase`.
5. Dodanie metody `getFlashcardById` w `flashcardService`, która pobiera fiszkę z bazy danych i weryfikuje własność.
6. Mapowanie danych z bazy do struktury `FlashcardDto`.
7. Zwrócenie odpowiedzi 200 OK z danymi fiszki lub odpowiedniego kodu błędu (401/404/500).
8. Dodanie odpowiednich logów błędów przy użyciu `loggerService`.
9. Testowanie endpointa przy użyciu narzędzi takich jak Postman oraz implementacja testów integracyjnych. 