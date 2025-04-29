import { Button } from "@/components/ui/button";
import { FlashcardCard } from "./FlashcardCard";
import type { FlashcardDto } from "@/types";

interface FlashcardListProps {
  flashcards: FlashcardDto[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAccept?: (id: string) => void;
  onDiscard?: (id: string) => void;
  onExport?: () => void;
  isLoading: boolean;
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
  isLoading,
  pagination,
  onPageChange,
}: FlashcardListProps) => {
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

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = pagination.page;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Fiszki ({pagination.total})</h3>
        {onExport && (
          <Button onClick={onExport} variant="outline">
            Eksportuj
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {flashcards.map((flashcard) => (
          <FlashcardCard
            key={flashcard.id}
            flashcard={flashcard}
            onEdit={onEdit}
            onDelete={isCandidate ? undefined : onDelete}
            onAccept={onAccept}
            onDiscard={onDiscard}
          />
        ))}
      </div>

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
