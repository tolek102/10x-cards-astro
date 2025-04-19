import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { FlashcardDto } from "@/types";

interface LearningCardProps {
  flashcard: FlashcardDto;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  currentIndex: number;
  totalCards: number;
}

export const LearningCard = ({
  flashcard,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  currentIndex,
  totalCards,
}: LearningCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        setIsFlipped(!isFlipped);
        break;
      case "ArrowLeft":
        if (canGoPrevious) {
          e.preventDefault();
          onPrevious();
          setIsFlipped(false);
        }
        break;
      case "ArrowRight":
        if (canGoNext) {
          e.preventDefault();
          onNext();
          setIsFlipped(false);
        }
        break;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-500">
          Fiszka {currentIndex + 1} z {totalCards}
        </p>
      </div>

      <div
        className="relative h-96 cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Kliknij aby odwrócić fiszkę"
      >
        <div className={`absolute inset-0 duration-500 preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}>
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center">
            <p className="text-2xl text-center text-gray-900">{flashcard.front}</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center">
            <p className="text-2xl text-center text-gray-900">{flashcard.back}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={() => {
            onPrevious();
            setIsFlipped(false);
          }}
          disabled={!canGoPrevious}
        >
          ← Poprzednia
        </Button>

        <Button variant="ghost" onClick={() => setIsFlipped(!isFlipped)} className="mx-4">
          {isFlipped ? "Pokaż przód" : "Pokaż tył"}
        </Button>

        <Button
          onClick={() => {
            onNext();
            setIsFlipped(false);
          }}
          disabled={!canGoNext}
        >
          Następna →
        </Button>
      </div>

      <div className="text-center mt-4 text-sm text-gray-500">
        <p>Użyj strzałek ← → do nawigacji lub spacji do odwracania fiszki</p>
      </div>
    </div>
  );
};
