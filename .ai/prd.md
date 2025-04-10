# Dokument wymagań produktu (PRD) - 10x-cards-astro

## 1. Przegląd produktu
Produkt 10x-cards-astro to aplikacja webowa umożliwiająca tworzenie fiszek edukacyjnych przy użyciu dwóch metod: automatycznego generowania przez AI oraz ręcznego wprowadzania danych. Platforma pozwala użytkownikom na dodawanie, edycję, usuwanie oraz przeglądanie fiszek. Dodatkowo, produkt integruje fiszki z gotowym algorytmem powtórek, optymalizując proces nauki metodą spaced repetition. System obsługuje rejestrację i logowanie, gwarantując bezpieczny dostęp do spersonalizowanych funkcji.

## 2. Problem użytkownika
Ręczne tworzenie wysokiej jakości fiszek jest czasochłonne i wymaga precyzyjnego formułowania krótkich, ale treściwych notatek. Brak automatyzacji powoduje, że użytkownicy rezygnują z tej metody nauki, mimo że spaced repetition jest bardzo efektywną techniką przyswajania wiedzy.

## 3. Wymagania funkcjonalne
1. Automatyczne generowanie fiszek:
   - Użytkownik wkleja tekst o długości od 1000 do 10000 znaków.
   - API AI przetwarza tekst i generuje fiszki, przy czym:
     - Front nie przekracza 200 znaków.
     - Back nie przekracza 500 znaków.
   - Proces generowania jest stały, bez możliwości podglądu lub konfiguracji przez użytkownika.

2. Ręczne tworzenie fiszek:
   - Użytkownik może dodawać fiszki ręcznie, wprowadzając front i back z ograniczeniami:
     - Front: max 200 znaków.
     - Back: max 500 znaków.
   - System wyświetla komunikaty o błędach, gdy limity zostaną przekroczone.

3. Edycja i usuwanie fiszek:
   - Użytkownik ma możliwość edycji istniejących fiszek z zachowaniem tych samych ograniczeń znakowych.
   - Użytkownik może usuwać fiszki, po czym system prosi o potwierdzenie operacji.

4. System kont użytkowników:
   - Rejestracja, logowanie i uwierzytelnianie użytkowników.
   - Dostęp do fiszek jest ograniczony do właściciela konta.

5. Integracja z algorytmem powtórek:
   - Fiszki są integrowane z gotowym algorytmem powtórek, co wspiera efektywną naukę metodą spaced repetition.

6. Zbieranie statystyk interakcji:
   - System rejestruje liczbę akceptacji, odrzutów oraz edycji fiszek.
   - Dane statystyczne wspomagają analizę efektywności działania aplikacji.

## 4. Granice produktu
- Brak tworzenia własnego, zaawansowanego algorytmu powtórek (np. SuperMemo, Anki).
- Brak importu fiszek z różnych formatów (PDF, DOCX, itp.).
- Brak możliwości współdzielenia zestawów fiszek między użytkownikami.
- Brak integracji z innymi platformami edukacyjnymi.
- Produkt dostępny wyłącznie jako aplikacja web (brak aplikacji mobilnych).
- Brak opcji archiwizacji fiszek.
- Brak możliwości modyfikacji konfiguracji API AI lub interfejsu generowania przez użytkownika.

## 5. Historyjki użytkowników

US-001
Tytuł: Uwierzytelnianie i autoryzacja
Opis: Jako nowy użytkownik chcę móc się zarejestrować i zalogować, aby uzyskać bezpieczny dostęp do aplikacji oraz zarządzać swoimi fiszkami.
Kryteria akceptacji:
- Użytkownik może zarejestrować konto przy użyciu poprawnych danych.
- Użytkownik może zalogować się po poprawnej rejestracji.
- System zapewnia bezpieczne przechowywanie danych oraz ochronę dostępu.

US-002
Tytuł: Przeglądanie fiszek
Opis: Jako zalogowany użytkownik chcę przeglądać listę swoich fiszek, aby mieć szybki dostęp do materiałów edukacyjnych.
Kryteria akceptacji:
- Lista fiszek jest widoczna i czytelna w interfejsie użytkownika.
- Lista jest aktualizowana po każdej operacji (dodanie, edycja, usunięcie fiszki).

US-003
Tytuł: Automatyczne generowanie fiszek przy użyciu AI
Opis: Jako użytkownik chcę wkleić tekst (od 1000 do 10000 znaków) i otrzymać wygenerowane przez AI fiszki, gdzie front nie przekracza 200 znaków, a back nie przekracza 500 znaków.
Kryteria akceptacji:
- Użytkownik wkleja tekst spełniający wymagania długości.
- System wysyła tekst do API AI i odbiera wygenerowane fiszki.
- Wygenerowane fiszki spełniają ograniczenia znakowe i są wyświetlane bez możliwości modyfikacji procesu generacji.

US-004
Tytuł: Ręczne tworzenie fiszek
Opis: Jako użytkownik chcę móc ręcznie dodawać fiszki, wprowadzając front i back z ograniczeniami znakowymi, aby tworzyć materiał edukacyjny według własnego wyboru.
Kryteria akceptacji:
- Interfejs umożliwia wprowadzenie frontu (max 200 znaków) i backu (max 500 znaków).
- System wyświetla odpowiedni komunikat w przypadku przekroczenia limitu znaków.
- Nowa fiszka pojawia się na liście po zatwierdzeniu danych.

US-005
Tytuł: Edycja fiszki
Opis: Jako użytkownik chcę móc edytować istniejące fiszki, aby aktualizować lub poprawiać ich zawartość.
Kryteria akceptacji:
- Użytkownik wybiera fiszkę do edycji z listy.
- Edycja odbywa się z zachowaniem ograniczeń znakowych (front max 200, back max 500).
- Zmiany są zapisywane i odzwierciedlone w interfejsie.

US-006
Tytuł: Usuwanie fiszki
Opis: Jako użytkownik chcę móc usuwać fiszki, aby utrzymać bazę danych zaktualizowaną i uporządkowaną.
Kryteria akceptacji:
- Użytkownik wybiera fiszkę do usunięcia.
- System prosi o potwierdzenie operacji przed usunięciem.
- Po potwierdzeniu fiszka jest usuwana z systemu.

US-007
Tytuł: Zbieranie statystyk interakcji
Opis: Jako administrator systemu chcę, aby aplikacja rejestrowała szczegółowe statystyki interakcji (akceptacje, odrzuty, edycje), aby móc analizować efektywność rozwiązania.
Kryteria akceptacji:
- System automatycznie zapisuje statystyki dla każdej operacji na fiszkach.
- Statystyki obejmują liczbę akceptacji, odrzutów i edycji.
- Dane statystyczne są dostępne do analizy przez mechanizmy backendu.

## 6. Metryki sukcesu
- 75% fiszek wygenerowanych przez AI jest akceptowane przez użytkowników.
- Użytkownicy tworzą 75% swoich fiszek przy użyciu funkcji automatycznego generowania przez AI.
- Monitorowanie statystyk interakcji (liczba akceptacji, odrzutów, edycji) potwierdza poprawność działania systemu.
- Wskaźnik satysfakcji użytkowników związany z jakością fiszek oraz intuicyjnością interfejsu. 