# API Endpoint Implementation Plan: Delete Flashcard

## 1. Przegląd punktu końcowego
Celem endpointu jest usunięcie konkretnej fiszki poprzez identyfikator. Operacja ta jest dostępna tylko dla uwierzytelnionego użytkownika, który jest właścicielem danej fiszki. W przypadku sukcesu zwracany jest status 204 No Content.

## 2. Szczegóły żądania
- **Metoda HTTP:** DELETE
- **Struktura URL:** `/api/flashcards/{id}`
- **Parametry:**
  - **Wymagany:**
    - Path parameter: `id` (identyfikator fiszki, typ integer)
- **Request Body:** Brak
- **Autoryzacja:** Wymagana – token autoryzacyjny (Bearer token przekazywany w nagłówku)

## 3. Wykorzystywane typy
- **FlashcardDto:** Reprezentuje model fiszki (pola: id, front, back, source, candidate, created_at, updated_at)
- *(Opcjonalnie)* **FlashcardDeleteCommand:** Model polecenia dla warstwy logiki biznesowej, umożliwiający ujednolicenie operacji usuwania

## 4. Szczegóły odpowiedzi
- **204 No Content:** Fiszka została pomyślnie usunięta.
- **Kody błędów:**
  - **401 Unauthorized:** Użytkownik nie jest uwierzytelniony.
  - **404 Not Found:** Fiszka o podanym `id` nie istnieje lub nie należy do zalogowanego użytkownika.
  - **500 Internal Server Error:** Wystąpił nieoczekiwany błąd po stronie serwera.

## 5. Przepływ danych
1. Klient wysyła żądanie HTTP DELETE na endpoint `/api/flashcards/{id}` wraz z nagłówkiem autoryzacyjnym.
2. Middleware autoryzacyjne weryfikuje token i ustawia dane użytkownika w kontekście (np. `context.locals.supabase`).
3. Endpoint parsuje parametr `id` z URL i waliduje, czy jest poprawnym integerem.
4. Serwis (np. `FlashcardService`) wyszukuje fiszkę w bazie danych, filtrując po `id` oraz `user_id` zalogowanego użytkownika.
5. Jeśli fiszka nie istnieje lub użytkownik nie ma do niej dostępu, zwracany jest błąd 404 Not Found.
6. Jeśli fiszka istnieje, wykonywana jest operacja usunięcia przy użyciu zapytań parametryzowanych lub ORM.
7. Po pomyślnym usunięciu zwracany jest status 204 No Content.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie i autoryzacja:** Weryfikacja tokenu oraz sprawdzenie, czy fiszka należy do zalogowanego użytkownika.
- **Walidacja danych:** Sprawdzenie, że parametr `id` jest liczbą całkowitą.
- **Ochrona przed SQL Injection:** Użycie zapytań parametryzowanych lub ORM.
- **Audyt i logowanie:** Rejestrowanie operacji usunięcia dla celów monitorowania i audytu.

## 7. Obsługa błędów
- **401 Unauthorized:** Jeśli żądanie pochodzi od niezautoryzowanego użytkownika.
- **404 Not Found:** Jeśli fiszka nie została znaleziona lub nie należy do danego użytkownika.
- **500 Internal Server Error:** W przypadku nieoczekiwanych błędów, które powinny być logowane w systemie.

## 8. Rozważania dotyczące wydajności
- Wykorzystanie indeksu na kolumnach `user_id` i `id` w tabeli `flashcards` dla szybkiego wyszukiwania.
- Operacja usuwania jest szybka, lecz warto monitorować logi pod kątem ewentualnych problemów wydajnościowych.
- Rozważenie wdrożenia rate limiting dla operacji modyfikujących dane.

## 9. Etapy wdrożenia
1. **Przygotowanie środowiska:** Upewnienie się, że middleware autoryzacyjne działa poprawnie.
2. **Parsowanie i walidacja:** Implementacja parsowania parametru `id` oraz jego walidacji.
3. **Rozszerzenie serwisu:** Dodanie metody w `FlashcardService` obsługującej usunięcie fiszki z weryfikacją `user_id`.
4. **Obsługa błędów:** Implementacja zwracania odpowiednich kodów błędów (401, 404, 500) oraz rejestrowanie błędów.
5. **Testowanie:** Napisanie testów jednostkowych i integracyjnych, obejmujących przypadki pomyślnego usunięcia i wystąpienia błędów.
6. **Dokumentacja:** Aktualizacja dokumentacji API o opis nowego endpointu.
7. **Wdrożenie:** Code review, wdrożenie na środowisko staging, a następnie monitorowanie po wdrożeniu na produkcję. 