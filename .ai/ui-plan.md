# Architektura UI dla 10x-cards-astro

## 1. Przegląd struktury UI

Interfejs aplikacji został podzielony na moduły odpowiadające głównym funkcjonalnościom: autoryzacja, generowanie fiszek (zarówno z użyciem AI, jak i ręcznie), przeglądanie zarządzania fiszkami oraz (przyszłościowo) sesja nauki. Centralnym elementem nawigacji jest topbar, który umożliwia łatwe przełączanie między widokami oraz prezentuje informacje o zalogowanym użytkowniku.

## 2. Lista widoków

- **Widok Landing / Auth**
  - Ścieżka: `/`
  - Główny cel: Umożliwić logowanie oraz rejestrację użytkowników.
  - Kluczowe informacje: Formularze logowania/rejestracji, komunikaty o błędach walidacji.
  - Kluczowe komponenty: Formularz, przyciski, dynamiczne komunikaty walidacyjne.
  - UX/Dostępność: Prosty i czytelny interfejs z natychmiastową walidacją pól, dostępny dla użytkowników o różnych potrzebach.
  - Bezpieczeństwo: Bezpieczne przesyłanie danych oraz minimalizowanie ujawniania szczegółów technicznych w komunikatach o błędach.

- **Widok Dashboard**
  - Ścieżka: `/dashboard`
  - Główny cel: Umożliwić szybkiego przejścia do jednego widoku na stronie:
        - widok dodawania fiszek
        - widok przegądania fiszek
        - widok sesji nauki
  - Kluczowe informacje: trzy duze przyciski przenoszące uzytkownika do wybranego widoku.
  - Kluczowe komponenty: Przyciski.
  - UX/Dostępność: Prosty i czytelny widok zawierający trzy duze przyciski z ikoną i nazwą widoku, do którego prowadzą.
  - Bezpieczeństwo: Bezpieczne przesyłanie danych oraz minimalizowanie ujawniania szczegółów technicznych w komunikatach o błędach.

- **Widok Dodawania Fiszek**
  - Ścieżka: `/flashcards/new`
  - Główny cel: Umożliwić użytkownikom generowanie fiszek poprzez dwie metody – automatyczne generowanie z wykorzystaniem AI oraz ręczne tworzenie. Po wygenerowaniu fiszek z uzyciem AI pod komponentem dodawania fiszek pojawi się lista z wygenerowanymi fiszkami, abu uzytkownik od razu miał wgląd w to co zostało utworzone.
  - Kluczowe informacje: Komponent z dwaoma panelami zakładkowymi ("Generowanie z AI" i "Dodawanie Ręczne") z odpowiednimi formularzami i dynamiczną walidacją pól tekstowych (AI: 1000-10000 znaków, Przód: max 200, Tył: max 500 znaków).
  - Kluczowe komponenty:
    - Komponent słuzący do dodawania fiszek z dwoma zakładkami:
        - Zakładka "Generowanie z AI": Pole tekstowe z licznikiem znaków, przycisk do wysyłki żądania generacji, dynamiczne komunikaty walidacyjne.
        - Zakładka "Dodawanie Ręczne": Formularz z polami na "Pytanie/Zagadnienie" oraz "Odpowiedź/Definicja", liczniki znaków, komunikaty walidacyjne.
    - Lista z wygenerowanymi fiszkami przez AI, przyciski operacji inline, modal do edycji fiszek.
  - UX/Dostępność: Jasno oznaczone aktywne zakładki (zmiana koloru), responsywne formularze, natychmiastowa informacja o błędach.
  - Bezpieczeństwo: Walidacja danych po stronie klienta przed wysłaniem do API.

- **Widok Przeglądania Fiszek**
  - Ścieżka: `/flashcards`
  - Główny cel: Umożliwić przeglądanie, edycję i zarządzanie fiszkami. Widok dzielony jest na dwie zakładki: "Fiszki zaakceptowane" oraz "Kandydaci na fiszki".
  - Kluczowe informacje: Lista fiszek, status (zaakceptowane/kandydaci), dane o dacie utworzenia, przyciski operacji inline (akceptacja, edycja, usuwanie).
  - Kluczowe komponenty: Lista z paginacją, przyciski operacji inline, modal do edycji fiszek.
  - UX/Dostępność: Łatwa nawigacja między zakładkami, natychmiastowa informacja zwrotna o operacjach, czytelny układ listy.
  - Bezpieczeństwo: Ograniczenie operacji do autoryzowanych użytkowników, potwierdzenia krytycznych operacji (np. usuwania) w modalach.

- **Widok Sesji Nauki (przyszłościowo)**
  - Ścieżka: `/flashcards/study`
  - Główny cel: Umożliwić użytkownikom naukę przy użyciu algorytmu spaced repetition, prezentując fiszki do powtórek.
  - Kluczowe informacje: Prezentacja fiszek (przód, tył), możliwość oceny przyswojenia materiału.
  - Kluczowe komponenty: Interaktywny panel nauki, przyciski oceny, dynamiczny harmonogram powtórek.
  - UX/Dostępność: Intuicyjny interfejs skoncentrowany na nauce, jasne wskazówki dotyczące interakcji.
  - Bezpieczeństwo: Ograniczenie dostępu do danych nauki tylko do zalogowanych użytkowników.

## 3. Mapa podróży użytkownika

1. Użytkownik trafia na stronę główną (Widok Landing / Auth) i loguje się lub rejestruje.
2. Po pomyślnym logowaniu użytkownik zostaje przekierowany do głównego interfejsu, gdzie za pośrednictwem topbara może przejść do widoku Dodawania Fiszek lub Przeglądania Fiszek.
3. W widoku Dodawania Fiszek użytkownik wybiera jedną z zakładek:
   - "Generowanie AI": Wkleja długi tekst, odbiera wygenerowane kandydatury fiszek i widzi dynamiczne komunikaty walidacyjne.
   - "Generowanie Ręczne": Wprowadza dane w formularzu, posiada dynamiczne liczniki i walidację pól.
4. W widoku Przeglądania Fiszek użytkownik przegląda listę fiszek, wykonuje operacje inline (akceptacja, edycja, usuwanie) oraz korzysta z modal okien do edycji.
5. W przyszłości użytkownik może przejść do widoku Sesji Nauki, aby korzystać z algorytmu powtórek.
6. Nawigacja między widokami odbywa się poprzez topbar z wyraźnym oznaczeniem aktywnej zakładki.

## 4. Układ i struktura nawigacji

- **Topbar:** Umieszczony na górze interfejsu, zawiera logo/nazwę produktu, linki do głównych widoków (Dodawanie Fiszek, Przeglądanie Fiszek, Sesja Nauki), informacje o użytkowniku (nazwa, profil, logout).
- **Aktywna zakładka:** Widoczna dzięki zmianie koloru, co umożliwia szybkie zorientowanie się w aktualnym widoku.
- **Paginacja:** Używana w widoku Przeglądania Fiszek, umożliwiająca przełączanie między stronami listy.
- **Operacje inline:** Akceptacja, edycja i usuwanie fiszek wykonywane bez dodatkowych potwierdzeń (z wyjątkiem edycji w modal), z natychmiastowymi komunikatami o sukcesie lub błędzie.

## 5. Kluczowe komponenty

- **Topbar:** Globalny pasek nawigacyjny z informacjami o użytkowniku i linkami do głównych widoków.
- **Formularze autoryzacji:** Komponenty logowania i rejestracji z dynamiczną walidacją i odpowiednimi komunikatami błędów.
- **Dynamiczny formularz fiszek:** Formularze w widoku Dodawania Fiszek z licznikami znaków i natychmiastową walidacją dla obu metod generacji.
- **Lista fiszek:** Wyświetlanie fiszek z operacjami inline, paginacją oraz możliwością edycji przez modal.
- **Modal edycji:** Popup umożliwiający edycję wybranej fiszki z dynamiczną walidacją pól.
- **Komunikaty inline:** Natychmiastowe, tekstowe komunikaty o sukcesie lub błędzie, bez dodatkowych dialogów potwierdzających. 