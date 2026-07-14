-- À exécuter dans Supabase → SQL Editor
-- Ta table "moments" existe déjà (id, text, ambiance, poetic, created_at,
-- photo_url, source_id). Il manque juste les colonnes suivantes utilisées
-- par l'app : date, location, collection_id, source, favorite, updated_at.

alter table moments add column if not exists date timestamptz;
alter table moments add column if not exists location text;
alter table moments add column if not exists collection_id text;
alter table moments add column if not exists source text default 'manual';
alter table moments add column if not exists favorite boolean default false;
alter table moments add column if not exists updated_at timestamptz;

-- Pour les instants déjà existants, on aligne "date" sur "created_at"
-- s'il n'y a pas encore de valeur (évite les dates vides à l'affichage).
update moments set date = created_at where date is null;
update moments set updated_at = created_at where updated_at is null;

-- Colonne "timing" (Ce soir / Plus tard) sur les envies
alter table bucket_items add column if not exists timing text not null default 'plus_tard';

-- RLS désactivée pour un usage MVP avec la clé "anon" partagée entre les
-- deux utilisateurs du couple (pas d'auth pour l'instant).
alter table moments disable row level security;
alter table bucket_items disable row level security;
alter table prayer_topics disable row level security;
alter table game_sessions disable row level security;
