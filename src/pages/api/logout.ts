import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../db/supabase.client';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    return new Response(null, {
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'Wystąpił nieoczekiwany błąd podczas wylogowywania',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}; 