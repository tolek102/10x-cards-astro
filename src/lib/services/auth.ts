import { showToast } from "../toast";
import { logger } from "./loggerService";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
}

interface ResetPasswordCredentials {
  email: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<void> {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error || "Wystąpił błąd podczas logowania";
        if (errorMessage.includes("Invalid login credentials")) {
          errorMessage = "Nieprawidłowe dane logowania";
        }
        throw new Error(errorMessage);
      }

      showToast("Zalogowano pomyślnie", "success");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.href = "/creator";
    } catch (error) {
      throw error instanceof Error ? error : new Error("Wystąpił nieoczekiwany błąd");
    }
  },

  async register(credentials: RegisterCredentials): Promise<void> {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error || "Wystąpił błąd podczas rejestracji";
        if (errorMessage.includes("User already registered")) {
          errorMessage = "Użytkownik o tym adresie email jest już zarejestrowany";
        }
        throw new Error(errorMessage);
      }

      showToast("Konto zostało utworzone pomyślnie", "success", {
        description: "Na podany adres email został wysłany link do aktywacji konta",
        duration: 3000,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const loginUrl = new URL("/creator", window.location.origin);
      window.location.href = loginUrl.toString();
    } catch (error) {
      throw error instanceof Error ? error : new Error("Wystąpił nieoczekiwany błąd");
    }
  },

  async resetPassword(credentials: ResetPasswordCredentials): Promise<void> {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Wystąpił błąd podczas resetowania hasła");
      }

      showToast("Instrukcje resetowania hasła zostały wysłane na podany adres email", "success");
      window.location.href = "/auth/login";
    } catch (error) {
      throw error instanceof Error ? error : new Error("Wystąpił nieoczekiwany błąd");
    }
  },

  handleAuthError(error: unknown): void {
    logger.error("Auth error:", error);
    showToast(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd", "error");
  },
};
