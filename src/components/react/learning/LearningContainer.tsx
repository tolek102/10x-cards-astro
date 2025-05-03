import { useEffect, useState } from "react";
import { LearningSession } from "./LearningSession";
import { useFlashcards } from "@/lib/hooks/useFlashcards";
import type { FlashcardDto } from "@/types";

export const LearningContainer = () => {
  const { flashcards, isLoading, loadPage } = useFlashcards();
  const [learningFlashcards, setLearningFlashcards] = useState<FlashcardDto[]>([]);

  // Efekt do ładowania danych
  useEffect(() => {
    loadPage(1, 100);
  }, [loadPage]);

  // Osobny efekt do filtrowania fiszek
  useEffect(() => {
    const acceptedFlashcards = flashcards.filter((f) => !f.candidate);
    setLearningFlashcards(acceptedFlashcards);
  }, [flashcards]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie fiszek...</p>
        </div>
      </div>
    );
  }

  // Pokazujemy LearningSession tylko gdy dane są załadowane i nie ma błędu
  if (!isLoading && flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">
          Nie masz jeszcze żadnych fiszek. Dodaj nowe fiszki w sekcji Kreator lub zaakceptuj istniejące fiszki w sekcji
          Podgląd.
        </p>
      </div>
    );
  }

  return <LearningSession flashcards={learningFlashcards} />;
};
