# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Architektura UI 10x-cards jest zorganizowana wokół dwóch głównych stanów użytkownika: niezalogowany i zalogowany. Niezalogowani użytkownicy widzą Welcome Screen z opcjami logowania i rejestracji, podczas gdy zalogowani użytkownicy mają dostęp do głównego interfejsu aplikacji z trzema kluczowymi sekcjami: Creator, Preview i Learning.

### Główne założenia architektury:
- Modularność: każdy widok jest niezależnym komponentem
- Lokalne zarządzanie stanem dla modali
- Integracja z API poprzez React Query
- Spójny system powiadomień i loadingów
- Zachowanie obecnej estetyki UI

## 2. Lista widoków

### Welcome Screen
- **Ścieżka**: `/`
- **Cel**: Wprowadzenie niezalogowanych użytkowników
- **Kluczowe informacje**: 
  - Opis produktu
  - Opcje logowania/rejestracji
  - Demo mode
- **Komponenty**:
  - LoginModal
  - RegisterModal
  - ForgotPasswordModal
- **UX/Dostępność**:
  - Jasna ścieżka do rozpoczęcia
  - Keyboard navigation
  - ARIA labels

### Main App Layout
- **Ścieżka**: `/app`
- **Cel**: Container dla zalogowanych użytkowników
- **Kluczowe informacje**:
  - Nazwa użytkownika
  - Nawigacja
  - Statystyki
- **Komponenty**:
  - NavigationBar
  - UserMenu
  - MainContent
- **UX/Dostępność**:
  - Responsive design
  - Persistent navigation
  - Clear feedback

### Flashcard Creator
- **Ścieżka**: `/app/creator`
- **Cel**: Tworzenie nowych fiszek
- **Kluczowe informacje**:
  - AI Generator
  - Manual Creator
  - Liczniki znaków
- **Komponenty**:
  - AIGeneratorTab
  - ManualCreatorTab
  - CharCounter
  - ResultsList
- **UX/Dostępność**:
  - Clear validation
  - Loading states
  - Error handling

### Flashcard Preview
- **Ścieżka**: `/app/preview`
- **Cel**: Zarządzanie fiszkami
- **Kluczowe informacje**:
  - Lista zaakceptowanych fiszek
  - Lista kandydatów
  - Opcje zarządzania
- **Komponenty**:
  - FlashcardList
  - FlashcardCard
  - EditModal
  - ExportModal
- **UX/Dostępność**:
  - Pagination
  - Batch actions
  - Sort/Filter options

### Learning Session
- **Ścieżka**: `/app/learning`
- **Cel**: Nauka z fiszek
- **Kluczowe informacje**:
  - Aktualna fiszka
  - Postęp sesji
  - Opcje nawigacji
- **Komponenty**:
  - LearningCard
  - ProgressBar
  - NavigationControls
- **UX/Dostępność**:
  - Keyboard shortcuts
  - Progress tracking
  - Clear feedback

### Modals
#### Login Modal
- **Cel**: Logowanie użytkownika
- **Komponenty**:
  - LoginForm
  - ValidationMessages
  - LoadingSpinner

#### Register Modal
- **Cel**: Rejestracja użytkownika
- **Komponenty**:
  - RegisterForm
  - ValidationMessages
  - LoadingSpinner

#### Forgot Password Modal
- **Cel**: Reset hasła
- **Komponenty**:
  - ForgotPasswordForm
  - ValidationMessages
  - LoadingSpinner

#### Edit Modal
- **Cel**: Edycja fiszki
- **Komponenty**:
  - EditForm
  - CharCounter
  - ValidationMessages

#### Export Modal
- **Cel**: Eksport fiszek
- **Komponenty**:
  - ExportOptions
  - DownloadButton

## 3. Mapa podróży użytkownika

### Ścieżka rejestracji/logowania:
1. Welcome Screen
2. Register/Login Modal
3. Main App Layout
4. Flashcard Creator

### Ścieżka tworzenia fiszek:
1. Flashcard Creator
2. Wybór metody (AI/Manual)
3. Wprowadzenie danych
4. Przegląd wyników
5. Zatwierdzenie/Edycja

### Ścieżka nauki:
1. Learning Session
2. Przeglądanie fiszki
3. Sprawdzenie odpowiedzi
4. Ocena znajomości
5. Następna fiszka

## 4. Układ i struktura nawigacji

### Główna nawigacja (zalogowani):
- Creator
- Preview
- Learning

### Modalne przejścia:
- Edycja fiszki
- Eksport
- Ustawienia konta

### Zachowanie:
- Persistent navigation bar
- Breadcrumbs dla lokalizacji
- Back button support
- Keyboard shortcuts

## 5. Kluczowe komponenty

### AuthGuard
- Ochrona routów dla zalogowanych
- Redirect do logowania
- Obsługa sesji

### FlashcardCard
- Display fiszki
- Flip animation
- Action buttons
- Status indicators

### LoadingSpinner
- Consistent loading UI
- Accessibility support
- Multiple sizes

### Toast
- System powiadomień
- Success/Error/Info variants
- Auto-dismiss
- Accessibility

### Modal
- Backdrop
- Close button
- Keyboard support
- Focus trap

### Tabs
- Przełączanie widoków
- Active indicators
- Keyboard navigation

### Button
- Multiple variants
- Loading state
- Disabled state
- Icon support

### TextArea
- Character counter
- Validation
- Auto-resize
- Max length

### CharCounter
- Current/Max display
- Color indicators
- Accessibility

## 6. Integracja z API

### Endpoints:
- Auth: `/api/register`, `/api/login`, `/api/me`
- Flashcards: 
  - GET `/api/flashcards`
  - GET `/api/flashcards/candidates`
  - POST `/api/flashcards`
  - POST `/api/flashcards/generate`
  - PATCH `/api/flashcards/{id}`
  - DELETE `/api/flashcards/{id}`
- Stats: GET `/api/statistics`

### Obsługa błędów:
- Network errors
- Validation errors
- Server errors
- Timeout handling

### Caching:
- React Query setup
- Invalidation rules
- Optimistic updates
- Background refetch

## 7. Bezpieczeństwo i wydajność

### Bezpieczeństwo:
- Protected routes
- Token management
- XSS prevention
- CSRF protection

### Wydajność:
- Lazy loading
- Pagination
- Debouncing
- Memoization

## 8. Dostępność

### Podstawowe wymagania:
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

### Dodatkowe usprawnienia:
- High contrast mode
- Font size controls
- Motion reduction
- Error announcements 