import { showToast } from "../toast";

interface LoginCredentials {
  email: string;
  password: string;
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

  handleLoginError(error: unknown): void {
    showToast(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd", "error");
  },
};
