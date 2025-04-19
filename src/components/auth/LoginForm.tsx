import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { LoginUserCommand } from "../../types";

interface LoginFormProps {
  onSubmit: (data: LoginUserCommand) => Promise<void>;
  onForgotPassword: () => void;
  onRegister: () => void;
}

export const LoginForm = ({ onSubmit, onForgotPassword, onRegister }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await onSubmit({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas logowania");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="twoj@email.com"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Hasło</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Logowanie..." : "Zaloguj się"}
      </Button>

      <div className="flex justify-between text-sm">
        <button type="button" onClick={onForgotPassword} className="text-indigo-600 hover:text-indigo-500">
          Zapomniałeś hasła?
        </button>
        <button type="button" onClick={onRegister} className="text-indigo-600 hover:text-indigo-500">
          Zarejestruj się
        </button>
      </div>
    </form>
  );
};
