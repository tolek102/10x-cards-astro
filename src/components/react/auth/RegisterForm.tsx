import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { showToast } from "@/lib/toast";
import { logger } from "@/lib/services/loggerService";

export const RegisterForm = () => {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    setIsLoading(true);
    try {
      const result = await register(email, password);
      if (result.success) {
        form.reset();
        showToast("Konto zostało utworzone", "success", {
          description: "Na podany adres email zostały wysłane instrukcje aktywacji konta.",
        });
        window.location.href = "/auth/login?registered=true";
      }
    } catch (error) {
      logger.error("Error registering", { error });
      showToast("Wystąpił błąd podczas rejestracji", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Adres email"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Hasło
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Hasło"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="sr-only">
            Potwierdź hasło
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Potwierdź hasło"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Rejestracja..." : "Zarejestruj się"}
        </button>
      </div>
    </form>
  );
};
