import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { FlashcardDto, PaginationDto } from "@/types";
import { FlashcardCard } from "../preview/FlashcardCard";
import { EditModal } from "../preview/EditModal";

interface ResultsListProps {
  flashcards: FlashcardDto[];
  pagination: PaginationDto;
  onEdit: (id: string, flashcard: Partial<FlashcardDto>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAccept?: (id: string) => Promise<void>;
  onDiscard?: (id: string) => Promise<void>;
  onPageChange: (page: number) => Promise<void>;
  showTimeFilter?: boolean;
}

export const ResultsList = ({
  flashcards,
  pagination,
  onEdit,
  onDelete,
  onAccept,
  onDiscard,
  onPageChange,
  showTimeFilter = false,
}: ResultsListProps) => {
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardDto | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [flashcardToDelete, setFlashcardToDelete] = useState<string | null>(null);
  const [flashcardToDiscard, setFlashcardToDiscard] = useState<string | null>(null);

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Brak utworzonych fiszek</p>
      </div>
    );
  }

  const handleEdit = (id: string) => {
    const flashcard = flashcards.find((f) => f.id === id);
    if (flashcard) {
      setEditingFlashcard(flashcard);
    }
  };

  const handleCloseEdit = () => {
    setEditingFlashcard(null);
  };

  const handleDelete = (id: string) => {
    setFlashcardToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!flashcardToDelete) return;

    try {
      await onDelete(flashcardToDelete);
    } finally {
      setFlashcardToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDiscard = (id: string) => {
    setFlashcardToDiscard(id);
    setIsDiscardDialogOpen(true);
  };

  const confirmDiscard = async () => {
    if (!flashcardToDiscard || !onDiscard) return;

    try {
      await onDiscard(flashcardToDiscard);
    } finally {
      setFlashcardToDiscard(null);
      setIsDiscardDialogOpen(false);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = pagination.page;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Utworzone fiszki ({pagination.total})</h3>
        </div>
        {showTimeFilter && (
          <p className="text-sm text-gray-500">
            Wyświetlane są fiszki utworzone w ciągu ostatniej godziny, posortowane od najnowszych
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {flashcards.map((flashcard) => (
          <FlashcardCard
            key={flashcard.id || `${flashcard.front}-${flashcard.back}`}
            flashcard={flashcard}
            onEdit={handleEdit}
            onDelete={!flashcard.candidate ? handleDelete : undefined}
            onAccept={flashcard.candidate ? onAccept : undefined}
            onDiscard={flashcard.candidate ? handleDiscard : undefined}
          />
        ))}
      </div>

      <EditModal
        isOpen={editingFlashcard !== null}
        onClose={handleCloseEdit}
        onSave={onEdit}
        flashcard={editingFlashcard}
      />

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          <Button variant="outline" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
            Poprzednia
          </Button>
          <span className="py-2 px-4">
            Strona {currentPage} z {totalPages}
          </span>
          <Button variant="outline" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Następna
          </Button>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć tę fiszkę?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja jest nieodwracalna. Fiszka zostanie trwale usunięta z systemu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFlashcardToDelete(null)}>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Usuń</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDiscardDialogOpen} onOpenChange={setIsDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz odrzucić tę fiszkę?</AlertDialogTitle>
            <AlertDialogDescription>
              Fiszka zostanie usunięta z listy kandydatów. Będziesz mógł ją później wygenerować ponownie.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFlashcardToDiscard(null)}>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscard}>Odrzuć</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
