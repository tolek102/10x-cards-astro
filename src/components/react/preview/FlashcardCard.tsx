import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { FlashcardDto } from "@/types";
import { useResizeObserver } from "@/lib/hooks/useResizeObserver";

interface FlashcardCardProps {
  flashcard: FlashcardDto;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAccept?: (id: string) => void;
  onDiscard?: (id: string) => void;
}

export const FlashcardCard = ({ flashcard, onEdit, onDelete, onAccept, onDiscard }: FlashcardCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [backTextSize, setBackTextSize] = useState(20);
  const backContentRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsFlipped(!isFlipped);
    }
  };

  const adjustTextSize = useCallback(() => {
    const content = backContentRef.current;
    const container = containerRef.current;
    if (!content || !container) return;

    // Określamy początkowy rozmiar czcionki na podstawie długości tekstu
    const textLength = flashcard.back.length;
    let fontSize = (() => {
      if (textLength < 100) return 24;
      if (textLength < 200) return 22;
      if (textLength < 300) return 20;
      if (textLength < 400) return 18;
      return 16;
    })();

    const minFontSize = 16; // Zmniejszamy minimalny rozmiar czcionki

    content.style.fontSize = `${fontSize}px`;

    // Sprawdzamy zarówno wysokość jak i szerokość
    const isOverflowing = () => {
      const contentRect = content.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Dodajemy margines bezpieczeństwa
      const safetyMargin = 10; // piksele

      return (
        content.scrollHeight > container.clientHeight - safetyMargin ||
        content.scrollWidth > container.clientWidth - safetyMargin ||
        contentRect.height > containerRect.height - safetyMargin ||
        contentRect.width > containerRect.width - safetyMargin
      );
    };

    // Zmniejszamy rozmiar czcionki, dopóki tekst się nie zmieści
    while (isOverflowing() && fontSize > minFontSize) {
      // Bardziej agresywne zmniejszanie dla dłuższych tekstów
      const decrementStep = fontSize > 18 ? 1 : 0.5;
      fontSize -= decrementStep;
      content.style.fontSize = `${fontSize}px`;
    }

    setBackTextSize(fontSize);
  }, [flashcard.back]);

  const setResizeObserver = useResizeObserver(adjustTextSize);

  useEffect(() => {
    if (containerRef.current) {
      setResizeObserver(containerRef.current);
    }
    adjustTextSize();
  }, [adjustTextSize, setResizeObserver, flashcard.back]);

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
            <div className="absolute top-4 right-4 flex">
              {onEdit && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edytuj</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {onDelete && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Usuń</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="max-h-[320px] overflow-y-auto">
              <h2 className="text-[20px] leading-[1.4] font-bold text-center break-words">{flashcard.front}</h2>
            </div>
          </div>
        </div>

        {/* Back side */}
        <div className="absolute w-full h-full backface-hidden bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 rotate-y-180">
          <div ref={containerRef} className="flex flex-col items-center justify-center h-full">
            <div className="max-h-[320px] w-full overflow-y-auto">
              <p
                ref={backContentRef}
                className="text-center break-words"
                style={{
                  fontSize: `${backTextSize}px`,
                  lineHeight: "1.4",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  hyphens: "auto",
                  maxHeight: "100%",
                  margin: 0,
                  padding: 0,
                }}
              >
                {flashcard.back}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status badges */}
      <div className="absolute bottom-4 left-4 flex space-x-2">
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{flashcard.source}</span>
        {flashcard.candidate && (
          <>
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
              Kandydat
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="inline-block w-4 h-4 text-yellow-600">ⓘ</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Niezaakceptowana fiszka zostanie automatycznie usunięta o godzinie 3:00 następnego dnia</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Zaakceptuj</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Odrzuć</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
