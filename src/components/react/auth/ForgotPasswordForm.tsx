import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { showToast } from "@/lib/toast";
import { logger } from "@/lib/services/loggerService";

export const ForgotPasswordForm = () => {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email")?.toString();

    if (!email) {
      showToast("Proszę podać adres email", "error");
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword(email);
      if (result.success) {
        form.reset();
      }
    } catch (error) {
      logger.error("Error resetting password", { error });
      showToast("Wystąpił błąd podczas resetowania hasła", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          placeholder="Adres email"
          disabled={isLoading}
        />
      </div>

      <div>
        <button
          type="submit"
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "Wysyłanie..." : "Wyślij link do resetowania hasła"}
        </button>
      </div>

      <div className="text-center">
        <a href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Powrót do logowania
        </a>
      </div>
    </form>
  );
};
