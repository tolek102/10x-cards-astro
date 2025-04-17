# Specyfikacja modułu autentykacji

## 1. Architektura interfejsu użytkownika

### 1.1. Nowe strony i layouty
- Utworzenie nowych stron w katalogu `/src/pages`:
  - `/login` – strona logowania
  - `/register` – strona rejestracji
  - `/reset-password` – strona inicjalizacji resetu hasła
  - `/update-password` – strona zmiany hasła po kliknięciu w link resetujący
- Utworzenie dedykowanego layoutu `AuthLayout.astro` dla stron autoryzacyjnych, który zarządza układem oraz nawigacją (np. wyświetlanie przycisków logowania/rejestracji w zależności od stanu użytkownika).

### 1.2. Komponenty i formularze (React)
- W katalogu `/src/components` lub `/src/components/ui` dodane zostaną komponenty:
  - `<LoginForm>` – interaktywny formularz logowania
  - `<RegisterForm>` – interaktywny formularz rejestracji
  - `<PasswordRecoveryForm>` – formularz do inicjowania resetu hasła
  - `<UpdatePasswordForm>` – formularz zmiany hasła po weryfikacji tokenu
- Wspólny komponent `<AuthForm>` może być używany jako wrapper dla logiki walidacji, obsługi stanów (loading, error) oraz komunikacji z API.
- Odpowiedzialności:
  - Astro: Routing, renderowanie stron, integracja layoutów i middleware.
  - React: Walidacja formularzy, obsługa zdarzeń, interaktywność i przesyłanie danych do endpointów API.

### 1.3. Walidacja i komunikaty błędów
- **Klient (React):**
  - Walidacja formatu email
  - Weryfikacja siły hasła (minimum 8 znaków, kombinacja liter i cyfr)
  - Natychmiastowe komunikaty, np.: "Niepoprawny format adresu email", "Hasło musi zawierać minimum 8 znaków", "Użytkownik już istnieje" lub "Błędne dane logowania".
- **Serwer:**
  - Użycie bibliotek do walidacji (np. Zod) w endpointach API
  - Obsługa wyjątków i zwracanie odpowiednich statusów HTTP (400, 401, 409, 500)

### 1.4. Scenariusze użytkowników
- **Rejestracja:**
  - Użytkownik wypełnia formularz rejestracyjny (email, hasło).
  - System sprawdza kompletność danych i czy konto już nie istnieje.
  - Po pomyślnej rejestracji następuje automatyczne logowanie oraz przekierowanie do strefy użytkownika.
- **Logowanie:**
  - Użytkownik wprowadza email i hasło.
  - Przy poprawnych danych następuje przekierowanie, a przy błędach wyświetlany jest stosowny komunikat.
- **Odzyskiwanie hasła:**
  - Użytkownik podaje swój adres email, aby otrzymać link resetujący hasło.
  - Link prowadzi do formularza umożliwiającego ustawienie nowego hasła.

## 2. Logika backendowa

### 2.1. Endpointy API
W katalogu `/src/pages/api/auth` zostaną utworzone następujące endpointy:
- `/register` – obsługa rejestracji użytkownika
- `/login` – obsługa logowania
- `/logout` – obsługa wylogowywania (usuwanie sesji lub tokenów)
- `/reset-password` – inicjowanie procesu resetowania hasła (wysłanie linku resetującego)
- `/update-password` – finalizacja zmiany hasła (aktualizacja nowego hasła po weryfikacji tokenu)

### 2.2. Modele danych i kontrakty
- **Modele danych:**
  - Definicja użytkownika (User) w `/src/types.ts` z polami: ID, email, role, status konta.
  - Payloady:
    - Rejestracja: `{ email: string, password: string }`
    - Logowanie: `{ email: string, password: string }`
    - Reset hasła: `{ email: string }`
    - Aktualizacja hasła: `{ token: string, newPassword: string }`

### 2.3. Walidacja i obsługa wyjątków
- Walidacja danych wejściowych zarówno w endpointach API (np. przy użyciu Zod), jak i w serwisach backendowych.
- Obsługa wyjątków:
  - Błędy walidacji (400 Bad Request)
  - Błędy autoryzacji (401 Unauthorized)
  - Konflikty (409 Conflict) – np. przy próbie rejestracji istniejącego już konta
  - Błędy serwera (500 Internal Server Error)
- Przekazywanie czytelnych komunikatów błędów do frontendu.

### 2.4. Integracja z systemem renderowania Astro
- Aktualizacja konfiguracji w `@astro.config.mjs` w celu uwzględnienia nowych endpointów API oraz middleware autoryzacyjnego.
- Wprowadzenie middleware w `/src/middleware/index.ts`, który zabezpiecza strony wymagające autoryzacji, sprawdzając sesję użytkownika.

## 3. System autentykacji

### 3.1. Wykorzystanie Supabase Auth
- Użycie biblioteki `@supabase/supabase-js` do komunikacji z usługą Supabase Auth.
- Implementacja operacji:
  - **Rejestracja:** wywołanie metody `signUp`
  - **Logowanie:** wywołanie metody `signIn`
  - **Wylogowywanie:** wywołanie metody `signOut`
  - **Reset hasła:** wysyłka linku resetującego do użytkownika
- Zarządzanie sesją przy użyciu tokenów JWT lub ciasteczek (secure cookies).

### 3.2. Serwisy i kontrakty
- Utworzenie serwisu `AuthService` w katalogu `/src/lib/` odpowiedzialnego za:
  - Komunikację z Supabase Auth
  - Obsługę logiki biznesowej (rejestracja, logowanie, reset hasła)
- Definicje kontraktów i typów w `/src/types.ts` zapewniają spójność wymiany danych między frontendem a backendem.

### 3.3. Bezpieczeństwo i zgodność z RODO
- Ochrona danych użytkowników zgodnie z RODO:
  - Bezpieczne przechowywanie haseł (delegowane do Supabase Auth)
  - Szyfrowanie sesji i tokenów (JWT lub secure cookies)
  - Możliwość usunięcia konta wraz z danymi na życzenie użytkownika

## Podsumowanie
- Architektura uwzględnia wyraźny podział między warstwą prezentacji (Astro i React) a logiką backendową.
- Nowe strony oraz komponenty UI zostały zaprojektowane z naciskiem na responsywność, efektywną walidację i integrację z API.
- System autentykacji opiera się na Supabase Auth, co zapewnia skalowalność, bezpieczeństwo oraz zgodność z wymaganiami produktu.
- Solidne mechanizmy walidacji i obsługi wyjątków gwarantują spójne i bezpieczne doświadczenie użytkownika. 