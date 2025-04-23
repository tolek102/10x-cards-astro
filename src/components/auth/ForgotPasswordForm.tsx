import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { showToast } from "../../lib/toast";

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  onLogin: () => void;
}

export const ForgotPasswordForm = ({ onSubmit, onLogin }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubmit(email);
      showToast("Instrukcje resetowania hasła zostały wysłane", "success", {
        description: `Sprawdź swoją skrzynkę ${email}`,
      });
      onLogin(); // Przekieruj do strony logowania po wysłaniu instrukcji
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Wystąpił błąd podczas resetowania hasła", "error");
    } finally {
      setIsLoading(false);
    }
  };

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
