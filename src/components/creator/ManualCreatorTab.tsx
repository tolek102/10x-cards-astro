import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FlashcardCreateDto } from "@/types";

interface ManualCreatorTabProps {
  onAdd: (flashcard: FlashcardCreateDto) => Promise<void>;
  isAdding: boolean;
}

export const ManualCreatorTab = ({ onAdd, isAdding }: ManualCreatorTabProps) => {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    await onAdd({
      front: front.trim(),
      back: back.trim(),
      source: "MANUAL",
      candidate: false,
    });

    // Reset form
    setFront("");
    setBack("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="front" className="text-sm font-medium text-gray-700">
              Przód fiszki
            </label>
            <span className="text-sm text-gray-500">{front.length}</span>
          </div>
          <Textarea
            id="front"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="Wpisz treść przodu fiszki..."
            className="h-32 resize-none"
            aria-label="Treść przodu fiszki"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="back" className="text-sm font-medium text-gray-700">
              Tył fiszki
            </label>
            <span className="text-sm text-gray-500">{back.length}</span>
          </div>
          <Textarea
            id="back"
            value={back}
            onChange={(e) => setBack(e.target.value)}
            placeholder="Wpisz treść tyłu fiszki..."
            className="h-32 resize-none"
            aria-label="Treść tyłu fiszki"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFront("");
            setBack("");
          }}
          disabled={isAdding}
        >
          Wyczyść
        </Button>
        <Button type="submit" disabled={!front.trim() || !back.trim() || isAdding} className="w-32">
          {isAdding ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Dodawanie...
            </>
          ) : (
            "Dodaj fiszkę"
          )}
        </Button>
      </div>
    </form>
  );
};
