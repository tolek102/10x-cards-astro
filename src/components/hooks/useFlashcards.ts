import { useState, useCallback } from 'react';
import type { FlashcardDto, FlashcardCreateDto, FlashcardUpdateDto, PaginationDto } from '@/types';
import { useCurrentUser } from './useCurrentUser';
import { showToast } from '@/lib/toast';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const useFlashcards = () => {
  const { user } = useCurrentUser();
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [candidates, setCandidates] = useState<FlashcardDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCandidatesLoading, setIsCandidatesLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationDto>({ page: 1, limit: 10, total: 0 });
  const [candidatesPagination, setCandidatesPagination] = useState<PaginationDto>({ page: 1, limit: 10, total: 0 });

  const handleApiError = useCallback(async (operation: () => Promise<any>, errorMessage: string, retries = 0): Promise<any> => {
    try {
      return await operation();
    } catch (error) {
      console.error(`Error during ${errorMessage}:`, error);
      
      if (retries < MAX_RETRIES) {
        showToast(`Ponawiam próbę... (${retries + 1}/${MAX_RETRIES})`, 'info');
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return handleApiError(operation, errorMessage, retries + 1);
      }

      if (error instanceof Error) {
        showToast(errorMessage, 'error', {
          description: error.message
        });
      } else {
        showToast(errorMessage, 'error');
      }
      throw error;
    }
  }, []);

  const loadPage = async (page: number, limit: number = 10) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await handleApiError(async () => {
        const response = await fetch(`/api/flashcards?page=${page}&limit=${limit}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Nie udało się załadować fiszek');
        }
        const data = await response.json();
        setFlashcards(data.data);
        setPagination(data.pagination);
      }, 'Błąd ładowania fiszek');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCandidatesPage = async (page: number, limit: number = 10) => {
    if (!user) return;
    setIsCandidatesLoading(true);
    try {
      await handleApiError(async () => {
        const response = await fetch(`/api/flashcards/candidates?page=${page}&limit=${limit}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Nie udało się załadować kandydatów');
        }
        const data = await response.json();
        setCandidates(data.data);
        setCandidatesPagination(data.pagination);
      }, 'Błąd ładowania kandydatów');
    } finally {
      setIsCandidatesLoading(false);
    }
  };

  const createFlashcard = async (flashcard: FlashcardCreateDto): Promise<FlashcardDto> => {
    if (!user) throw new Error('Użytkownik nie jest zalogowany');
    return handleApiError(async () => {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flashcard),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nie udało się utworzyć fiszki');
      }
      return response.json();
    }, 'Błąd tworzenia fiszki');
  };

  const updateFlashcard = async (id: string, update: FlashcardUpdateDto): Promise<void> => {
    if (!user) throw new Error('Użytkownik nie jest zalogowany');
    await handleApiError(async () => {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nie udało się zaktualizować fiszki');
      }
    }, 'Błąd aktualizacji fiszki');
  };

  const deleteFlashcard = async (id: string): Promise<void> => {
    if (!user) throw new Error('Użytkownik nie jest zalogowany');
    await handleApiError(async () => {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nie udało się usunąć fiszki');
      }
    }, 'Błąd usuwania fiszki');
  };

  const acceptFlashcard = async (id: string): Promise<void> => {
    if (!user) throw new Error('Użytkownik nie jest zalogowany');
    await handleApiError(async () => {
      const response = await fetch(`/api/flashcards/${id}/accept`, {
        method: 'PATCH',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nie udało się zaakceptować fiszki');
      }
    }, 'Błąd akceptacji fiszki');
  };

  const discardFlashcard = async (id: string): Promise<void> => {
    if (!user) throw new Error('Użytkownik nie jest zalogowany');
    await handleApiError(async () => {
      const response = await fetch(`/api/flashcards/${id}/discard`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nie udało się odrzucić fiszki');
      }
    }, 'Błąd odrzucania fiszki');
  };

  const generateFlashcards = async (text: string): Promise<FlashcardDto[]> => {
    if (!user) throw new Error('Użytkownik nie jest zalogowany');
    return handleApiError(async () => {
      const response = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nie udało się wygenerować fiszek');
      }
      return response.json();
    }, 'Błąd generowania fiszek');
  };

  return {
    flashcards,
    candidates,
    isLoading,
    isCandidatesLoading,
    pagination,
    candidatesPagination,
    loadPage,
    loadCandidatesPage,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    acceptFlashcard,
    discardFlashcard,
    generateFlashcards,
  };
};
