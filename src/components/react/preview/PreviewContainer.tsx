import { useEffect } from "react";
import { PreviewSection } from "./PreviewSection";
import { useFlashcards } from "@/lib/hooks/useFlashcards";
import { logger } from "@/lib/services/loggerService";

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

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([loadPage(1), loadCandidatesPage(1)]);
      } catch (error) {
        logger.error("Error loading initial data:", { error });
      }
    };

    loadInitialData();
  }, [loadPage, loadCandidatesPage]); // Add stable function dependencies

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
