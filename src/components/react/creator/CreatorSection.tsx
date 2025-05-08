import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIGeneratorTab } from "./AIGeneratorTab";
import { ManualCreatorTab } from "./ManualCreatorTab";
import { FlashcardList } from "../preview/FlashcardList";
import type { FlashcardCreateDto, FlashcardDto } from "@/types";
import { logger } from "@/lib/services/loggerService";

interface CreatorSectionProps {
  generateFlashcards: (text: string) => Promise<FlashcardDto[]>;
  createFlashcard: (flashcard: FlashcardCreateDto) => Promise<FlashcardDto>;
  updateFlashcard: (id: string, flashcard: Partial<FlashcardDto>) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  acceptFlashcard: (id: string) => Promise<void>;
  discardFlashcard: (id: string) => Promise<void>;
  candidates: FlashcardDto[];
  manuallyCreatedFlashcards: FlashcardDto[];
  isLoading: boolean;
}

export const CreatorSection = ({
  generateFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  acceptFlashcard,
  discardFlashcard,
  candidates,
  manuallyCreatedFlashcards,
  isLoading,
}: CreatorSectionProps) => {
  const [activeTab, setActiveTab] = useState<"ai" | "manual">("ai");

  const handleTabChange = (value: string) => {
    setActiveTab(value as "ai" | "manual");
  };

  const handleGenerateFlashcards = async (text: string) => {
    try {
      await generateFlashcards(text);
    } catch (err) {
      logger.error("Error generating flashcards:", { err });
    }
  };

  const handleCreateFlashcard = async (flashcard: FlashcardCreateDto) => {
    try {
      await createFlashcard(flashcard);
    } catch (err) {
      logger.error("Error creating flashcard:", { err });
    }
  };

  const handleEditFlashcard = async (id: string, flashcard?: Partial<FlashcardDto>) => {
    if (!flashcard) return;

    try {
      await updateFlashcard(id, flashcard);
    } catch (err) {
      logger.error("Error updating flashcard:", { err });
    }
  };

  const handleDeleteFlashcard = async (id: string) => {
    try {
      await deleteFlashcard(id);
    } catch (err) {
      logger.error("Error deleting flashcard:", { err });
    }
  };

  const handleAcceptFlashcard = async (id: string) => {
    try {
      await acceptFlashcard(id);
    } catch (err) {
      logger.error("Error accepting flashcard:", { err });
    }
  };

  const handleDiscardFlashcard = async (id: string) => {
    try {
      await discardFlashcard(id);
    } catch (err) {
      logger.error("Error discarding flashcard:", { err });
    }
  };

  // Wyświetlamy fiszki w zależności od aktywnej zakładki
  const displayedFlashcards = activeTab === "ai" ? candidates : manuallyCreatedFlashcards;

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
          <FlashcardList
            flashcards={displayedFlashcards}
            pagination={displayedPagination}
            onEdit={handleEditFlashcard}
            onDelete={activeTab === "manual" || !displayedFlashcards[0]?.candidate ? handleDeleteFlashcard : undefined}
            onAccept={activeTab === "ai" ? handleAcceptFlashcard : undefined}
            onDiscard={activeTab === "ai" ? handleDiscardFlashcard : undefined}
            onPageChange={async () => Promise.resolve()}
            showTimeFilter={false}
            isLoading={isLoading}
          />
        </div>
      </Tabs>
    </div>
  );
};
