import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { FlashcardDto } from "@/types";

interface FlashcardCardProps {
  flashcard: FlashcardDto;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAccept?: (id: string) => void;
  onDiscard?: (id: string) => void;
}

export const FlashcardCard = ({ flashcard, onEdit, onDelete, onAccept, onDiscard }: FlashcardCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div
      className="relative h-64 cursor-pointer group perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Kliknij aby odwrócić fiszkę"
    >
      <div className={`absolute inset-0 duration-500 preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}>
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-white rounded-xl border border-gray-200 p-6">
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(flashcard.id);
                }}
                className="text-gray-500 hover:text-indigo-600"
                aria-label="Edytuj fiszkę"
              >
                ✏️
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(flashcard.id);
                }}
                className="text-gray-500 hover:text-red-600"
                aria-label="Usuń fiszkę"
              >
                🗑️
              </Button>
            </div>
          </div>
          <p className="text-lg text-center text-gray-900">{flashcard.front}</p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-lg text-center text-gray-900">{flashcard.back}</p>
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
