import { useState, useCallback, useRef } from "react";
import type { FlashcardDto, FlashcardCreateDto, GenerateFlashcardsCommand, PaginationDto } from "@/types";
import { FlashcardsService } from "@/lib/services/flashcards";
import { showToast } from "@/lib/toast";
import { logger } from "../services/loggerService";

interface FlashcardsState {
  flashcards: FlashcardDto[];
  candidates: FlashcardDto[];
  isLoading: boolean;
  isCandidatesLoading: boolean;
  error: Error | null;
  pagination: PaginationDto;
  candidatesPagination: PaginationDto;
  manuallyCreatedFlashcards: FlashcardDto[];
  lastCreatedFlashcard: FlashcardDto | null;
}

interface UseFlashcardsReturn extends FlashcardsState {
  generateFlashcards: (text: string) => Promise<FlashcardDto[]>;
  createFlashcard: (flashcard: FlashcardCreateDto) => Promise<FlashcardDto>;
  updateFlashcard: (id: string, flashcard: Partial<FlashcardDto>) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  acceptFlashcard: (id: string) => Promise<void>;
  discardFlashcard: (id: string) => Promise<void>;
  loadPage: (page: number, limit?: number) => Promise<void>;
  loadCandidatesPage: (page: number, limit?: number) => Promise<void>;
}

const DEFAULT_PAGE_SIZE = 10;

export const useFlashcards = (initialPage = 1, pageSize = DEFAULT_PAGE_SIZE): UseFlashcardsReturn => {
  // State
  const [state, setState] = useState<FlashcardsState>({
    flashcards: [],
    candidates: [],
    isLoading: false,
    isCandidatesLoading: false,
    error: null,
    pagination: {
      page: initialPage,
      limit: pageSize,
      total: 0,
    },
    candidatesPagination: {
      page: initialPage,
      limit: pageSize,
      total: 0,
    },
    manuallyCreatedFlashcards: [],
    lastCreatedFlashcard: null,
  });

  // Ref to store pagination limit
  const pageLimitRef = useRef(pageSize);

  // Update ref when state changes
  if (state.pagination.limit !== pageLimitRef.current) {
    pageLimitRef.current = state.pagination.limit;
  }

  // Pomocnicze funkcje do aktualizacji stanu
  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading, error: null }));
  }, []);

  const setCandidatesLoading = useCallback((isCandidatesLoading: boolean) => {
    setState((prev) => ({ ...prev, isCandidatesLoading, error: null }));
  }, []);

  const setError = useCallback((error: Error) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  // Funkcje do zarządzania fiszkami
  const loadPage = useCallback(
    async (page: number, limit?: number) => {
      setLoading(true);
      try {
        const newLimit = limit ?? pageLimitRef.current;
        const response = await FlashcardsService.getFlashcards(page, newLimit);
        setState((prev) => ({
          ...prev,
          flashcards: response.data,
          pagination: {
            ...response.pagination,
            limit: newLimit,
          },
        }));
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to load flashcards");
        setError(error);
        showToast("Nie udało się załadować fiszek", "error", {
          description: "Wystąpił problem podczas pobierania fiszek. Spróbuj odświeżyć stronę.",
        });
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const loadCandidatesPage = useCallback(
    async (page: number, limit?: number) => {
      setCandidatesLoading(true);
      try {
        const newLimit = limit ?? pageLimitRef.current;
        const response = await FlashcardsService.getCandidates(page, newLimit);
        setState((prev) => ({
          ...prev,
          candidates: response.data,
          candidatesPagination: {
            ...response.pagination,
            limit: newLimit,
          },
        }));
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to load candidate flashcards");
        setError(error);
        showToast("Nie udało się załadować kandydatów", "error", {
          description: "Wystąpił problem podczas pobierania kandydatów na fiszki. Spróbuj odświeżyć stronę.",
        });
      } finally {
        setCandidatesLoading(false);
      }
    },
    [setCandidatesLoading, setError]
  );

  const generateFlashcards = useCallback(
    async (text: string): Promise<FlashcardDto[]> => {
      setLoading(true);
      try {
        const command: GenerateFlashcardsCommand = { text };
        const generatedFlashcards = await FlashcardsService.generateFlashcards(command);

        setState((prev) => ({
          ...prev,
          candidates: [...prev.candidates, ...generatedFlashcards],
          candidatesPagination: {
            ...prev.candidatesPagination,
            total: prev.candidatesPagination.total + generatedFlashcards.length,
          },
        }));

        showToast("Wygenerowano nowe fiszki", "success", {
          description: `Pomyślnie utworzono ${generatedFlashcards.length} nowych kandydatów na fiszki.`,
        });

        return generatedFlashcards;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to generate flashcards");
        logger.error("Failed to generate flashcards", { error });
        setError(error);
        showToast("Nie udało się wygenerować fiszek", "error", {
          description: "Wystąpił problem podczas generowania fiszek. Sprawdź wprowadzony tekst i spróbuj ponownie.",
        });
        return [];
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const createFlashcard = useCallback(
    async (flashcard: FlashcardCreateDto): Promise<FlashcardDto> => {
      setLoading(true);
      try {
        const newFlashcard = await FlashcardsService.createFlashcard(flashcard);

        setState((prev) => ({
          ...prev,
          ...(newFlashcard.candidate
            ? {
                candidates: [...prev.candidates, newFlashcard],
                candidatesPagination: {
                  ...prev.candidatesPagination,
                  total: prev.candidatesPagination.total + 1,
                },
              }
            : {
                flashcards: [...prev.flashcards, newFlashcard],
                pagination: {
                  ...prev.pagination,
                  total: prev.pagination.total + 1,
                },
                manuallyCreatedFlashcards: [...prev.manuallyCreatedFlashcards, newFlashcard],
              }),
          lastCreatedFlashcard: newFlashcard,
        }));

        showToast("Utworzono nową fiszkę", "success", {
          description: "Nowa fiszka została poprawnie dodana do listy fiszek.",
        });

        return newFlashcard;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to create flashcard");
        setError(error);
        showToast("Nie udało się utworzyć fiszki", "error", {
          description: "Wystąpił problem podczas tworzenia fiszki. Sprawdź wprowadzone dane i spróbuj ponownie.",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const updateFlashcard = useCallback(
    async (id: string, flashcard: Partial<FlashcardDto>): Promise<void> => {
      setLoading(true);
      try {
        const updatedFlashcard = await FlashcardsService.updateFlashcard(id, flashcard);

        setState((prev) => ({
          ...prev,
          flashcards: prev.flashcards.map((card) => (card.id === id ? updatedFlashcard : card)),
          candidates: prev.candidates.map((card) => (card.id === id ? updatedFlashcard : card)),
          manuallyCreatedFlashcards: prev.manuallyCreatedFlashcards.map((card) =>
            card.id === id ? updatedFlashcard : card
          ),
        }));

        showToast("Zaktualizowano fiszkę", "success", {
          description: "Pomyślnie zaktualizowano zawartość fiszki.",
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update flashcard");
        setError(error);
        showToast("Nie udało się zaktualizować fiszki", "error", {
          description: "Wystąpił problem podczas aktualizacji fiszki. Sprawdź wprowadzone dane i spróbuj ponownie.",
        });
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const deleteFlashcard = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      try {
        await FlashcardsService.deleteFlashcard(id);

        setState((prev) => ({
          ...prev,
          flashcards: prev.flashcards.filter((card) => card.id !== id),
          candidates: prev.candidates.filter((card) => card.id !== id),
          manuallyCreatedFlashcards: prev.manuallyCreatedFlashcards.filter((card) => card.id !== id),
          pagination: {
            ...prev.pagination,
            total: prev.pagination.total - 1,
          },
        }));

        showToast("Usunięto fiszkę", "success", {
          description: "Pomyślnie usunięto fiszkę z systemu.",
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to delete flashcard");
        setError(error);
        showToast("Nie udało się usunąć fiszki", "error", {
          description: "Wystąpił problem podczas usuwania fiszki. Spróbuj ponownie później.",
        });
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const acceptFlashcard = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      try {
        const updatedFlashcard = await FlashcardsService.acceptFlashcard(id);

        setState((prev) => ({
          ...prev,
          candidates: prev.candidates.filter((f) => f.id !== id),
          flashcards: [...prev.flashcards, updatedFlashcard],
          candidatesPagination: {
            ...prev.candidatesPagination,
            total: prev.candidatesPagination.total - 1,
          },
          pagination: {
            ...prev.pagination,
            total: prev.pagination.total + 1,
          },
        }));

        showToast("Zaakceptowano fiszkę", "success", {
          description: "Fiszka została przeniesiona do głównej kolekcji.",
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to accept flashcard");
        setError(error);
        showToast("Nie udało się zaakceptować fiszki", "error", {
          description: "Wystąpił problem podczas akceptowania fiszki. Spróbuj ponownie później.",
        });
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const discardFlashcard = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      try {
        await FlashcardsService.discardFlashcard(id);

        setState((prev) => ({
          ...prev,
          candidates: prev.candidates.filter((f) => f.id !== id),
          candidatesPagination: {
            ...prev.candidatesPagination,
            total: prev.candidatesPagination.total - 1,
          },
        }));

        showToast("Odrzucono fiszkę", "success", {
          description: "Pomyślnie odrzucono fiszkę z listy kandydatów.",
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to discard flashcard");
        setError(error);
        showToast("Nie udało się odrzucić fiszki", "error", {
          description: "Wystąpił problem podczas odrzucania fiszki. Spróbuj ponownie później.",
        });
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  return {
    ...state,
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
