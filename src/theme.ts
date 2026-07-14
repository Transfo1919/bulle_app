export const T = {
  paper: 'var(--paper)',
  paper2: 'var(--paper2)',
  surface: 'var(--surface)',
  ink: 'var(--ink)',
  muted: 'var(--muted)',
  sage: 'var(--accent)',
  border: 'var(--border)',
  radius: 14,
  font: "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif",
};

// Couleurs contextuelles par module — jamais liées à une émotion, juste à une section.
export const CONTEXT = {
  adeux: '#C08552', // terracotta doux
  priere: '#6E8F72', // vert sauge
  envies: '#C9A24B', // ocre
  instants: '#9C978A', // neutre
};

export type ThemeName = 'papier' | 'sauge' | 'nuit';
export const THEME_ORDER: ThemeName[] = ['papier', 'sauge', 'nuit'];
export const THEME_LABELS: Record<ThemeName, string> = {
  papier: 'Papier',
  sauge: 'Sauge',
  nuit: 'Nuit',
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
