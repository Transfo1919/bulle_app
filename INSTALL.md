# 🎀 Bulle - Installation & Configuration

## Prérequis

- **Node.js** 18+ et npm
- **Supabase** project (free tier suffit)

## Installation locale

### 1. Cloner et installer dépendances

```bash
git clone https://github.com/Transfo1919/bulle_app.git
cd bulle_app
npm install
```

### 2. Configuration Supabase

#### Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Copier l'URL et la clé anon

#### Créer les tables

Exécuter ce SQL dans Supabase SQL Editor :

```sql
-- Memories
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  title TEXT,
  date TIMESTAMP NOT NULL,
  mood TEXT CHECK (mood IN ('soleil', 'calme', 'gris', 'tempete')),
  location TEXT,
  collection_id UUID,
  source TEXT CHECK (source IN ('manual', 'game', 'bucket', 'prayer')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Photos
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  taken_at TIMESTAMP,
  latitude FLOAT,
  longitude FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Collections
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cover_photo TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Games
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  enabled BOOLEAN DEFAULT TRUE
);

-- Game Sessions
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id),
  played_at TIMESTAMP DEFAULT NOW(),
  summary TEXT,
  winner TEXT,
  fun_fact TEXT
);

-- Bucket Items
CREATE TABLE bucket_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Prayer Topics
CREATE TABLE prayer_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('ponctuel', 'récurrent')),
  status TEXT CHECK (status IN ('active', 'answered')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  answered_at TIMESTAMP
);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true);
```

### 3. Variables d'environnement

Créer `.env.local` :

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Lancer le dev server

```bash
npm run dev
```

L'app est accessible sur `http://localhost:5173`

## Architecture

```
src/
├── components/       # Composants réutilisables
├── pages/           # Pages (Home, Memories, Games, Bucket, Prayer)
├── stores/          # Zustand stores (global state)
├── services/        # Services (Supabase, photos, collections)
├── types/           # TypeScript types
├── App.tsx          # App principal avec navigation
├── index.css        # Styles globaux
└── main.tsx         # Entry point
```

## Principes de développement

✅ **Constitution de Bulle respectée**
- Aucune pression (pas de streaks, notifications culpabilisantes)
- Simplicité prioritaire
- Frictions minimales
- Souvenirs au cœur de l'app
- Technologie invisible

## Roadmap V1

- [x] Architecture modulaire
- [x] Stores Zustand
- [x] Page Accueil
- [x] Page Souvenirs (avec filtres)
- [x] Page Jeux
- [x] Page Bucket
- [x] Page Prière
- [x] Composants réutilisables (Button, Card, Modal)
- [ ] Pipeline photos (EXIF, compression WebP)
- [ ] Collections automatiques (temporal + GPS)
- [ ] Intégration Supabase complète
- [ ] Create Memory workflow depuis chaque module
- [ ] Pré-remplissage des formulaires

## Build & Déploiement

### Build local
```bash
npm run build
npm run preview
```

### Déploiement Vercel
```bash
vercel
```

## Troubleshooting

**"Cannot find module 'zustand'"**
→ `npm install`

**Supabase connection error**
→ Vérifier `.env.local`, les variables doivent correspondre aux clés Supabase

## Support

Pour toute question, consulter la Constitution et la Spécification technique.
