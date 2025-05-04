import { showToast } from "../toast";
import { authService } from "../services/auth";

export function initializeLoginPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error");
  const registered = urlParams.get("registered");

  if (error) {
    showToast(error, "error");
  }
  if (registered) {
    showToast("Konto zostało utworzone. Możesz się teraz zalogować.", "success");
  }

  document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      await authService.login({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      });
    } catch (error) {
      authService.handleLoginError(error);
    }
  });
}
