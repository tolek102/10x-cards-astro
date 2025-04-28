import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

// Ścieżki publiczne - endpointy API i strony publiczne
const PUBLIC_PATHS = [
  // Auth pages
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/auth/logout",
  "/api/auth/me",
  // Public pages
  "/",
];

// Ścieżki chronione - wymagają zalogowania
const PROTECTED_PATHS = [
  "/learning",
  "/preview",
  "/creator"
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies, redirect, locals } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Inicjalizacja Supabase i pobranie użytkownika
  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
  const { data: { user }, error } = await supabase.auth.getUser();

  // Ustawienie user i supabase w locals
  locals.user = user && user.email ? { id: user.id, email: user.email } : null;
  locals.supabase = supabase;

  // Sprawdź czy ścieżka jest chroniona
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));
  const isApiPath = pathname.startsWith("/api");

  // Obsługa ścieżek API
  if (isApiPath && !isPublicPath) {
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Przekierowanie niezalogowanych użytkowników z chronionych ścieżek
  if (isProtectedPath && !user) {
    return redirect("/auth/login");
  }

  // Kontynuuj dla publicznych ścieżek lub zalogowanych użytkowników
  return next();
});
