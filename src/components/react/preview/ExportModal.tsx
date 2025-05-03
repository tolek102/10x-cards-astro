import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { FlashcardDto } from "@/types";
import { showToast } from "@/lib/toast";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  flashcards: FlashcardDto[];
}

type ExportFormat = "json" | "csv";

export const ExportModal = ({ isOpen, onClose, flashcards }: ExportModalProps) => {
  const [format, setFormat] = useState<ExportFormat>("json");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === "json") {
        content = JSON.stringify(flashcards, null, 2);
        filename = "flashcards.json";
        mimeType = "application/json";
      } else {
        // CSV format
        const headers = "Front,Back,Source,Candidate,Created At,Updated At\n";
        const rows = flashcards
          .map(
            (card) =>
              `"${card.front.replace(/"/g, '""')}","${card.back.replace(
                /"/g,
                '""'
              )}","${card.source}","${card.candidate}","${card.created_at}","${card.updated_at}"`
          )
          .join("\n");
        content = headers + rows;
        filename = "flashcards.csv";
        mimeType = "text/csv";
      }

      // Create download link
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("Pomyślnie wyeksportowano fiszki", "success", {
        description: `Wyeksportowano ${flashcards.length} fiszek do pliku ${filename}. Plik został pobrany na Twój komputer.`,
      });
      onClose();
    } catch (err) {
      showToast("Błąd eksportu", "error", {
        description:
          err instanceof Error
            ? err.message
            : "Wystąpił problem podczas eksportu fiszek. Sprawdź uprawnienia do zapisu plików i spróbuj ponownie.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Eksportuj fiszki</DialogTitle>
          <DialogDescription>
            Wybierz format eksportu dla swoich fiszek.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json">JSON</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv">CSV</Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isExporting}>
            Anuluj
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? "Eksportowanie..." : "Eksportuj"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
