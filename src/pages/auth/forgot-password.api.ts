import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../db/supabase.client";
import { logger } from "@/lib/services/loggerService";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const data = await request.formData();
    const email = data.get("email")?.toString() || "";

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: new URL("/auth/reset-password", request.url).toString(),
    });

    if (error) {
      return redirect(`/auth/forgot-password?error=${encodeURIComponent(error.message)}`);
    }

    return redirect("/auth/forgot-password?success=true");
  } catch (error) {
    logger.error("Failed to reset password:", { error });
    return redirect("/auth/forgot-password?error=Wystąpił nieoczekiwany błąd");
  }
};
