```markdown
# Plan Testów dla Aplikacji 10x Cards

**Wersja:** 1.0
**Data:** 2025-04-29
**Autor:** Paweł Bachta - przy uzyciu Gemini 2.5 Pro

## 1. Wprowadzenie i Cele Testowania

### 1.1. Wprowadzenie

Niniejszy dokument opisuje plan testów dla aplikacji webowej "10x Cards", służącej do tworzenia, zarządzania i nauki przy użyciu fiszek, z opcjonalnym wykorzystaniem sztucznej inteligencji do ich generowania. Aplikacja zbudowana jest w oparciu o framework Astro z wykorzystaniem React dla komponentów interaktywnych oraz Supabase jako backendu (BaaS) i OpenRouter do generowania treści AI.

### 1.2. Cele Testowania

Główne cele procesu testowania to:

- Weryfikacja, czy aplikacja spełnia zdefiniowane wymagania funkcjonalne i niefunkcjonalne.
- Identyfikacja i raportowanie defektów w oprogramowaniu.
- Zapewnienie wysokiej jakości, stabilności i użyteczności aplikacji przed wdrożeniem.
- Weryfikacja poprawności integracji z usługami zewnętrznymi (Supabase, OpenRouter).
- Ocena bezpieczeństwa aplikacji, zwłaszcza w kontekście autentykacji i autoryzacji.
- Zapewnienie spójnego i intuicyjnego interfejsu użytkownika (UI/UX).
- Minimalizacja ryzyka związanego z wdrożeniem nowych funkcjonalności lub zmian.

## 2. Zakres Testów

### 2.1. Funkcjonalności objęte testami:

- **Autentykacja użytkownika:** Rejestracja, Logowanie, Wylogowanie, Resetowanie hasła.
- **Zarządzanie fiszkami (Kreator):**
  - Tworzenie ręczne fiszek (walidacja pól, zapis).
  - Generowanie fiszek przez AI (wprowadzanie tekstu, walidacja długości, proces generowania, obsługa błędów AI, zapis kandydatów).
  - Wyświetlanie ostatnio utworzonych/wygenerowanych fiszek w sekcji Kreatora.
- **Zarządzanie fiszkami (Podgląd):**
  - Wyświetlanie listy zaakceptowanych fiszek.
  - Wyświetlanie listy kandydatów na fiszki.
  - Paginacja dla obu list.
  - Zmiana liczby elementów na stronie.
  - Sortowanie list (jeśli zaimplementowane zgodnie z API).
  - Edycja fiszek (zaakceptowanych i kandydatów) - walidacja, zapis zmian, zmiana statusu (AI -> AI_EDITED, candidate -> false).
  - Usuwanie fiszek (zaakceptowanych i kandydatów).
  - Akceptacja fiszek kandydatów.
  - Odrzucanie fiszek kandydatów (równoznaczne z usunięciem).
  - Eksport zaakceptowanych fiszek (format JSON, CSV).
  - Interakcje z kartą fiszki (odwracanie, przyciski akcji).
- **Nauka:**
  - Rozpoczęcie sesji nauki (tylko z zaakceptowanymi fiszkami).
  - Wyświetlanie fiszek (przód/tył).
  - Odwracanie fiszki (kliknięcie, spacja).
  - Nawigacja między fiszkami (przyciski, strzałki).
  - Wyświetlanie paska postępu i statystyk sesji.
  - Obsługa końca sesji i możliwość rozpoczęcia nowej.
  - Obsługa braku fiszek do nauki.
- **Interfejs użytkownika:**
  - Nawigacja główna (dla zalogowanych).
  - Strona główna (dla niezalogowanych).
  - Responsywność interfejsu na różnych urządzeniach.
  - Wyświetlanie powiadomień (toasty) dla akcji użytkownika i błędów.
  - Ogólna spójność wizualna i UX.
- **API Backend:**
  - Poprawność działania endpointów API zgodnie ze specyfikacją OpenAPI (`flashcards.yaml`).
  - Walidacja danych wejściowych (Zod).
  - Obsługa błędów API (statusy HTTP, komunikaty).
  - Autoryzacja dostępu do endpointów API (middleware).

### 2.2. Funkcjonalności wyłączone z testów (jeśli dotyczy):

- Testy penetracyjne (wymagają dedykowanych narzędzi i ekspertyzy, mogą być realizowane osobno).
- Testy konfiguracji serwera Supabase (zakładamy poprawną konfigurację przez dostawcę BaaS).
- Dogłębne testy samego modelu AI OpenRouter (skupiamy się na integracji i obsłudze odpowiedzi).

## 3. Typy Testów do Przeprowadzenia

- **Testy Jednostkowe (Unit Tests):**
  - _Cel:_ Weryfikacja poprawności działania izolowanych fragmentów kodu (funkcje, komponenty React, hooki, serwisy).
  - _Zakres:_ Serwisy (`flashcardService`, `statisticsService`, `openrouterService`), hooki React (`useFlashcards`, `useFlashcardsLearning`), funkcje pomocnicze (`utils.ts`), logika walidacji Zod (jeśli skomplikowana), proste komponenty React.
  - _Narzędzia:_ Vitest, Testing Library (dla React).
  - _Pokrycie:_ Dążenie do wysokiego pokrycia kodu dla logiki biznesowej.
- **Testy Integracyjne (Integration Tests):**
  - _Cel:_ Weryfikacja współpracy między różnymi modułami systemu.
  - _Zakres:_
    - Integracja komponentów React (np. `CreatorSection` z jego zakładkami i listą wyników).
    - Integracja frontend-backend (wywołania API z komponentów/hooków React do endpointów Astro).
    - Integracja API Astro z Supabase.
    - Integracja API Astro z OpenRouter.
  - _Narzędzia:_ Vitest (dla testów API i serwisów z mockowanym Supabase/OpenRouter), Supertest (dla testów API), Testing Library (dla integracji komponentów React).
- **Testy API (API Tests):**
  - _Cel:_ Weryfikacja poprawności działania endpointów API zgodnie ze specyfikacją OpenAPI.
  - _Zakres:_ Wszystkie endpointy w `src/pages/api/` - testowanie metod HTTP, parametrów, ciała żądania, odpowiedzi (statusy, format, dane), walidacji, autoryzacji.
  - _Narzędzia:_ Vitest (jak w istniejących `__tests__`), Postman/Insomnia (manualne), narzędzia do automatyzacji testów API (np. Playwright, Supertest).
- **Testy End-to-End (E2E Tests):**
  - _Cel:_ Symulacja rzeczywistych przepływów użytkownika w przeglądarce, weryfikacja działania całej aplikacji jako zintegrowanej całości.
  - _Zakres:_ Kluczowe scenariusze użytkownika (rejestracja -> logowanie -> tworzenie fiszki -> nauka -> wylogowanie), interakcje z UI, hydracja komponentów React.
  - _Narzędzia:_ Playwright, Cypress.
- **Testy Użyteczności (Usability Testing):**
  - _Cel:_ Ocena łatwości obsługi, intuicyjności i ogólnego doświadczenia użytkownika (UX).
  - _Zakres:_ Nawigacja, przepływy pracy (tworzenie, nauka), zrozumiałość komunikatów, responsywność.
  - _Metody:_ Testy eksploracyjne, testy korytarzowe (jeśli możliwe).
- **Testy Kompatybilności (Compatibility Testing):**
  - _Cel:_ Zapewnienie poprawnego działania aplikacji na różnych przeglądarkach i urządzeniach.
  - _Zakres:_ Najpopularniejsze przeglądarki (Chrome, Firefox, Safari, Edge) w najnowszych wersjach. Różne rozmiary ekranu (desktop, tablet, mobile).
  - _Narzędzia:_ Narzędzia deweloperskie przeglądarek, usługi typu BrowserStack/SauceLabs (jeśli dostępne).
- **Testy Wydajnościowe (Performance Testing):**
  - _Cel:_ Ocena szybkości ładowania stron, czasu odpowiedzi API, wydajności generowania fiszek AI.
  - _Zakres:_ Czas ładowania kluczowych stron (Podgląd, Nauka), czas odpowiedzi endpointów API (szczególnie listujących i generujących), czas generowania fiszek przez AI.
  - _Narzędzia:_ Lighthouse, WebPageTest, narzędzia deweloperskie przeglądarek (zakładka Network/Performance), K6 (dla testów obciążeniowych API - opcjonalnie).
- **Testy Bezpieczeństwa (Security Testing):**
  - _Cel:_ Identyfikacja potencjalnych luk bezpieczeństwa.
  - _Zakres:_ Ochrona ścieżek (middleware), walidacja danych wejściowych (zapobieganie XSS, SQL Injection - choć Supabase pomaga), bezpieczeństwo sesji/tokenów, kontrola dostępu do danych (czy użytkownik widzi tylko swoje fiszki?).
  - _Metody:_ Przegląd kodu, testy E2E sprawdzające dostęp, podstawowe skanowanie (np. OWASP ZAP - opcjonalnie).
- **Testy Wizualne (Visual Regression Testing):**
  - _Cel:_ Wykrywanie niezamierzonych zmian w wyglądzie interfejsu użytkownika.
  - _Zakres:_ Kluczowe komponenty UI, strony aplikacji.
  - _Narzędzia:_ Playwright/Cypress z integracją np. Percy.io, Applitools (jeśli dostępne), lub porównywanie zrzutów ekranu.
- **Testy Dostępności (Accessibility Testing):**
  - _Cel:_ Zapewnienie, że aplikacja jest używalna dla osób z różnymi niepełnosprawnościami.
  - _Zakres:_ Struktura HTML, atrybuty ARIA, kontrast kolorów, nawigacja klawiaturą.
  - _Narzędzia:_ Axe DevTools, Lighthouse, manualna weryfikacja (np. nawigacja klawiaturą, czytniki ekranu).

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

_(Przykładowe scenariusze, lista nie jest wyczerpująca)_

**4.1. Autentykacja:**

- **TC-AUTH-001:** Pomyślna rejestracja nowego użytkownika z poprawnymi danymi.
- **TC-AUTH-002:** Próba rejestracji z już istniejącym adresem email.
- **TC-AUTH-003:** Próba rejestracji z niepoprawnym formatem emaila.
- **TC-AUTH-004:** Próba rejestracji ze zbyt krótkim hasłem.
- **TC-AUTH-005:** Pomyślne logowanie z poprawnymi danymi.
- **TC-AUTH-006:** Próba logowania z niepoprawnym hasłem.
- **TC-AUTH-007:** Próba logowania z nieistniejącym adresem email.
- **TC-AUTH-008:** Pomyślne wylogowanie użytkownika.
- **TC-AUTH-009:** Próba dostępu do chronionej strony (np. `/creator`) przez niezalogowanego użytkownika (oczekiwane przekierowanie do logowania).
- **TC-AUTH-010:** Pomyślne wysłanie linku do resetowania hasła.
- **TC-AUTH-011:** Próba resetu hasła dla nieistniejącego emaila.
- **TC-AUTH-012:** Dostęp do danych użytkownika (`/api/auth/me`) przez zalogowanego użytkownika.
- **TC-AUTH-013:** Próba dostępu do danych użytkownika (`/api/auth/me`) przez niezalogowanego użytkownika (oczekiwany błąd 401).

**4.2. Tworzenie Fiszki (Ręczne):**

- **TC-MANUAL-001:** Pomyślne utworzenie fiszki z poprawnymi danymi (front/back).
- **TC-MANUAL-002:** Próba utworzenia fiszki z pustym polem 'front'.
- **TC-MANUAL-003:** Próba utworzenia fiszki z pustym polem 'back'.
- **TC-MANUAL-004:** Próba utworzenia fiszki z tekstem przekraczającym limit znaków (front).
- **TC-MANUAL-005:** Próba utworzenia fiszki z tekstem przekraczającym limit znaków (back).
- **TC-MANUAL-006:** Weryfikacja, czy nowo utworzona fiszka pojawia się na liście kandydatów w Kreatorze (lub zaakceptowanych, w zależności od logiki - API `POST /api/flashcards` tworzy od razu zaakceptowaną).
- **TC-MANUAL-007:** Użycie przycisku "Wyczyść" w formularzu.

**4.3. Generowanie Fiszki (AI):**

- **TC-AI-001:** Pomyślne wygenerowanie fiszek z tekstem o poprawnej długości (między 1000 a 10000 znaków).
- **TC-AI-002:** Próba generowania z tekstem zbyt krótkim (<1000 znaków) - przycisk powinien być nieaktywny.
- **TC-AI-003:** Próba generowania z tekstem zbyt długim (>10000 znaków) - przycisk powinien być nieaktywny.
- **TC-AI-004:** Weryfikacja, czy wygenerowane fiszki pojawiają się na liście wyników w zakładce AI Kreatora.
- **TC-AI-005:** Weryfikacja statusu "Kandydat" i źródła "AI" dla wygenerowanych fiszek.
- **TC-AI-006:** Obsługa błędu po stronie API OpenRouter (np. błędny klucz API, timeout, błąd modelu) - wyświetlenie odpowiedniego toastu.
- **TC-AI-007:** Obsługa odpowiedzi AI w nieprawidłowym formacie - wyświetlenie błędu.
- **TC-AI-008:** Użycie przycisku "Wyczyść" w formularzu AI.
- **TC-AI-009:** Sprawdzenie stanu ładowania (ikona, tekst przycisku) podczas generowania.

**4.4. Podgląd i Zarządzanie Fiszakami:**

- **TC-PREVIEW-001:** Przełączanie między zakładkami "Zaakceptowane" i "Kandydaci".
- **TC-PREVIEW-002:** Wyświetlanie poprawnej liczby fiszek w nagłówkach zakładek.
- **TC-PREVIEW-003:** Paginacja - nawigacja do następnej/poprzedniej strony (jeśli jest więcej niż 1 strona).
- **TC-PREVIEW-004:** Paginacja - sprawdzenie nieaktywności przycisków na pierwszej/ostatniej stronie.
- **TC-PREVIEW-005:** Zmiana liczby fiszek na stronie - weryfikacja odświeżenia listy i paginacji.
- **TC-PREVIEW-006:** Odwracanie karty fiszki (kliknięcie, spacja/enter).
- **TC-PREVIEW-007:** Pomyślna edycja fiszki (zmiana front/back) - otwarcie modala, zapis, weryfikacja zmian na liście, toast sukcesu.
- **TC-PREVIEW-008:** Próba zapisu edycji bez zmian - oczekiwany toast informacyjny, zamknięcie modala.
- **TC-PREVIEW-009:** Próba zapisu edycji z pustym polem front/back - oczekiwany błąd walidacji, modal pozostaje otwarty.
- **TC-PREVIEW-010:** Anulowanie edycji fiszki - zamknięcie modala bez zapisu zmian.
- **TC-PREVIEW-011:** Pomyślne usunięcie fiszki (zaakceptowanej) - potwierdzenie, weryfikacja usunięcia z listy, toast sukcesu.
- **TC-PREVIEW-012:** Pomyślne usunięcie fiszki (kandydata) - potwierdzenie, weryfikacja usunięcia z listy, toast sukcesu.
- **TC-PREVIEW-013:** Pomyślna akceptacja fiszki kandydata - weryfikacja przeniesienia na listę zaakceptowanych, toast sukcesu.
- **TC-PREVIEW-014:** Pomyślne odrzucenie fiszki kandydata - weryfikacja usunięcia z listy kandydatów, toast sukcesu.
- **TC-PREVIEW-015:** Eksport fiszek do JSON - otwarcie modala, wybór formatu, kliknięcie eksportuj, weryfikacja pobrania pliku, toast sukcesu.
- **TC-PREVIEW-016:** Eksport fiszek do CSV - otwarcie modala, wybór formatu, kliknięcie eksportuj, weryfikacja pobrania pliku, toast sukcesu.
- **TC-PREVIEW-017:** Obsługa braku fiszek na liście (zaakceptowane/kandydaci).
- **TC-PREVIEW-018:** Weryfikacja źródła fiszki (MANUAL, AI, AI_EDITED) i statusu kandydata na karcie.

**4.5. Sesja Nauki:**

- **TC-LEARN-001:** Rozpoczęcie sesji nauki z co najmniej jedną zaakceptowaną fiszką.
- **TC-LEARN-002:** Wyświetlenie komunikatu o braku fiszek, gdy nie ma zaakceptowanych fiszek.
- **TC-LEARN-003:** Poprawne wyświetlanie przodu fiszki na początku.
- **TC-LEARN-004:** Odwrócenie fiszki (kliknięcie, spacja) - pokazanie tyłu.
- **TC-LEARN-005:** Ponowne odwrócenie fiszki - pokazanie przodu.
- **TC-LEARN-006:** Nawigacja do następnej fiszki (przycisk, strzałka w prawo) - pokazanie przodu nowej fiszki.
- **TC-LEARN-007:** Nawigacja do poprzedniej fiszki (przycisk, strzałka w lewo) - pokazanie przodu poprzedniej fiszki.
- **TC-LEARN-008:** Sprawdzenie nieaktywności przycisku "Poprzednia" na pierwszej fiszce.
- **TC-LEARN-009:** Sprawdzenie nieaktywności przycisku "Następna" na ostatniej fiszce.
- **TC-LEARN-010:** Poprawne działanie paska postępu i statystyk sesji (licznik fiszek, procent ukończenia).
- **TC-LEARN-011:** Zakończenie sesji po przejściu ostatniej fiszki - wyświetlenie komunikatu, pojawienie się przycisku "Rozpocznij nową sesję".
- **TC-LEARN-012:** Rozpoczęcie nowej sesji po zakończeniu poprzedniej.

## 5. Środowisko Testowe

- **Środowisko Frontend:** Przeglądarki internetowe (Chrome, Firefox, Safari, Edge - najnowsze wersje) na systemach Windows, macOS. Urządzenia mobilne (symulacja w przeglądarce, rzeczywiste urządzenia jeśli dostępne).
- **Środowisko Backend:**
  - **Lokalne:** Możliwe uruchomienie aplikacji lokalnie (jeśli setup na to pozwala) z lokalną instancją Supabase (np. przez Supabase CLI) lub dedykowanym projektem Supabase dla deweloperów/testerów. Mockowanie OpenRouter lub użycie klucza testowego.
  - **Staging/Test:** Dedykowane środowisko wdrożeniowe (np. Vercel, Netlify) połączone z oddzielnym projektem Supabase (staging) i kluczem API OpenRouter dla środowiska testowego. To preferowane środowisko dla testów E2E i integracyjnych.
- **Dane Testowe:** Przygotowanie zestawu danych testowych w Supabase (użytkownicy, fiszki zaakceptowane, fiszki kandydaci o różnym źródle) dla środowiska Staging/Test.

## 6. Narzędzia do Testowania

- **Framework do testów jednostkowych/integracyjnych:** Vitest (już używany w projekcie)
- **Biblioteka do testowania komponentów React:** React Testing Library
- **Framework do testów E2E:** Playwright (rekomendowany ze względu na dobre wsparcie dla TS, auto-wait, testy API, wizualne) lub Cypress.
- **Narzędzia do testów API:** Playwright (wbudowane), Postman/Insomnia (manualne eksploracje).
- **Narzędzia deweloperskie przeglądarek:** Do inspekcji elementów, debugowania, analizy sieci i wydajności.
- **Narzędzia do testów dostępności:** Axe DevTools (rozszerzenie przeglądarki).
- **Narzędzia do testów wizualnych (opcjonalnie):** Playwright/Cypress z porównywaniem zrzutów ekranu lub integracja z Percy.io/Applitools.
- **System zarządzania testami (opcjonalnie):** TestRail, Zephyr Scale, lub prostsze rozwiązania jak arkusz kalkulacyjny/Markdown.
- **System śledzenia błędów:** Jira, GitHub Issues, itp. (zgodnie z procesem projektowym).

## 7. Harmonogram Testów

_(Przykładowy harmonogram, do dostosowania do realiów projektu)_

- **Faza 1: Planowanie i Przygotowanie (1-2 dni):** Finalizacja planu testów, przygotowanie środowiska testowego, danych testowych, konfiguracja narzędzi.
- **Faza 2: Wykonanie Testów Jednostkowych i Integracyjnych (ciągłe):** Deweloperzy piszą testy jednostkowe i integracyjne równolegle z rozwojem kodu. QA wspiera w definiowaniu przypadków i przeglądzie testów.
- **Faza 3: Wykonanie Testów Systemowych i E2E (po ustabilizowaniu funkcjonalności, np. na środowisku Staging - 5-7 dni):** Wykonywanie scenariuszy testowych E2E, testy API, testy użyteczności, kompatybilności, dostępności.
- **Faza 4: Testy Regresyjne (przed wdrożeniem, po poprawkach błędów - 2-3 dni):** Ponowne wykonanie kluczowych testów (manualnych i automatycznych) w celu upewnienia się, że poprawki nie wprowadziły nowych błędów.
- **Faza 5: Testy Akceptacyjne Użytkownika (UAT) (jeśli dotyczy - 1-2 dni):** Przekazanie aplikacji klientowi/product ownerowi do finalnej akceptacji.
- **Faza 6: Testy Powdrożeniowe (Smoke Tests) (po wdrożeniu na produkcję - 0.5 dnia):** Szybka weryfikacja kluczowych funkcjonalności na środowisku produkcyjnym.

## 8. Kryteria Akceptacji Testów

### 8.1. Kryteria Wejścia (Rozpoczęcia Testów Systemowych):

- Plan testów zatwierdzony.
- Środowisko testowe przygotowane i stabilne.
- Wszystkie kluczowe funkcjonalności zaimplementowane i dostępne na środowisku testowym.
- Testy jednostkowe i integracyjne przechodzą (np. >95% sukcesu).
- Dokumentacja (jeśli istnieje) dostępna.

### 8.2. Kryteria Wyjścia (Zakończenia Testów i Rekomendacji Wdrożenia):

- Wszystkie zaplanowane scenariusze testowe (krytyczne i wysokiego priorytetu) zostały wykonane.
- Wszystkie znalezione błędy krytyczne i wysokiego priorytetu zostały naprawione i zweryfikowane.
- Liczba znanych błędów o niskim/średnim priorytecie jest akceptowalna przez zespół projektowy/product ownera.
- Testy regresyjne zakończone sukcesem.
- Pokrycie kodu testami jednostkowymi/integracyjnymi osiągnęło ustalony próg (np. 70-80%).
- Raport końcowy z testów przygotowany i zaakceptowany.

## 9. Role i Odpowiedzialności

- **Inżynier QA:** Tworzenie i utrzymanie planu testów, projektowanie i wykonywanie scenariuszy testowych (manualnych i automatycznych), raportowanie błędów, współpraca z deweloperami przy rozwiązywaniu problemów, przygotowanie raportów z testów.
- **Deweloperzy:** Pisanie testów jednostkowych i integracyjnych, naprawa zgłoszonych błędów, wsparcie QA w diagnozowaniu problemów, przegląd kodu pod kątem jakości i testowalności.
- **Product Owner / Kierownik Projektu:** Definiowanie wymagań, priorytetyzacja błędów, akceptacja wyników testów (UAT), podejmowanie decyzji o wdrożeniu.
- **DevOps (jeśli dotyczy):** Przygotowanie i utrzymanie środowisk testowych i produkcyjnych, wsparcie w konfiguracji narzędzi.

## 10. Procedury Raportowania Błędów

- Wszystkie znalezione defekty będą raportowane w dedykowanym systemie śledzenia błędów (np. Jira, GitHub Issues).
- Każdy raport błędu powinien zawierać:
  - **Tytuł:** Zwięzły opis problemu.
  - **Środowisko:** Gdzie błąd wystąpił (np. Staging, Lokalnie, Przeglądarka/OS).
  - **Kroki do reprodukcji:** Szczegółowa lista kroków pozwalająca odtworzyć błąd.
  - **Obserwowany wynik:** Co się stało.
  - **Oczekiwany wynik:** Co powinno się stać.
  - **Priorytet/Waga:** (np. Krytyczny, Wysoki, Średni, Niski) - ustalany wstępnie przez QA, finalnie przez PO/Zespół.
  - **Załączniki:** Zrzuty ekranu, nagrania wideo, logi konsoli (jeśli relevantne).
  - **Przypisanie:** (Opcjonalnie) Do odpowiedniego dewelopera/zespołu.
- Błędy będą przeglądane i priorytetyzowane regularnie przez zespół projektowy.
- Naprawione błędy będą ponownie testowane (re-test) przez QA.
- Statusy błędów będą aktualizowane w systemie śledzenia (np. Nowy, W Analizie, Do Poprawy, W Testach, Zamknięty, Odrzucony).
```
