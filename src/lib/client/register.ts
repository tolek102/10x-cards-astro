import { showToast } from "../toast";
import { authService } from "../services/auth";

export function initializeRegisterPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error");

  if (error) {
    showToast(error, "error");
  }

  document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    if (!email || !password || !confirmPassword) {
      showToast("Proszę wypełnić wszystkie pola", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Podane hasła nie są takie same", "error");
      return;
    }

    try {
      await authService.register({ email, password });
    } catch (error) {
      authService.handleAuthError(error);
    }
  });
}
