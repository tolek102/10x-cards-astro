import { useAuth } from "./providers/AuthProvider";
import AppLayout from "./layouts/AppLayout";
import { WelcomeScreen } from "./WelcomeScreen";
import { CreatorSection } from "./creator/CreatorSection";
import { PreviewSection } from "./preview/PreviewSection";
import { LearningSession as LearningSection } from "./learning/LearningSession";
import { useState } from "react";

const App = () => {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState<"creator" | "preview" | "learning">("creator");

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
        return <PreviewSection />;
      case "learning":
        return <LearningSection flashcards={user.flashcards || []} />;
      default:
        return <CreatorSection />;
    }
  };

  return <AppLayout>{renderActiveSection()}</AppLayout>;
};

export default App;
