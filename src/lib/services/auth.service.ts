import type { AstroCookies } from 'astro';

interface AuthError {
  error: string;
}

interface AuthSuccess {
  user: {
    id: string;
    email: string;
  };
}

type AuthResponse = AuthError | AuthSuccess;

export const authService = {
  async login(email: string, password: string, baseUrl: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { error: 'Wystąpił nieoczekiwany błąd' };
    }
  },

  async register(email: string, password: string, baseUrl: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${baseUrl}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { error: 'Wystąpił nieoczekiwany błąd' };
    }
  },

  async resetPassword(email: string, baseUrl: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${baseUrl}/api/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { error: 'Wystąpił nieoczekiwany błąd' };
    }
  },
}; 