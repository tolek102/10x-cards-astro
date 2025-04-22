import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../db/supabase.client';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response(null, { status: 401 });
    }

    return new Response(
      JSON.stringify({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'Wystąpił nieoczekiwany błąd',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}; 