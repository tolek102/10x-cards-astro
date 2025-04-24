import type { APIRoute } from 'astro';
import { authService } from '../../lib/services/auth.service';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const data = await request.formData();
    const email = data.get('email')?.toString() || '';
    const password = data.get('password')?.toString() || '';

    const result = await authService.register(email, password, request.url);

    if ('error' in result) {
      return redirect(`/auth/register?error=${encodeURIComponent(result.error)}`);
    }

    return redirect('/auth/login?registered=true');
  } catch (error) {
    return redirect('/auth/register?error=Wystąpił nieoczekiwany błąd');
  }
}; 