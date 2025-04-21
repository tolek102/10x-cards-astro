import { useState, useEffect } from "react";
import { FlashcardList } from "./FlashcardList";
import { EditModal } from "./EditModal";
import { ExportModal } from "./ExportModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FlashcardDto, FlashcardUpdateDto } from "@/types";

interface PreviewSectionProps {
  flashcards: FlashcardDto[];
  candidates: FlashcardDto[];
  onEdit: (id: string, update: FlashcardUpdateDto) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAccept: (id: string) => Promise<void>;
  onDiscard: (id: string) => Promise<void>;
  onLoadPage: (page: number, limit?: number) => Promise<void>;
  onLoadCandidatesPage: (page: number, limit?: number) => Promise<void>;
  isLoading: boolean;
  isCandidatesLoading: boolean;
  pagination: { page: number; limit: number; total: number };
  candidatesPagination: { page: number; limit: number; total: number };
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const PreviewSection = ({
  flashcards,
  candidates,
  onEdit,
  onDelete,
  onAccept,
  onDiscard,
  onLoadPage,
  onLoadCandidatesPage,
  isLoading,
  isCandidatesLoading,
  pagination,
  candidatesPagination,
}: PreviewSectionProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<FlashcardDto | null>(null);
  const [activeTab, setActiveTab] = useState<"accepted" | "candidates">("accepted");
  const [selectedPageSize, setSelectedPageSize] = useState<number>(pagination.limit);

  const handlePageSizeChange = async (newLimit: number) => {
    setSelectedPageSize(newLimit);
    await Promise.all([onLoadPage(1, newLimit), onLoadCandidatesPage(1, newLimit)]);
  };

  useEffect(() => {
    setSelectedPageSize(activeTab === "accepted" ? pagination.limit : candidatesPagination.limit);
  }, [activeTab, pagination.limit, candidatesPagination.limit]);

  const handleEditClick = (id: string) => {
    const flashcard =
      activeTab === "accepted" ? flashcards.find((f) => f.id === id) : candidates.find((f) => f.id === id);
    if (flashcard) {
      setSelectedFlashcard(flashcard);
      setIsEditModalOpen(true);
    }
  };

  const handleEditSave = async (id: string, update: FlashcardUpdateDto) => {
    await onEdit(id, update);
    setIsEditModalOpen(false);
    setSelectedFlashcard(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę fiszkę?")) {
      await onDelete(id);
      if (activeTab === "accepted") {
        await onLoadPage(pagination.page, pagination.limit);
      } else {
        await onLoadCandidatesPage(candidatesPagination.page, candidatesPagination.limit);
      }
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await onAccept(id);
      await Promise.all([
        onLoadPage(pagination.page, pagination.limit),
        onLoadCandidatesPage(candidatesPagination.page, candidatesPagination.limit),
      ]);
    } catch (err) {
      console.error("Failed to accept flashcard:", err);
    }
  };

  const handleDiscard = async (id: string) => {
    try {
      await onDiscard(id);
      await onLoadCandidatesPage(candidatesPagination.page, candidatesPagination.limit);
    } catch (err) {
      console.error("Failed to discard flashcard:", err);
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
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onExport={() => setIsExportModalOpen(true)}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={(page) => onLoadPage(page, selectedPageSize)}
          />
        </TabsContent>

        <TabsContent value="candidates">
          <FlashcardList
            flashcards={candidates}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onAccept={handleAccept}
            onDiscard={handleDiscard}
            isLoading={isCandidatesLoading}
            pagination={candidatesPagination}
            onPageChange={(page) => onLoadCandidatesPage(page, selectedPageSize)}
          />
        </TabsContent>
      </Tabs>

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedFlashcard(null);
        }}
        onSave={handleEditSave}
        flashcard={selectedFlashcard}
      />

      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} flashcards={flashcards} />
    </div>
  );
};
