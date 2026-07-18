import { ThemeName, ThemeVar, THEME_VARS, DEFAULT_THEME_PALETTES, DEFAULT_CONTEXT_COLORS, DEFAULT_RADIUS } from '../theme';

const STORAGE_KEY = 'bulle_color_overrides';

interface Overrides {
  themes: Partial<Record<ThemeName, Partial<Record<ThemeVar, string>>>>;
  context: Partial<Record<keyof typeof DEFAULT_CONTEXT_COLORS, string>>;
  radius: Partial<Record<keyof typeof DEFAULT_RADIUS, number>>;
}

function loadOverrides(): Overrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { themes: {}, context: {}, radius: {} };
}

function saveOverrides(overrides: Overrides) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    /* ignore */
  }
}

// Applique toutes les surcharges enregistrées comme variables CSS sur
// <body>, pour qu'elles s'affichent immédiatement partout dans l'app.
export function applyStoredOverrides() {
  const overrides = loadOverrides();
  const body = document.body;

  Object.entries(overrides.context).forEach(([key, value]) => {
    if (value) body.style.setProperty(`--context-${key}`, value);
  });

  Object.entries(overrides.radius).forEach(([key, value]) => {
    if (value != null) {
      const cssVar = key === 'radius' ? '--radius' : key === 'radiusMd' ? '--radius-md' : '--radius-sm';
      body.style.setProperty(cssVar, `${value}px`);
    }
  });

  const currentTheme = (body.getAttribute('data-theme') as ThemeName) || 'papier';
  const themeOverrides = overrides.themes[currentTheme];
  if (themeOverrides) {
    Object.entries(themeOverrides).forEach(([key, value]) => {
      if (value) body.style.setProperty(cssVarForThemeKey(key as ThemeVar), value);
    });
  }
}

function cssVarForThemeKey(key: ThemeVar): string {
  if (key === 'accent') return '--accent';
  return `--${key}`;
}

export function setContextColor(key: keyof typeof DEFAULT_CONTEXT_COLORS, value: string) {
  document.body.style.setProperty(`--context-${key}`, value);
  const overrides = loadOverrides();
  overrides.context[key] = value;
  saveOverrides(overrides);
}

export function setRadius(key: keyof typeof DEFAULT_RADIUS, value: number) {
  const cssVar = key === 'radius' ? '--radius' : key === 'radiusMd' ? '--radius-md' : '--radius-sm';
  document.body.style.setProperty(cssVar, `${value}px`);
  const overrides = loadOverrides();
  overrides.radius[key] = value;
  saveOverrides(overrides);
}

export function setThemeColor(theme: ThemeName, key: ThemeVar, value: string) {
  document.body.style.setProperty(cssVarForThemeKey(key), value);
  const overrides = loadOverrides();
  if (!overrides.themes[theme]) overrides.themes[theme] = {};
  overrides.themes[theme]![key] = value;
  saveOverrides(overrides);
}

export function getCurrentValues(theme: ThemeName) {
  const overrides = loadOverrides();
  const contextColors = { ...DEFAULT_CONTEXT_COLORS, ...overrides.context };
  const radius = { ...DEFAULT_RADIUS, ...overrides.radius };
  const themePalette = { ...DEFAULT_THEME_PALETTES[theme], ...(overrides.themes[theme] || {}) };
  return { contextColors, radius, themePalette };
}

export function resetAllOverrides() {
  localStorage.removeItem(STORAGE_KEY);
  const body = document.body;
  const props = [
    '--context-adeux', '--context-envies', '--context-priere', '--context-instants',
    '--radius', '--radius-md', '--radius-sm',
    ...THEME_VARS.map(cssVarForThemeKey),
  ];
  props.forEach((p) => body.style.removeProperty(p));
}
