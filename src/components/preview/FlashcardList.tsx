import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FlashcardCard } from "./FlashcardCard";
import type { FlashcardDto } from "@/types";

interface FlashcardListProps {
  flashcards: FlashcardDto[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAccept: (id: string) => void;
  onDiscard: (id: string) => void;
  onExport: () => void;
}

type Tab = "approved" | "candidates";

export const FlashcardList = ({ flashcards, onEdit, onDelete, onAccept, onDiscard, onExport }: FlashcardListProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("approved");

  const approvedFlashcards = flashcards.filter((f) => !f.candidate);
  const candidateFlashcards = flashcards.filter((f) => f.candidate);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "approved"
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
          onClick={() => setActiveTab("approved")}
        >
          Zaakceptowane ({approvedFlashcards.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "candidates"
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
          onClick={() => setActiveTab("candidates")}
        >
          Kandydaci ({candidateFlashcards.length})
        </button>

        <div className="ml-auto">
          <Button variant="outline" onClick={onExport} disabled={flashcards.length === 0}>
            Eksportuj fiszki
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {activeTab === "approved" &&
          (approvedFlashcards.length > 0 ? (
            approvedFlashcards.map((flashcard) => (
              <FlashcardCard key={flashcard.id} flashcard={flashcard} onEdit={onEdit} onDelete={onDelete} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">Brak zaakceptowanych fiszek</div>
          ))}

        {activeTab === "candidates" &&
          (candidateFlashcards.length > 0 ? (
            candidateFlashcards.map((flashcard) => (
              <FlashcardCard
                key={flashcard.id}
                flashcard={flashcard}
                onEdit={onEdit}
                onDelete={onDelete}
                onAccept={onAccept}
                onDiscard={onDiscard}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">Brak fiszek oczekujących na akceptację</div>
          ))}
      </div>
    </div>
  );
};
