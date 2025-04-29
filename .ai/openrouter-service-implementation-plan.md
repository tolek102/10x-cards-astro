# Plan Implementacji Usługi OpenRouter dla Generowania Fiszek

## 1. Opis Usługi

Usługa OpenRouter będzie działać jako warstwa pośrednia (middleware) między naszą aplikacją a API OpenRouter.ai, zapewniając możliwość generowania fiszek przy użyciu modelu językowego (LLM) ustawianego w zmiennych środowiskowych (na początku domyślnie: google/gemini-2.0-flash-exp:free). Usługa będzie odpowiedzialna za przekształcanie tekstu wejściowego w wysokiej jakości fiszki edukacyjne.

## 2. Specyfikacja Konstruktora

```typescript
class OpenRouterService {
  constructor(config: OpenRouterConfig) {
    // Parametry konfiguracyjne
    apiKey: string; // Klucz API OpenRouter
    model: string; // Model LLM (domyślnie google/gemini-2.0-flash-exp:free)
    maxRetries: number; // Maksymalna liczba prób ponownego wykonania żądania
    timeout: number; // Limit czasu żądania w milisekundach
    baseUrl: string; // Bazowy URL API OpenRouter
  }
}
```

## 3. Metody i Pola Publiczne

### 3.1 Metoda Generowania Fiszek

```typescript
async generateFlashcards(text: string): Promise<FlashcardCreateDto[]>
```

## 4. Metody i Pola Prywatne

### 4.1 Komunikacja z AI

```typescript
private async makeRequest(text: string): Promise<OpenRouterResponse>
private async parseAIResponse(response: OpenRouterResponse): FlashcardCreateDto[]
private async validateGeneratedFlashcards(flashcards: FlashcardCreateDto[]): FlashcardCreateDto[]
```

### 4.2 Obsługa Błędów

```typescript
private handleApiError(error: Error): void
private async retryRequest(fn: Function, retries: number): Promise<any>
```

### 4.3 Formatowanie Żądań i Odpowiedzi

```typescript
// Format żądania
private formatPrompt(text: string): {
  model: string;
  messages: Array<{
    role: 'system' | 'user';
    content: string;
  }>;
  response_format: {
    type: 'json_schema';
    json_schema: {
      name: 'flashcards';
      strict: true;
      schema: {
        type: 'array';
        items: {
          type: 'object';
          properties: {
            front: { type: 'string' };
            back: { type: 'string' };
          };
          required: ['front', 'back'];
        };
      };
    };
  };
}

// Format odpowiedzi z OpenRouter
interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: 'assistant';
      content: string; // Zawiera JSON ze strukturą fiszek
    };
    finish_reason: 'stop' | 'length' | 'content_filter';
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Mapowanie odpowiedzi na format aplikacji
interface FlashcardCreateDto {
  front: string;
  back: string;
  source: 'AI';
  candidate: true;
}
```

### 4.4 Przykład Odpowiedzi

```typescript
// Przykładowa odpowiedź z OpenRouter
const openRouterResponse = {
  id: "chatcmpl-123",
  choices: [
    {
      message: {
        role: "assistant",
        content: JSON.stringify([
          {
            front: "Co to jest TypeScript?",
            back: "TypeScript to typowany nadzbiór JavaScript, który kompiluje się do czystego JavaScript.",
          },
          {
            front: "Jakie są główne zalety TypeScript?",
            back: "Statyczne typowanie, wsparcie dla nowoczesnych funkcji JS, lepsze wsparcie IDE, wykrywanie błędów podczas kompilacji.",
          },
        ]),
      },
      finish_reason: "stop",
    },
  ],
  usage: {
    prompt_tokens: 100,
    completion_tokens: 150,
    total_tokens: 250,
  },
};

// Zmapowana odpowiedź na format aplikacji
const mappedFlashcards: FlashcardCreateDto[] = [
  {
    front: "Co to jest TypeScript?",
    back: "TypeScript to typowany nadzbiór JavaScript, który kompiluje się do czystego JavaScript.",
    source: "AI",
    candidate: true,
  },
  {
    front: "Jakie są główne zalety TypeScript?",
    back: "Statyczne typowanie, wsparcie dla nowoczesnych funkcji JS, lepsze wsparcie IDE, wykrywanie błędów podczas kompilacji.",
    source: "AI",
    candidate: true,
  },
];
```

## 5. Obsługa Błędów

### 5.1 Typy Błędów

```typescript
enum OpenRouterErrorType {
  AUTHENTICATION_ERROR = "błąd_uwierzytelniania",
  RATE_LIMIT_ERROR = "błąd_limitu_żądań",
  MODEL_ERROR = "błąd_modelu",
  VALIDATION_ERROR = "błąd_walidacji",
  GENERATION_ERROR = "błąd_generowania_fiszek",
  NETWORK_ERROR = "błąd_sieci",
  TIMEOUT_ERROR = "błąd_przekroczenia_czasu",
  UNKNOWN_ERROR = "błąd_nieznany",
}
```

## 6. Kwestie Bezpieczeństwa

1. Zarządzanie Kluczami API

   - Przechowywanie kluczy API w zmiennych środowiskowych
   - Nigdy nie ujawniać kluczy w kodzie po stronie klienta

2. Walidacja Danych
   - Walidacja tekstu wejściowego pod kątem bezpieczeństwa
   - Sanityzacja wygenerowanych fiszek
   - Implementacja limitu długości tekstu wejściowego

## 7. Kroki Implementacji

### Krok 1: Konfiguracja Początkowa

1. Utworzenie struktury katalogów usługi w `src/lib/openrouter`
2. Konfiguracja zmiennych środowiskowych:
   ```env
   OPENROUTER_API_KEY=your_api_key
   OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
   OPENROUTER_MAX_RETRIES=3
   OPENROUTER_TIMEOUT=30000
   ```

### Krok 2: Implementacja Rdzenia Usługi

1. Implementacja klasy OpenRouterService
2. Integracja z istniejącym systemem logowania
3. Implementacja podstawowej metody komunikacji API

### Krok 3: Implementacja Generowania Fiszek

1. Utworzenie szablonu promptu dla generowania fiszek
2. Implementacja logiki parsowania odpowiedzi AI
3. Dodanie walidacji wygenerowanych fiszek

### Krok 4: Integracja z FlashcardService

1. Modyfikacja metody `generateFlashcards` w `FlashcardService`
2. Implementacja mapowania odpowiedzi na format `FlashcardCreateDto`
3. Dodanie obsługi błędów

## 8. Przykłady Użycia

### Podstawowe Generowanie Fiszek

```typescript
const openRouter = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY,
  model: process.env.OPENROUTER_MODEL,
});

const flashcards = await openRouter.generateFlashcards("Tekst do przetworzenia na fiszki...");
```

## 9. Integracja z Astro i React

### Integracja z Astro

1. Modyfikacja endpointu `/api/flashcards/generate`
2. Implementacja obsługi długich żądań
3. Konfiguracja timeoutów

### Integracja z React

1. Integracja z istniejącym komponentem `AIGeneratorTab`:

   - Podłączenie nowej usługi OpenRouter do props `onGenerate`
   - Wykorzystanie istniejącego stanu `isGenerating` do pokazywania statusu generowania
   - Zachowanie obecnej walidacji długości tekstu (1000-10000 znaków)

2. Obsługa błędów w `CreatorSection`:

   - Integracja z istniejącym systemem powiadomień (`showToast`)
   - Mapowanie błędów z OpenRouter na odpowiednie komunikaty dla użytkownika
   - Zachowanie obecnej logiki zarządzania stanem ładowania

3. Zachowanie istniejącej funkcjonalności:
   - Zarządzanie wygenerowanymi fiszkami w `ResultsList`
   - Obsługa akcji akceptacji/odrzucania/edycji fiszek
   - System powiadomień o sukcesie/błędach

## 10. Kwestie Wdrożeniowe

1. Konfiguracja Środowiska
   - Konfiguracja zmiennych środowiskowych dla OpenRouter
   - Konfiguracja timeoutów i limitów
   - Konfiguracja monitorowania błędów
