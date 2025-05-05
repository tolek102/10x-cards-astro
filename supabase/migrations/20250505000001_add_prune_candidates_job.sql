-- Add cron job for pruning candidate flashcards
select cron.schedule(
  'prune_candidate_flashcards',
  '0 3 * * *',  -- every day at 3:00 AM
  $$
    delete from flashcards
    where candidate = true
      and created_at < now() - interval '3 hours';
  $$
); 