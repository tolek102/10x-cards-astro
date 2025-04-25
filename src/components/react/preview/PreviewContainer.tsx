import { useEffect, useCallback } from 'react';
import { PreviewSection } from './PreviewSection';
import { useFlashcards } from '@/components/hooks/useFlashcards';

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
    await Promise.all([
      loadPage(1),
      loadCandidatesPage(1),
    ]);
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