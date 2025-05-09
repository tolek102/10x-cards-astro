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

  // Combine both flashcard lists
  const allFlashcards = [...candidates, ...manuallyCreatedFlashcards];

  // Sort by creation date (assuming there's a createdAt field)
  const sortedFlashcards = allFlashcards.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const displayedPagination = {
    page: 1,
    limit: sortedFlashcards.length || 10,
    total: sortedFlashcards.length,
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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Ostatnio dodane fiszki ({sortedFlashcards.length})</h3>
              <label htmlFor="input-text" className="text-sm font-medium text-gray-700">
                Po wyjściu z kreatora, fiszki przenoszone są do sekcji `Podgląd`
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Niezaakceptowane fiszki-kandydaci są automatycznie usuwane o godzinie 3:00 następnego dnia
              </p>
            </div>
            <FlashcardList
              flashcards={sortedFlashcards}
              pagination={displayedPagination}
              onEdit={handleEditFlashcard}
              onDelete={async (id) => {
                const flashcard = sortedFlashcards.find((f) => f.id === id);
                if (flashcard && (flashcard.source === "MANUAL" || flashcard.source === "AI_EDITED")) {
                  await handleDeleteFlashcard(id);
                }
              }}
              onAccept={async (id) => {
                const flashcard = sortedFlashcards.find((f) => f.id === id);
                if (flashcard && flashcard.source === "AI" && flashcard.candidate) {
                  await handleAcceptFlashcard(id);
                }
              }}
              onDiscard={async (id) => {
                const flashcard = sortedFlashcards.find((f) => f.id === id);
                if (flashcard && flashcard.source === "AI" && flashcard.candidate) {
                  await handleDiscardFlashcard(id);
                }
              }}
              onPageChange={async () => Promise.resolve()}
              showTimeFilter={false}
              isLoading={isLoading}
              showCustomTitle={true}
            />
          </div>
        </div>
      </Tabs>
    </div>
  );
};
