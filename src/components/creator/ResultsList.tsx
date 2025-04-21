import { Button } from "@/components/ui/button";
import type { FlashcardDto, PaginationDto } from "@/types";
import { FlashcardCard } from "../preview/FlashcardCard";

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
      onEdit(id, {
        front: flashcard.front,
        back: flashcard.back,
      });
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
            onDelete={onDelete}
            onAccept={onAccept}
            onDiscard={onDiscard}
          />
        ))}
      </div>

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
    </div>
  );
};
