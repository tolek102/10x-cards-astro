import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import Modal from "./Modal";
import { showToast } from "../../lib/toast";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const ForgotPasswordModal = ({ isOpen, onClose, onLogin }: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await resetPassword(email);
      showToast("Pomyślnie wysłano link do resetowania hasła", "success", {
        description: "Sprawdź swoją skrzynkę pocztową i postępuj zgodnie z instrukcjami w wiadomości."
      });
      onClose();
      onLogin();
    } catch (err) {
      showToast("Błąd resetowania hasła", "error", {
        description: err instanceof Error 
          ? `Nie można zresetować hasła. ${err.message}`
          : "Wystąpił nieoczekiwany błąd podczas resetowania hasła. Spróbuj ponownie później."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="sm:flex sm:items-start">
          <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Resetowanie hasła</h3>
            <div className="mt-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="forgot-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={onLogin}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Powrót do logowania
                  </button>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? (
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : null}
                    {isLoading ? "Wysyłanie..." : "Wyślij link do resetowania"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;
