import { showToast } from "../toast";
import { logger } from "../services/loggerService";

const displayToast = (message: string, type: "success" | "error" = "error") => {
  if (message?.trim() && typeof showToast === "function") {
    logger.info("Displaying toast:", { message, type });
    showToast(message, type);
  } else {
    logger.error("Cannot display toast:", {
      message,
      type,
      showToastAvailable: typeof showToast === "function",
    });
  }
};

export function initializeRegisterPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error");

  if (error) {
    displayToast(error);
  }

  document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    if (!email || !password || !confirmPassword) {
      displayToast("Proszę wypełnić wszystkie pola");
      return;
    }

    if (password !== confirmPassword) {
      displayToast("Podane hasła nie są takie same");
      return;
    }

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
        let errorMessage = data.error || "Wystąpił błąd podczas rejestracji";
        if (errorMessage.includes("User already registered")) {
          errorMessage = "Użytkownik o tym adresie email jest już zarejestrowany";
        }
        displayToast(errorMessage);
        return;
      }

      displayToast("Konto zostało utworzone pomyślnie", "success");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const loginUrl = new URL("/creator", window.location.origin);

      if (document.startViewTransition) {
        document.startViewTransition(() => {
          window.location.href = loginUrl.toString();
        });
      } else {
        window.location.href = loginUrl.toString();
      }
    } catch (error) {
      displayToast(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd");
    }
  });
}
