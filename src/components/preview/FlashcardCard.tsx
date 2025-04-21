import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { FlashcardDto } from "@/types";

interface FlashcardCardProps {
  flashcard: FlashcardDto;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAccept?: (id: string) => void;
  onDiscard?: (id: string) => void;
}

export const FlashcardCard = ({ flashcard, onEdit, onDelete, onAccept, onDiscard }: FlashcardCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div
      className="w-full h-[400px] cursor-pointer perspective-1000"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Click to flip the card"
    >
      <div className={`relative w-full h-full preserve-3d duration-500 ${isFlipped ? "rotate-y-180" : ""}`}>
        {/* Front side */}
        <div className="absolute w-full h-full backface-hidden bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex flex-col items-center justify-center h-full">
            {onEdit && onDelete && (
              <div className="absolute top-4 right-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(flashcard.id);
                  }}
                  className="mr-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  aria-label="Edit flashcard"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(flashcard.id);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  aria-label="Delete flashcard"
                >
                  🗑️
                </button>
              </div>
            )}
            <h2 className="text-2xl font-bold text-center">{flashcard.front}</h2>
          </div>
        </div>

        {/* Back side */}
        <div className="absolute w-full h-full backface-hidden bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 rotate-y-180">
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-xl text-center">{flashcard.back}</p>
          </div>
        </div>
      </div>

      {/* Status badges */}
      <div className="absolute bottom-4 left-4 flex space-x-2">
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{flashcard.source}</span>
        {flashcard.candidate && (
          <>
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">Kandydat</span>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAccept?.(flashcard.id);
                }}
                className="text-green-600 hover:text-green-700"
                aria-label="Zaakceptuj fiszkę"
              >
                ✓
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDiscard?.(flashcard.id);
                }}
                className="text-red-600 hover:text-red-700"
                aria-label="Odrzuć fiszkę"
              >
                ✕
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
