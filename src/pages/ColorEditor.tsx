import React, { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { T, CONTEXT, ThemeName, THEME_LABELS, THEME_VARS, ThemeVar, DEFAULT_CONTEXT_COLORS, DEFAULT_RADIUS } from '../theme';
import { setContextColor, setThemeColor, setRadius, getCurrentValues, resetAllOverrides } from '../services/colorOverrides';

interface ColorEditorProps {
  theme: ThemeName;
  onClose: () => void;
}

const THEME_VAR_LABELS: Record<ThemeVar, string> = {
  paper: 'Fond',
  paper2: 'Fond secondaire',
  surface: 'Surface (cartes)',
  ink: 'Texte',
  muted: 'Texte discret',
  border: 'Bordures',
  accent: 'Accent',
};

const CONTEXT_LABELS: Record<keyof typeof DEFAULT_CONTEXT_COLORS, string> = {
  adeux: 'À deux',
  envies: 'Envies',
  priere: 'Prière',
  instants: 'Instants',
};

const RADIUS_LABELS: Record<keyof typeof DEFAULT_RADIUS, string> = {
  radius: 'Coins — grand (cartes)',
  radiusMd: 'Coins — moyen',
  radiusSm: 'Coins — petit',
};

export const ColorEditor: React.FC<ColorEditorProps> = ({ theme, onClose }) => {
  const [, forceRender] = useState(0);
  const values = getCurrentValues(theme);

  const refresh = () => forceRender((n) => n + 1);

  const handleReset = () => {
    resetAllOverrides();
    refresh();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: T.paper,
        zIndex: 500,
        overflow: 'auto',
        fontFamily: T.font,
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: T.surface,
          borderBottom: `1px solid ${T.border}`,
          padding: 'calc(12px + env(safe-area-inset-top)) 16px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1,
        }}
      >
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: T.ink }}>Éditeur de couleurs</h1>
          <p style={{ fontSize: 12, color: T.muted, margin: '2px 0 0 0' }}>Thème actif : {THEME_LABELS[theme]}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleReset} title="Réinitialiser" style={iconBtnStyle}>
            <RotateCcw size={18} color={T.muted} />
          </button>
          <button onClick={onClose} title="Fermer" style={iconBtnStyle}>
            <X size={20} color={T.muted} />
          </button>
        </div>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 60 }}>
        <Section title="Couleurs des modules">
          {(Object.keys(CONTEXT_LABELS) as (keyof typeof DEFAULT_CONTEXT_COLORS)[]).map((key) => (
            <ColorRow
              key={key}
              label={CONTEXT_LABELS[key]}
              value={values.contextColors[key]}
              onChange={(v) => {
                setContextColor(key, v);
                refresh();
              }}
            />
          ))}
        </Section>

        <Section title={`Palette du thème "${THEME_LABELS[theme]}"`}>
          {THEME_VARS.map((key) => (
            <ColorRow
              key={key}
              label={THEME_VAR_LABELS[key]}
              value={values.themePalette[key]}
              onChange={(v) => {
                setThemeColor(theme, key, v);
                refresh();
              }}
            />
          ))}
        </Section>

        <Section title="Rayon des coins">
          {(Object.keys(RADIUS_LABELS) as (keyof typeof DEFAULT_RADIUS)[]).map((key) => (
            <RadiusRow
              key={key}
              label={RADIUS_LABELS[key]}
              value={values.radius[key]}
              onChange={(v) => {
                setRadius(key, v);
                refresh();
              }}
            />
          ))}
        </Section>

        <div
          style={{
            background: T.paper2,
            borderRadius: T.radius,
            padding: 16,
            border: `1px solid ${T.border}`,
          }}
        >
          <p style={{ fontSize: 12, color: T.muted, margin: '0 0 10px 0' }}>Aperçu en direct</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {(Object.keys(CONTEXT_LABELS) as (keyof typeof DEFAULT_CONTEXT_COLORS)[]).map((key) => (
              <span
                key={key}
                style={{
                  background: CONTEXT[key],
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '5px 12px',
                  borderRadius: 20,
                }}
              >
                {CONTEXT_LABELS[key]}
              </span>
            ))}
          </div>
          <div style={{ background: T.surface, borderRadius: T.radiusMd, padding: 14, border: `1px solid ${T.border}` }}>
            <p style={{ fontSize: 14, color: T.ink, margin: 0 }}>Voici à quoi ressemble une carte.</p>
            <p style={{ fontSize: 12, color: T.muted, margin: '6px 0 0 0' }}>Et un texte discret en dessous.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 6,
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h2 style={{ fontSize: 13, fontWeight: 700, color: T.muted, margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: 0.4 }}>
      {title}
    </h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
  </div>
);

const ColorRow: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => {
  const [hexInput, setHexInput] = useState(value);

  React.useEffect(() => {
    setHexInput(value);
  }, [value]);

  const commitHex = (v: string) => {
    const cleaned = v.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(cleaned)) onChange(cleaned);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: T.radiusMd,
        padding: '10px 14px',
      }}
    >
      <input
        type="color"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setHexInput(e.target.value);
        }}
        style={{ width: 36, height: 36, border: 'none', borderRadius: 8, padding: 0, background: 'none', cursor: 'pointer', flexShrink: 0 }}
      />
      <span style={{ flex: 1, fontSize: 14, color: T.ink }}>{label}</span>
      <input
        type="text"
        value={hexInput}
        onChange={(e) => setHexInput(e.target.value)}
        onBlur={() => commitHex(hexInput)}
        onKeyDown={(e) => e.key === 'Enter' && commitHex(hexInput)}
        style={{
          width: 90,
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          padding: '6px 8px',
          fontFamily: 'monospace',
          fontSize: 12.5,
          color: T.ink,
          background: T.paper,
          textAlign: 'center',
        }}
      />
    </div>
  );
};

const RadiusRow: React.FC<{ label: string; value: number; onChange: (v: number) => void }> = ({ label, value, onChange }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: T.radiusMd,
      padding: '10px 14px',
    }}
  >
    <span style={{ flex: 1, fontSize: 14, color: T.ink }}>{label}</span>
    <input
      type="range"
      min={0}
      max={32}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: 100 }}
    />
    <span style={{ width: 40, textAlign: 'right', fontSize: 12.5, color: T.muted, fontFamily: 'monospace' }}>{value}px</span>
  </div>
);
