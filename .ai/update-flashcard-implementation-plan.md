# API Endpoint Implementation Plan: Update Flashcard

## 1. Przegląd punktu końcowego

Celem punktu końcowego jest umożliwienie zaktualizowania istniejącej fiszki przez uwierzytelnionego użytkownika. Podczas aktualizacji:

- Jeśli fiszka jest kandydatem (candidate = true), zostanie automatycznie zaakceptowana (candidate zostanie ustawione na false).
- Jeśli źródłem fiszki jest "AI", po edycji zostanie zmienione na "AI_EDITED".

## 2. Szczegóły żądania

- **Metoda HTTP:** PATCH
- **Struktura URL:** /api/flashcards/{id}
- **Parametry:**
  - **Wymagane:**
    - Path parameter: id (identyfikator fiszki do aktualizacji)
    - Request Body (JSON)- conajmniej jedno z pól:
      - `front`: string (maksymalnie 200 znaków)
      - `back`: string (maksymalnie 500 znaków)
      - `candidate`: boolean (zazwyczaj przekazywane jako false, aby potwierdzić akceptację)
  - **Opcjonalne:** Brak

## 3. Wykorzystywane typy

- **DTO:**
  - `FlashcardDto` – zawiera: id, front, back, source, candidate, created_at, updated_at
- **Command Model:**
  - `FlashcardUpdateDto` – umożliwia częściową aktualizację pól: front, back, candidate, (opcjonalnie source)
- Walidacja wejściowych danych powinna być realizowana przy użyciu schematu Zod.

## 4. Szczegóły odpowiedzi

- **200 OK:** Zwraca zaktualizowane szczegóły fiszki w formacie JSON.
- **Kody błędów:**
  - 400: Błąd walidacji (np. przekroczenie limitu długości pól)
  - 401: Nieautoryzowany dostęp (np. brak uwierzytelnienia)
  - 404: Fiszka nie została znaleziona lub nie należy do użytkownika
  - 500: Błąd serwera

## 5. Przepływ danych

1. Odbiór żądania i weryfikacja uwierzytelnienia użytkownika (np. za pomocą Supabase Auth wykorzystując `context.locals`).
2. Walidacja struktury żądania przy użyciu Zod, sprawdzenie ograniczeń długości dla `front` i `back`.
3. Pobranie fiszki z bazy danych przy użyciu podanego id i weryfikacja, czy należy do zalogowanego użytkownika.
4. Zastosowanie logiki biznesowej:
   - Jeśli fiszka jest kandydatem, ustawienie `candidate` na false.
   - Jeśli `source` fiszki wynosi "AI", zmiana na "AI_EDITED".
5. Aktualizacja rekordu fiszki w bazie danych.
6. Zwrócenie zaktualizowanych danych fiszki w odpowiedzi.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie i autoryzacja:**
  - Sprawdzenie poprawności sesji użytkownika.
  - Weryfikacja przynależności fiszki (flashcard.user_id) do bieżącego użytkownika.
- **Walidacja danych:**
  - Stosowanie schematów walidacji (Zod) dla request body.
- **Ochrona przed atakami:**
  - Sanitizacja danych wejściowych, aby zapobiec atakom typu injection.

## 7. Obsługa błędów

- **400 Bad Request:**
  - Nieprawidłowa struktura danych lub przekroczenie limitu długości (np. `front` > 200 znaków, `back` > 500 znaków).
- **401 Unauthorized:**
  - Brak autoryzacji, nieprawidłowa sesja użytkownika.
- **404 Not Found:**
  - Brak fiszki o podanym id lub fiszka nie należy do zalogowanego użytkownika.
- **500 Internal Server Error:**
  - Nieoczekiwane błędy podczas operacji na bazie danych, problemy z logiką biznesową.
- Rejestrowanie błędów oraz kluczowych operacji dla dalszej diagnostyki i audytu.

## 8. Rozważania dotyczące wydajności

- Wykorzystanie indeksu na kolumnie `user_id` poprawiającego szybkość zapytań.
- Ograniczenie liczby zapytań do bazy danych i użycie transakcji dla zapewnienia spójności operacji.
- Optymalizacja walidacji danych po stronie aplikacji przed wykonaniem operacji na bazie.

## 9. Etapy wdrożenia

1. Utworzenie schematu walidacji przy użyciu Zod dla request body (sprawdzenie długości i typów pól).
2. Implementacja kontrolera endpointa (np. `/src/pages/api/flashcards/[id].ts`) z obsługą metody PUT.
3. Weryfikacja uwierzytelnienia użytkownika oraz autoryzacji dostępu do konkretnej fiszki.
4. Pobranie fiszki z bazy danych i walidacja jej istnienia oraz przynależności do aktualnego użytkownika.
5. Zastosowanie logiki biznesowej:
   - Aktualizacja pola `candidate` na false, jeśli fiszka była kandydatem.
   - Zmiana `source` z "AI" na "AI_EDITED", jeśli dotyczy.
6. Aktualizacja rekordu fiszki w bazie danych.
7. Rejestracja operacji i ewentualnych błędów w systemie logowania.
8. Testowanie endpointa przy użyciu narzędzi takich jak Postman oraz pisanie testów jednostkowych/integracyjnych.
9. Code review oraz wdrożenie do środowiska produkcyjnego.
