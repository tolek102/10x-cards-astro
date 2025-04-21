import { useState, useEffect } from "react";
import type { FlashcardDto, FlashcardCreateDto, GenerateFlashcardsCommand, PaginationDto } from "@/types";
import { FlashcardsService } from "@/lib/services/flashcards";

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
      setError(err instanceof Error ? err : new Error("Failed to load flashcards"));
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
      setError(err instanceof Error ? err : new Error("Failed to load candidate flashcards"));
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
      return generatedFlashcards;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to generate flashcards"));
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
      return newFlashcard;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to create flashcard"));
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
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update flashcard"));
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
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to delete flashcard"));
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
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to accept flashcard"));
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
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to discard flashcard"));
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
