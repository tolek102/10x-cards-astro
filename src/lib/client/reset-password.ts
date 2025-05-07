import { showToast } from "../toast";
import { authService } from "../services/auth";

export const initializeResetPasswordPage = () => {
  document.getElementById("resetPasswordForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email")?.toString();

    if (!email) {
      showToast("Proszę podać adres email", "error");
      return;
    }

    try {
      await authService.resetPassword({ email });
    } catch (error) {
      authService.handleAuthError(error);
    }
  });

  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error");

  if (error) {
    showToast(error, "error");
  }
};
