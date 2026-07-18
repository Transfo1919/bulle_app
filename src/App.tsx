// Bulle — build de vérification (force un nouveau déploiement)
import React, { useState, useEffect } from 'react';
import { Sofa, Image, Users, Sparkles, HandHeart, Camera, X } from 'lucide-react';
import { useMemoryStore } from './stores/memoryStore';
import { useGameStore } from './stores/gameStore';
import { useBucketStore } from './stores/bucketStore';
import { usePrayerStore } from './stores/prayerStore';
import { useCollectionStore } from './stores/collectionStore';
import { useCustomContentStore } from './stores/customContentStore';
import { HomePage } from './pages/Home';
const InstantsPage = React.lazy(() => import('./pages/Instants').then((m) => ({ default: m.InstantsPage })));
const AdeuxPage = React.lazy(() => import('./pages/Adeux').then((m) => ({ default: m.AdeuxPage })));
const EnviesPage = React.lazy(() => import('./pages/Envies').then((m) => ({ default: m.EnviesPage })));
const PrayerPage = React.lazy(() => import('./pages/Prayer').then((m) => ({ default: m.PrayerPage })));
import { Button, Modal, ErrorBanner, Spinner } from './components/UI';
import { DEFAULT_GAMES } from './services/adeuxContent';
import { uploadPhoto, isSupabaseConfigured } from './services/supabase';
import { compressPhoto } from './services/photoService';
import { BucketItem, PrayerTopic, Memory } from './types';
import { T, CONTEXT, SOURCE_COLORS, SOURCE_LABELS, ThemeName, THEME_ORDER, applyTheme, getStoredTheme } from './theme';

type Source = 'manual' | 'game' | 'bucket' | 'prayer';
type Tab = 'sofa' | 'instants' | 'adeux' | 'envies' | 'priere';

interface MemoryPrefill {
  text?: string;
  source: Source;
  source_id?: string;
}

function App() {
  if (!isSupabaseConfigured) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          padding: 32,
          textAlign: 'center',
          background: '#F7F3EC',
          fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif",
        }}
      >
        <h1 style={{ fontSize: 20, marginBottom: 12, color: '#2E2B27' }}>Configuration manquante</h1>
        <p style={{ fontSize: 14, color: '#8A8377', lineHeight: 1.5, maxWidth: 320 }}>
          Les variables d'environnement <code>VITE_SUPABASE_URL</code> et{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> ne sont pas définies. Ajoute-les dans les Environment
          Variables de Vercel (Project Settings → Environment Variables), puis redéploie.
        </p>
      </div>
    );
  }

  return <AppContent />;
}

function AppContent() {
  const [tab, setTab] = useState<Tab>('sofa');
  const [theme, setTheme] = useState<ThemeName>(getStoredTheme());
  const [showCreateMemory, setShowCreateMemory] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [draftLocation, setDraftLocation] = useState('');
  const [draftDate, setDraftDate] = useState('');
  const [draftSource, setDraftSource] = useState<Source>('manual');
  const [draftSourceId, setDraftSourceId] = useState<string | undefined>(undefined);
  const [draftPhotoFile, setDraftPhotoFile] = useState<File | null>(null);
  const [draftPhotoPreview, setDraftPhotoPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme((current) => THEME_ORDER[(THEME_ORDER.indexOf(current) + 1) % THEME_ORDER.length]);
  };

  // Stores
  const setGames = useGameStore((state) => state.setGames);
  const addMemory = useMemoryStore((state) => state.addMemory);
  const memories = useMemoryStore((state) => state.memories);
  const updateMemoryAction = useMemoryStore((state) => state.updateMemory);
  const loadMemories = useMemoryStore((state) => state.loadMemories);
  const loadBucketItems = useBucketStore((state) => state.loadItems);
  const loadPrayerTopics = usePrayerStore((state) => state.loadTopics);
  const loadCollections = useCollectionStore((state) => state.loadCollections);
  const loadCustomContent = useCustomContentStore((state) => state.loadCustomContent);

  useEffect(() => {
    setGames(DEFAULT_GAMES);
    loadMemories();
    loadBucketItems();
    loadPrayerTopics();
    loadCollections();
    loadCustomContent();
  }, [setGames, loadMemories, loadBucketItems, loadPrayerTopics, loadCollections, loadCustomContent]);

  const openCreateMemory = (prefill?: MemoryPrefill) => {
    setEditingId(null);
    setDraftText(prefill?.text || '');
    setDraftLocation('');
    setDraftDate(new Date().toISOString().slice(0, 10));
    setDraftSource(prefill?.source || 'manual');
    setDraftSourceId(prefill?.source_id);
    setDraftPhotoFile(null);
    setDraftPhotoPreview(null);
    setRemovePhoto(false);
    setSaveError(null);
    setShowCreateMemory(true);
  };

  const openEditMemory = (memory: Memory) => {
    setEditingId(memory.id);
    setDraftText(memory.text);
    setDraftLocation(memory.location || '');
    setDraftDate(memory.date ? memory.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
    setDraftSource(memory.source);
    setDraftSourceId(memory.source_id);
    setDraftPhotoFile(null);
    setDraftPhotoPreview(memory.photo_url || null);
    setRemovePhoto(false);
    setSaveError(null);
    setShowCreateMemory(true);
  };

  const handlePhotoSelect = (file: File | null) => {
    setDraftPhotoFile(file);
    setRemovePhoto(file === null);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setDraftPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setDraftPhotoPreview(null);
    }
  };

  const handleCreateMemory = async () => {
    if (!draftText.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      let photo_url: string | undefined;
      if (draftPhotoFile) {
        try {
          const compressed = await compressPhoto(draftPhotoFile);
          const path = `${Date.now()}_${compressed.name}`;
          photo_url = await uploadPhoto(compressed, path);
        } catch (photoErr: any) {
          throw new Error(`Échec de l'envoi de la photo : ${photoErr?.message || photoErr}`);
        }
      }

      if (editingId) {
        const updates: Partial<Memory> = {
          text: draftText.trim(),
          date: draftDate ? new Date(draftDate).toISOString() : undefined,
          location: draftLocation || undefined,
          source: draftSource,
          source_id: draftSourceId,
          updated_at: new Date().toISOString(),
        };
        if (photo_url) updates.photo_url = photo_url;
        else if (removePhoto) updates.photo_url = null as any;
        await updateMemoryAction(editingId, updates);
      } else {
        const memory = {
          text: draftText.trim(),
          date: draftDate ? new Date(draftDate).toISOString() : new Date().toISOString(),
          // L'ambiance n'est plus choisie manuellement : la couleur affichée
          // dépend désormais automatiquement de ce à quoi l'instant est lié
          // (voir SOURCE_COLORS). On garde une valeur neutre par défaut.
          ambiance: 'calme' as any,
          location: draftLocation || undefined,
          source: draftSource,
          source_id: draftSourceId,
          photo_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await addMemory(memory);
      }
      setShowCreateMemory(false);
      setEditingId(null);
    } catch (e: any) {
      setSaveError(e?.message || "Une erreur est survenue lors de l'enregistrement.");
    }
    setSaving(false);
  };

  const knownLocations = React.useMemo(
    () => Array.from(new Set(memories.map((m) => m.location).filter(Boolean))) as string[],
    [memories]
  );

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

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {tab === 'sofa' && (
          <HomePage onNavigate={(t) => setTab(t as Tab)} theme={theme} onCycleTheme={cycleTheme} />
        )}
        <React.Suspense fallback={<Spinner />}>
          {tab === 'instants' && <InstantsPage onCreateClick={() => openCreateMemory()} onEditClick={openEditMemory} />}
          {tab === 'adeux' && <AdeuxPage onCreateMemoryFor={handleCreateMemoryForAdeux} />}
          {tab === 'envies' && <EnviesPage onCreateMemoryFor={handleCreateMemoryForBucket} />}
          {tab === 'priere' && <PrayerPage onCreateMemoryFor={handleCreateMemoryForPrayer} />}
        </React.Suspense>
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
      <Modal isOpen={showCreateMemory} onClose={() => setShowCreateMemory(false)} title={editingId ? 'Modifier l\'instant' : 'Créer un instant'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {saveError && <ErrorBanner message={saveError} />}
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
                    border: draftSource === s ? `1px solid ${SOURCE_COLORS[s]}` : `1px solid ${T.border}`,
                    background: draftSource === s ? SOURCE_COLORS[s] : 'transparent',
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

          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="date"
              value={draftDate}
              onChange={(e) => setDraftDate(e.target.value)}
              style={{
                flex: 1,
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
            <input
              type="text"
              placeholder="Lieu (optionnel)"
              value={draftLocation}
              onChange={(e) => setDraftLocation(e.target.value)}
              list="known-locations"
              style={{
                flex: 1,
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
            <datalist id="known-locations">
              {knownLocations.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button full variant="secondary" onClick={() => setShowCreateMemory(false)}>
              Annuler
            </Button>
            <Button full onClick={handleCreateMemory} disabled={!draftText.trim() || saving}>
              {saving ? 'Enregistrement…' : editingId ? 'Enregistrer les modifications' : 'Garder ce moment'}
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
