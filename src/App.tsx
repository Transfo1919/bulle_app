import React, { useState, useEffect } from 'react';
import { Sofa, Image, Users, Sparkles, HandHeart, Camera, X } from 'lucide-react';
import { useMemoryStore } from './stores/memoryStore';
import { useGameStore } from './stores/gameStore';
import { useBucketStore } from './stores/bucketStore';
import { usePrayerStore } from './stores/prayerStore';
import { HomePage } from './pages/Home';
import { MemoriesPage } from './pages/Memories';
import { GamesPage } from './pages/Games';
import { BucketPage } from './pages/Bucket';
import { PrayerPage } from './pages/Prayer';
import { Button, Modal } from './components/UI';
import { DEFAULT_GAMES } from './services/moduleService';
import { uploadPhoto } from './services/supabase';
import { BucketItem, PrayerTopic } from './types';
import { T, CONTEXT, ThemeName, THEME_ORDER, applyTheme, getStoredTheme } from './theme';

const MOOD_OPTIONS = [
  { id: 'soleil', label: 'Soleil', color: '#D4924A' },
  { id: 'calme', label: 'Calme', color: '#7A9E8E' },
  { id: 'gris', label: 'Gris', color: '#8E8E93' },
  { id: 'tempete', label: 'Tempête', color: '#7B7FC4' },
];

const SOURCE_LABELS: Record<string, string> = {
  manual: 'Libre',
  game: 'À deux',
  bucket: 'Envies',
  prayer: 'Prière',
};

type Source = 'manual' | 'game' | 'bucket' | 'prayer';
type Tab = 'sofa' | 'instants' | 'adeux' | 'envies' | 'priere';

interface MemoryPrefill {
  text?: string;
  source: Source;
  source_id?: string;
}

function App() {
  const [tab, setTab] = useState<Tab>('sofa');
  const [theme, setTheme] = useState<ThemeName>(getStoredTheme());
  const [showCreateMemory, setShowCreateMemory] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [draftMood, setDraftMood] = useState('calme');
  const [draftLocation, setDraftLocation] = useState('');
  const [draftSource, setDraftSource] = useState<Source>('manual');
  const [draftSourceId, setDraftSourceId] = useState<string | undefined>(undefined);
  const [draftPhotoFile, setDraftPhotoFile] = useState<File | null>(null);
  const [draftPhotoPreview, setDraftPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme((current) => THEME_ORDER[(THEME_ORDER.indexOf(current) + 1) % THEME_ORDER.length]);
  };

  // Stores
  const setGames = useGameStore((state) => state.setGames);
  const addMemory = useMemoryStore((state) => state.addMemory);
  const loadMemories = useMemoryStore((state) => state.loadMemories);
  const memoryError = useMemoryStore((state) => state.error);
  const loadBucketItems = useBucketStore((state) => state.loadItems);
  const loadPrayerTopics = usePrayerStore((state) => state.loadTopics);

  useEffect(() => {
    setGames(DEFAULT_GAMES);
    loadMemories();
    loadBucketItems();
    loadPrayerTopics();
  }, [setGames, loadMemories, loadBucketItems, loadPrayerTopics]);

  const openCreateMemory = (prefill?: MemoryPrefill) => {
    setDraftText(prefill?.text || '');
    setDraftMood('calme');
    setDraftLocation('');
    setDraftSource(prefill?.source || 'manual');
    setDraftSourceId(prefill?.source_id);
    setDraftPhotoFile(null);
    setDraftPhotoPreview(null);
    setShowCreateMemory(true);
  };

  const handlePhotoSelect = (file: File | null) => {
    setDraftPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setDraftPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setDraftPhotoPreview(null);
    }
  };

  const handleCreateMemory = async () => {
    if (!draftText.trim() || !draftMood) return;
    setSaving(true);
    try {
      let photo_url: string | undefined;
      if (draftPhotoFile) {
        const path = `${Date.now()}_${draftPhotoFile.name}`;
        photo_url = await uploadPhoto(draftPhotoFile, path);
      }

      const memory = {
        id: `instant_${Date.now()}`,
        text: draftText.trim(),
        date: new Date().toISOString(),
        mood: draftMood as any,
        location: draftLocation || undefined,
        source: draftSource,
        source_id: draftSourceId,
        photo_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await addMemory(memory);
      setShowCreateMemory(false);
    } catch {
      // error already surfaced via memoryError
    }
    setSaving(false);
  };

  const handleCreateMemoryForBucket = (item: BucketItem) => {
    openCreateMemory({ text: item.title, source: 'bucket', source_id: item.id });
  };

  const handleCreateMemoryForPrayer = (topic: PrayerTopic) => {
    openCreateMemory({ text: topic.title, source: 'prayer', source_id: topic.id });
  };

  const handleCreateMemoryForAdeux = (prefill: { text: string; source_id: string }) => {
    openCreateMemory({ text: prefill.text, source: 'game', source_id: prefill.source_id });
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
          padding: 'calc(12px + env(safe-area-inset-top)) 16px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: T.ink }}>Bulle</h1>
        <button
          onClick={() => setTab('sofa')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <Sofa size={20} color={T.sage} />
        </button>
      </div>

      {/* Error banner */}
      {memoryError && (
        <div
          style={{
            margin: '10px 16px 0',
            background: '#FFF0EE',
            border: '1px solid #F5C6C0',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 12.5,
            color: '#C0392B',
          }}
        >
          {memoryError}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {tab === 'sofa' && (
          <HomePage onNavigate={(t) => setTab(t as Tab)} theme={theme} onCycleTheme={cycleTheme} />
        )}
        {tab === 'instants' && <MemoriesPage onCreateClick={() => openCreateMemory()} />}
        {tab === 'adeux' && <GamesPage onCreateMemoryFor={handleCreateMemoryForAdeux} />}
        {tab === 'envies' && <BucketPage onCreateMemoryFor={handleCreateMemoryForBucket} />}
        {tab === 'priere' && <PrayerPage onCreateMemoryFor={handleCreateMemoryForPrayer} />}
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
          padding: '8px 8px calc(8px + env(safe-area-inset-bottom))',
          gap: 8,
        }}
      >
        <NavButton icon={<Sofa size={20} />} label="Le Sofa" active={tab === 'sofa'} color={T.sage} onClick={() => setTab('sofa')} />
        <NavButton icon={<Image size={20} />} label="Instants" active={tab === 'instants'} color={CONTEXT.instants} onClick={() => setTab('instants')} />
        <NavButton icon={<Users size={20} />} label="À deux" active={tab === 'adeux'} color={CONTEXT.adeux} onClick={() => setTab('adeux')} />
        <NavButton icon={<Sparkles size={20} />} label="Envies" active={tab === 'envies'} color={CONTEXT.envies} onClick={() => setTab('envies')} />
        <NavButton icon={<HandHeart size={20} />} label="Prière" active={tab === 'priere'} color={CONTEXT.priere} onClick={() => setTab('priere')} />
      </div>

      {/* Create Memory (Instant) Modal */}
      <Modal isOpen={showCreateMemory} onClose={() => setShowCreateMemory(false)} title="Créer un instant">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: T.muted, display: 'block', marginBottom: 8 }}>
              Lié à...
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(Object.keys(SOURCE_LABELS) as Source[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setDraftSource(s)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    border: draftSource === s ? `1px solid ${T.sage}` : `1px solid ${T.border}`,
                    background: draftSource === s ? T.sage : 'transparent',
                    color: draftSource === s ? '#fff' : T.muted,
                    fontSize: 12,
                    fontFamily: T.font,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {SOURCE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

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
              color: T.ink,
              background: T.surface,
            }}
          />

          <div>
            <label style={{ fontSize: 12, color: T.muted, display: 'block', marginBottom: 8 }}>
              Photo (optionnelle)
            </label>
            {draftPhotoPreview ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={draftPhotoPreview}
                  alt=""
                  style={{ width: '100%', maxHeight: 180, borderRadius: T.radius, objectFit: 'cover' }}
                />
                <button
                  onClick={() => handlePhotoSelect(null)}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'rgba(0,0,0,0.55)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={14} color="#fff" />
                </button>
              </div>
            ) : (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  border: `1px dashed ${T.border}`,
                  borderRadius: T.radius,
                  padding: '16px',
                  color: T.muted,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <Camera size={18} />
                Ajouter une photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoSelect(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

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
              color: T.ink,
              background: T.surface,
            }}
          />

          <div style={{ display: 'flex', gap: 8 }}>
            <Button full variant="secondary" onClick={() => setShowCreateMemory(false)}>
              Annuler
            </Button>
            <Button full onClick={handleCreateMemory} disabled={!draftText.trim() || saving}>
              {saving ? 'Enregistrement…' : 'Garder ce moment'}
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
  color: string;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, active, color, onClick }) => (
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
      color: active ? color : T.muted,
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
