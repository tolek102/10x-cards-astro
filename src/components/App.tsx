import { useAuth } from "./providers/AuthProvider";
import AppLayout from "./layouts/AppLayout";
import { WelcomeScreen } from "./WelcomeScreen";
import { CreatorSection } from "./creator/CreatorSection";
import { PreviewSection } from "./preview/PreviewSection";
import { LearningSession as LearningSection } from "./learning/LearningSession";
import { useState } from "react";
import { useFlashcards } from "./hooks/useFlashcards";

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
  } = useFlashcards();

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
        return <CreatorSection />;
      case "preview":
        return (
          <PreviewSection
            flashcards={flashcards}
            candidates={candidates}
            onEdit={updateFlashcard}
            onDelete={deleteFlashcard}
            onAccept={acceptFlashcard}
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
        return <LearningSection flashcards={flashcards.filter((f) => !f.candidate)} />;
      default:
        return <CreatorSection />;
    }
  };

  return (
    <AppLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderActiveSection()}
    </AppLayout>
  );
};

export default App;
