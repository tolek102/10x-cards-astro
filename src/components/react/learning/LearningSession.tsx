import type { FlashcardDto } from "@/types";
import { showToast } from "@/lib/toast";
import { LearningCard } from "./LearningCard";
import { ProgressBar } from "../learning/ProgressBar";
import { useFlashcardsLearning } from "@/lib/hooks/useFlashcardsLearning";

interface LearningSessionProps {
  flashcards: FlashcardDto[];
}

export const LearningSession = ({ flashcards }: LearningSessionProps) => {
  const {
    currentFlashcard,
    stats,
    isSessionComplete,
    canGoPrevious,
    canGoNext,
    handleNext,
    handlePrevious,
    resetSession
  } = useFlashcardsLearning({ flashcards });

  if (stats.totalCards === 0) {
    showToast("Brak materiałów do nauki", "info", {
      description: "Aby rozpocząć naukę, dodaj nowe fiszki w sekcji Kreator lub zaakceptuj istniejące fiszki w sekcji Podgląd."
    });
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">
          Brak fiszek do nauki. Dodaj nowe fiszki w sekcji Kreator lub zaakceptuj istniejące fiszki w sekcji Podgląd.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <ProgressBar current={stats.completedCards} total={stats.totalCards} className="mb-8" />

      <LearningCard
        flashcard={currentFlashcard}
        onNext={handleNext}
        onPrevious={handlePrevious}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        currentIndex={stats.completedCards - 1}
        totalCards={stats.totalCards}
      />

      {/* Statystyki sesji */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Statystyki sesji</h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
          <div>
            <p>Pozostało fiszek:</p>
            <p className="text-lg font-medium text-gray-900">{stats.remainingCards}</p>
          </div>
          <div>
            <p>Ukończono:</p>
            <p className="text-lg font-medium text-gray-900">{stats.progress}%</p>
          </div>
        </div>
      </div>

      {isSessionComplete && (
        <div className="text-center mt-8">
          <button
            onClick={resetSession}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Rozpocznij nową sesję
          </button>
        </div>
      )}
    </div>
  );
};

