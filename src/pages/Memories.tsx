import React, { useMemo, useState, useRef } from 'react';
import {
  Plus, Search, Clock, CalendarDays, Star, Sparkles as DiscoverIcon,
  Library, ChevronLeft, ChevronRight, Trash2, FolderPlus, Copy, Pencil, Undo2,
} from 'lucide-react';
import { useMemoryStore } from '../stores/memoryStore';
import { useCollectionStore } from '../stores/collectionStore';
import { Card, Button, Modal, Divider } from '../components/UI';
import { Memory } from '../types';
import { T, CONTEXT, SOURCE_COLORS } from '../theme';

const SOURCE_LABELS: Record<string, string> = {
  game: 'Lié à un moment à deux',
  bucket: 'Lié à une envie',
  prayer: 'Lié à une prière',
};

type TopMode = 'decouvrir' | 'bibliotheque';
type ViewMode = 'recents' | 'chrono';
type SourceFilter = 'tous' | 'photos' | 'adeux' | 'envies' | 'priere' | 'libres' | 'favoris';

interface MemoriesPageProps {
  onCreateClick: () => void;
  onEditClick?: (memory: Memory) => void;
}

export const MemoriesPage: React.FC<MemoriesPageProps> = ({ onCreateClick, onEditClick }) => {
  const memories = useMemoryStore((state) => state.memories);
  const trashed = useMemoryStore((state) => state.trashed);
  const loadTrash = useMemoryStore((state) => state.loadTrash);
  const updateMemory = useMemoryStore((state) => state.updateMemory);
  const deleteMemory = useMemoryStore((state) => state.deleteMemory);
  const restore = useMemoryStore((state) => state.restore);
  const collections = useCollectionStore((state) => state.collections);
  const addCollection = useCollectionStore((state) => state.addCollection);

  const [topMode, setTopMode] = useState<TopMode>('decouvrir');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [actionMemory, setActionMemory] = useState<Memory | null>(null);
  const [collectionPickerFor, setCollectionPickerFor] = useState<Memory | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showTrash, setShowTrash] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('recents');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('tous');
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedFlash, setCopiedFlash] = useState(false);

  const discoverOrder = useMemo(
    () => [...memories].sort(() => Math.random() - 0.5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [memories.length]
  );
  const [discoverIndex, setDiscoverIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goNext = () => setDiscoverIndex((i) => (i + 1) % Math.max(discoverOrder.length, 1));
  const goPrev = () => setDiscoverIndex((i) => (i - 1 + discoverOrder.length) % Math.max(discoverOrder.length, 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 60) goPrev();
    else if (diff < -60) goNext();
    touchStartX.current = null;
  };

  const locations = useMemo(
    () => Array.from(new Set(memories.map((m) => m.location).filter(Boolean))) as string[],
    [memories]
  );

  const filtered = useMemo(() => {
    let base =
      viewMode === 'recents'
        ? [...memories].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        : [...memories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return base.filter((m) => {
      if (searchTerm && !m.text.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (collectionFilter && !(m.collection_ids || []).includes(collectionFilter)) return false;
      switch (sourceFilter) {
        case 'photos': return !!m.photo_url;
        case 'adeux': return m.source === 'game';
        case 'envies': return m.source === 'bucket';
        case 'priere': return m.source === 'prayer';
        case 'libres': return m.source === 'manual';
        case 'favoris': return !!m.favorite;
        default: return true;
      }
    });
  }, [viewMode, memories, searchTerm, sourceFilter, collectionFilter]);

  const FILTERS: { id: SourceFilter; label: string }[] = [
    { id: 'tous', label: 'Tous' },
    { id: 'favoris', label: 'Favoris' },
    { id: 'photos', label: 'Avec photo' },
    { id: 'adeux', label: 'À deux' },
    { id: 'envies', label: 'Envies' },
    { id: 'priere', label: 'Prière' },
    { id: 'libres', label: 'Libres' },
  ];

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    await addCollection(newCollectionName.trim());
    setNewCollectionName('');
  };

  const toggleMemoryCollection = (memory: Memory, collectionId: string) => {
    const current = memory.collection_ids || [];
    const next = current.includes(collectionId)
      ? current.filter((id) => id !== collectionId)
      : [...current, collectionId];
    updateMemory(memory.id, { collection_ids: next });
  };

  const handleExport = (memory: Memory) => {
    const text = `${new Date(memory.date).toLocaleDateString('fr-FR')} — ${memory.text}`;
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedFlash(true);
      setTimeout(() => setCopiedFlash(false), 1500);
    });
  };

  const openTrash = () => {
    loadTrash();
    setShowTrash(true);
  };

  const current = discoverOrder[discoverIndex] || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 80 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <ModeButton active={topMode === 'decouvrir'} icon={<DiscoverIcon size={14} />} label="Découvrir" onClick={() => setTopMode('decouvrir')} />
        <ModeButton active={topMode === 'bibliotheque'} icon={<Library size={14} />} label="Bibliothèque" onClick={() => setTopMode('bibliotheque')} />
      </div>

      {topMode === 'decouvrir' ? (
        memories.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 40, color: T.muted }}>
            Les plus belles histoires commencent souvent par un premier instant.
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {current && (
              <Card onClick={() => setActionMemory(current)} style={{ cursor: 'pointer', minHeight: 320, display: 'flex', flexDirection: 'column' }}>
                {current.photo_url ? (
                  <img src={current.photo_url} alt="" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: T.radius - 6, marginBottom: 14 }} />
                ) : (
                  <div style={{ width: '100%', height: 120, borderRadius: T.radius - 6, marginBottom: 14, background: SOURCE_COLORS[current.source] + '22' }} />
                )}
                <p style={{ fontSize: 12, color: T.muted, margin: '0 0 8px 0' }}>
                  {current.poetic || new Date(current.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p style={{ fontSize: 16, lineHeight: 1.5, margin: 0, flex: 1 }}>{current.text}</p>
                {current.source !== 'manual' && (
                  <p style={{ fontSize: 11, color: T.sage, margin: '10px 0 0 0' }}>{SOURCE_LABELS[current.source]}</p>
                )}
              </Card>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={goPrev} style={navBtnStyle}><ChevronLeft size={20} color={T.muted} /></button>
              <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>{discoverIndex + 1} / {discoverOrder.length}</p>
              <button onClick={goNext} style={navBtnStyle}><ChevronRight size={20} color={T.muted} /></button>
            </div>
          </div>
        )
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8, background: T.paper2, borderRadius: T.radius, padding: '12px 16px', alignItems: 'center' }}>
            <Search size={16} color={T.muted} />
            <input
              type="text"
              placeholder="Chercher un instant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: T.font, fontSize: 14, outline: 'none', color: T.ink }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <ModeButton active={viewMode === 'recents'} icon={<Clock size={14} />} label="Plus récents" onClick={() => setViewMode('recents')} />
            <ModeButton active={viewMode === 'chrono'} icon={<CalendarDays size={14} />} label="Chronologique" onClick={() => setViewMode('chrono')} />
          </div>

          <div style={{ display: 'flex', gap: 8, overflow: 'auto', paddingBottom: 4 }}>
            {FILTERS.map((f) => (
              <Button key={f.id} size="sm" variant={sourceFilter === f.id ? 'primary' : 'ghost'} onClick={() => setSourceFilter(f.id)}>
                {f.label}
              </Button>
            ))}
          </div>

          {collections.length > 0 && (
            <div style={{ display: 'flex', gap: 8, overflow: 'auto', paddingBottom: 4 }}>
              <Button size="sm" variant={!collectionFilter ? 'primary' : 'ghost'} onClick={() => setCollectionFilter(null)}>
                Toutes collections
              </Button>
              {collections.map((c) => (
                <Button key={c.id} size="sm" variant={collectionFilter === c.id ? 'primary' : 'ghost'} onClick={() => setCollectionFilter(c.id)}>
                  {c.name}
                </Button>
              ))}
            </div>
          )}

          {locations.length > 0 && (
            <div style={{ display: 'flex', gap: 8, overflow: 'auto', paddingBottom: 4 }}>
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setSearchTerm(loc)}
                  style={{ fontSize: 11.5, color: T.muted, background: T.paper2, border: 'none', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', fontFamily: T.font }}
                >
                  📍 {loc}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((memory) => (
              <Card
                key={memory.id}
                onClick={() => setSelectedMemory(memory)}
                onContextMenu={(e) => { e.preventDefault(); setActionMemory(memory); }}
                style={{ cursor: 'pointer', borderLeft: `4px solid ${SOURCE_COLORS[memory.source]}` }}
              >
                <LongPressWrapper onLongPress={() => setActionMemory(memory)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {memory.photo_url && (
                      <img src={memory.photo_url} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', marginRight: 12, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                        <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>
                          {new Date(memory.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        {memory.source !== 'manual' && (
                          <span style={{ fontSize: 10, color: T.sage, background: T.paper2, borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>
                            {SOURCE_LABELS[memory.source]}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{memory.text}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginLeft: 12 }}>
                      {memory.favorite && <Star size={14} fill={CONTEXT.envies} color={CONTEXT.envies} />}
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: SOURCE_COLORS[memory.source], flexShrink: 0 }} />
                    </div>
                  </div>
                </LongPressWrapper>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <Card style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ color: T.muted, fontSize: 14 }}>Aucun instant trouvé</p>
            </Card>
          )}
        </>
      )}

      <Button full onClick={onCreateClick}>
        <Plus size={16} style={{ marginRight: 8 }} />
        Créer un instant
      </Button>

      <button
        onClick={openTrash}
        style={{ background: 'none', border: 'none', color: T.muted, fontSize: 12, fontFamily: T.font, cursor: 'pointer', padding: '4px 0' }}
      >
        <Trash2 size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
        Corbeille
      </button>

      <Modal isOpen={!!selectedMemory} onClose={() => setSelectedMemory(null)} title="Instant">
        {selectedMemory && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {selectedMemory.photo_url && (
              <img src={selectedMemory.photo_url} alt="" style={{ width: '100%', maxHeight: 280, borderRadius: T.radius, objectFit: 'cover' }} />
            )}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>
                  {selectedMemory.poetic || new Date(selectedMemory.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <button onClick={() => updateMemory(selectedMemory.id, { favorite: !selectedMemory.favorite })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                  <Star size={18} fill={selectedMemory.favorite ? CONTEXT.envies : 'none'} color={CONTEXT.envies} />
                </button>
              </div>
              <p style={{ fontSize: 16, fontWeight: 500, margin: '8px 0 0 0', lineHeight: 1.5 }}>{selectedMemory.text}</p>
              {selectedMemory.source !== 'manual' && (
                <p style={{ fontSize: 12, color: T.sage, margin: '8px 0 0 0' }}>{SOURCE_LABELS[selectedMemory.source]}</p>
              )}
            </div>
            {selectedMemory.location && (
              <>
                <Divider />
                <div>
                  <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>Lieu</p>
                  <p style={{ fontSize: 14, margin: '4px 0 0 0' }}>{selectedMemory.location}</p>
                </div>
              </>
            )}
            <Button full variant="secondary" onClick={() => { setActionMemory(selectedMemory); setSelectedMemory(null); }}>
              Plus d'actions
            </Button>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!actionMemory} onClose={() => setActionMemory(null)} title="Actions">
        {actionMemory && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <ActionRow icon={<Pencil size={16} />} label="Modifier" onClick={() => { onEditClick?.(actionMemory); setActionMemory(null); }} />
            <ActionRow
              icon={<Star size={16} fill={actionMemory.favorite ? CONTEXT.envies : 'none'} color={CONTEXT.envies} />}
              label={actionMemory.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              onClick={() => { updateMemory(actionMemory.id, { favorite: !actionMemory.favorite }); setActionMemory(null); }}
            />
            <ActionRow icon={<FolderPlus size={16} />} label="Ajouter à une collection" onClick={() => { setCollectionPickerFor(actionMemory); setActionMemory(null); }} />
            <ActionRow icon={<Copy size={16} />} label={copiedFlash ? 'Copié !' : 'Exporter (copier)'} onClick={() => handleExport(actionMemory)} />
            <ActionRow icon={<Trash2 size={16} color="#C0392B" />} label="Supprimer" danger onClick={() => { deleteMemory(actionMemory.id); setActionMemory(null); }} />
          </div>
        )}
      </Modal>

      <Modal isOpen={!!collectionPickerFor} onClose={() => setCollectionPickerFor(null)} title="Collections">
        {collectionPickerFor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {collections.map((c) => {
              const active = (collectionPickerFor.collection_ids || []).includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleMemoryCollection(collectionPickerFor, c.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: T.radius - 6,
                    border: `1px solid ${active ? T.sage : T.border}`, background: active ? `${CONTEXT.instants}22` : 'transparent',
                    cursor: 'pointer', fontFamily: T.font, fontSize: 14, color: T.ink,
                  }}
                >
                  {c.name}
                  {active && <Star size={14} fill={T.sage} color={T.sage} />}
                </button>
              );
            })}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Nouvelle collection..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                style={{ flex: 1, border: `1px solid ${T.border}`, borderRadius: T.radius - 6, padding: '10px 14px', fontFamily: T.font, fontSize: 14, outline: 'none', color: T.ink, background: T.surface }}
              />
              <Button size="sm" onClick={handleCreateCollection}>Créer</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showTrash} onClose={() => setShowTrash(false)} title="Corbeille">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>
            Les instants supprimés restent ici 30 jours avant suppression définitive.
          </p>
          {trashed.length === 0 && <p style={{ fontSize: 13, color: T.muted }}>La corbeille est vide.</p>}
          {trashed.map((m) => (
            <Card key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.75 }}>
              <p style={{ flex: 1, fontSize: 13, margin: 0 }}>{m.text}</p>
              <button onClick={() => restore(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} title="Restaurer">
                <Undo2 size={16} color={T.sage} />
              </button>
            </Card>
          ))}
        </div>
      </Modal>
    </div>
  );
};

const navBtnStyle: React.CSSProperties = {
  background: T.paper2, border: 'none', borderRadius: '50%', width: 40, height: 40,
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
};

const ModeButton: React.FC<{ active: boolean; icon: React.ReactNode; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20,
      border: `1px solid ${active ? CONTEXT.instants : T.border}`,
      background: active ? CONTEXT.instants : 'transparent',
      color: active ? '#fff' : T.muted, fontSize: 12, fontFamily: T.font, fontWeight: 600, cursor: 'pointer',
    }}
  >
    {icon}
    {label}
  </button>
);

const ActionRow: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }> = ({ icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 8px', background: 'none', border: 'none',
      borderBottom: `1px solid ${T.border}`, cursor: 'pointer', fontFamily: T.font, fontSize: 14,
      color: danger ? '#C0392B' : T.ink, textAlign: 'left', width: '100%',
    }}
  >
    {icon}
    {label}
  </button>
);

const LongPressWrapper: React.FC<{ children: React.ReactNode; onLongPress: () => void }> = ({ children, onLongPress }) => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = () => { timer.current = setTimeout(onLongPress, 550); };
  const clear = () => { if (timer.current) clearTimeout(timer.current); };
  return (
    <div onTouchStart={start} onTouchEnd={clear} onTouchMove={clear} onMouseDown={start} onMouseUp={clear} onMouseLeave={clear}>
      {children}
    </div>
  );
};
