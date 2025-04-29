import { useState, useEffect } from "react";
import { FlashcardList } from "./FlashcardList";
import { EditModal } from "./EditModal";
import { ExportModal } from "./ExportModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FlashcardDto, FlashcardUpdateDto, PaginationDto } from "@/types";
import { showToast } from "@/lib/toast";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<FlashcardDto | null>(null);
  const [activeTab, setActiveTab] = useState<"accepted" | "candidates">("accepted");
  const [selectedPageSize, setSelectedPageSize] = useState<number>(pagination.limit);

  const handlePageSizeChange = async (newLimit: number) => {
    setSelectedPageSize(newLimit);
    await Promise.all([loadPage(1, newLimit), loadCandidatesPage(1, newLimit)]);
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
    try {
      await updateFlashcard(id, update);
      showToast("Pomyślnie zaktualizowano fiszkę", "success", {
        description: "Zapisano zmiany w treści fiszki. Możesz teraz kontynuować przeglądanie.",
      });
      // Refresh both lists since editing a candidate moves it to accepted
      await Promise.all([
        loadPage(pagination.page, pagination.limit),
        loadCandidatesPage(candidatesPagination.page, candidatesPagination.limit),
      ]);
    } catch (err) {
      showToast("Błąd aktualizacji", "error", {
        description: "Wystąpił problem podczas aktualizacji fiszki. Sprawdź wprowadzone dane i spróbuj ponownie.",
      });
    } finally {
      setIsEditModalOpen(false);
      setSelectedFlashcard(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę fiszkę?")) {
      try {
        await deleteFlashcard(id);
        showToast("Pomyślnie usunięto fiszkę", "success", {
          description: "Fiszka została trwale usunięta z systemu. Tej operacji nie można cofnąć.",
        });
        if (activeTab === "accepted") {
          await loadPage(pagination.page, pagination.limit);
        } else {
          await loadCandidatesPage(candidatesPagination.page, candidatesPagination.limit);
        }
      } catch (err) {
        showToast("Błąd usuwania", "error", {
          description: "Wystąpił problem podczas usuwania fiszki. Spróbuj ponownie później.",
        });
      }
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await acceptFlashcard(id);
      showToast("Pomyślnie zaakceptowano fiszkę", "success", {
        description: "Fiszka została przeniesiona do zestawu zaakceptowanych i jest gotowa do nauki.",
      });
      await Promise.all([
        loadPage(pagination.page, pagination.limit),
        loadCandidatesPage(candidatesPagination.page, candidatesPagination.limit),
      ]);
    } catch (err) {
      showToast("Błąd akceptacji", "error", {
        description: "Wystąpił problem podczas akceptowania fiszki. Spróbuj ponownie później.",
      });
    }
  };

  const handleDiscard = async (id: string) => {
    try {
      await discardFlashcard(id);
      showToast("Pomyślnie odrzucono fiszkę", "success", {
        description: "Fiszka została usunięta z listy kandydatów. Możesz ją później wygenerować ponownie.",
      });
      await Promise.all([
        loadPage(pagination.page, pagination.limit),
        loadCandidatesPage(candidatesPagination.page, candidatesPagination.limit),
      ]);
    } catch (err) {
      showToast("Błąd odrzucania", "error", {
        description: "Wystąpił problem podczas odrzucania fiszki. Spróbuj ponownie później.",
      });
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
            onPageChange={(page) => loadPage(page, selectedPageSize)}
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
            onPageChange={(page) => loadCandidatesPage(page, selectedPageSize)}
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
