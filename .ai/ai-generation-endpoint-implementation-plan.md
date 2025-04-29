# API Endpoint Implementation Plan: Auto-Generate Flashcards via AI

## 1. Przegląd punktu końcowego

Endpoint realizuje przetwarzanie długiego tekstu wejściowego poprzez zewnętrzną usługę AI w celu wygenerowania propozycji fiszek (flashcards). Jego celem jest umożliwienie użytkownikowi uzyskania zestawu fiszek, które mogą być następnie zaakceptowane lub edytowane.

## 2. Szczegóły żądania

- **Metoda HTTP:** POST
- **Struktura URL:** `/api/flashcards/generate`
- **Parametry:**

  - **Wymagane:**
    - `text` (string, 1000-10000 znaków) – długi tekst wejściowy do przetworzenia.
  - **Opcjonalne:** Brak

- **Request Body:**
  ```json
  {
    "text": "Long text input (between 1000 to 10000 characters)"
  }
  ```

## 3. Wykorzystywane typy

- **DTOs i Command Modele:**
  - `GenerateFlashcardsCommand`: Model zawierający pole `text`.
  - `FlashcardDto`: DTO reprezentujący pojedynczą fiszkę (pola: `id`, `front`, `back`, `source`, `candidate`, `created_at`, `updated_at`).
  - `GeneratedFlashcardDto`: Alias typu na tablicę `FlashcardDto`.

## 4. Szczegóły odpowiedzi

- **200 OK:** Zwraca listę wygenerowanych fiszek, gdzie każda fiszka ma:
  - `id`
  - `front`
  - `back`
  - `source` ustawione na "AI"
  - `candidate` ustawione na `true`
  - `created_at`
  - `updated_at`
- **Błędy:**
  - **400 Bad Request:** Błąd walidacji danych wejściowych (np. tekst zbyt krótki lub zbyt długi).
  - **500 Internal Server Error:** Błąd serwera, np. związany z wywołaniem usługi AI.

## 5. Przepływ danych

1. Nadchodzi żądanie HTTP zawierające długi tekst w ciele żądania.
2. Żądanie jest walidowane przy użyciu `zod` – sprawdzany jest m.in. format oraz długość pola `text`.
3. Logika biznesowa (w serwisie, np. `src/lib/services/flashcardService.ts`) wywołuje zewnętrzną usługę AI, przekazując otrzymany tekst.
4. Odebrane dane z AI (flashcards candidate) są, w razie potrzeby, zapisywane w bazie danych (tabela `flashcards` z `source` ustawionym na "AI" oraz `candidate` na `true`).
5. Opcjonalnie, aktualizowane są statystyki użytkownika w tabeli `statistics`.
6. Endpoint zwraca odpowiedź JSON zawierającą listę wygenerowanych fiszek.

## 6. Względy bezpieczeństwa

- **Walidacja:** Dane wejściowe są walidowane przy użyciu `zod` (np. walidacja długości tekstu).
- **RLS:** Przy operacjach na tabeli `flashcards` stosowane są zasady Row-Level Security (RLS).
- **Obsługa błędów:** Szczegółowe logowanie błędów bez ujawniania wrażliwych informacji użytkownikowi.

## 7. Obsługa błędów

- **400 Bad Request:** W przypadku nieprawidłowych danych wejściowych (np. tekst nie spełnia ograniczeń długości).
- **500 Internal Server Error:** Jeżeli wystąpi błąd podczas komunikacji z usługą AI lub inny błąd serwera.
- Każdy błąd powinien być odpowiednio logowany celem analizy i debugowania.

## 8. Rozważania dotyczące wydajności

- Walidacja wejścia ogranicza przetwarzanie jedynie do poprawnych danych, co zapobiega niepotrzebnym wywołaniom usługi AI.
- Użycie asynchronicznych wywołań usług zewnętrznych minimalizuje blokowanie głównego wątku.
- Rozważenie buforowania wyników, aby ograniczyć liczbę wywołań dla identycznych danych wejściowych.

## 9. Etapy wdrożenia

1. Utworzenie nowego endpointu `/api/flashcards/generate` w katalogu `src/pages/api/flashcards/`.
2. Stworzenie schematu walidacyjnego przy użyciu `zod` dla `GenerateFlashcardsCommand`.
3. Implementacja logiki biznesowej w serwisie, np. w pliku `src/lib/services/flashcardService.ts`, do komunikacji z usługą AI. Na etapie developmentu skozystamy z mocków zamiast wywolania serwisu AI.
4. Wywołanie zewnętrznej usługi AI i przetworzenie otrzymanych danych.
5. Opcjonalne zapisywanie wygenerowanych fiszek do bazy danych i aktualizacja statystyk użytkownika.
6. Przygotowanie struktury odpowiedzi zgodnie z dokumentacją DTO i Command Modelami.
7. Dodanie kompleksowej obsługi błędów oraz logowania.
8. Testowanie endpointu (jednostkowe, integracyjne, E2E) w celu weryfikacji poprawności działania.
9. Przegląd kodu przez zespół i wdrożenie na środowisko testowe przed produkcyjnym uruchomieniem.
