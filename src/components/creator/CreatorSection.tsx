import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIGeneratorTab } from "./AIGeneratorTab";
import { ManualCreatorTab } from "./ManualCreatorTab";
import { ResultsList } from "./ResultsList";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { FlashcardCreateDto, FlashcardDto } from "@/types";

interface CreatorSectionProps {
  generateFlashcards: (text: string) => Promise<FlashcardDto[]>;
  createFlashcard: (flashcard: FlashcardCreateDto) => Promise<FlashcardDto>;
  updateFlashcard: (id: string, flashcard: Partial<FlashcardDto>) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  acceptFlashcard: (id: string) => Promise<void>;
  discardFlashcard: (id: string) => Promise<void>;
}

export const CreatorSection = ({
  generateFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  acceptFlashcard,
  discardFlashcard,
}: CreatorSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState<"ai" | "manual">("ai");
  const [lastGeneratedFlashcards, setLastGeneratedFlashcards] = useState<FlashcardDto[]>([]);
  const [lastCreatedFlashcard, setLastCreatedFlashcard] = useState<FlashcardDto[]>([]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as "ai" | "manual");
  };

  const handleGenerateFlashcards = async (text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const generatedFlashcards = await generateFlashcards(text);
      setLastGeneratedFlashcards(generatedFlashcards);
    } catch (err) {
      console.error("Failed to generate flashcards:", err);
      setError(err instanceof Error ? err : new Error("Failed to generate flashcards"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFlashcard = async (flashcard: FlashcardCreateDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const createdFlashcard = await createFlashcard(flashcard);
      setLastCreatedFlashcard([createdFlashcard]);
    } catch (err) {
      console.error("Failed to create flashcard:", err);
      setError(err instanceof Error ? err : new Error("Failed to create flashcard"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptFlashcard = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await acceptFlashcard(id);
      // Remove the accepted flashcard from the list
      setLastGeneratedFlashcards((prev) => prev.filter((card) => card.id !== id));
    } catch (err) {
      console.error("Failed to accept flashcard:", err);
      setError(err instanceof Error ? err : new Error("Failed to accept flashcard"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardFlashcard = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await discardFlashcard(id);
      // Remove the discarded flashcard from the list
      setLastGeneratedFlashcards((prev) => prev.filter((card) => card.id !== id));
    } catch (err) {
      console.error("Failed to discard flashcard:", err);
      setError(err instanceof Error ? err : new Error("Failed to discard flashcard"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFlashcard = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteFlashcard(id);
      // Remove the deleted flashcard from the appropriate list
      if (activeTab === "ai") {
        setLastGeneratedFlashcards((prev) => prev.filter((card) => card.id !== id));
      } else {
        setLastCreatedFlashcard((prev) => prev.filter((card) => card.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete flashcard:", err);
      setError(err instanceof Error ? err : new Error("Failed to delete flashcard"));
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

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

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
            onEdit={updateFlashcard}
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
