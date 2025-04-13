# API Endpoint Implementation Plan: List Accepted Flashcards

## 1. Przegląd punktu końcowego
Ten endpoint ma za zadanie zwrócić paginowaną listę zaakceptowanych fiszek (czyli tych, których flaga `candidate` ma wartość `false`) dla uwierzytelnionego użytkownika. Endpoint umożliwia klientowi pobranie fiszek wraz z metadanymi dotyczącymi paginacji.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET
- **Struktura URL:** `/api/flashcards`
- **Parametry zapytania:**
  - **page** (opcjonalny): numer strony; domyślna wartość to 1
  - **limit** (opcjonalny): liczba wyników na stronę; domyślna wartość to 20
  - **sort** (opcjonalny): kryterium sortowania, np. `created_at_desc` lub `created_at_asc`
- **Body:** Brak

## 3. Wykorzystywane typy
- **FlashcardDto:** reprezentuje pojedynczą fiszkę (pola: `id`, `front`, `back`, `source`, `candidate`, `created_at`, `updated_at`)
- **FlashcardsListResponseDto:** zawiera listę fiszek oraz metadane paginacji
- **PaginationDto:** zawiera informacje o bieżącej stronie, limicie oraz łącznej liczbie wyników

## 4. Szczegóły odpowiedzi
- **200 OK:** Zwracana odpowiedź zawiera:
  - `data`: tablica obiektów typu `FlashcardDto`
  - `pagination`: obiekt zawierający `page`, `limit` i `total`
- **401 Unauthorized:** Użytkownik nie jest uwierzytelniony
- **400 Bad Request:** Nieprawidłowe parametry (np. błędne wartości `page`, `limit` lub `sort`)
- **500 Internal Server Error:** Błąd po stronie serwera

## 5. Przepływ danych
1. **Uwierzytelnienie:** Endpoint sprawdza, czy żądanie pochodzi od uwierzytelnionego użytkownika korzystając z `context.locals.supabase`.
2. **Pobranie parametrów:** Odczytanie parametrów `page`, `limit` i `sort` z query string oraz ustawienie wartości domyślnych tam, gdzie to wymagane.
3. **Walidacja:** Sprawdzenie, czy parametry posiadają prawidłowe typy i wartości (np. `page` i `limit` muszą być liczbami pozytywnymi, `sort` musi mieścić się w dozwolonych wartościach).
4. **Zapytanie do bazy:** Wykonanie zapytania do tabeli `flashcards` z filtrami:
   - `user_id` równe identyfikatorowi uwierzytelnionego użytkownika
   - `candidate` ustawione na `false`
5. **Sortowanie i paginacja:** Zastosowanie sortowania (jeśli określone) oraz paginacji (przy użyciu limitu i offsetu).
6. **Zliczenie wyników:** Pobranie łącznej liczby fiszek spełniających kryteria w celu uzupełnienia metadanych paginacji.
7. **Budowa odpowiedzi:** Utworzenie obiektu odpowiedzi zawierającego dane fiszek oraz metadane, a następnie odesłanie go z kodem 200.

## 6. Względy bezpieczeństwa
- **Uwierzytelnienie:** Endpoint powinien być dostępny tylko dla zalogowanych użytkowników.
- **Autoryzacja:** Weryfikacja, czy użytkownik może przeglądać tylko swoje własne fiszki.
- **Walidacja danych:** Dokładna walidacja parametrów wejściowych, aby zapobiec atakom typu injection.
- **Bezpieczne zapytania:** Użycie mechanizmów ORM lub zapytań przygotowywanych w celu zabezpieczenia przed SQL Injection.

## 7. Obsługa błędów
- **401 Unauthorized:** Zwracany, gdy użytkownik nie jest uwierzytelniony.
- **400 Bad Request:** Zwracany w przypadku nieprawidłowych parametrów (np. nieprawidłowy format, wartość ujemna).
- **500 Internal Server Error:** Zwracany, gdy wystąpi nieoczekiwany błąd po stronie serwera; dodatkowo logowanie błędów dla celów debugowania.

## 8. Rozważania dotyczące wydajności
- **Indeks bazy danych:** Wykorzystanie istniejącego indeksu na kolumnie `user_id` w tabeli `flashcards` w celu optymalizacji zapytań.
- **Pagniacja:** Ograniczenie wyników zapytania poprzez stosowanie limitów i offsetów, aby zmniejszyć obciążenie bazy danych.
- **Optymalizacja zapytań:** Selektywne pobieranie tylko niezbędnych kolumn z tabeli.

## 9. Etapy wdrożenia
1. Utworzenie pliku endpointu: `/src/pages/api/flashcards/index.ts`
2. Implementacja mechanizmu uwierzytelnienia na poziomie endpointu przy użyciu `context.locals.supabase`.
3. Pobranie i walidacja parametrów query (`page`, `limit`, `sort`), w tym ustawienie wartości domyślnych.
4. Wyodrębnienie logiki zapytania do serwisu (np. `flashcardsService` w `/src/lib/services`) lub utworzenie nowego serwisu do obsługi fiszek.
5. Budowa zapytania do bazy danych, filtrowanie fiszek użytkownika z flagą `candidate = false`, zastosowanie sortowania oraz paginacji.
6. Zliczenie całkowitej liczby wyników dla metadanych paginacji.
7. Budowa odpowiedzi w formacie `FlashcardsListResponseDto` i zwrócenie jej z kodem 200.
8. Dodanie odpowiedniej obsługi błędów, w tym zwracanie 401, 400 oraz 500 w razie potrzeby.
9. Dodanie logowania błędów na potrzeby debugowania oraz monitoringu.
10. Napisanie testów jednostkowych oraz integracyjnych, aby upewnić się, że endpoint działa zgodnie z oczekiwaniami. 