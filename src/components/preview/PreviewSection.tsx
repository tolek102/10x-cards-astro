import { useState } from "react";
import { FlashcardList } from "./FlashcardList";
import { EditModal } from "./EditModal";
import { ExportModal } from "./ExportModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FlashcardDto, FlashcardUpdateDto } from "@/types";

interface PreviewSectionProps {
  flashcards: FlashcardDto[];
  candidates: FlashcardDto[];
  onEdit: (id: string, update: FlashcardUpdateDto) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAccept: (id: string) => Promise<void>;
  onDiscard: (id: string) => Promise<void>;
  onLoadPage: (page: number) => Promise<void>;
  onLoadCandidatesPage: (page: number) => Promise<void>;
  isLoading: boolean;
  isCandidatesLoading: boolean;
  pagination: { page: number; limit: number; total: number };
  candidatesPagination: { page: number; limit: number; total: number };
}

export const PreviewSection = ({
  flashcards,
  candidates,
  onEdit,
  onDelete,
  onAccept,
  onDiscard,
  onLoadPage,
  onLoadCandidatesPage,
  isLoading,
  isCandidatesLoading,
  pagination,
  candidatesPagination,
}: PreviewSectionProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<FlashcardDto | null>(null);
  const [activeTab, setActiveTab] = useState<"accepted" | "candidates">("accepted");

  const handleEditClick = (id: string) => {
    const flashcard =
      activeTab === "accepted" ? flashcards.find((f) => f.id === id) : candidates.find((f) => f.id === id);
    if (flashcard) {
      setSelectedFlashcard(flashcard);
      setIsEditModalOpen(true);
    }
  };

  const handleEditSave = async (id: string, update: FlashcardUpdateDto) => {
    await onEdit(id, update);
    setIsEditModalOpen(false);
    setSelectedFlashcard(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę fiszkę?")) {
      await onDelete(id);
      // Reload the appropriate list after deletion
      if (activeTab === "accepted") {
        await onLoadPage(pagination.page);
      } else {
        await onLoadCandidatesPage(candidatesPagination.page);
      }
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await onAccept(id);
      // Reload both lists after accepting a flashcard
      await Promise.all([onLoadPage(pagination.page), onLoadCandidatesPage(candidatesPagination.page)]);
    } catch (err) {
      console.error("Failed to accept flashcard:", err);
    }
  };

  const handleDiscard = async (id: string) => {
    try {
      await onDiscard(id);
      // Reload candidates list after discarding
      await onLoadCandidatesPage(candidatesPagination.page);
    } catch (err) {
      console.error("Failed to discard flashcard:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "accepted" | "candidates")}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="accepted">Zaakceptowane ({pagination.total})</TabsTrigger>
          <TabsTrigger value="candidates">Kandydaci ({candidatesPagination.total})</TabsTrigger>
        </TabsList>

        <TabsContent value="accepted">
          <FlashcardList
            flashcards={flashcards}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onExport={() => setIsExportModalOpen(true)}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={onLoadPage}
          />
        </TabsContent>

        <TabsContent value="candidates">
          <FlashcardList
            flashcards={candidates}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onAccept={handleAccept}
            onDiscard={handleDiscard}
            isLoading={isCandidatesLoading}
            pagination={candidatesPagination}
            onPageChange={onLoadCandidatesPage}
          />
        </TabsContent>
      </Tabs>

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedFlashcard(null);
        }}
        onSave={handleEditSave}
        flashcard={selectedFlashcard}
      />

      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} flashcards={flashcards} />
    </div>
  );
};
