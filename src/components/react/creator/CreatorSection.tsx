import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIGeneratorTab } from "./AIGeneratorTab";
import { ManualCreatorTab } from "./ManualCreatorTab";
import { ResultsList } from "./ResultsList";
import { showToast } from "@/lib/toast";
import type { FlashcardCreateDto, FlashcardDto } from "@/types";

interface CreatorSectionProps {
  generateFlashcards: (text: string) => Promise<FlashcardDto[]>;
  createFlashcard: (flashcard: FlashcardCreateDto) => Promise<FlashcardDto>;
  updateFlashcard: (id: string, flashcard: Partial<FlashcardDto>) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  acceptFlashcard: (id: string) => Promise<void>;
  discardFlashcard: (id: string) => Promise<void>;
  onLoadPage?: (page: number, limit?: number) => Promise<void>;
  onLoadCandidatesPage?: (page: number, limit?: number) => Promise<void>;
}

export const CreatorSection = ({
  generateFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  acceptFlashcard,
  discardFlashcard,
  onLoadPage,
  onLoadCandidatesPage,
}: CreatorSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"ai" | "manual">("ai");
  const [lastGeneratedFlashcards, setLastGeneratedFlashcards] = useState<FlashcardDto[]>([]);
  const [lastCreatedFlashcard, setLastCreatedFlashcard] = useState<FlashcardDto[]>([]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as "ai" | "manual");
  };

  const handleGenerateFlashcards = async (text: string) => {
    setIsLoading(true);
    try {
      const generatedFlashcards = await generateFlashcards(text);
      setLastGeneratedFlashcards(generatedFlashcards);
      showToast("Pomyślnie wygenerowano fiszki", "success", {
        description: `Utworzono ${generatedFlashcards.length} nowych kandydatów na fiszki.`
      });
    } catch (err) {
      showToast("Błąd generowania fiszek", "error", {
        description: "Wystąpił problem podczas generowania fiszek. Sprawdź wprowadzony tekst i spróbuj ponownie."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFlashcard = async (flashcard: FlashcardCreateDto) => {
    setIsLoading(true);
    try {
      const createdFlashcard = await createFlashcard(flashcard);
      setLastCreatedFlashcard([createdFlashcard]);
      showToast("Pomyślnie utworzono fiszkę", "success", {
        description: "Nowa fiszka została dodana do listy kandydatów."
      });
    } catch (err) {
      showToast("Błąd tworzenia fiszki", "error", {
        description: "Wystąpił problem podczas tworzenia fiszki. Sprawdź wprowadzone dane i spróbuj ponownie."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFlashcard = async (id: string, flashcard: Partial<FlashcardDto>) => {
    setIsLoading(true);
    try {
      await updateFlashcard(id, flashcard);
      // Remove the edited flashcard from the list since it's no longer a candidate
      if (activeTab === "ai") {
        setLastGeneratedFlashcards((prev) => prev.filter((card) => card.id !== id));
      } else {
        setLastCreatedFlashcard((prev) => prev.filter((card) => card.id !== id));
      }
      // Refresh both lists in PreviewSection
      if (onLoadPage && onLoadCandidatesPage) {
        await Promise.all([onLoadPage(1), onLoadCandidatesPage(1)]);
      }
      showToast("Zaktualizowano fiszkę", "success", {
        description: "Pomyślnie zaktualizowano fiszkę."
      });
    } catch (err) {
      showToast("Błąd aktualizacji fiszki", "error", {
        description: err instanceof Error 
          ? err.message 
          : "Nie udało się zaktualizować fiszki. Sprawdź wprowadzone zmiany i spróbuj ponownie."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFlashcard = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteFlashcard(id);
      // Remove the deleted flashcard from the appropriate list
      if (activeTab === "ai") {
        setLastGeneratedFlashcards((prev) => prev.filter((card) => card.id !== id));
      } else {
        setLastCreatedFlashcard((prev) => prev.filter((card) => card.id !== id));
      }
      showToast("Usunięto fiszkę", "success", {
        description: "Pomyślnie usunięto fiszkę."
      });
    } catch (err) {
      showToast("Błąd usuwania fiszki", "error", {
        description: err instanceof Error 
          ? err.message 
          : "Nie udało się usunąć fiszki. Spróbuj ponownie później."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptFlashcard = async (id: string) => {
    setIsLoading(true);
    try {
      await acceptFlashcard(id);
      // Remove the accepted flashcard from the list
      if (activeTab === "ai") {
        setLastGeneratedFlashcards((prev) => prev.filter((card) => card.id !== id));
      }
      // Refresh both lists in PreviewSection
      if (onLoadPage && onLoadCandidatesPage) {
        await Promise.all([onLoadPage(1), onLoadCandidatesPage(1)]);
      }
      showToast("Zaakceptowano fiszkę", "success", {
        description: "Pomyślnie zaakceptowano fiszkę."
      });
    } catch (err) {
      showToast("Błąd akceptacji fiszki", "error", {
        description: err instanceof Error 
          ? err.message 
          : "Nie udało się zaakceptować fiszki. Spróbuj ponownie później."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardFlashcard = async (id: string) => {
    setIsLoading(true);
    try {
      await discardFlashcard(id);
      // Remove the discarded flashcard from the list
      if (activeTab === "ai") {
        setLastGeneratedFlashcards((prev) => prev.filter((card) => card.id !== id));
      }
      showToast("Odrzucono fiszkę", "success", {
        description: "Pomyślnie odrzucono fiszkę."
      });
    } catch (err) {
      showToast("Błąd odrzucania fiszki", "error", {
        description: err instanceof Error 
          ? err.message 
          : "Nie udało się odrzucić fiszki. Spróbuj ponownie później."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Display flashcards based on active tab
  const displayedFlashcards = activeTab === "ai" ? lastGeneratedFlashcards : lastCreatedFlashcard;
  const displayedPagination = {
    page: 1,
    limit: displayedFlashcards.length || 10,
    total: displayedFlashcards.length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="ai">Generator AI</TabsTrigger>
          <TabsTrigger value="manual">Tworzenie ręczne</TabsTrigger>
        </TabsList>

        <TabsContent value="ai">
          <AIGeneratorTab onGenerate={handleGenerateFlashcards} isGenerating={isLoading} />
        </TabsContent>

        <TabsContent value="manual">
          <ManualCreatorTab onAdd={handleCreateFlashcard} isAdding={isLoading} />
        </TabsContent>

        <div className="mt-8">
          <ResultsList
            flashcards={displayedFlashcards}
            pagination={displayedPagination}
            onEdit={handleEditFlashcard}
            onDelete={handleDeleteFlashcard}
            onAccept={handleAcceptFlashcard}
            onDiscard={handleDiscardFlashcard}
            onPageChange={async () => Promise.resolve()}
            showTimeFilter={false}
          />
        </div>
      </Tabs>
    </div>
  );
}; 