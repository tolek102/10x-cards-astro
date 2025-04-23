import { useState, useEffect } from "react";
import type { FlashcardDto, FlashcardCreateDto, GenerateFlashcardsCommand, PaginationDto } from "@/types";
import { FlashcardsService } from "@/lib/services/flashcards";
import { showToast } from "@/lib/toast";

interface UseFlashcardsReturn {
  flashcards: FlashcardDto[];
  candidates: FlashcardDto[];
  isLoading: boolean;
  isCandidatesLoading: boolean;
  error: Error | null;
  pagination: PaginationDto;
  candidatesPagination: PaginationDto;
  generateFlashcards: (text: string) => Promise<FlashcardDto[]>;
  createFlashcard: (flashcard: FlashcardCreateDto) => Promise<FlashcardDto>;
  updateFlashcard: (id: string, flashcard: Partial<FlashcardDto>) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  acceptFlashcard: (id: string) => Promise<void>;
  discardFlashcard: (id: string) => Promise<void>;
  loadPage: (page: number, limit?: number) => Promise<void>;
  loadCandidatesPage: (page: number, limit?: number) => Promise<void>;
}

export const useFlashcards = (initialPage = 1, pageSize = 10): UseFlashcardsReturn => {
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [candidates, setCandidates] = useState<FlashcardDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCandidatesLoading, setIsCandidatesLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationDto>({
    page: initialPage,
    limit: pageSize,
    total: 0,
  });
  const [candidatesPagination, setCandidatesPagination] = useState<PaginationDto>({
    page: initialPage,
    limit: pageSize,
    total: 0,
  });

  const loadPage = async (page: number, limit?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await FlashcardsService.getFlashcards(page, limit ?? pagination.limit);
      setFlashcards(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load flashcards");
      setError(error);
      showToast("Nie udało się załadować fiszek", "error", {
        description: "Wystąpił problem podczas pobierania fiszek. Spróbuj odświeżyć stronę."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCandidatesPage = async (page: number, limit?: number) => {
    setIsCandidatesLoading(true);
    setError(null);
    try {
      const response = await FlashcardsService.getCandidates(page, limit ?? candidatesPagination.limit);
      setCandidates(response.data);
      setCandidatesPagination(response.pagination);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load candidate flashcards");
      setError(error);
      showToast("Nie udało się załadować kandydatów", "error", {
        description: "Wystąpił problem podczas pobierania kandydatów na fiszki. Spróbuj odświeżyć stronę."
      });
    } finally {
      setIsCandidatesLoading(false);
    }
  };

  useEffect(() => {
    loadPage(initialPage);
    loadCandidatesPage(initialPage);
  }, [initialPage]);

  const generateFlashcards = async (text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const command: GenerateFlashcardsCommand = { text };
      const generatedFlashcards = await FlashcardsService.generateFlashcards(command);
      setCandidates((prev) => [...prev, ...generatedFlashcards]);
      setCandidatesPagination((prev) => ({
        ...prev,
        total: prev.total + generatedFlashcards.length,
      }));
      showToast("Wygenerowano nowe fiszki", "success", {
        description: `Pomyślnie utworzono ${generatedFlashcards.length} nowych kandydatów na fiszki.`
      });
      return generatedFlashcards;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to generate flashcards");
      setError(error);
      showToast("Nie udało się wygenerować fiszek", "error", {
        description: "Wystąpił problem podczas generowania fiszek. Sprawdź wprowadzony tekst i spróbuj ponownie."
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createFlashcard = async (flashcard: FlashcardCreateDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const [newFlashcard] = await FlashcardsService.createFlashcards({
        flashcards: [flashcard],
      });
      setCandidates((prev) => [...prev, newFlashcard]);
      setCandidatesPagination((prev) => ({
        ...prev,
        total: prev.total + 1,
      }));
      showToast("Utworzono nową fiszkę", "success", {
        description: "Nowa fiszka została dodana do listy kandydatów."
      });
      return newFlashcard;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create flashcard");
      setError(error);
      showToast("Nie udało się utworzyć fiszki", "error", {
        description: "Wystąpił problem podczas tworzenia fiszki. Sprawdź wprowadzone dane i spróbuj ponownie."
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFlashcard = async (id: string, flashcard: Partial<FlashcardDto>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedFlashcard = await FlashcardsService.updateFlashcard(id, flashcard);
      setFlashcards((prev) => prev.map((card) => (card.id === id ? updatedFlashcard : card)));
      setCandidates((prev) => prev.map((card) => (card.id === id ? updatedFlashcard : card)));
      showToast("Zaktualizowano fiszkę", "success", {
        description: "Pomyślnie zaktualizowano zawartość fiszki."
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update flashcard");
      setError(error);
      showToast("Nie udało się zaktualizować fiszki", "error", {
        description: "Wystąpił problem podczas aktualizacji fiszki. Sprawdź wprowadzone dane i spróbuj ponownie."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFlashcard = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await FlashcardsService.deleteFlashcard(id);
      setFlashcards((prev) => prev.filter((card) => card.id !== id));
      setCandidates((prev) => prev.filter((card) => card.id !== id));
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));
      showToast("Usunięto fiszkę", "success", {
        description: "Pomyślnie usunięto fiszkę z systemu."
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to delete flashcard");
      setError(error);
      showToast("Nie udało się usunąć fiszki", "error", {
        description: "Wystąpił problem podczas usuwania fiszki. Spróbuj ponownie później."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const acceptFlashcard = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedFlashcard = await FlashcardsService.acceptFlashcard(id);
      setCandidates((prev) => prev.filter((f) => f.id !== id));
      setFlashcards((prev) => [...prev, updatedFlashcard]);
      setCandidatesPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));
      setPagination((prev) => ({
        ...prev,
        total: prev.total + 1,
      }));
      showToast("Zaakceptowano fiszkę", "success", {
        description: "Fiszka została przeniesiona do głównej kolekcji."
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to accept flashcard");
      setError(error);
      showToast("Nie udało się zaakceptować fiszki", "error", {
        description: "Wystąpił problem podczas akceptowania fiszki. Spróbuj ponownie później."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const discardFlashcard = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await FlashcardsService.discardFlashcard(id);
      setCandidates((prev) => prev.filter((f) => f.id !== id));
      setCandidatesPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));
      showToast("Odrzucono fiszkę", "success", {
        description: "Pomyślnie odrzucono fiszkę z listy kandydatów."
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to discard flashcard");
      setError(error);
      showToast("Nie udało się odrzucić fiszki", "error", {
        description: "Wystąpił problem podczas odrzucania fiszki. Spróbuj ponownie później."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    flashcards,
    candidates,
    isLoading,
    isCandidatesLoading,
    error,
    pagination,
    candidatesPagination,
    generateFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    acceptFlashcard,
    discardFlashcard,
    loadPage,
    loadCandidatesPage,
  };
};
