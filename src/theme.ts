export const T = {
  paper: 'var(--paper)',
  paper2: 'var(--paper2)',
  surface: 'var(--surface)',
  ink: 'var(--ink)',
  muted: 'var(--muted)',
  sage: 'var(--accent)',
  border: 'var(--border)',
  radius: 'var(--radius)',
  radiusMd: 'var(--radius-md)',
  radiusSm: 'var(--radius-sm)',
  font: "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif",
};

// Couleurs contextuelles par module — jamais liées à une émotion, juste à une section.
// Partagées entre tous les thèmes (via variables CSS), pilotables en
// direct par l'éditeur de couleurs (voir ColorEditor).
export const CONTEXT = {
  adeux: 'var(--context-adeux)', // terracotta doux
  priere: 'var(--context-priere)', // vert sauge
  envies: 'var(--context-envies)', // ocre
  instants: 'var(--context-instants)', // neutre
};

// Valeurs par défaut (utilisées par l'éditeur de couleurs pour l'état
// initial et le bouton "Réinitialiser").
export const DEFAULT_CONTEXT_COLORS = {
  adeux: '#4F6D7A',
  priere: '#7C9687',
  envies: '#D9A441',
  instants: '#8A748C',
};
export const DEFAULT_RADIUS = { radius: 17, radiusMd: 17, radiusSm: 32 };

export type ThemeName = 'papier' | 'sauge' | 'nuit' | 'douceur';
export const THEME_ORDER: ThemeName[] = ['papier', 'sauge', 'nuit', 'douceur'];
export const THEME_LABELS: Record<ThemeName, string> = {
  papier: 'Papier',
  sauge: 'Sauge',
  nuit: 'Nuit',
  douceur: 'Douceur',
};

// Palette de base par thème (valeurs par défaut, définies aussi dans
// index.css). Servent de référence à l'éditeur de couleurs.
export const THEME_VARS = ['paper', 'paper2', 'surface', 'ink', 'muted', 'border', 'accent'] as const;
export type ThemeVar = (typeof THEME_VARS)[number];

export const DEFAULT_THEME_PALETTES: Record<ThemeName, Record<ThemeVar, string>> = {
  papier: { paper: '#F7F3EC', paper2: '#EDE8DF', surface: '#FFFFFF', ink: '#2E2B27', muted: '#8A8377', border: '#E4DED2', accent: '#8FA895' },
  sauge: { paper: '#EEF1EA', paper2: '#E2E8DD', surface: '#FFFFFF', ink: '#28312B', muted: '#6E8F72', border: '#DCE3D8', accent: '#6E8F72' },
  nuit: { paper: '#1C1B19', paper2: '#26241F', surface: '#26241F', ink: '#EDEAE3', muted: '#948C7C', border: '#3A372F', accent: '#8FA895' },
  douceur: { paper: '#F8F5F1', paper2: '#E8DDD1', surface: '#FFFFFF', ink: '#5A4A42', muted: '#A9938A', border: '#E8DDD1', accent: '#A9B79D' },
};

// Couleur automatique d'un instant selon ce à quoi il est lié — jamais
// choisie manuellement à la création.
export type MemorySource = 'manual' | 'game' | 'bucket' | 'prayer';
export const SOURCE_COLORS: Record<MemorySource, string> = {
  manual: '#9C978A',
  game: CONTEXT.adeux,
  bucket: CONTEXT.envies,
  prayer: CONTEXT.priere,
};

export const SOURCE_LABELS: Record<MemorySource, string> = {
  manual: 'Libre',
  game: 'À deux',
  bucket: 'Envies',
  prayer: 'Prière',
};

// Libellé affiché sur les cartes d'instants ("Lié à un moment à deux"...)
export const SOURCE_LINK_LABELS: Partial<Record<MemorySource, string>> = {
  game: 'Lié à un moment à deux',
  bucket: 'Lié à une envie',
  prayer: 'Lié à une prière',
};

const STORAGE_KEY = 'bulle_theme';

export function applyTheme(name: ThemeName) {
  document.body.setAttribute('data-theme', name);
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch {
    /* ignore */
  }
}

export function getStoredTheme(): ThemeName {
  try {
    const t = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    if (t && THEME_ORDER.includes(t)) return t;
  } catch {
    /* ignore */
  }
  return 'papier';
}
