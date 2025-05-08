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
    } catch (err) {
      logger.error("Error generating flashcards:", { err });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFlashcard = async (flashcard: FlashcardCreateDto) => {
    setIsLoading(true);
    try {
      const createdFlashcard = await createFlashcard(flashcard);
      setLastCreatedFlashcard([createdFlashcard]);
    } catch (err) {
      logger.error("Error creating flashcard:", { err });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFlashcard = async (id: string, flashcard?: Partial<FlashcardDto>) => {
    if (!flashcard) return;

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
    } catch (err) {
      logger.error("Error updating flashcard:", { err });
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
    } catch (err) {
      logger.error("Error deleting flashcard:", { err });
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
    } catch (err) {
      logger.error("Error accepting flashcard:", { err });
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
    } catch (err) {
      logger.error("Error discarding flashcard:", { err });
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
