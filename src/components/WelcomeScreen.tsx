import { useState } from "react";
import { useAuth } from "./providers/AuthProvider";
import LoginModal from "./modals/LoginModal";
import RegisterModal from "./modals/RegisterModal";
import ForgotPasswordModal from "./modals/ForgotPasswordModal";
import { showToast } from "../lib/toast";

export const WelcomeScreen = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const { login } = useAuth();

  const handleDemoLogin = async () => {
    try {
      await login("demo@example.com", "demo123");
      showToast("Pomyślnie zalogowano do wersji demo", "success", {
        description: "Witamy w aplikacji! Możesz teraz przetestować wszystkie funkcje."
      });
    } catch (error) {
      showToast("Nie udało się zalogować do wersji demo", "error", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">10x Cards</span>
            <span className="block text-indigo-600">Ucz się 10 razy szybciej</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Twórz inteligentne fiszki z pomocą AI. Ucz się efektywniej dzięki spersonalizowanemu systemowi nauki.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                Zaloguj się
              </button>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <button
                onClick={() => setShowRegisterModal(true)}
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Zarejestruj się
              </button>
            </div>
          </div>
          <div className="mt-3">
            <button onClick={handleDemoLogin} className="text-sm text-indigo-600 hover:text-indigo-500">
              Wypróbuj demo
            </button>
          </div>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Szybkie tworzenie</h3>
              <p className="mt-2 text-base text-gray-500">
                Generuj fiszki automatycznie z pomocą AI lub twórz je ręcznie w intuicyjnym interfejsie.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Inteligentne zarządzanie</h3>
              <p className="mt-2 text-base text-gray-500">
                Organizuj i przeglądaj swoje fiszki. Eksportuj je w różnych formatach.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Efektywna nauka</h3>
              <p className="mt-2 text-base text-gray-500">
                Ucz się w optymalny sposób dzięki inteligentnemu systemowi powtórek.
              </p>
            </div>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onForgotPassword={() => {
          setShowLoginModal(false);
          setShowForgotPasswordModal(true);
        }}
        onRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />

      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onLogin={() => {
          setShowForgotPasswordModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
};
