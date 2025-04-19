import { useState } from "react";
import { FlashcardList } from "./FlashcardList";
import { EditModal } from "./EditModal";
import { ExportModal } from "./ExportModal";
import type { FlashcardDto, FlashcardUpdateDto } from "@/types";

interface PreviewSectionProps {
  flashcards: FlashcardDto[];
  onEdit: (id: string, update: FlashcardUpdateDto) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAccept: (id: string) => Promise<void>;
  onDiscard: (id: string) => Promise<void>;
}

export const PreviewSection = ({ flashcards, onEdit, onDelete, onAccept, onDiscard }: PreviewSectionProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<FlashcardDto | null>(null);

  const handleEditClick = (id: string) => {
    const flashcard = flashcards.find((f) => f.id === id);
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
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <FlashcardList
        flashcards={flashcards}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onAccept={onAccept}
        onDiscard={onDiscard}
        onExport={() => setIsExportModalOpen(true)}
      />

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
