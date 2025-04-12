import type { MiddlewareResponseHandler } from "astro";

export const handleAuth: MiddlewareResponseHandler = async ({ locals, request }, next) => {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "Missing or invalid authorization token",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const token = authHeader.split(" ")[1];
  const {
    data: { user },
    error,
  } = await locals.supabase.auth.getUser(token);

  if (error || !user) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "Invalid or expired token",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Add user to locals for use in routes
  locals.user = user;

  return next();
};
