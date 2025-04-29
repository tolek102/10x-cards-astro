import { useState, useCallback } from "react";
import type { FlashcardDto } from "@/types";
import { showToast } from "@/lib/toast";

interface UseFlashcardsLearningProps {
  flashcards: FlashcardDto[] | undefined;
}

interface LearningStats {
  totalCards: number;
  completedCards: number;
  remainingCards: number;
  progress: number;
}

export const useFlashcardsLearning = ({ flashcards = [] }: UseFlashcardsLearningProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Filtrujemy tylko zaakceptowane fiszki
  const approvedFlashcards = flashcards.filter((f) => !f.candidate);
  const totalCards = approvedFlashcards.length;

  const stats: LearningStats = {
    totalCards,
    completedCards: currentIndex + 1,
    remainingCards: totalCards - (currentIndex + 1),
    progress: Math.round(((currentIndex + 1) / totalCards) * 100),
  };

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < totalCards - 1;

  const handleNext = useCallback(() => {
    if (canGoNext) {
      setCurrentIndex((prev) => prev + 1);
      if (currentIndex === totalCards - 2) {
        showToast("Ostatnia fiszka", "info", {
          description: "To już ostatnia fiszka w tej sesji. Świetna praca!",
        });
      }
    } else {
      setIsSessionComplete(true);
      showToast("Sesja zakończona", "success", {
        description: `Gratulacje! Ukończyłeś sesję nauki, przerabiając wszystkie ${totalCards} fiszek.`,
      });
    }
  }, [canGoNext, currentIndex, totalCards]);

  const handlePrevious = useCallback(() => {
    if (canGoPrevious) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [canGoPrevious]);

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setIsSessionComplete(false);
  }, []);

  return {
    currentFlashcard: approvedFlashcards[currentIndex],
    stats,
    isSessionComplete,
    canGoPrevious,
    canGoNext,
    handleNext,
    handlePrevious,
    resetSession,
  };
};
