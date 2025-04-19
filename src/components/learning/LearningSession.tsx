import { useState } from "react";
import { LearningCard } from "./LearningCard";
import { ProgressBar } from "./ProgressBar";
import type { FlashcardDto } from "@/types";

interface LearningSessionProps {
  flashcards: FlashcardDto[];
}

export const LearningSession = ({ flashcards }: LearningSessionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filtrujemy tylko zaakceptowane fiszki
  const approvedFlashcards = flashcards.filter((f) => !f.candidate);
  const totalCards = approvedFlashcards.length;

  if (totalCards === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">
          Brak fiszek do nauki. Dodaj nowe fiszki w sekcji Creator lub zaakceptuj istniejące fiszki w sekcji Preview.
        </p>
      </div>
    );
  }

  const currentFlashcard = approvedFlashcards[currentIndex];
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < totalCards - 1;

  const handleNext = () => {
    if (canGoNext) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <ProgressBar current={currentIndex + 1} total={totalCards} className="mb-8" />

      <LearningCard
        flashcard={currentFlashcard}
        onNext={handleNext}
        onPrevious={handlePrevious}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        currentIndex={currentIndex}
        totalCards={totalCards}
      />

      {/* Statystyki sesji */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Statystyki sesji</h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
          <div>
            <p>Pozostało fiszek:</p>
            <p className="text-lg font-medium text-gray-900">{totalCards - (currentIndex + 1)}</p>
          </div>
          <div>
            <p>Ukończono:</p>
            <p className="text-lg font-medium text-gray-900">{Math.round(((currentIndex + 1) / totalCards) * 100)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};
