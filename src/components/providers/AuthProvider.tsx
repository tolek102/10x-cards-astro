import { createContext, useContext, useState, useEffect } from "react";
import type { UserDto } from "../../types";
import { showToast } from "../../lib/toast";
import { logger } from "../../lib/services/loggerService";
import { authService } from "../../lib/services/auth";

interface AuthResult {
  success: boolean;
  error?: string;
  user?: UserDto;
}

interface AuthContextType {
  user: UserDto | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        logger.error("Failed to check authentication status:", { err });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      await authService.login({ email, password });
      return { success: true };
    } catch (err) {
      authService.handleAuthError(err);
      return { success: false, error: err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd" };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      await authService.register({ email, password });
      return { success: true };
    } catch (err) {
      authService.handleAuthError(err);
      return { success: false, error: err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd" };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      await authService.resetPassword({ email });
      return { success: true };
    } catch (err) {
      authService.handleAuthError(err);
      return { success: false, error: err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd" };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        let errorMessage = "Nie udało się wylogować";
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            const data = await response.json();
            errorMessage = data.error || errorMessage;
          } catch (parseError) {
            logger.error("Błąd parsowania JSON podczas wylogowywania:", { parseError });
          }
        }
        showToast("Błąd wylogowania", "error", {
          description: errorMessage,
        });
        return { success: false, error: errorMessage };
      }

      setUser(null);
      showToast("Pomyślnie wylogowano z systemu", "success", {
        description: "Do zobaczenia!",
      });
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd";
      showToast("Błąd wylogowania", "error", {
        description: `Nie można połączyć się z serwerem. ${errorMessage}`,
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
