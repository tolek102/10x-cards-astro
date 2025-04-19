import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { FlashcardDto } from "@/types";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  flashcards: FlashcardDto[];
}

type ExportFormat = "json" | "csv";

export const ExportModal = ({ isOpen, onClose, flashcards }: ExportModalProps) => {
  const [format, setFormat] = useState<ExportFormat>("json");

  const handleExport = () => {
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
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Eksportuj fiszki</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setFormat("json")}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  format === "json" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📄</div>
                  <div className="font-medium">JSON</div>
                  <div className="text-sm text-gray-500">Pełne dane w formacie JSON</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  format === "csv" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium">CSV</div>
                  <div className="text-sm text-gray-500">Format zgodny z arkuszami</div>
                </div>
              </button>
            </div>

            <div className="text-sm text-gray-500 text-center">Liczba fiszek do eksportu: {flashcards.length}</div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          <Button type="button" onClick={handleExport}>
            Eksportuj
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
