import { CreatorSection } from './CreatorSection';
import { useFlashcards } from '@/components/hooks/useFlashcards';

export const CreatorContainer = () => {
  const {
    generateFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    acceptFlashcard,
    discardFlashcard,
    loadPage,
    loadCandidatesPage,
  } = useFlashcards();

  return (
    <CreatorSection
      generateFlashcards={generateFlashcards}
      createFlashcard={createFlashcard}
      updateFlashcard={updateFlashcard}
      deleteFlashcard={deleteFlashcard}
      acceptFlashcard={acceptFlashcard}
      discardFlashcard={discardFlashcard}
      onLoadPage={loadPage}
      onLoadCandidatesPage={loadCandidatesPage}
    />
  );
}; 