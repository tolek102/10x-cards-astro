# API Endpoint Implementation Plan: Accept AI-Generated Flashcard

## 1. Przegląd punktu końcowego
Endpoint umożliwia zatwierdzenie fiszki wygenerowanej przez AI poprzez zmianę flagi `candidate` z wartości `true` na `false`. Operacja ta potwierdza, że użytkownik zaakceptował propozycję fiszki. Endpoint działa tylko wtedy, gdy żądana fiszka istnieje i należy do aktualnie uwierzytelnionego użytkownika.

## 2. Szczegóły żądania
- **Metoda HTTP:** PATCH
- **Struktura URL:** `/api/flashcards/:id/accept`
- **Nagłówki:**
  - `Authorization: Bearer {token}` (wymagany dla weryfikacji użytkownika)
  - (opcjonalnie) `Content-Type: application/json`
- **Parametry:**
  - **Wymagane:**
    - `:id` – identyfikator fiszki, która ma zostać zatwierdzona.
  - **Opcjonalne:** Brak
- **Request Body:** pole `candidate` zostanie zmienione na `false`

## 3. Wykorzystywane typy
- **FlashcardDto:** Zawiera właściwości: `id`, `front`, `back`, `source`, `candidate`, `created_at`, `updated_at`.
- **FlashcardUpdateDto:** Model do aktualizacji fiszki; w tym przypadku pole `candidate` zostanie zmienione na `false`.

## 4. Szczegóły odpowiedzi
- **200 OK:** Zwraca zaktualizowany obiekt fiszki w formacie JSON.
- **404 Not Found:** Fiszka o podanym `id` nie istnieje lub nie należy do zalogowanego użytkownika.
- **401 Unauthorized:** Brak ważnego tokena autoryzacyjnego lub nieautoryzowany dostęp.
- **400 Bad Request:** Nieprawidłowy format parametru lub inny błąd walidacyjny.
- **500 Internal Server Error:** Wystąpił błąd po stronie serwera.

## 5. Przepływ danych
1. **Autoryzacja:** Middleware weryfikuje token (np. Supabase Auth) i ustawia dane użytkownika w kontekście.
2. **Walidacja parametru:** Parametr `id` jest parsowany i sprawdzany (np. za pomocą Zod) pod kątem poprawności formatu (oczekiwany typ: integer).
3. **Weryfikacja właściwości:** Serwis sprawdza, czy fiszka o danym `id` istnieje oraz czy należy do uwierzytelnionego użytkownika.
4. **Aktualizacja rekordu:** Jeśli warunki są spełnione, w rekordzie fiszki flaga `candidate` jest ustawiana na `false`, zazwyczaj w ramach transakcji, aby zapewnić spójność.
5. **Odpowiedź:** Zaktualizowany obiekt fiszki jest zwracany zgodnie z typem `FlashcardDto`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnienie i autoryzacja:** Endpoint dostępny tylko dla zalogowanych użytkowników; weryfikowany przez token JWT (np. Supabase Auth).
- **Walidacja danych:** Parametr `id` musi być poprawnym numerem; zastosowanie mechanizmów walidacji (np. Zod) oraz prepared statements, aby zapobiec SQL injection.
- **Row-Level Security (RLS):** Wykorzystanie zasad RLS w bazie danych do weryfikacji własności fiszki.
- **Logowanie wyjątków:** Wszystkie błędy i nieoczekiwane przypadki są logowane w celu ułatwienia diagnostyki.

## 7. Obsługa błędów
- **404 Not Found:** Jeśli fiszka o podanym `id` nie istnieje lub nie należy do użytkownika.
- **401 Unauthorized:** Użytkownik nie jest uwierzytelniony lub token jest nieważny.
- **400 Bad Request:** Błędy walidacyjne, np. nieprawidłowy format `id`.
- **500 Internal Server Error:** Błąd po stronie serwera, np. problem z bazą danych lub nieoczekiwana sytuacja; wszystkie błędy powinny być rejestrowane.

## 8. Rozważania dotyczące wydajności
- **Indeksowanie:** Użycie indeksu na kolumnie `user_id` w tabeli `flashcards` dla optymalizacji zapytań.
- **Transakcje:** Zastosowanie transakcji przy aktualizacji rekordu dla zapewnienia atomowości operacji.
- **Minimalizacja obciążenia:** Operacja polega na pojedynczej aktualizacji rekordu, co ogranicza wpływ na wydajność bazy danych.

## 9. Etapy wdrożenia
1. **Implementacja middleware uwierzytelniającego:** Zapewnienie wstępnej weryfikacji tokena autoryzacyjnego.
2. **Stworzenie funkcji serwisowej:** Utworzenie metody `acceptGeneratedFlashcard(flashcardId: number, userId: number)` w warstwie serwisowej, która:
   - Weryfikuje istnienie fiszki oraz jej przynależność do użytkownika.
   - Aktualizuje flagę `candidate` na `false`.
3. **Aktualizacja endpointu:** W endpointzie `/api/flashcards/:id/accept` zaimplementować logikę wywołania powyższej funkcji oraz obsługę odpowiedzi zgodnie z opisanymi kodami statusu.
4. **Dodanie walidacji danych wejściowych:** Zapewnienie walidacji parametru `id` (np. przy użyciu Zod).
5. **Implementacja testów jednostkowych i integracyjnych:** Pokrycie testami scenariuszy:
   - Pomyślnego zatwierdzenia fiszki
   - Próby zatwierdzenia nieistniejącej fiszki (404 Not Found)
   - Błędów autoryzacji (401 Unauthorized)
   - Błędów walidacji (400 Bad Request)
6. **Logowanie błędów:** Implementacja mechanizmu logowania błędów dla ułatwienia diagnostyki.
7. **Code Review i testy integracyjne:** Przegląd kodu przez zespół i testy na środowiskach staging oraz produkcyjnym. 