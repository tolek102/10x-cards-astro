import { createContext, useContext, useState, useEffect } from "react";
import type { UserDto } from "../../types";
import { showToast } from "../../lib/toast";

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
        console.error("Failed to check authentication status:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Nieprawidłowy email lub hasło";
        showToast("Błąd logowania", "error", {
          description: errorMessage
        });
        return { success: false, error: errorMessage };
      }

      setUser(data.user);
      showToast("Pomyślnie zalogowano do systemu", "success", {
        description: "Witamy w aplikacji!"
      });
      return { success: true, user: data.user };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd";
      showToast("Błąd logowania", "error", {
        description: `Nie można połączyć się z serwerem. ${errorMessage}`
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Nie udało się zarejestrować";
        showToast("Błąd rejestracji", "error", {
          description: errorMessage
        });
        return { success: false, error: errorMessage };
      }

      setUser(data.user);
      showToast("Pomyślnie utworzono konto", "success", {
        description: "Witamy w aplikacji!"
      });
      return { success: true, user: data.user };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd";
      showToast("Błąd rejestracji", "error", {
        description: `Nie można połączyć się z serwerem. ${errorMessage}`
      });
      return { success: false, error: errorMessage };
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
        const data = await response.json();
        const errorMessage = data.error || "Nie udało się wylogować";
        showToast("Błąd wylogowania", "error", {
          description: errorMessage
        });
        return { success: false, error: errorMessage };
      }

      setUser(null);
      showToast("Pomyślnie wylogowano z systemu", "success", {
        description: "Do zobaczenia!"
      });
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd";
      showToast("Błąd wylogowania", "error", {
        description: `Nie można połączyć się z serwerem. ${errorMessage}`
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Nie udało się zresetować hasła";
        showToast("Błąd resetowania hasła", "error", {
          description: errorMessage
        });
        return { success: false, error: errorMessage };
      }

      showToast("Instrukcje resetowania hasła zostały wysłane na podany adres email", "success");
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd";
      showToast("Błąd resetowania hasła", "error", {
        description: `Nie można połączyć się z serwerem. ${errorMessage}`
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
