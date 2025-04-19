import { Button } from "@/components/ui/button";
import type { FlashcardDto, PaginationDto } from "@/types";

interface ResultsListProps {
  flashcards: FlashcardDto[];
  pagination: PaginationDto;
  onEdit: (id: string, flashcard: Partial<FlashcardDto>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onPageChange: (page: number) => Promise<void>;
}

export const ResultsList = ({ flashcards, pagination, onEdit, onDelete, onPageChange }: ResultsListProps) => {
  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Brak utworzonych fiszek</p>
      </div>
    );
  }

  const handleEdit = (flashcard: FlashcardDto) => {
    onEdit(flashcard.id, {
      front: flashcard.front,
      back: flashcard.back,
    });
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = pagination.page;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Utworzone fiszki ({pagination.total})</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {flashcards.map((flashcard) => (
          <div
            key={flashcard.id}
            className="relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(flashcard)}
                className="text-gray-500 hover:text-indigo-600"
                aria-label="Edytuj fiszkę"
              >
                ✏️
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(flashcard.id)}
                className="text-gray-500 hover:text-red-600"
                aria-label="Usuń fiszkę"
              >
                🗑️
              </Button>
            </div>

            <div className="space-y-2 pr-16">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Przód</h4>
                <p className="text-gray-900">{flashcard.front}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Tył</h4>
                <p className="text-gray-900">{flashcard.back}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-2">
              <span className="text-xs text-gray-500">{new Date(flashcard.created_at).toLocaleDateString()}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{flashcard.source}</span>
              {flashcard.candidate && (
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">Kandydat</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Poprzednia
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Następna
          </Button>
        </div>
      )}
    </div>
  );
};
