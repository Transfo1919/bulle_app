import React, { useState, useEffect } from 'react';
import { Home, Image, Gamepad2, Gift, HandHeart } from 'lucide-react';
import { useMemoryStore } from './stores/memoryStore';
import { useGameStore } from './stores/gameStore';
import { HomePage } from './pages/Home';
import { MemoriesPage } from './pages/Memories';
import { GamesPage } from './pages/Games';
import { BucketPage } from './pages/Bucket';
import { PrayerPage } from './pages/Prayer';
import { Button, Modal } from './components/UI';
import { DEFAULT_GAMES } from './services/moduleService';

const T = {
  paper: '#F5F1EA',
  paper2: '#EDE8DF',
  surface: '#FFFFFF',
  ink: '#2B2B2B',
  muted: '#9A9692',
  sage: '#7A9E8E',
  border: '#E4DFD6',
  radius: 14,
  font: "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif",
};

const MOOD_OPTIONS = [
  { id: 'soleil', label: 'Soleil', color: '#D4924A' },
  { id: 'calme', label: 'Calme', color: T.sage },
  { id: 'gris', label: 'Gris', color: '#8E8E93' },
  { id: 'tempete', label: 'Tempête', color: '#7B7FC4' },
];

function App() {
  const [tab, setTab] = useState('accueil');
  const [showCreateMemory, setShowCreateMemory] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [draftMood, setDraftMood] = useState('calme');
  const [draftLocation, setDraftLocation] = useState('');

  // Initialize stores
  const setGames = useGameStore((state) => state.setGames);
  const addMemory = useMemoryStore((state) => state.addMemory);

  useEffect(() => {
    setGames(DEFAULT_GAMES);
  }, [setGames]);

  const handleCreateMemory = () => {
    if (draftText.trim() && draftMood) {
      const memory = {
        id: `memory_${Date.now()}`,
        text: draftText.trim(),
        date: new Date().toISOString(),
        mood: draftMood as any,
        location: draftLocation || undefined,
        source: 'manual' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      addMemory(memory);
      setDraftText('');
      setDraftMood('calme');
      setDraftLocation('');
      setShowCreateMemory(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: T.paper,
        fontFamily: T.font,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: T.surface,
          borderBottom: `1px solid ${T.border}`,
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: T.ink }}>Bulle</h1>
        <button
          onClick={() => setTab('accueil')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <Home size={20} color={T.sage} />
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
        }}
      >
        {tab === 'accueil' && <HomePage onNavigate={setTab} />}
        {tab === 'souvenirs' && <MemoriesPage onCreateClick={() => setShowCreateMemory(true)} />}
        {tab === 'jeux' && <GamesPage />}
        {tab === 'bucket' && <BucketPage />}
        {tab === 'priere' && <PrayerPage />}
      </div>

      {/* Bottom Navigation */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: T.surface,
          borderTop: `1px solid ${T.border}`,
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          padding: 8,
          gap: 8,
        }}
      >
        <NavButton
          icon={<Home size={20} />}
          label="Accueil"
          active={tab === 'accueil'}
          onClick={() => setTab('accueil')}
        />
        <NavButton
          icon={<Image size={20} />}
          label="Souvenirs"
          active={tab === 'souvenirs'}
          onClick={() => setTab('souvenirs')}
        />
        <NavButton
          icon={<Gamepad2 size={20} />}
          label="Jeux"
          active={tab === 'jeux'}
          onClick={() => setTab('jeux')}
        />
        <NavButton
          icon={<Gift size={20} />}
          label="Bucket"
          active={tab === 'bucket'}
          onClick={() => setTab('bucket')}
        />
        <NavButton
          icon={<HandHeart size={20} />}
          label="Prière"
          active={tab === 'priere'}
          onClick={() => setTab('priere')}
        />
      </div>

      {/* Create Memory Modal */}
      <Modal
        isOpen={showCreateMemory}
        onClose={() => setShowCreateMemory(false)}
        title="Créer un souvenir"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <textarea
            placeholder="Raconte ce moment..."
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            autoFocus
            style={{
              border: `1px solid ${T.border}`,
              borderRadius: T.radius,
              padding: '12px 16px',
              fontFamily: T.font,
              fontSize: 14,
              minHeight: 100,
              outline: 'none',
              resize: 'none',
            }}
          />

          <div>
            <label style={{ fontSize: 12, color: T.muted, display: 'block', marginBottom: 8 }}>
              Comment te sens-tu ?
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setDraftMood(mood.id)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: mood.color,
                    border: draftMood === mood.id ? `2px solid ${T.ink}` : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  title={mood.label}
                />
              ))}
            </div>
          </div>

          <input
            type="text"
            placeholder="Lieu (optionnel)"
            value={draftLocation}
            onChange={(e) => setDraftLocation(e.target.value)}
            style={{
              border: `1px solid ${T.border}`,
              borderRadius: T.radius,
              padding: '12px 16px',
              fontFamily: T.font,
              fontSize: 14,
              outline: 'none',
            }}
          />

          <div style={{ display: 'flex', gap: 8 }}>
            <Button full variant="secondary" onClick={() => setShowCreateMemory(false)}>
              Annuler
            </Button>
            <Button full onClick={handleCreateMemory} disabled={!draftText.trim()}>
              Sauvegarder
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: active ? T.sage : T.muted,
      fontSize: 10,
      fontFamily: T.font,
      fontWeight: 500,
      transition: 'color 0.2s',
    }}
  >
    {icon}
    {label}
  </button>
);

export default App;
