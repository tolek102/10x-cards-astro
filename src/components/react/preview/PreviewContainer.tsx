import { useEffect, useCallback } from 'react';
import { PreviewSection } from './PreviewSection';
import { useFlashcards } from '@/lib/hooks/useFlashcards';

export const PreviewContainer = () => {
  const {
    flashcards,
    candidates,
    isLoading,
    isCandidatesLoading,
    pagination,
    candidatesPagination,
    loadPage,
    loadCandidatesPage,
    updateFlashcard,
    deleteFlashcard,
    acceptFlashcard,
    discardFlashcard,
  } = useFlashcards();

  const loadInitialData = useCallback(async () => {
    try {
      await loadPage(1);
      await loadCandidatesPage(1);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }, [loadPage, loadCandidatesPage]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return (
    <PreviewSection
      flashcards={flashcards}
      candidates={candidates}
      isLoading={isLoading}
      isCandidatesLoading={isCandidatesLoading}
      pagination={pagination}
      candidatesPagination={candidatesPagination}
      updateFlashcard={updateFlashcard}
      deleteFlashcard={deleteFlashcard}
      acceptFlashcard={acceptFlashcard}
      discardFlashcard={discardFlashcard}
      loadPage={loadPage}
      loadCandidatesPage={loadCandidatesPage}
    />
  );
}; 