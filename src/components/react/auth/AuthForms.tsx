import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { Providers } from "@/components/providers/Providers";

interface AuthFormsProps {
  type: "login" | "register" | "forgot-password";
  error?: string | null;
  success?: string | null;
  registered?: string | null;
}

export const AuthForms = ({ type, error, success, registered }: AuthFormsProps) => {
  return (
    <Providers>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {type === "login" && "Zaloguj się do swojego konta"}
              {type === "register" && "Utwórz nowe konto"}
              {type === "forgot-password" && "Zresetuj hasło"}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Lub{" "}
              {type === "login" && (
                <a href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                  zarejestruj się za darmo
                </a>
              )}
              {type === "register" && (
                <a href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  zaloguj się do istniejącego konta
                </a>
              )}
              {type === "forgot-password" && (
                <a href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  wróć do logowania
                </a>
              )}
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Błąd</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Sukces</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{success}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {registered && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Sukces</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Konto zostało utworzone. Możesz się teraz zalogować.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {type === "login" && <LoginForm />}
          {type === "register" && <RegisterForm />}
          {type === "forgot-password" && <ForgotPasswordForm />}

          <div className="text-center mt-4">
            <a href="/" className="font-medium text-gray-600 hover:text-gray-500">
              ← Powrót na stronę główną
            </a>
          </div>
        </div>
      </div>
    </Providers>
  );
};
