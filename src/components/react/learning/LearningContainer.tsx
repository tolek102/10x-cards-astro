import { useEffect, useState, useCallback } from 'react';
import { LearningSession } from './LearningSession';
import { useFlashcards } from '@/lib/hooks/useFlashcards';
import type { FlashcardDto } from '@/types';
import { showToast } from '@/lib/toast';

export const LearningContainer = () => {
  const { flashcards, isLoading, loadPage } = useFlashcards();
  const [learningFlashcards, setLearningFlashcards] = useState<FlashcardDto[]>([]);

  const loadFlashcards = useCallback(async () => {
    try {
      await loadPage(1, 100); // Ładujemy większą ilość fiszek do nauki
    } catch (error) {
      showToast('Błąd ładowania fiszek', 'error', {
        description: 'Wystąpił problem podczas ładowania fiszek do nauki. Spróbuj odświeżyć stronę.'
      });
    }
  }, [loadPage]);

  useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  useEffect(() => {
    // Filtrujemy tylko zaakceptowane fiszki
    const acceptedFlashcards = flashcards.filter(f => !f.candidate);
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

  return <LearningSession flashcards={learningFlashcards} />;
}; 