-- À exécuter dans Supabase → SQL Editor
-- Crée les tables manquantes pour Bucket, Prière et sessions de Jeux,
-- et ajoute les colonnes nécessaires à la table memories existante.

-- Nouvelles colonnes sur la table moments existante (lien vers un module + photo)
alter table moments add column if not exists source_id text;
alter table moments add column if not exists photo_url text;

create table if not exists bucket_items (
  id text primary key,
  title text not null,
  timing text not null default 'plus_tard', -- 'ce_soir' | 'plus_tard'
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table bucket_items add column if not exists timing text not null default 'plus_tard';

create table if not exists prayer_topics (
  id text primary key,
  title text not null,
  description text,
  type text not null default 'ponctuel',
  category text not null default 'toport', -- 'toport' | 'recognition'
  status text not null default 'active',   -- 'active' | 'answered'
  created_at timestamptz not null default now(),
  answered_at timestamptz
);

create table if not exists game_sessions (
  id text primary key,
  game_id text not null,
  played_at timestamptz not null default now(),
  summary text,
  winner text,
  fun_fact text
);

-- RLS: désactivée ici pour un usage MVP avec la clé "anon" partagée entre les deux
-- utilisateurs du couple (pas d'auth pour l'instant, conforme à la philosophie V1
-- "pas de compte"). À activer plus tard si vous ajoutez une authentification.
alter table bucket_items disable row level security;
alter table prayer_topics disable row level security;
alter table game_sessions disable row level security;
