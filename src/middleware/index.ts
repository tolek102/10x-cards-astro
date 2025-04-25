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
  // Public pages
  "/",
];

export const onRequest = defineMiddleware(async ({ request, cookies, redirect, locals }, next) => {
  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
  const { data: { user }, error } = await supabase.auth.getUser();

  // Set user and supabase client in locals for use in API routes and components
  locals.user = user && user.email ? { id: user.id, email: user.email } : null;
  locals.supabase = supabase;

  const url = new URL(request.url);
  const isPublicPath = PUBLIC_PATHS.some(path => url.pathname.startsWith(path));
  const isApiPath = url.pathname.startsWith("/api");

  // Allow public paths
  if (isPublicPath) {
    return next();
  }

  // Handle API routes
  if (isApiPath) {
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return next();
  }

  // Handle page routes
  if (!user) {
    return redirect("/auth/login");
  }

  return next();
});
