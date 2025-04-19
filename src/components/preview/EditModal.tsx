import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FlashcardDto, FlashcardUpdateDto } from "@/types";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, update: FlashcardUpdateDto) => Promise<void>;
  flashcard: FlashcardDto | null;
}

export const EditModal = ({ isOpen, onClose, onSave, flashcard }: EditModalProps) => {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (flashcard) {
      setFront(flashcard.front);
      setBack(flashcard.back);
    }
  }, [flashcard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flashcard || !front.trim() || !back.trim()) return;

    setIsSaving(true);
    try {
      await onSave(flashcard.id, {
        front: front.trim(),
        back: back.trim(),
      });
      onClose();
    } catch (error) {
      console.error("Błąd podczas zapisywania fiszki:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edytuj fiszkę</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="edit-front" className="text-sm font-medium text-gray-700">
                  Przód fiszki
                </label>
                <span className="text-sm text-gray-500">{front.length}</span>
              </div>
              <Textarea
                id="edit-front"
                value={front}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFront(e.target.value)}
                placeholder="Wpisz treść przodu fiszki..."
                className="h-32 resize-none"
                aria-label="Treść przodu fiszki"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="edit-back" className="text-sm font-medium text-gray-700">
                  Tył fiszki
                </label>
                <span className="text-sm text-gray-500">{back.length}</span>
              </div>
              <Textarea
                id="edit-back"
                value={back}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBack(e.target.value)}
                placeholder="Wpisz treść tyłu fiszki..."
                className="h-32 resize-none"
                aria-label="Treść tyłu fiszki"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSaving || !front.trim() || !back.trim() || !flashcard}>
              {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
