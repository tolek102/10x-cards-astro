import { useState } from "react";
import { FlashcardList } from "./FlashcardList";
import { ExportModal } from "./ExportModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FlashcardDto, FlashcardUpdateDto, PaginationDto } from "@/types";
import { logger } from "@/lib/services/loggerService";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

interface PreviewSectionProps {
  flashcards: FlashcardDto[];
  candidates: FlashcardDto[];
  isLoading: boolean;
  isCandidatesLoading: boolean;
  pagination: PaginationDto;
  candidatesPagination: PaginationDto;
  updateFlashcard: (id: string, update: FlashcardUpdateDto) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  acceptFlashcard: (id: string) => Promise<void>;
  discardFlashcard: (id: string) => Promise<void>;
  loadPage: (page: number, limit?: number) => Promise<void>;
  loadCandidatesPage: (page: number, limit?: number) => Promise<void>;
}

export const PreviewSection = ({
  flashcards,
  candidates,
  isLoading,
  isCandidatesLoading,
  pagination,
  candidatesPagination,
  updateFlashcard,
  deleteFlashcard,
  acceptFlashcard,
  discardFlashcard,
  loadPage,
  loadCandidatesPage,
}: PreviewSectionProps) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"accepted" | "candidates">("accepted");
  const [selectedPageSize, setSelectedPageSize] = useState<number>(pagination.limit);

  const handlePageSizeChange = async (newLimit: number) => {
    try {
      setSelectedPageSize(newLimit);
      await loadPage(1, newLimit);
      await loadCandidatesPage(1, newLimit);
    } catch (err) {
      logger.error("Error changing page size:", { err });
    }
  };

  const handleEditFlashcard = async (id: string, flashcard?: Partial<FlashcardDto>) => {
    if (!flashcard) return;
    try {
      await updateFlashcard(id, flashcard);
    } catch (err) {
      logger.error("Error updating flashcard:", { err });
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteFlashcard(id);
    } catch (err) {
      logger.error("Error deleting flashcard:", { err });
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await acceptFlashcard(id);
    } catch (err) {
      logger.error("Error accepting flashcard:", { err });
    }
  };

  const handleDiscard = async (id: string): Promise<void> => {
    try {
      await discardFlashcard(id);
    } catch (err) {
      logger.error("Error discarding flashcard:", { err });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "accepted" | "candidates")}>
        <div className="flex items-center justify-between mb-8">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="accepted">Zaakceptowane ({pagination.total})</TabsTrigger>
            <TabsTrigger value="candidates">Kandydaci ({candidatesPagination.total})</TabsTrigger>
          </TabsList>

          <Select
            value={selectedPageSize.toString()}
            onValueChange={(value) => {
              const limit = parseInt(value);
              handlePageSizeChange(limit);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Wybierz ilość na stronie" />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size} fiszek na stronie
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="accepted">
          <FlashcardList
            flashcards={flashcards}
            onEdit={handleEditFlashcard}
            onDelete={handleDelete}
            onExport={() => setIsExportModalOpen(true)}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={(page) => loadPage(page, selectedPageSize)}
          />
        </TabsContent>

        <TabsContent value="candidates">
          <FlashcardList
            flashcards={candidates}
            onEdit={handleEditFlashcard}
            onDelete={handleDelete}
            onAccept={handleAccept}
            onDiscard={handleDiscard}
            isLoading={isCandidatesLoading}
            pagination={candidatesPagination}
            onPageChange={(page) => loadCandidatesPage(page, selectedPageSize)}
          />
        </TabsContent>
      </Tabs>

      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} flashcards={flashcards} />
    </div>
  );
};
