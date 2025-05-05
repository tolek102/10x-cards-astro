# Dokument implementacyjny: Auto-usuwanie fiszek kandydatów z dnia poprzedniego o 3:00

**Opis dokumentu**  
Ten plik zawiera dokładny plan implementacji mechanizmu automatycznego usuwania fiszek z kolumną `candidate = true` w tabeli `flashcards` z poprzedniego dnia o godzinie 3:00. Dokument został stworzony, aby zapewnić zrozumiały i powtarzalny proces wdrożenia tej funkcjonalności oraz rozwiązać problem nadmiaru niezaaprobowanych fiszek w bazie.

## Problem do rozwiązania  
Fiszki oznaczone jako kandydackie (`candidate = true`) generowane przez AI mogą być tymczasowe i nieakceptowane przez użytkownika. Bez usuwania po określonym czasie tabela gromadzi stare, niepotrzebne rekordy. Należy usunąć te rekordy automatycznie o 3:00 w nocy, aby zminimalizować zużycie zasobów i zachować porządek.

## Plan implementacji

### 1. Weryfikacja i włączenie rozszerzenia pg_cron  
1.1. Sprawdzić, czy na instancji Supabase jest dostępne i włączone rozszerzenie `pg_cron`.  
1.2. Jeśli nie: utworzyć migrację SQL w katalogu `supabase/migrations/`, która wykona:
```sql
create extension if not exists pg_cron;
```

### 2. Utworzenie zadania cron w bazie  
2.1. Dodać migrację SQL w `supabase/migrations/` o nazwie np. `202505xx_add_pgcron_prune_candidate_flashcards.sql`.  
2.2. W treści migracji zamieścić:
```sql
-- Włączenie rozszerzenia (jeśli nie w poprzedniej migracji)
create extension if not exists pg_cron;

-- Zaplanowanie codziennego usuwania o 3:00 w nocy
select cron.schedule(
  'prune_candidate_flashcards',
  '0 3 * * *',  -- codziennie o 3:00
$$
  delete from flashcards
  where candidate = true
    and created_at < now() - interval '3 hours';
$$
);
```

### 3. Testowanie migracji  
3.1. Uruchomić migracje lokalnie (`supabase db push` lub `npm run supabase:migrate`) i upewnić się, że rozszerzenie jest dostępne.  
3.2. Zalogować się do bazy i sprawdzić, czy zadanie `prune_candidate_flashcards` zostało utworzone:  
```sql
select * from cron.job where job_name = 'prune_candidate_flashcards';
```  
3.3. Wykonać ręcznie:  
```sql
select cron.run(job_id);
```  
3.4. Sprawdzić, czy rekordy spełniające warunek zostały usunięte.

### 4. Dokumentacja i przekazanie  
4.1. Dodać komentarz w `schema.prisma` (jeśli używane) albo w dokumentacji repozytorium, że mechanizm usuwa kandydackie fiszki automatycznie.  
4.2. Powiadomić zespół, że funkcjonalność działa.

### 5. Komunikacja z użytkownikiem  
5.1. Na ekranie podglądu fiszek kandydackich (`FlashcardsPreview`) wyświetlić informację, ze wszystkie fiszki kandydaci utworzone danego dnia zostaną usunięte o godzinie 3:00 i ze nie da się po tym czasie przywrocic niezaakceptowanych fiszek
5.2. Na ekranie podglądu fiszek wygenerowanych przez AI (`ResoultList`) wyświetlić informację, ze wszystkie wygenerowane fiszki które nie zostaną zaakceptowane, zostaną usunięte o godzinie 3:00 i ze nie da się po tym czasie przywrocic niezaakceptowanych fiszek

## Efekt  
Po wdrożeniu migracji i wykonaniu zadania pg_cron, wszystkie fiszki z kolumną `candidate = true`, utworzone dnia poprzedniego w odniesieniu do odpalenia zadania cron, zostaną trwale usunięte, co zapobiegnie zaleganiu niezaaprobowanych rekordów.

## Efekt 
W bazie mamy 2 fiszki z `candidate = true`.
f1 z created_at 02.05.2025 12:00:00
f2 z created_at 03.05.2025 01:00:00
cron odpalamy 03.05.2025 o 3:00
fiszka f1 powinna zostać usunięta, 
fiszka f2 powinna zostać w bazie az do odpalenia crona nastepnego dnia
