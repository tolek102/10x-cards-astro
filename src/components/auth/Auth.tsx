import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { Dialog, DialogContent } from "../ui/dialog";
import type { LoginUserCommand, RegisterUserCommand } from "../../types";

type AuthMode = "login" | "register" | "forgot-password";

interface AuthProps {
  onLoginSuccess: () => void;
}

export const Auth = ({ onLoginSuccess }: AuthProps) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [isOpen, setIsOpen] = useState(false);

  const handleLogin = async (data: LoginUserCommand) => {
    try {
      // TODO: Implement login with Supabase
      onLoginSuccess();
      setIsOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const handleRegister = async (data: RegisterUserCommand) => {
    try {
      // TODO: Implement registration with Supabase
      setMode("login");
    } catch (error) {
      throw error;
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      // TODO: Implement password reset with Supabase
      setMode("login");
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="flex justify-center">
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Zaloguj się
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {mode === "login" && (
            <LoginForm
              onSubmit={handleLogin}
              onRegister={() => setMode("register")}
              onForgotPassword={() => setMode("forgot-password")}
            />
          )}
          {mode === "register" && <RegisterForm onSubmit={handleRegister} onLogin={() => setMode("login")} />}
          {mode === "forgot-password" && (
            <ForgotPasswordForm onSubmit={handleForgotPassword} onLogin={() => setMode("login")} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
