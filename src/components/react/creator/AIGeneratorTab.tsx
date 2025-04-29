import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AIGeneratorTabProps {
  onGenerate: (text: string) => Promise<void>;
  isGenerating: boolean;
}

export const AIGeneratorTab = ({ onGenerate, isGenerating }: AIGeneratorTabProps) => {
  const [text, setText] = useState("");
  const charCount = text.length;
  const isValidLength = charCount >= 1000 && charCount <= 10000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidLength) return;
    await onGenerate(text);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="input-text" className="text-sm font-medium text-gray-700">
            Wprowadź tekst do przetworzenia
          </label>
          <span className={`text-sm ${!isValidLength ? "text-red-500" : "text-gray-500"}`}>{charCount}/10000</span>
        </div>
        <Textarea
          id="input-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Wklej tutaj tekst, z którego chcesz wygenerować fiszki..."
          className="h-64 resize-none"
          aria-label="Tekst do wygenerowania fiszek"
        />
        {!isValidLength && <p className="text-sm text-red-500">Tekst powinien zawierać od 1000 do 10000 znaków</p>}
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setText("");
          }}
          disabled={isGenerating}
        >
          Wyczyść
        </Button>
        <Button type="submit" disabled={!isValidLength || isGenerating} className="w-32">
          {isGenerating ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Generowanie...
            </>
          ) : (
            "Generuj fiszki"
          )}
        </Button>
      </div>
    </form>
  );
};
