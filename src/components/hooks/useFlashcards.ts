import { useState, useEffect } from "react";
import type { FlashcardDto, FlashcardCreateDto, GenerateFlashcardsCommand, PaginationDto } from "@/types";
import { FlashcardsService } from "@/lib/services/flashcards";

interface UseFlashcardsReturn {
  flashcards: FlashcardDto[];
  isLoading: boolean;
  error: Error | null;
  pagination: PaginationDto;
  generateFlashcards: (text: string) => Promise<void>;
  createFlashcard: (flashcard: FlashcardCreateDto) => Promise<void>;
  updateFlashcard: (id: string, flashcard: Partial<FlashcardDto>) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  loadPage: (page: number) => Promise<void>;
}

export const useFlashcards = (initialPage = 1, pageSize = 10): UseFlashcardsReturn => {
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationDto>({
    page: initialPage,
    limit: pageSize,
    total: 0,
  });

  const loadPage = async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await FlashcardsService.getFlashcards(page, pagination.limit);
      setFlashcards(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load flashcards"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPage(initialPage);
  }, [initialPage]);

  const generateFlashcards = async (text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const command: GenerateFlashcardsCommand = { text };
      const generatedFlashcards = await FlashcardsService.generateFlashcards(command);
      setFlashcards((prev) => [...prev, ...generatedFlashcards]);
      setPagination((prev) => ({
        ...prev,
        total: prev.total + generatedFlashcards.length,
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to generate flashcards"));
    } finally {
      setIsLoading(false);
    }
  };

  const createFlashcard = async (flashcard: FlashcardCreateDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const newFlashcards = await FlashcardsService.createFlashcards({
        flashcards: [flashcard],
      });
      setFlashcards((prev) => [...prev, ...newFlashcards]);
      setPagination((prev) => ({
        ...prev,
        total: prev.total + 1,
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to create flashcard"));
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

  return {
    flashcards,
    isLoading,
    error,
    pagination,
    generateFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    loadPage,
  };
};
