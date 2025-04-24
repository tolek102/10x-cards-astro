import type { APIRoute } from 'astro';
import { authService } from '../../lib/services/auth.service';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const data = await request.formData();
    const email = data.get('email')?.toString() || '';

    const result = await authService.resetPassword(email, request.url);

    if ('error' in result) {
      return redirect(`/auth/forgot-password?error=${encodeURIComponent(result.error)}`);
    }

    return redirect('/auth/forgot-password?success=true');
  } catch (error) {
    return redirect('/auth/forgot-password?error=Wystąpił nieoczekiwany błąd');
  }
}; 