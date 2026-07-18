-- Renforce la structure de la base pour qu'elle reste rapide et fiable
-- à mesure que le volume de données grandit. Sans danger à ré-exécuter.

-- Index sur les colonnes les plus filtrées/triées par l'app.
create index if not exists idx_moments_created_at on moments (created_at desc);
create index if not exists idx_moments_date on moments (date desc);
create index if not exists idx_moments_source on moments (source);
create index if not exists idx_moments_deleted_at on moments (deleted_at);
create index if not exists idx_moments_favorite on moments (favorite) where favorite = true;

create index if not exists idx_bucket_items_completed on bucket_items (completed);
create index if not exists idx_bucket_items_timing on bucket_items (timing);

create index if not exists idx_prayer_topics_category on prayer_topics (category);
create index if not exists idx_prayer_topics_status on prayer_topics (status);

create index if not exists idx_game_sessions_played_at on game_sessions (played_at desc);

create index if not exists idx_custom_questions_theme on custom_questions (theme);

-- Garde-fous : les valeurs de "source", "timing" et "category" doivent
-- rester parmi celles que l'app connaît, pour éviter des données
-- incohérentes en cas d'insertion manuelle ou d'évolution future.
do $$
begin
  begin
    alter table moments add constraint chk_moments_source
      check (source in ('manual', 'game', 'bucket', 'prayer'));
  exception when others then null;
  end;
  begin
    alter table bucket_items add constraint chk_bucket_items_timing
      check (timing in ('ce_soir', 'plus_tard'));
  exception when others then null;
  end;
  begin
    alter table prayer_topics add constraint chk_prayer_topics_category
      check (category in ('toport', 'recognition'));
  exception when others then null;
  end;
end $$;
