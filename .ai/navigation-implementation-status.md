# Cel implementacji

Celem implementacji jest dodanie nawigacji między stronami aplikacji oraz prawidłowej obsługi autentykacji użytkowników, w tym:

1. Dodanie topbara z możliwością przełączania się między zakładkami
2. Usunięcie mockowego użytkownika (DEFAULT_USER_ID)
3. Zabezpieczenie stron przed dostępem przez niezalogowanych użytkowników
4. Poprawne wyświetlanie stanu zalogowania w UI

# Status implementacji

## Zrealizowane kroki

1. Modyfikacja middleware do ochrony stron:

   - Dodano przekierowanie niezalogowanych użytkowników na stronę logowania
   - Dodano zwracanie błędu 401 dla nieautoryzowanych żądań API
   - Zaktualizowano listę ścieżek publicznych
   - Dodano obsługę user w locals dla komponentów i API
   - Dodano przekazywanie instancji Supabase do locals

2. Stworzenie AuthenticatedLayout:

   - Utworzono nowy komponent `AuthenticatedLayout.astro`
   - Zintegrowano komponent `NavigationBar` z layoutem
   - Dodano obsługę przekazywania aktywnej sekcji

3. Aktualizacja komponentu NavigationBar:

   - Dodano nawigację między sekcjami (creator, preview, learning)
   - Dodano wyświetlanie danych zalogowanego użytkownika
   - Zaimplementowano funkcję wylogowania

4. Aktualizacja endpointów API:

   - Usunięto używanie DEFAULT_USER_ID
   - Dodano sprawdzanie autentykacji
   - Zaktualizowano używanie ID zalogowanego użytkownika
   - Dodano obsługę błędów i walidację

5. Aktualizacja typów:

   - Dodano typy dla Astro.locals
   - Zaktualizowano interfejs UserDto
   - Zaktualizowano typy dla SupabaseClient
   - Poprawiono typy dla fiszek (FlashcardDto, FlashcardUpdateDto)
   - Dodano typ SupabaseClient do Astro.locals

6. Dodanie nowych komponentów i endpointów:

   - Utworzono hook `useCurrentUser` do zarządzania stanem użytkownika
   - Dodano endpoint `/api/auth/me` do pobierania danych użytkownika
   - Zaktualizowano middleware o obsługę autentykacji
   - Utworzono hook `useFlashcards` do zarządzania fiszkami
   - Utworzono kontenery React dla poszczególnych sekcji

7. Ulepszenie obsługi błędów w komponentach React:

   - Dodano mechanizm ponownych prób dla operacji API (max 3 próby)
   - Dodano szczegółowe komunikaty błędów w języku polskim
   - Ujednolicono format obsługi błędów w hooku useFlashcards
   - Dodano wyświetlanie statusu ponownych prób w toastach

8. Poprawki błędów i ulepszenia:

   - Zmieniono przekierowanie po wylogowaniu na stronę główną `/`
   - Naprawiono błędy 500 w endpointach `/api/flashcards` i `/api/flashcards/candidates`
   - Dodano obsługę błędów z użyciem toastów w komponencie NavigationBar

9. Poprawki błędów w obsłudze fiszek:
   - Usunięto użycie DEFAULT_USER_ID z serwisu fiszek
   - Naprawiono problemy z typami w FlashcardService
   - Zmodyfikowano ładowanie danych w PreviewContainer, aby uniknąć błędów ERR_INSUFFICIENT_RESOURCES

## Napotkane problemy

1. Błędy w endpointach API:

   - ~~Endpointy `/api/flashcards` i `/api/flashcards/candidates` zwracają błąd 500~~
   - Niezgodność metod HTTP w endpoincie `/api/flashcards/[id]/accept`
   - ~~Brak prawidłowej obsługi błędów w komponentach~~
   - ~~Potrzebna aktualizacja logiki biznesowej w serwisach~~

2. Problemy z komponentami React:
   - Błędy przy próbie użycia hooków React w plikach Astro
   - Niespójności w typach między komponentami
   - Brak obsługi ponownych prób po błędach API

## Kolejne kroki

1. ~~Poprawić obsługę wylogowania:~~
   ~~- zmienić przekierowanie po wylogowaniu na stroną główną `/`~~
   ~~(obecnie przekierowuje na `/auth/login`)~~

2. Zaktualizować testy:

   - Dostosować testy do nowej logiki obsługi błędów
   - Dodać testy dla mechanizmu ponownych prób
   - Zaktualizować mocki do używania testowego ID użytkownika

3. Dodać wsparcie dla trybu offline:

   - Implementacja cache'owania odpowiedzi API
   - Obsługa trybu offline w komponentach
   - Synchronizacja danych po przywróceniu połączenia

4. Poprawić obsługę błędów w pozostałych endpointach:
   - Dodać szczegółowe komunikaty błędów
   - Ujednolicić format odpowiedzi błędów
   - Dodać logowanie błędów
