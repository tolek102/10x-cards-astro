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
import type { FlashcardDto } from "@/types";
import { FlashcardCard } from "./FlashcardCard";
import { EditModal } from "./EditModal";

interface FlashcardListProps {
  flashcards: FlashcardDto[];
  onEdit?: (id: string, flashcard?: Partial<FlashcardDto>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onAccept?: (id: string) => Promise<void>;
  onDiscard?: (id: string) => Promise<void>;
  onExport?: () => void;
  isLoading?: boolean;
  showTimeFilter?: boolean;
  showCustomTitle?: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  onPageChange: (page: number) => Promise<void>;
}

export const FlashcardList = ({
  flashcards,
  onEdit,
  onDelete,
  onAccept,
  onDiscard,
  onExport,
  isLoading = false,
  showTimeFilter = false,
  showCustomTitle = false,
  pagination,
  onPageChange,
}: FlashcardListProps) => {
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardDto | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [flashcardToDelete, setFlashcardToDelete] = useState<string | null>(null);
  const [flashcardToDiscard, setFlashcardToDiscard] = useState<string | null>(null);

  // Jeśli mamy onDiscard, to znaczy że to lista kandydatów
  const isCandidate = Boolean(onDiscard);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Brak fiszek</p>
      </div>
    );
  }

  const handleEdit = (id: string) => {
    if (!onEdit) return;
    const flashcard = flashcards.find((f) => f.id === id);
    if (flashcard) {
      setEditingFlashcard(flashcard);
    }
  };

  const handleCloseEdit = () => {
    setEditingFlashcard(null);
  };

  const handleDelete = (id: string) => {
    if (!onDelete) return;
    setFlashcardToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!flashcardToDelete || !onDelete) return;

    try {
      await onDelete(flashcardToDelete);
    } finally {
      setFlashcardToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDiscard = (id: string) => {
    if (!onDiscard) return;
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
    <div className="space-y-6">
      {!showCustomTitle && (
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Fiszki ({pagination.total})</h3>
            {showTimeFilter && (
              <p className="text-sm text-gray-500 mt-1">
                Wyświetlane są fiszki utworzone w ciągu ostatniej godziny, posortowane od najnowszych
              </p>
            )}
            {isCandidate && (
              <p className="text-sm text-gray-500 mt-1">
                Niezaakceptowane fiszki-kandydaci są automatycznie usuwane o godzinie 3:00 następnego dnia
              </p>
            )}
          </div>
          {onExport && (
            <Button onClick={onExport} variant="outline">
              Eksportuj
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {flashcards.map((flashcard) => (
          <FlashcardCard
            key={flashcard.id}
            flashcard={flashcard}
            onEdit={onEdit ? () => handleEdit(flashcard.id) : undefined}
            onDelete={onDelete ? () => handleDelete(flashcard.id) : undefined}
            onAccept={onAccept}
            onDiscard={onDiscard ? () => handleDiscard(flashcard.id) : undefined}
          />
        ))}
      </div>

      {onEdit && editingFlashcard && (
        <EditModal
          isOpen={editingFlashcard !== null}
          onClose={handleCloseEdit}
          onSave={onEdit}
          flashcard={editingFlashcard}
        />
      )}

      {onDelete && (
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
      )}

      {onDiscard && (
        <AlertDialog open={isDiscardDialogOpen} onOpenChange={setIsDiscardDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Czy na pewno chcesz odrzucić tę fiszkę?</AlertDialogTitle>
              <AlertDialogDescription>
                Fiszka zostanie trwale usunięta z listy kandydatów. Ta operacja jest nieodwracalna.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setFlashcardToDiscard(null)}>Anuluj</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDiscard}>Odrzuć</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <Button variant="outline" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
            Poprzednia
          </Button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Strona {currentPage} z {totalPages}
          </span>
          <Button variant="outline" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Następna
          </Button>
        </div>
      )}
    </div>
  );
};
