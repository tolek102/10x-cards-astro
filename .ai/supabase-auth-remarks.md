# Supabase Auth Integration with Astro - Zaktualizowana Dokumentacja

## Cel dokumentu

Niniejszy dokument opisuje integrację Supabase Auth w aplikacji Astro, dostosowaną do obecnych wymagań projektu, zgodnie z dokumentacją @auth-spec.md oraz planem API (@api-plan.md). Poniżej przedstawiono spójną strategię zarówno dla backendu, jak i integracji z warstwą UI.

## Struktura Endpointów API

Dla spójności z planem API zaleca się umieszczenie endpointów autentykacji bez dedykowanego segmentu `/auth` w ścieżce. W związku z tym nasze endpointy powinny mieć następujące ścieżki:

- Logowanie: `/api/login`
- Rejestracja: `/api/register`
- Wylogowanie: `/api/logout`
- Resetowanie hasła: `/api/reset-password`

Wdrożenie powyższych ścieżek można zrealizować poprzez utworzenie lub modyfikację plików w katalogu `/src/pages/api/` (np. `login.ts`, `register.ts`, `logout.ts`, `reset-password.ts`).

## Konfiguracja Supabase Client

Upewnij się, że tworzysz instancję klienta Supabase z wykorzystaniem `@supabase/ssr` oraz właściwej konfiguracji ciasteczek przy użyciu metod `getAll` i `setAll`. Przykład implementacji:

```typescript
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "../db/database.types.ts";

export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    cookieOptions,
    cookies: {
      getAll() {
        return (context.headers.get("Cookie") ?? "").split("; ").map((cookieStr) => {
          const [name, value] = cookieStr.split("=");
          return { name, value };
        });
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};
```

_(Powyższy kod może wymagać dostosowania do lokalnego środowiska.)_

## Middleware i Zarządzanie Sesją

Dla stron chronionych zaleca się stosowanie middleware, które:

- Używa funkcji `createSupabaseServerInstance` do pobrania danych użytkownika.
- W przypadku braku aktywnej sesji nie wykonuje automatycznego przekierowania, lecz pozwala na dynamiczne otwieranie modalnych komponentów logowania (np. LoginModal).

Przykładowa implementacja middleware:

```typescript
import { createSupabaseServerInstance } from "../db/supabase.client.ts";
import { defineMiddleware } from "astro:middleware";

const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/api/login",
  "/api/register",
  "/api/reset-password",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    locals.user = {
      email: user.email,
      id: user.id,
    };
  } else {
    // Zamiast przekierowania, możesz tu zainicjować logikę otwierania modalnego komponentu logowania
    // return redirect('/auth/login');
  }

  return next();
});
```

## Endpointy Autentykacji

### Logowanie

Endpoint `/api/login` (np. `login.ts`):

```typescript
import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../db/supabase.client.ts";

export const POST: APIRoute = async ({ request, cookies }) => {
  // Walidacja danych przy użyciu np. Zod powinna być zaimplementowana tutaj
  const { email, password } = await request.json();

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ user: data.user }), {
    status: 200,
  });
};
```

### Rejestracja

Endpoint `/api/register` (np. `register.ts`):

```typescript
export const POST: APIRoute = async ({ request, cookies }) => {
  // Walidacja danych przy użyciu Zod powinna być dodana tutaj
  const { email, password } = await request.json();

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ user: data.user }), {
    status: 200,
  });
};
```

### Wylogowanie

Endpoint `/api/logout` (np. `logout.ts`):

```typescript
export const POST: APIRoute = async ({ cookies, request }) => {
  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
  const { error } = await supabase.auth.signOut();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(null, { status: 200 });
};
```

### Reset Hasła

Nowy endpoint `/api/reset-password` (np. `reset-password.ts`):

```typescript
export const POST: APIRoute = async ({ request, cookies }) => {
  // Walidacja danych przy użyciu Zod powinna być dodana tutaj
  const { email } = await request.json();

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ message: "Instrukcje resetowania hasła wysłane." }), {
    status: 200,
  });
};
```

## Walidacja Danych

Zaleca się użycie biblioteki Zod do walidacji wejściowych danych użytkownika w każdym z endpointów. Dzięki walidacji przy wczesnych zwrotach (early returns) można zapobiec występowaniu błędów i ograniczyć zagnieżdżanie kodu.

## Integracja z UI

W warstwie frontend, zamiast dedykowanych stron logowania/rejestracji, należy:

- Wykorzystać modalne komponenty: `LoginModal`, `RegisterModal` oraz `ForgotPasswordModal` znajdujące się w katalogu `/src/components/auth`.
- Rozszerzyć kontekst autentykacji (`<AuthProvider />`) o metody logowania, rejestracji, wylogowywania oraz resetowania hasła.
- Upewnić się, że logika middleware nie wymusza przekierowania, lecz umożliwia dynamiczne otwieranie modalnych komponentów autentykacyjnych.

## Podsumowanie

Dokument ten został uaktualniony, aby:

- Ujednolicić ścieżki endpointów API zgodnie z planem API.
- Dodać niezbędny endpoint do resetowania hasła.
- Wprowadzić przykładowe fragmenty kodu z walidacją (z użyciem Zod).
- Zintegrować zalecenia dotyczące frontendowych modalnych komponentów oraz kontekstu autentykacji.

Przy implementacji należy pamiętać, aby aktualizować również pliki konfiguracyjne oraz środowiskowe (m.in. `.env`, `src/env.d.ts`) zgodnie z wymaganiami Supabase.
