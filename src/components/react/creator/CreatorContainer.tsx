import { CreatorSection } from "./CreatorSection";
import { useFlashcards } from "@/lib/hooks/useFlashcards";

export const CreatorContainer = () => {
  const {
    generateFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    acceptFlashcard,
    discardFlashcard,
    candidates,
    manuallyCreatedFlashcards,
    isLoading,
  } = useFlashcards();

  return (
    <CreatorSection
      generateFlashcards={generateFlashcards}
      createFlashcard={createFlashcard}
      updateFlashcard={updateFlashcard}
      deleteFlashcard={deleteFlashcard}
      acceptFlashcard={acceptFlashcard}
      discardFlashcard={discardFlashcard}
      candidates={candidates}
      manuallyCreatedFlashcards={manuallyCreatedFlashcards}
      isLoading={isLoading}
    />
  );
};
