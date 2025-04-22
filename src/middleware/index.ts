import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

// Ścieżki publiczne - endpointy API i strony publiczne
const PUBLIC_PATHS = [
  "/api/login",
  "/api/register",
  "/api/reset-password",
  "/api/logout",
];

export const onRequest = defineMiddleware(
  async ({ locals, cookies, url, request }, next) => {
    // Pomijamy sprawdzanie autoryzacji dla ścieżek publicznych
    if (PUBLIC_PATHS.includes(url.pathname)) {
      return next();
    }

    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Pobieramy dane użytkownika z sesji
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      locals.user = {
        email: user.email,
        id: user.id,
      };
      locals.supabase = supabase;
      return next();
    }

    // Dla ścieżek API zwracamy błąd 401
    if (url.pathname.startsWith('/api/')) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "Authentication required",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Dla pozostałych ścieżek pozwalamy na kontynuację - obsługa modali logowania
    locals.supabase = supabase;
    return next();
  }
);
