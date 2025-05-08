## Code Review i Propozycje Usprawnień

Projekt jest dobrze zorganizowany i napisany z dbałością o wiele aspektów nowoczesnego tworzenia aplikacji webowych. Poniżej znajduje się szczegółowa analiza wraz z propozycjami usprawnień.

### 1. Bezpieczeństwo

#### 1.1. Klucz API OpenRouter eksponowany po stronie klienta - **FIXED**
*   **Opis:** W pliku `src/lib/services/openrouter/config.ts` klucz API `PUBLIC_OPENROUTER_API_KEY` jest pobierany ze zmiennej środowiskowej z prefiksem `PUBLIC_`. Oznacza to, że ten klucz API jest dostępny w kodzie po stronie klienta, co stanowi poważne zagrożenie bezpieczeństwa. Klucze API do usług zewnętrznych powinny być przechowywane i używane wyłącznie po stronie serwera.
*   **Lokalizacja:** `src/lib/services/openrouter/config.ts`
*   **Sugestia:**
    1.  Zmień nazwę zmiennej środowiskowej na np. `OPENROUTER_API_KEY` (bez prefiksu `PUBLIC_`).
    2.  Upewnij się, że `OpenRouterService` jest używany tylko po stronie serwera (np. w endpointach API Astro, a nie bezpośrednio w komponentach React renderowanych po stronie klienta). W tym projekcie `OpenRouterService` jest używany w `FlashcardService` (`src/lib/services/flashcardService.ts`), który z kolei jest używany w endpointach API, co jest **poprawne**. Problemem jest sam fakt, że konfiguracja pobiera klucz jako publiczny.
    3.  Funkcja `getOpenRouterConfig` powinna być używana tylko w kontekście serwerowym, gdzie ma dostęp do zmiennych środowiskowych serwera.
*   **Severity: 9/10** (Krytyczne - ryzyko nadużycia klucza API)

#### 1.2. Uwierzytelnianie i Autoryzacja
*   **Opis:** Middleware (`src/middleware/index.ts`) poprawnie obsługuje ochronę ścieżek i endpointów API, sprawdzając obecność użytkownika. Użycie `createSupabaseServerInstance` jest prawidłowe.
*   **Status:** Dobrze zaimplementowane.

#### 1.3. Walidacja danych wejściowych
*   **Opis:** Endpointy API (`src/pages/api/*`) konsekwentnie używają biblioteki `zod` do walidacji danych wejściowych (parametry ścieżki, query, body). Jest to bardzo dobra praktyka.
*   **Status:** Dobrze zaimplementowane.

#### 1.4. Ochrona przed CSRF/XSS
*   **Opis:** Astro domyślnie zapewnia pewien poziom ochrony. Użycie formularzy POST z endpointami API (jak w `forgot-password.astro`) jest standardowym podejściem. Dla operacji modyfikujących dane, ważne jest, aby zawsze używać metod POST/PATCH/DELETE, a nie GET.
*   **Status:** Wygląda dobrze.

#### 1.5. Nagłówki bezpieczeństwa
*   **Opis:** Middleware dodaje nagłówki `Cache-Control`, `Pragma`, `Expires` dla chronionych ścieżek, co jest dobrą praktyką zapobiegającą cachowaniu wrażliwych danych.
*   **Status:** Dobrze zaimplementowane.

### 2. Struktura Klas i Komponentów

#### 2.1. Powtórzenie definicji `UserDto` i `App.Locals` - **FIXED**
*   **Opis:** Typ `UserDto` jest zdefiniowany zarówno w `src/env.d.ts` jak i `src/types.ts`. Podobnie, `App.Locals` jest rozszerzane w obu tych plikach.
*   **Lokalizacja:** `src/env.d.ts`, `src/types.ts`
*   **Sugestia:** Skonsolidować te definicje. `App.Locals` powinno być zdefiniowane tylko w `src/env.d.ts`, ponieważ jest to typ globalny specyficzny dla Astro. `UserDto` może pozostać w `src/types.ts` i być importowane do `env.d.ts` w razie potrzeby.
*   **Severity: 3/10** (Niska - głównie kwestia porządkowa)

#### 2.2. Niespójne użycie serwisów klienckich - **FIXED**
*   **Opis:** W `src/lib/client/login.ts` używany jest `authService`, natomiast w `src/lib/client/register.ts` i `src/lib/client/reset-password.ts` logika `fetch` jest zaimplementowana bezpośrednio.
*   **Lokalizacja:** `src/lib/client/*`, `src/lib/services/auth.ts`
*   **Sugestia:** Rozszerzyć `authService` (`src/lib/services/auth.ts`) o metody `register` i `resetPassword` i używać go spójnie we wszystkich skryptach klienckich. To poprawi spójność i reużywalność.
*   **Severity: 4/10** (Średnia - wpływa na czytelność i spójność)

#### 2.3. Hydratacja komponentu `Logo` - **FIXED**
*   **Opis:** Komponent `Logo.tsx` jest używany z dyrektywą `client:load` w `MarketingContent.astro` i `WelcomeScreen.astro`. Komponent ten nie wydaje się zawierać żadnej logiki interaktywnej (stanu, hooków useEffect), więc pełna hydratacja może nie być konieczna.
*   **Lokalizacja:** `src/components/astro/welcome/MarketingContent.astro`, `src/components/astro/welcome/WelcomeScreen.astro`, `src/components/Logo.tsx`
*   **Sugestia:** Jeśli `Logo.tsx` nie wymaga interaktywności JavaScript po stronie klienta, można usunąć `client:load` (renderowanie serwerowe) lub, jeśli jest jakaś subtelna interakcja (np. event listener dodany w `useEffect`), rozważyć `client:visible`. Jeśli logo ma być tylko statyczne, najlepiej przekształcić je na komponent `.astro` lub upewnić się, że wersja `.tsx` nie jest niepotrzebnie hydratowana.
*   **Severity: 2/10** (Niska - potencjalna drobna optymalizacja wydajności)

#### 2.4. Podwójne renderowanie `Toaster` - **FIXED**
*   **Opis:** `ToastProvider.tsx` renderuje `<Toaster />` z biblioteki `sonner`. Jednocześnie `BaseLayout.astro` renderuje `<Toaster />` z `src/components/ui/sonner.tsx` (który dodatkowo używa `next-themes`, co jest problematyczne). Prowadzi to do potencjalnego podwójnego renderowania lub konfliktów.
*   **Lokalizacja:** `src/components/providers/ToastProvider.tsx`, `src/layouts/BaseLayout.astro`, `src/components/ui/sonner.tsx`
*   **Sugestia:**
    1.  `ToastProvider.tsx` powinien być jedynym miejscem, gdzie renderowany jest `Toaster` z biblioteki `sonner`.
    2.  Usunąć renderowanie `<Toaster client:load />` z `BaseLayout.astro`.
    3.  Usunąć lub naprawić `src/components/ui/sonner.tsx`. Jeśli celem było ostylowanie `Toaster`a lub integracja z motywami, należy to zrobić w sposób kompatybilny z Astro, bez `next-themes`. Najprościej będzie polegać na konfiguracji przekazywanej do `Toaster` w `ToastProvider`.
*   **Severity: 5/10** (Średnia - może powodować błędy w działaniu powiadomień)

#### 2.5. Logika `useFlashcards` dla ręcznie tworzonych fiszek - **FIXED**
*   **Opis:** `ManualCreatorTab.tsx` tworzy fiszki z `candidate: false`. Jednak hook `useFlashcards` w funkcji `createFlashcard` dodaje nowo utworzoną fiszkę (która powinna być `candidate: false`) do stanu `state.candidates` i aktualizuje `candidatesPagination`.
*   **Lokalizacja:** `src/lib/hooks/useFlashcards.ts`, `src/components/react/creator/ManualCreatorTab.tsx`
*   **Sugestia:** Zmodyfikować `createFlashcard` w `useFlashcards`, aby poprawnie obsługiwał typ tworzonej fiszki. Jeśli fiszka ma `candidate: false`, powinna być dodana do `state.flashcards` i aktualizować `state.pagination`.
*   **Severity: 6/10** (Średnia/Wysoka - błąd w logice aplikacji, fiszki trafiają na złą listę)

### 3. Powtórzenia Kodu (DRY)

#### 3.1. Style CSS dla fiszek - **FIXED**
*   **Opis:** Style CSS dla `.flashcard`, `.flashcard-inner`, `.flashcard-front`, `.flashcard-back` są zdefiniowane zarówno w `src/styles/global.css` jak i w bloku `<style is:global>` w `src/layouts/BaseLayout.astro`.
*   **Lokalizacja:** `src/styles/global.css`, `src/layouts/BaseLayout.astro`
*   **Sugestia:** Skonsolidować te style w jednym miejscu, preferencyjnie w `src/styles/global.css`.
*   **Severity: 2/10** (Niska - bałagan, potencjalne problemy z pierwszeństwem stylów)

#### 3.2. Logika listowania fiszek w `FlashcardService` (serwer) - **FIXED**
*   **Opis:** Metody `listAcceptedFlashcards` i `listCandidateFlashcards` w `src/lib/services/flashcardService.ts` mają bardzo podobną logikę (budowanie query, paginacja, sortowanie), różnią się jedynie warunkiem `eq("candidate", boolean_value)`.
*   **Lokalizacja:** `src/lib/services/flashcardService.ts`
*   **Sugestia:** Zrefaktoryzować te dwie metody do jednej, prywatnej metody, która przyjmuje parametr `candidate: boolean` (lub podobny) w celu zmniejszenia redundancji kodu.
*   **Severity: 3/10** (Niska - poprawa czytelności i łatwości utrzymania)

#### 3.3. Komponenty `ResultsList.tsx` i `FlashcardList.tsx` - **FIXED**
*   **Opis:** `ResultsList.tsx` (używany w `CreatorSection`) i `FlashcardList.tsx` (używany w `PreviewSection`) są bardzo podobne. Oba renderują listę `FlashcardCard`, obsługują paginację i wyświetlają komunikaty. Różnią się nieco w przekazywanych propsach (np. `onAccept`, `onDiscard`, `onExport`).
*   **Lokalizacja:** `src/components/react/creator/ResultsList.tsx`, `src/components/react/preview/FlashcardList.tsx`
*   **Sugestia:** Rozważyć unifikację tych dwóch komponentów w jeden bardziej generyczny komponent listy fiszek, który można by skonfigurować za pomocą propsów. Może to wymagać ostrożnego zaprojektowania interfejsu propsów. Alternatywnie, jeśli różnice są znaczące i uzasadnione kontekstem użycia, pozostawienie ich jako osobnych komponentów jest akceptowalne, ale warto przejrzeć, czy nie da się wyekstrahować wspólnych części.
*   **Severity: 3/10** (Niska - potencjalna poprawa reużywalności)

### 4. Jakość Kodu i Dobre Praktyki

#### 4.1. Niespójność w obsłudze formularzy na stronach autoryzacji
*   **Opis:** Strona `forgot-password.astro` używa standardowego formularza HTML POST i endpointu API Astro (`forgot-password.api.ts`) do obsługi logiki. Natomiast strony `login.astro`, `register.astro`, `reset-password.astro` używają skryptów klienckich (`<script>`) do obsługi formularzy i wywołań `fetch`.
*   **Lokalizacja:** `src/pages/auth/*`
*   **Sugestia:** Ujednolicić podejście.
    *   Opcja 1: Wszystkie formularze autoryzacji używają wzorca Astro Form Actions (formularz POST + dedykowany endpoint API `.api.ts`). Jest to bardziej "Astro-native".
    *   Opcja 2: Wszystkie formularze autoryzacji są zaimplementowane jako komponenty React (z `client:load`), co ułatwiłoby zarządzanie stanem formularza, walidację po stronie klienta i interakcje.
    Obecne mieszane podejście jest mniej spójne.
*   **Severity: 4/10** (Średnia - wpływa na spójność i potencjalnie na doświadczenie deweloperskie)

#### 4.2. Typ `FlashcardsCreateCommand` vs implementacja - **FIXED**
*   **Opis:** Typ `FlashcardsCreateCommand` w `src/types.ts` definiuje `flashcards: FlashcardCreateDto[]`, sugerując możliwość tworzenia wielu fiszek naraz. Jednak implementacja w `FlashcardsService.createFlashcards` (`src/lib/services/flashcards.ts`) obsługuje tylko `command.flashcards[0]`, a endpoint API `POST /api/flashcards` (w `src/pages/api/flashcards/index.ts`) również oczekuje pojedynczej fiszki (`CreateManualFlashcardCommand` z OpenAPI).
*   **Lokalizacja:** `src/types.ts`, `src/lib/services/flashcards.ts`, `src/pages/api/flashcards/index.ts`, `src/openapi/flashcards.yaml`
*   **Sugestia:**
    *   Jeśli aplikacja ma obsługiwać tworzenie tylko jednej fiszki manualnie na raz, uprościć typ `FlashcardsCreateCommand` do pojedynczego `FlashcardCreateDto` i dostosować nazewnictwo.
    *   Jeśli w przyszłości planowane jest tworzenie wielu fiszek, zaktualizować serwis i API, aby poprawnie obsługiwały tablicę.
*   **Severity: 4/10** (Średnia - niespójność między definicją typu a implementacją może prowadzić do błędów)

#### 4.3. Dynamiczne dopasowanie rozmiaru czcionki w `FlashcardCard.tsx` - **FIXED**
*   **Opis:** `FlashcardCard.tsx` używa `useEffect` i listenera `resize` do dynamicznego dostosowywania rozmiaru czcionki na odwrocie karty. Każda instancja karty dodaje własny listener.
*   **Lokalizacja:** `src/components/react/preview/FlashcardCard.tsx`
*   **Sugestia:** Jeśli kart na stronie jest dużo, może to wpłynąć na wydajność. Rozważyć:
    1.  Użycie CSS `clamp()` lub jednostek relatywnych (np. `vw`, `vh`, `cqi`, `cqb`) w połączeniu z `container queries`, jeśli to możliwe, do bardziej deklaratywnego dopasowania.
    2.  Jeśli JavaScript jest konieczny, zoptymalizować przez np. debouncing funkcji `adjustTextSize` lub użycie jednego globalnego listenera `resize`, który zarządza aktualizacją widocznych kart.
*   **Severity: 3/10** (Niska - potencjalna optymalizacja wydajności w skrajnych przypadkach)

#### 4.4. Zakomentowany `ClientRouter` - **PROBLEM WITH TOAST AFTER UNCOMMENT**
*   **Opis:** W `BaseLayout.astro` `ClientRouter` (odpowiedzialny za View Transitions) jest zakomentowany z powodu problemów z Toasterem.
*   **Lokalizacja:** `src/layouts/BaseLayout.astro`
*   **Sugestia:** Warto zbadać przyczynę konfliktu z Toasterem i spróbować go rozwiązać, ponieważ View Transitions znacząco poprawiają UX. Możliwe, że Toaster musi być inicjalizowany w sposób, który przetrwa przejścia, lub jego kontener musi być oznaczony jako `transition:persist`.
*   **Severity: 5/10** (Średnia - utrata ważnej funkcjonalności Astro wpływającej na UX)

#### 4.5. `useTheme` z `next-themes` w `ui/sonner.tsx` - **FIXED**
*   **Opis:** Komponent `src/components/ui/sonner.tsx` używa `useTheme` z `next-themes`, co jest specyficzne dla Next.js. W projekcie Astro nie zadziała to poprawnie i jest niepotrzebną zależnością.
*   **Lokalizacja:** `src/components/ui/sonner.tsx`
*   **Sugestia:** Usunąć zależność `next-themes`, jeśli nie jest używana gdzie indziej. Dostosować `src/components/ui/sonner.tsx`, aby nie polegał na `useTheme`, lub usunąć ten plik, jeśli `ToastProvider.tsx` jest wystarczający (co wydaje się być prawdą).
*   **Severity: 4/10** (Średnia - niepotrzebna zależność, potencjalne błędy)

#### 4.6. Fallback dla klucza w `ResultsList.tsx` - **FIXED**
*   **Opis:** W `ResultsList.tsx` używany jest klucz `key={flashcard.id || \`${flashcard.front}-${flashcard.back}\`}`. Fiszki po utworzeniu (nawet jako kandydaci) powinny zawsze mieć unikalne `id` z bazy danych. Fallback na `front-back` może prowadzić do problemów z re-renderowaniem Reacta, jeśli kombinacja `front` i `back` nie jest unikalna.
*   **Lokalizacja:** `src/components/react/creator/ResultsList.tsx`
*   **Sugestia:** Upewnić się, że wszystkie fiszki, nawet te tymczasowo wyświetlane w `ResultsList` po wygenerowaniu przez AI, mają stabilne i unikalne `id` (np. tymczasowe UUIDv4 wygenerowane po stronie klienta przed wysłaniem do bazy, lub polegać na `id` zwracanym przez API).
*   **Severity: 3/10** (Niska - potencjalne problemy z wydajnością/poprawnością renderowania Reacta)

#### 4.7. Obsługa błędów w `AuthProvider` przy parsowaniu JSON - **FIXED**
*   **Opis:** W metodzie `logout` w `AuthProvider.tsx`, jeśli `!response.ok`, następuje próba `await response.json()`. Jeśli serwer zwróci błąd bez ciała JSON (np. błąd sieciowy przed dotarciem do serwera, lub serwer zwróci HTML błędu), to wywołanie `.json()` rzuci błąd, który nie jest elegancko obsłużony.
*   **Lokalizacja:** `src/components/providers/AuthProvider.tsx` (metoda `logout`)
*   **Sugestia:** Opakować `await response.json()` w blok `try-catch` lub sprawdzić `Content-Type` odpowiedzi przed próbą parsowania jako JSON.
*   **Severity: 3/10** (Niska - może prowadzić do nieobsłużonych błędów w specyficznych scenariuszach)

### Podsumowanie Ogólne

Aplikacja jest solidnie zbudowana, z wykorzystaniem nowoczesnych narzędzi i praktyk. Wiele elementów, takich jak struktura, typowanie, walidacja i testowanie, jest na wysokim poziomie. Najważniejsze obszary do natychmiastowej uwagi to bezpieczeństwo klucza API OpenRouter oraz kilka niespójności w logice (np. obsługa ręcznie tworzonych fiszek w `useFlashcards`). Pozostałe sugestie dotyczą głównie poprawy spójności, czytelności i drobnych optymalizacji.

Po wdrożeniu proponowanych zmian, aplikacja będzie jeszcze bardziej solidna, bezpieczna i łatwiejsza w utrzymaniu.