import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Shuffle } from 'lucide-react';
import { Card, Button, Modal } from '../components/UI';
import { useMemoryStore } from '../stores/memoryStore';
import { useBucketStore } from '../stores/bucketStore';
import { usePrayerStore } from '../stores/prayerStore';
import { useGameStore } from '../stores/gameStore';
import { useCustomContentStore } from '../stores/customContentStore';
import {
  DEFAULT_GAMES,
  JE_PENSE_ITEMS,
  JE_PENSE_GUIDING_QUESTIONS,
  QUI_CONNAIT_THEMES,
  ET_SI_QUESTIONS,
  DEFIS,
} from '../services/adeuxContent';
import { T, CONTEXT } from '../theme';

interface AdeuxPageProps {
  onCreateMemoryFor?: (prefill: { text: string; source_id: string }) => void;
}

const getIcon = (name: string): LucideIcon => {
  const icon = Icons[name as keyof typeof Icons] as unknown as LucideIcon;
  return icon || Icons.Users;
};

function pickRandom<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export const AdeuxPage: React.FC<AdeuxPageProps> = ({ onCreateMemoryFor }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const logSession = useGameStore((s) => s.logSession);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 80 }}>
      <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
        Passez un moment à deux, sans score ni compétition.
      </p>

      <Button
        full
        style={{ background: CONTEXT.adeux, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        onClick={() => setActiveId(pickRandom(DEFAULT_GAMES.map((g) => g.id)))}
      >
        <Shuffle size={16} />
        Jeu surprise
      </Button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {DEFAULT_GAMES.map((game) => {
          const Icon = getIcon(game.icon);
          return (
            <Card
              key={game.id}
              onClick={() => setActiveId(game.id)}
              style={{ display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer' }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: `${CONTEXT.adeux}22`,
                  color: CONTEXT.adeux,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={18} />
              </span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: T.ink }}>{game.name}</p>
                <p style={{ fontSize: 11.5, color: T.muted, margin: '4px 0 0 0', lineHeight: 1.35 }}>
                  {game.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <ExperienceModal
        activeId={activeId}
        onClose={() => setActiveId(null)}
        onDone={(summary) => {
          if (activeId) logSession(activeId, summary);
        }}
        onCreateMemoryFor={onCreateMemoryFor}
      />
    </div>
  );
};

interface ExperienceModalProps {
  activeId: string | null;
  onClose: () => void;
  onDone: (summary?: string) => void;
  onCreateMemoryFor?: (prefill: { text: string; source_id: string }) => void;
}

const ExperienceModal: React.FC<ExperienceModalProps> = ({ activeId, onClose, onDone, onCreateMemoryFor }) => {
  const game = DEFAULT_GAMES.find((g) => g.id === activeId) || null;

  const finish = (summary?: string) => {
    onDone(summary);
    onClose();
  };

  return (
    <Modal isOpen={!!game} onClose={onClose} title={game?.name}>
      {activeId === 'je-pense' && <JePenseExperience onFinish={finish} onCreateMemoryFor={onCreateMemoryFor} />}
      {activeId === 'photo-mystere' && <PhotoMystereExperience onFinish={finish} onCreateMemoryFor={onCreateMemoryFor} />}
      {activeId === 'qui-connait-mieux' && <QuiConnaitExperience onFinish={finish} onCreateMemoryFor={onCreateMemoryFor} />}
      {activeId === 'et-si' && <EtSiExperience onFinish={finish} onCreateMemoryFor={onCreateMemoryFor} />}
      {activeId === 'le-hasard' && <LeHasardExperience onFinish={finish} onCreateMemoryFor={onCreateMemoryFor} />}
      {activeId === 'defis' && <DefisExperience onFinish={finish} onCreateMemoryFor={onCreateMemoryFor} />}
    </Modal>
  );
};

const PromptBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ background: T.paper2, borderRadius: T.radius, padding: '18px 20px' }}>
    <p style={{ fontSize: 15, color: T.ink, margin: 0, lineHeight: 1.5 }}>{children}</p>
  </div>
);

// ─── Je pense à... ────────────────────────────────────
const JePenseExperience: React.FC<{
  onFinish: (summary?: string) => void;
  onCreateMemoryFor?: (prefill: { text: string; source_id: string }) => void;
}> = ({ onFinish, onCreateMemoryFor }) => {
  const [item, setItem] = useState(() => pickRandom(JE_PENSE_ITEMS)!);
  const hints = React.useMemo(
    () => [...JE_PENSE_GUIDING_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 3),
    [item]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
        L'un de vous pense à... <strong style={{ color: T.ink }}>{item}</strong>. L'autre doit deviner en posant des questions.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {hints.map((h) => (
          <span
            key={h}
            style={{
              fontSize: 11.5,
              color: T.muted,
              background: T.paper2,
              borderRadius: 20,
              padding: '4px 10px',
            }}
          >
            {h}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button full variant="secondary" onClick={() => setItem(pickRandom(JE_PENSE_ITEMS)!)}>
          Nouveau tirage
        </Button>
        <Button full style={{ background: CONTEXT.adeux }} onClick={() => onFinish(`Je pense à... ${item}`)}>
          Terminé
        </Button>
      </div>
      {onCreateMemoryFor && (
        <button
          onClick={() => onCreateMemoryFor({ text: `"Je pense à..." — ${item}`, source_id: 'je-pense' })}
          style={{ background: 'none', border: 'none', color: CONTEXT.adeux, fontSize: 12.5, cursor: 'pointer', fontFamily: T.font, textAlign: 'center' }}
        >
          Garder un souvenir de ce moment
        </button>
      )}
    </div>
  );
};

// ─── Photo Mystère ────────────────────────────────────
const PhotoMystereExperience: React.FC<{
  onFinish: (summary?: string) => void;
  onCreateMemoryFor?: (prefill: { text: string; source_id: string }) => void;
}> = ({ onFinish, onCreateMemoryFor }) => {
  const memoriesWithPhoto = useMemoryStore((s) => s.memories.filter((m) => !!m.photo_url));
  const [pick, setPick] = useState(() => pickRandom(memoriesWithPhoto));
  const [revealed, setRevealed] = useState(false);

  if (memoriesWithPhoto.length < 5) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 14, color: T.muted, margin: 0 }}>
          Pas encore assez de photos dans vos Instants pour ce jeu (au moins 5 nécessaires). Ajoutez
          quelques photos à vos souvenirs, puis revenez !
        </p>
        <Button full onClick={() => onFinish()}>
          Fermer
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {pick && (
        <>
          <div style={{ position: 'relative', borderRadius: T.radius, overflow: 'hidden' }}>
            <img
              src={pick.photo_url}
              alt=""
              style={{
                width: '100%',
                maxHeight: 240,
                objectFit: 'cover',
                filter: revealed ? 'none' : 'blur(20px)',
                transform: revealed ? 'none' : 'scale(1.1)',
                transition: 'filter 0.6s ease-out, transform 0.6s ease-out',
              }}
            />
          </div>
          {revealed && (
            <p style={{ fontSize: 14, color: T.ink, margin: 0, lineHeight: 1.4 }}>{pick.text}</p>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            {!revealed ? (
              <Button full style={{ background: CONTEXT.adeux }} onClick={() => setRevealed(true)}>
                Révéler
              </Button>
            ) : (
              <>
                <Button
                  full
                  variant="secondary"
                  onClick={() => {
                    setPick(pickRandom(memoriesWithPhoto));
                    setRevealed(false);
                  }}
                >
                  Nouvelle photo
                </Button>
                <Button full style={{ background: CONTEXT.adeux }} onClick={() => onFinish('Photo Mystère')}>
                  Terminé
                </Button>
              </>
            )}
          </div>
          {revealed && onCreateMemoryFor && (
            <button
              onClick={() => onCreateMemoryFor({ text: `Redécouvert : ${pick.text}`, source_id: 'photo-mystere' })}
              style={{ background: 'none', border: 'none', color: CONTEXT.adeux, fontSize: 12.5, cursor: 'pointer', fontFamily: T.font, textAlign: 'center' }}
            >
              Garder un souvenir de ce moment
            </button>
          )}
        </>
      )}
    </div>
  );
};

// ─── Qui connaît le mieux ? ────────────────────────────────────
const QuiConnaitExperience: React.FC<{
  onFinish: (summary?: string) => void;
  onCreateMemoryFor?: (prefill: { text: string; source_id: string }) => void;
}> = ({ onFinish, onCreateMemoryFor }) => {
  const customQuestions = useCustomContentStore((s) => s.questions);
  const addQuestion = useCustomContentStore((s) => s.addQuestion);
  const themes = Object.keys(QUI_CONNAIT_THEMES);

  const pool = (theme: string) => [
    ...QUI_CONNAIT_THEMES[theme],
    ...customQuestions.filter((q) => q.theme === theme).map((q) => q.question),
  ];

  const draw = () => {
    const theme = pickRandom(themes)!;
    const question = pickRandom(pool(theme))!;
    return { theme, question };
  };
  const [current, setCurrent] = useState(draw);
  const [showAdd, setShowAdd] = useState(false);
  const [newTheme, setNewTheme] = useState(themes[0]);
  const [newQuestion, setNewQuestion] = useState('');

  const handleAdd = async () => {
    if (!newQuestion.trim()) return;
    await addQuestion(newTheme, newQuestion.trim());
    setNewQuestion('');
    setShowAdd(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <span
        style={{
          alignSelf: 'flex-start', fontSize: 11, color: CONTEXT.adeux, background: `${CONTEXT.adeux}22`,
          borderRadius: 20, padding: '3px 10px', fontWeight: 600,
        }}
      >
        {current.theme}
      </span>
      <PromptBox>{current.question}</PromptBox>
      <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>
        Chacun répond en secret, puis vous comparez — pas de score à retenir.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button full variant="secondary" onClick={() => setCurrent(draw())}>
          Nouvelle question
        </Button>
        <Button full style={{ background: CONTEXT.adeux }} onClick={() => onFinish(current.question)}>
          Terminé
        </Button>
      </div>
      {onCreateMemoryFor && (
        <button
          onClick={() => onCreateMemoryFor({ text: `"${current.question}"`, source_id: 'qui-connait-mieux' })}
          style={{ background: 'none', border: 'none', color: CONTEXT.adeux, fontSize: 12.5, cursor: 'pointer', fontFamily: T.font, textAlign: 'center' }}
        >
          Garder un souvenir de ce moment
        </button>
      )}

      {showAdd ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
          <select
            value={newTheme}
            onChange={(e) => setNewTheme(e.target.value)}
            style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: '8px 10px', fontFamily: T.font, fontSize: 13, color: T.ink, background: T.surface }}
          >
            {themes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            type="text"
            placeholder="Votre question..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: '8px 10px', fontFamily: T.font, fontSize: 13, color: T.ink, background: T.surface }}
          />
          <Button size="sm" onClick={handleAdd} style={{ background: CONTEXT.adeux }}>Ajouter à la banque</Button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          style={{ background: 'none', border: 'none', color: T.muted, fontSize: 12, cursor: 'pointer', fontFamily: T.font, textAlign: 'center' }}
        >
          + Ajouter votre propre question
        </button>
      )}
    </div>
  );
};

// ─── Et si... ────────────────────────────────────
const EtSiExperience: React.FC<{
  onFinish: (summary?: string) => void;
  onCreateMemoryFor?: (prefill: { text: string; source_id: string }) => void;
}> = ({ onFinish, onCreateMemoryFor }) => {
  const [question, setQuestion] = useState(() => pickRandom(ET_SI_QUESTIONS)!);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PromptBox>{question}</PromptBox>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button full variant="secondary" onClick={() => setQuestion(pickRandom(ET_SI_QUESTIONS)!)}>
          Nouvelle question
        </Button>
        <Button full style={{ background: CONTEXT.adeux }} onClick={() => onFinish(question)}>
          Terminé
        </Button>
      </div>
      {onCreateMemoryFor && (
        <button
          onClick={() => onCreateMemoryFor({ text: question, source_id: 'et-si' })}
          style={{ background: 'none', border: 'none', color: CONTEXT.adeux, fontSize: 12.5, cursor: 'pointer', fontFamily: T.font, textAlign: 'center' }}
        >
          Garder un souvenir de ce moment
        </button>
      )}
    </div>
  );
};

// ─── Défis ────────────────────────────────────
const DefisExperience: React.FC<{
  onFinish: (summary?: string) => void;
  onCreateMemoryFor?: (prefill: { text: string; source_id: string }) => void;
}> = ({ onFinish, onCreateMemoryFor }) => {
  const customDefis = useCustomContentStore((s) => s.defis);
  const addDefi = useCustomContentStore((s) => s.addDefi);
  const pool = () => [...DEFIS, ...customDefis.map((d) => d.text)];

  const [defi, setDefi] = useState(() => pickRandom(pool())!);
  const [showAdd, setShowAdd] = useState(false);
  const [newDefi, setNewDefi] = useState('');

  const handleAdd = async () => {
    if (!newDefi.trim()) return;
    await addDefi(newDefi.trim());
    setNewDefi('');
    setShowAdd(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PromptBox>{defi}</PromptBox>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button full variant="secondary" onClick={() => setDefi(pickRandom(pool())!)}>
          Nouveau défi
        </Button>
        <Button full style={{ background: CONTEXT.adeux }} onClick={() => onFinish(defi)}>
          Terminé
        </Button>
      </div>
      {onCreateMemoryFor && (
        <button
          onClick={() => onCreateMemoryFor({ text: defi, source_id: 'defis' })}
          style={{ background: 'none', border: 'none', color: CONTEXT.adeux, fontSize: 12.5, cursor: 'pointer', fontFamily: T.font, textAlign: 'center' }}
        >
          Garder un souvenir de ce défi
        </button>
      )}

      {showAdd ? (
        <div style={{ display: 'flex', gap: 8, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
          <input
            type="text"
            placeholder="Votre défi..."
            value={newDefi}
            onChange={(e) => setNewDefi(e.target.value)}
            style={{ flex: 1, border: `1px solid ${T.border}`, borderRadius: 10, padding: '8px 10px', fontFamily: T.font, fontSize: 13, color: T.ink, background: T.surface }}
          />
          <Button size="sm" onClick={handleAdd} style={{ background: CONTEXT.adeux }}>Ajouter</Button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          style={{ background: 'none', border: 'none', color: T.muted, fontSize: 12, cursor: 'pointer', fontFamily: T.font, textAlign: 'center' }}
        >
          + Ajouter votre propre défi
        </button>
      )}
    </div>
  );
};

// ─── Le hasard ────────────────────────────────────
type HasardPick = { type: 'instant' | 'envie' | 'priere'; id: string; label: string };

const LeHasardExperience: React.FC<{
  onFinish: (summary?: string) => void;
  onCreateMemoryFor?: (prefill: { text: string; source_id: string }) => void;
}> = ({ onFinish, onCreateMemoryFor }) => {
  const memories = useMemoryStore((s) => s.memories);
  const envies = useBucketStore((s) => s.items.filter((i) => !i.completed));
  const prayers = usePrayerStore((s) => s.topics.filter((t) => t.category === 'toport'));

  const pool: HasardPick[] = [
    ...memories.map((m) => ({ type: 'instant' as const, id: m.id, label: m.text })),
    ...envies.map((e) => ({ type: 'envie' as const, id: e.id, label: e.title })),
    ...prayers.map((p) => ({ type: 'priere' as const, id: p.id, label: p.title })),
  ];

  const [excluded, setExcluded] = useState<string[]>([]);
  const draw = (excl: string[]): HasardPick | null => {
    const available = pool.filter((p) => !excl.includes(p.id));
    return pickRandom(available.length > 0 ? available : pool);
  };
  const [current, setCurrent] = useState(() => draw([]));

  const phrase = (type: string) =>
    type === 'instant'
      ? 'Et si on repensait à ça ?'
      : type === 'envie'
      ? 'Et si on faisait ça maintenant ?'
      : 'Et si on en reparlait ensemble ?';

  if (pool.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 14, color: T.muted, margin: 0 }}>
          Il n'y a encore rien à piocher — créez un instant, une envie ou un sujet de prière pour
          commencer.
        </p>
        <Button full onClick={() => onFinish()}>
          Fermer
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {current && (
        <>
          <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>{phrase(current.type)}</p>
          <PromptBox>{current.label}</PromptBox>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              full
              variant="secondary"
              onClick={() => {
                const next = draw([...excluded, current.id]);
                setExcluded((prev) => [...prev, current.id].slice(-5));
                setCurrent(next);
              }}
            >
              Nouveau tirage
            </Button>
            <Button full style={{ background: CONTEXT.adeux }} onClick={() => onFinish(current.label)}>
              Terminé
            </Button>
          </div>
          {onCreateMemoryFor && (
            <button
              onClick={() => onCreateMemoryFor({ text: current.label, source_id: current.id })}
              style={{ background: 'none', border: 'none', color: CONTEXT.adeux, fontSize: 12.5, cursor: 'pointer', fontFamily: T.font, textAlign: 'center' }}
            >
              Garder un souvenir de ce moment
            </button>
          )}
        </>
      )}
    </div>
  );
};
