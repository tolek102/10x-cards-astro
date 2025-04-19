import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  onLogin: () => void;
}

export const ForgotPasswordForm = ({ onSubmit, onLogin }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      await onSubmit(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas resetowania hasła");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium">Sprawdź swoją skrzynkę</h3>
          <p className="text-sm text-gray-500 mt-2">Wysłaliśmy instrukcje resetowania hasła na adres {email}</p>
        </div>
        <Button type="button" onClick={onLogin} className="w-full">
          Wróć do logowania
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium">Zapomniałeś hasła?</h3>
        <p className="text-sm text-gray-500 mt-2">Podaj swój adres email, a wyślemy Ci link do resetowania hasła</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="forgot-email">Email</Label>
        <Input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="twoj@email.com"
          required
          disabled={isLoading}
        />
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Wysyłanie..." : "Wyślij link resetujący"}
      </Button>

      <div className="text-sm text-center">
        <button type="button" onClick={onLogin} className="text-indigo-600 hover:text-indigo-500">
          Wróć do logowania
        </button>
      </div>
    </form>
  );
};
