import React, { useMemo, useRef } from 'react';
import { Image, Users, Sparkles, HandHeart, Palette } from 'lucide-react';
import { useMemoryStore } from '../stores/memoryStore';
import { useBucketStore } from '../stores/bucketStore';
import { usePrayerStore } from '../stores/prayerStore';
import { Card } from '../components/UI';
import { T, CONTEXT, ThemeName, THEME_LABELS } from '../theme';

interface HomeProps {
  onNavigate: (tab: string) => void;
  theme: ThemeName;
  onCycleTheme: () => void;
  onOpenColorEditor: () => void;
}

const REDECOUVERTE_LINES = [
  'Il y a quelque temps...',
  'Un instant à redécouvrir.',
  'Vous aviez presque oublié ça.',
  'Une envie qui attend toujours.',
  'Ce jour-là.',
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Bonjour';
  if (h >= 12 && h < 18) return 'Bel après-midi';
  if (h >= 18 && h < 23) return 'Bonsoir';
  return 'On ne dort pas ?';
}

export const HomePage: React.FC<HomeProps> = ({ onNavigate, theme, onCycleTheme, onOpenColorEditor }) => {
  const memories = useMemoryStore((s) => s.memories);
  const bucketItems = useBucketStore((s) => s.items);
  const prayerTopics = usePrayerStore((s) => s.topics);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const greeting = useMemo(() => getGreeting(), []);
  const redecouverteLine = useMemo(
    () => REDECOUVERTE_LINES[Math.floor(Math.random() * REDECOUVERTE_LINES.length)],
    []
  );

  // Pioche un élément à redécouvrir : un instant, une envie non faite, ou une prière — au hasard.
  const redecouverte = useMemo(() => {
    const pool: { type: 'instant' | 'envie' | 'priere'; label: string }[] = [];
    if (memories.length > 0) {
      const m = memories[Math.floor(Math.random() * memories.length)];
      pool.push({ type: 'instant', label: m.text.slice(0, 60) });
    }
    const pendingEnvies = bucketItems.filter((i) => !i.completed);
    if (pendingEnvies.length > 0) {
      const e = pendingEnvies[Math.floor(Math.random() * pendingEnvies.length)];
      pool.push({ type: 'envie', label: e.title });
    }
    const activePrayers = prayerTopics.filter((p) => p.category === 'toport');
    if (activePrayers.length > 0) {
      const p = activePrayers[Math.floor(Math.random() * activePrayers.length)];
      pool.push({ type: 'priere', label: p.title });
    }
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [memories, bucketItems, prayerTopics]);

  const redecouverteTarget = (type: string) => {
    if (type === 'instant') return 'instants';
    if (type === 'envie') return 'envies';
    return 'priere';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 80, position: 'relative' }}>
      <button
        onClick={onCycleTheme}
        onTouchStart={() => (longPressTimer.current = setTimeout(onOpenColorEditor, 600))}
        onTouchEnd={() => longPressTimer.current && clearTimeout(longPressTimer.current)}
        onMouseDown={() => (longPressTimer.current = setTimeout(onOpenColorEditor, 600))}
        onMouseUp={() => longPressTimer.current && clearTimeout(longPressTimer.current)}
        onMouseLeave={() => longPressTimer.current && clearTimeout(longPressTimer.current)}
        title={`Thème : ${THEME_LABELS[theme]} — appui long pour l'éditeur de couleurs`}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 6,
          color: T.muted,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Palette size={16} />
      </button>

      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: T.ink }}>{greeting}</h1>
        <p style={{ fontSize: 15, color: T.muted, margin: '6px 0 0 0' }}>
          Qu'est-ce qu'on fait aujourd'hui ?
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SofaButton
          icon={<Image size={18} />}
          label="Retrouver un instant"
          color={CONTEXT.instants}
          onClick={() => onNavigate('instants')}
        />
        <SofaButton
          icon={<Users size={18} />}
          label="Faire quelque chose à deux"
          color={CONTEXT.adeux}
          onClick={() => onNavigate('adeux')}
        />
        <SofaButton
          icon={<Sparkles size={18} />}
          label="Piocher une envie"
          color={CONTEXT.envies}
          onClick={() => onNavigate('envies')}
        />
        <SofaButton
          icon={<HandHeart size={18} />}
          label="Prendre un temps de prière"
          color={CONTEXT.priere}
          onClick={() => onNavigate('priere')}
        />
      </div>

      {redecouverte && (
        <Card
          onClick={() => onNavigate(redecouverteTarget(redecouverte.type))}
          style={{ cursor: 'pointer' }}
        >
          <p style={{ fontSize: 11, color: T.muted, margin: '0 0 6px 0', letterSpacing: 0.3 }}>
            {redecouverteLine}
          </p>
          <p style={{ fontSize: 14, color: T.ink, margin: 0, lineHeight: 1.4 }}>
            {redecouverte.label}
          </p>
        </Card>
      )}
    </div>
  );
};

interface SofaButtonProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}

const SofaButton: React.FC<SofaButtonProps> = ({ icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: T.radius,
      padding: '16px 18px',
      cursor: 'pointer',
      fontFamily: T.font,
      textAlign: 'left',
      width: '100%',
      transition: 'transform 0.2s ease-out',
    }}
  >
    <span
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: `${color}22`,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </span>
    <span style={{ fontSize: 15, fontWeight: 500, color: T.ink }}>{label}</span>
  </button>
);
