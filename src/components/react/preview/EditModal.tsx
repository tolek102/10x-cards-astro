import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FlashcardDto, FlashcardUpdateDto } from "@/types";
import { showToast } from "@/lib/toast";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, flashcard: FlashcardUpdateDto) => Promise<void>;
  flashcard: FlashcardDto | null;
}

export const EditModal = ({ isOpen, onClose, onSave, flashcard }: EditModalProps) => {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (flashcard) {
      setFront(flashcard.front);
      setBack(flashcard.back);
    }
  }, [flashcard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flashcard) {
      showToast("Błąd edycji", "error", {
        description: "Nie można edytować fiszki. Wybierz fiszkę do edycji i spróbuj ponownie."
      });
      return;
    }

    const trimmedFront = front.trim();
    const trimmedBack = back.trim();

    if (!trimmedFront || !trimmedBack) {
      showToast("Błąd walidacji", "error", {
        description: "Przód i tył fiszki nie mogą być puste. Wprowadź treść dla obu stron fiszki przed zapisaniem."
      });
      return;
    }

    if (trimmedFront === flashcard.front && trimmedBack === flashcard.back) {
      showToast("Brak zmian", "info", {
        description: "Nie wprowadzono żadnych zmian w treści fiszki. Edycja została anulowana."
      });
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(flashcard.id, { front, back });
      showToast("Pomyślnie zaktualizowano fiszkę", "success", {
        description: "Zapisano nową treść fiszki. Możesz teraz kontynuować przeglądanie."
      });
      onClose();
    } catch (error) {
      showToast("Błąd zapisywania", "error", {
        description: "Wystąpił problem podczas zapisywania zmian. Sprawdź wprowadzone dane i spróbuj ponownie."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edytuj fiszkę</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="front">Przód</Label>
              <Textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Wprowadź tekst na przodzie fiszki"
                className="mt-2"
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="back">Tył</Label>
              <Textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Wprowadź tekst na tyle fiszki"
                className="mt-2"
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 