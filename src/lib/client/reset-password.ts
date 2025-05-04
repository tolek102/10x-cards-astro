import { showToast } from "../toast";

export const initializeResetPasswordPage = () => {
  document.getElementById("resetPasswordForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.get("email"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Wystąpił błąd podczas resetowania hasła", "error");
        return;
      }

      showToast("Instrukcje resetowania hasła zostały wysłane na podany adres email", "success");
      window.location.href = "/auth/login";
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd", "error");
    }
  });

  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error");

  if (error) {
    showToast(error, "error");
  }
};
