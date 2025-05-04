import { useState } from "react";
import { FlashcardList } from "./FlashcardList";
import { EditModal } from "./EditModal";
import { ExportModal } from "./ExportModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<FlashcardDto | null>(null);
  const [activeTab, setActiveTab] = useState<"accepted" | "candidates">("accepted");
  const [selectedPageSize, setSelectedPageSize] = useState<number>(pagination.limit);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [flashcardToDelete, setFlashcardToDelete] = useState<string | null>(null);
  const [flashcardToDiscard, setFlashcardToDiscard] = useState<string | null>(null);

  const handlePageSizeChange = async (newLimit: number) => {
    setSelectedPageSize(newLimit);
    await Promise.all([loadPage(1, newLimit), loadCandidatesPage(1, newLimit)]);
  };

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
      // Refresh both lists since editing a candidate moves it to accepted
      await Promise.all([
        loadPage(pagination.page, pagination.limit),
        loadCandidatesPage(candidatesPagination.page, candidatesPagination.limit),
      ]);
    } catch (err) {
      logger.error("Error updating flashcard:", { err });
    } finally {
      setIsEditModalOpen(false);
      setSelectedFlashcard(null);
    }
  };

  const handleDelete = async (id: string) => {
    setFlashcardToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!flashcardToDelete) return;

    try {
      await deleteFlashcard(flashcardToDelete);
      if (activeTab === "accepted") {
        await loadPage(pagination.page, pagination.limit);
      } else {
        await loadCandidatesPage(candidatesPagination.page, candidatesPagination.limit);
      }
    } catch (err) {
      logger.error("Error deleting flashcard:", { err });
    } finally {
      setFlashcardToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await acceptFlashcard(id);
      await Promise.all([
        loadPage(pagination.page, pagination.limit),
        loadCandidatesPage(candidatesPagination.page, candidatesPagination.limit),
      ]);
    } catch (err) {
      logger.error("Error accepting flashcard:", { err });
    }
  };

  const handleDiscard = async (id: string) => {
    setFlashcardToDiscard(id);
    setIsDiscardDialogOpen(true);
  };

  const confirmDiscard = async () => {
    if (!flashcardToDiscard) return;

    try {
      await discardFlashcard(flashcardToDiscard);
      await Promise.all([
        loadPage(pagination.page, pagination.limit),
        loadCandidatesPage(candidatesPagination.page, candidatesPagination.limit),
      ]);
    } catch (err) {
      logger.error("Error discarding flashcard:", { err });
    } finally {
      setFlashcardToDiscard(null);
      setIsDiscardDialogOpen(false);
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć tę fiszkę?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja jest nieodwracalna. Fiszka zostanie trwale usunięta z systemu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFlashcardToDelete(null)}>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Usuń</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDiscardDialogOpen} onOpenChange={setIsDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz odrzucić tę fiszkę?</AlertDialogTitle>
            <AlertDialogDescription>
              Fiszka zostanie trwale usunięta z listy kandydatów. Ta operacja jest nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFlashcardToDiscard(null)}>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscard}>Odrzuć</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
