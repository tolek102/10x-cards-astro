import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { RegisterUserCommand } from "../../types";
import { showToast } from "../../lib/toast";

interface RegisterFormProps {
  onSubmit: (data: RegisterUserCommand) => Promise<void>;
  onLogin: () => void;
}

export const RegisterForm = ({ onSubmit, onLogin }: RegisterFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast("Hasła nie są identyczne", "error");
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({ email, password });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Wystąpił błąd podczas rejestracji", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="twoj@email.com"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Hasło</Label>
        <Input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-confirm-password">Potwierdź hasło</Label>
        <Input
          id="register-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Rejestracja..." : "Zarejestruj się"}
      </Button>

      <div className="text-sm text-center">
        <button type="button" onClick={onLogin} className="text-indigo-600 hover:text-indigo-500">
          Masz już konto? Zaloguj się
        </button>
      </div>
    </form>
  );
};
