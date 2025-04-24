import { useState } from 'react';
import type { LoginUserCommand, RegisterUserCommand, UserDto } from '../../../../types';

interface UseAuthProps {
  onSuccess?: (user: UserDto) => void;
  onError?: (error: Error) => void;
}

export const useAuth = ({ onSuccess, onError }: UseAuthProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleLogin = async (credentials: LoginUserCommand) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Błąd logowania. Sprawdź dane i spróbuj ponownie.');
      }

      const data = await response.json();
      onSuccess?.(data.user);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Wystąpił nieznany błąd');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData: RegisterUserCommand) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Błąd rejestracji. Sprawdź dane i spróbuj ponownie.');
      }

      const data = await response.json();
      onSuccess?.(data.user);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Wystąpił nieznany błąd');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Błąd wylogowania. Spróbuj ponownie.');
      }

      window.location.href = '/';
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Wystąpił nieznany błąd');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    handleLogin,
    handleRegister,
    handleLogout,
  };
}; 