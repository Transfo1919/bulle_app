# Bulle

Application de couple : Le Sofa, Instants, À deux, Envies, Prière.
Réalisée avec React + Vite + TypeScript + Supabase.

Voir [INSTALL.md](./INSTALL.md) pour l'installation et la configuration Supabase.

## Stack

- React 18 + TypeScript + Vite
- Zustand (état global)
- Supabase (base de données + stockage photos)
- Déploiement : Vercel

## Structure

```
src/
├── App.tsx           # Navigation, modal de création/édition d'instant
├── pages/             # Le Sofa, Instants, À deux, Envies, Prière
├── stores/            # Zustand (memory, bucket, prayer, game, collection, contenu perso)
├── services/          # Supabase + logique métier (moduleService)
├── theme.ts           # Thèmes (Papier/Sauge/Nuit) + couleurs contextuelles par module
└── types/             # Types partagés
```
