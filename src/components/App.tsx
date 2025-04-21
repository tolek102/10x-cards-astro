import { useAuth } from "./providers/AuthProvider";
import AppLayout from "./layouts/AppLayout";
import { WelcomeScreen } from "./WelcomeScreen";
import { CreatorSection } from "./creator/CreatorSection";
import { PreviewSection } from "./preview/PreviewSection";
import { LearningSession as LearningSection } from "./learning/LearningSession";
import { useState } from "react";
import { useFlashcards } from "./hooks/useFlashcards";
import type { FlashcardCreateDto } from "@/types";

const App = () => {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState<"creator" | "preview" | "learning">("creator");
  const {
    flashcards,
    candidates,
    updateFlashcard,
    deleteFlashcard,
    acceptFlashcard,
    discardFlashcard,
    loadPage,
    loadCandidatesPage,
    isLoading: isFlashcardsLoading,
    isCandidatesLoading,
    pagination,
    candidatesPagination,
    generateFlashcards: originalGenerateFlashcards,
    createFlashcard: originalCreateFlashcard,
  } = useFlashcards();

  const handleGenerateFlashcards = async (text: string) => {
    const generatedFlashcards = await originalGenerateFlashcards(text);
    // Reload candidates list after generation
    await loadCandidatesPage(1, candidatesPagination.limit);
    return generatedFlashcards;
  };

  const handleCreateFlashcard = async (flashcard: FlashcardCreateDto) => {
    const createdFlashcard = await originalCreateFlashcard(flashcard);
    // Reload accepted flashcards list after manual creation
    await loadPage(1, pagination.limit);
    return createdFlashcard;
  };

  const handleAcceptFlashcard = async (id: string) => {
    await acceptFlashcard(id);
    // Reload both lists after accepting a flashcard
    await Promise.all([
      loadPage(pagination.page, pagination.limit),
      loadCandidatesPage(candidatesPagination.page, candidatesPagination.limit),
    ]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <WelcomeScreen />;
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "creator":
        return (
          <CreatorSection
            generateFlashcards={handleGenerateFlashcards}
            createFlashcard={handleCreateFlashcard}
            updateFlashcard={updateFlashcard}
            deleteFlashcard={deleteFlashcard}
            acceptFlashcard={handleAcceptFlashcard}
            discardFlashcard={discardFlashcard}
            onLoadPage={loadPage}
            onLoadCandidatesPage={loadCandidatesPage}
          />
        );
      case "preview":
        return (
          <PreviewSection
            flashcards={flashcards}
            candidates={candidates}
            onEdit={updateFlashcard}
            onDelete={deleteFlashcard}
            onAccept={handleAcceptFlashcard}
            onDiscard={discardFlashcard}
            onLoadPage={loadPage}
            onLoadCandidatesPage={loadCandidatesPage}
            isLoading={isFlashcardsLoading}
            isCandidatesLoading={isCandidatesLoading}
            pagination={pagination}
            candidatesPagination={candidatesPagination}
          />
        );
      case "learning":
        return <LearningSection flashcards={flashcards} />;
      default:
        return null;
    }
  };

  return (
    <AppLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderActiveSection()}
    </AppLayout>
  );
};

export default App;
