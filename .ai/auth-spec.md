# Specyfikacja architektury modułu autentykacji

## Wprowadzenie

Aplikacja 10x-cards-astro umożliwia użytkownikom tworzenie oraz zarządzanie fiszkami przy użyciu metody spaced repetition. Dotychczasowe rozwiązanie wykorzystywało uproszczoną wersję autentykacji z przypisywaniem stałego identyfikatora użytkownika (dummy auth). Niniejsza specyfikacja opisuje kompleksową implementację mechanizmu rejestracji, logowania, wylogowywania oraz odzyskiwania hasła z wykorzystaniem Supabase Auth, zgodnie z wymaganiami US-001 oraz wymaganiami technologicznymi:

- Frontend: Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui
- Backend: Supabase (w tym Supabase Auth)


## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1. Warstwa Frontendu (Komponenty, Layouty i Modale)

- **Komponenty modularne i modalne**:
  - Aplikacja wykorzystuje istniejące komponenty modalne do autentykacji: `LoginModal`, `RegisterModal` oraz `ForgotPasswordModal`. Te modale zawierają formularze logowania, rejestracji oraz odzyskiwania hasła, które znajdują się w katalogu `src/components/auth`.
  - Aktualnie używany kontekst uwierzytelniania (`AuthProvider.tsx`) zostanie rozszerzony o integrację z rzeczywistą logiką Supabase Auth, zamiast używania stałego `DEFAULT_USER_ID`.

- **Layouty**:
  - Layouty dla użytkowników zalogowanych i niezalogowanych pozostają, jednak zamiast dedykowanych stron autentykacji, formularze i modale są wywoływane na żądanie, co upraszcza nawigację.
  - Layout publiczny zawiera nawigację, stopkę oraz miejsce na interaktywne modale, a layout chroniony dodaje dodatkowe elementy (np. przycisk wylogowania) oraz kontroluje dostęp do chronionych treści.

- **Komponenty React**:
  - Formularze: Istniejące komponenty `<LoginForm />`, `<RegisterForm />` i `<ForgotPasswordForm />` z katalogu `src/components/auth` zostaną dostosowane do wywołań API Supabase oraz zastąpienia dummy auth.
  - Komponenty walidacyjne pozostaną w celu zapewnienia wyświetlania poprawnych komunikatów o błędach.
  - Kontekst uwierzytelniania: `<AuthProvider />` oraz hook `useAuth` zostaną zaktualizowane, aby integrowały się z rzeczywistą logiką autentykacji za pomocą Supabase.

### 1.2. Odpowiedzialności i Integracja

- Formularze React:
  - Pobierają dane wejściowe i wykonują walidację po stronie klienta (np. sprawdzanie poprawności formatu email, minimalnej długości hasła).
  - Realizują wywołania API do backendu w celu rejestracji, logowania lub odzyskania hasła, wykorzystując metody Supabase Auth.

- Layouty i modale:
  - Zapewniają interaktywną obsługę sesji autentykacyjnych, wywołując odpowiednie modale w zależności od stanu użytkownika.
  - Umożliwiają utrzymanie kontekstu sesji bez potrzeby tworzenia dedykowanych stron autentykacji.
  - W przypadku stron chronionych wykorzystywany jest mechanizm SSR do weryfikacji sesji, a modyfikacja interfejsu odbywa się przez dynamiczne wywoływanie modalnych komponentów.

### 1.3. Walidacja i Komunikaty Błędów

- Walidacja po stronie klienta (React):
  - Sprawdzanie poprawności formatu email, niepustości pól oraz spełnienia ograniczeń (np. minimalna długość hasła).
  - Wyświetlanie komunikatów o błędach (np. "Podaj poprawny adres email", "Hasło musi zawierać minimum 6 znaków").

- Walidacja po stronie serwera (API):
  - Użycie bibliotek takich jak Zod do walidacji danych wejściowych.
  - Natychmiastowe zakończenie operacji (early return) w przypadku wykrycia błędów, z przekazaniem odpowiednich komunikatów do klienta.

### 1.4. Obsługa Scenariuszy

- Pomyślna rejestracja: Użytkownik wprowadza dane w modalnym formularzu rejestracyjnym, formularz wysyła żądanie do API, użytkownik otrzymuje potwierdzenie i uzyskuje dostęp do chronionych funkcjonalności.
- Nieudane logowanie: W przypadku nieprawidłowych danych modal wyświetla odpowiedni komunikat o błędzie.
- Odzyskiwanie hasła: Użytkownik inicjuje proces odzyskiwania hasła przez modal, a API wysyła wiadomość e-mail z instrukcjami resetu.
- Wylogowanie: Użytkownik wybiera opcję wylogowania, system czyści stan sesji, a modal logowania staje się dostępny, umożliwiając ponowne logowanie.


## 2. LOGIKA BACKENDOWA

### 2.1. Struktura Endpointów API

Endpointy zostaną zorganizowane w katalogu `/src/pages/api/auth/` i będą obejmowały:

- `register.ts` – rejestracja użytkownika:
  - Przyjmowanie danych (email, hasło) i walidacja za pomocą Zod.
  - Wywołanie funkcji Supabase Auth do tworzenia konta (`supabase.auth.signUp`).
  - Zwracanie statusu oraz komunikatów w przypadku sukcesu lub błędu.

- `login.ts` – logowanie użytkownika:
  - Przyjmowanie danych logowania (email, hasło) i walidacja.
  - Uwierzytelnienie poprzez wywołanie `supabase.auth.signInWithPassword` lub podobnej metody.
  - Zarządzanie sesją i przekazywanie tokenu.

- `logout.ts` – wylogowanie:
  - Usunięcie/zerowanie sesji użytkownika poprzez `supabase.auth.signOut`.
  - Mechanizm czyszczenia ciasteczek i sesji.

- `recover.ts` (lub `reset-password.ts`) – odzyskiwanie hasła:
  - Inicjowanie procesu resetowania hasła poprzez `supabase.auth.resetPasswordForEmail`.
  - Zwracanie komunikatów potwierdzających wysłanie instrukcji resetu.

### 2.2. Walidacja Danych Wejściowych i Obsługa Wyjątków

- Użycie Zod do definiowania schematów danych wejściowych dla każdego endpointu.
- Walidacja danych na początku funkcji – technika early return w przypadku błędów.
- Obsługa wyjątków:
  - Blok try-catch otaczający wywołania do Supabase Auth.
  - Logowanie błędów i zwracanie przyjaznych komunikatów błędów do klienta z odpowiednimi kodami HTTP.

### 2.3. Aktualizacja Renderowania Stron Server-Side

- Modyfikacja middleware oraz konfiguracji w `astro.config.mjs` w celu przekazywania sesji użytkownika do stron.
- Wykorzystanie `context.locals.supabase` zdefiniowanego w middleware dla autentykacji i weryfikacji sesji na poziomie serwera.
- Mechanizm przekierowań – strony chronione sprawdzają, czy istnieje aktywna sesja, i w razie jej braku wywołują modal autentykacyjny.


## 3. SYSTEM AUTENTYKACJI

### 3.1. Wykorzystanie Supabase Auth

- **Rejestracja**:
  - Implementacja metody `supabase.auth.signUp` w endpointzie `register.ts`.
  - Przechwytywanie i walidacja danych użytkownika (email, hasło) oraz obsługa powiadomień e-mail (jeśli Supabase to umożliwia).

- **Logowanie**:
  - Użycie `supabase.auth.signInWithPassword` (lub odpowiednika) w endpointzie `login.ts`.
  - Zarządzanie tokenami sesji i przekazywanie ich do klienta (przez ciasteczka lub nagłówki).

- **Wylogowanie**:
  - Realizacja funkcjonalności wylogowania przez `supabase.auth.signOut` w endpointzie `logout.ts`.
  - Czyszczenie stanu sesji zarówno po stronie klienta, jak i serwera.

- **Odzyskiwanie hasła**:
  - Wykorzystanie metody `supabase.auth.resetPasswordForEmail` w endpointzie `recover.ts`.
  - Proces inicjowania resetu hasła, wysyłania wiadomości e-mail z instrukcjami resetu oraz odpowiednie komunikaty zwrotne.

### 3.2. Integracja z Front-End

- Zastąpienie dotychczasowego rozwiązania dummy auth (stały user ID) przez prawdziwą autentykację z Supabase.
- Rozszerzenie istniejącego kontekstu autentykacji (`<AuthProvider />` oraz `useAuth`) o metody integrujące wywołania API i zarządzanie stanem sesji.
- Aktualizacja interfejsu front-end:
  - Operacje autentykacyjne (logowanie, rejestracja, odzyskiwanie hasła) będą wywoływane poprzez istniejące modale i formularze.
  - Strony chronione nadal wykorzystują mechanizm SSR do weryfikacji sesji, a interakcja odbywa się przez dynamiczne wywoływanie modalnych komponentów.

### 3.3. Bezpieczeństwo i Najlepsze Praktyki

- Wszystkie dane wejściowe są walidowane zarówno po stronie klienta, jak i serwera.
- Używanie HTTPS dla wszelkiej komunikacji między frontendem a backendem.
- Przechowywanie kluczy i tokenów w bezpieczny sposób (zmienne środowiskowe, mechanizmy ciasteczek httpOnly itp.).
- Regularne logowanie błędów i monitorowanie wyjątków.


## Podsumowanie

Niniejsza specyfikacja definiuje kompleksowy moduł autentykacji, który:

- Uporządkowuje logikę backendową poprzez dedykowane endpointy API oraz stosowanie walidacji danych i obsługi wyjątków.
- Korzysta z Supabase Auth do realizacji pełnej funkcjonalności autentykacji, zastępując dotychczasowe rozwiązanie dummy auth, zapewniając kompatybilność z istniejącą architekturą Astro i React.
- Aktualizuje interfejs użytkownika poprzez wykorzystanie istniejących modalnych komponentów oraz formularzy autentykacji, co upraszcza nawigację i interakcję z systemem.

Kluczowe elementy do implementacji:

- Komponenty React: `<LoginForm />`, `<RegisterForm />`, `<ForgotPasswordForm />`, `<AuthProvider />` (oraz modale: `LoginModal`, `RegisterModal`, `ForgotPasswordModal`).
- API Endpoints w `/src/pages/api/auth/`: `register.ts`, `login.ts`, `logout.ts`, `recover.ts`.
- Serwis autentykacyjny umieszczony w `/src/lib/auth.service.ts` opakowujący wywołania Supabase Auth.
- Wykorzystanie Zod do walidacji danych wejściowych oraz odpowiedniego zarządzania błędami.

Implementacja tego rozwiązania umożliwi bezpieczną, skalowalną i dobrze zintegrowaną funkcjonalność autentykacyjną, zgodną z wymaganiami projektu oraz najlepszymi praktykami programowania. 