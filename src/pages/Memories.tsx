import React, { useMemo, useState } from 'react';
import { Plus, Search, Shuffle, Clock, CalendarDays, Star } from 'lucide-react';
import { useMemoryStore } from '../stores/memoryStore';
import { Card, Button, Modal, Divider } from '../components/UI';
import { Memory } from '../types';
import { T, CONTEXT } from '../theme';

const MOOD_COLORS: Record<string, string> = {
  soleil: '#D4924A',
  calme: T.sage,
  gris: '#8E8E93',
  tempete: '#7B7FC4',
};

const SOURCE_LABELS: Record<string, string> = {
  game: 'Lié à un moment à deux',
  bucket: 'Lié à une envie',
  prayer: 'Lié à une prière',
};

type ViewMode = 'aleatoire' | 'recents' | 'chrono';
type SourceFilter = 'tous' | 'photos' | 'adeux' | 'envies' | 'priere' | 'libres' | 'favoris';

interface MemoriesPageProps {
  onCreateClick: () => void;
}

export const MemoriesPage: React.FC<MemoriesPageProps> = ({ onCreateClick }) => {
  const memories = useMemoryStore((state) => state.memories);
  const toggleFavorite = useMemoryStore((state) => state.updateMemory);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('aleatoire');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('tous');
  const [searchTerm, setSearchTerm] = useState('');

  // L'ordre aléatoire est figé au montage pour ne pas re-mélanger à chaque frappe de recherche.
  const randomOrder = useMemo(
    () => [...memories].sort(() => Math.random() - 0.5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [memories.length]
  );

  const filtered = useMemo(() => {
    let base =
      viewMode === 'aleatoire'
        ? randomOrder
        : viewMode === 'recents'
        ? [...memories].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        : [...memories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return base.filter((m) => {
      if (searchTerm && !m.text.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      switch (sourceFilter) {
        case 'photos':
          return !!m.photo_url;
        case 'adeux':
          return m.source === 'game';
        case 'envies':
          return m.source === 'bucket';
        case 'priere':
          return m.source === 'prayer';
        case 'libres':
          return m.source === 'manual';
        case 'favoris':
          return !!m.favorite;
        default:
          return true;
      }
    });
  }, [viewMode, randomOrder, memories, searchTerm, sourceFilter]);

  const FILTERS: { id: SourceFilter; label: string }[] = [
    { id: 'tous', label: 'Tous' },
    { id: 'favoris', label: 'Favoris' },
    { id: 'photos', label: 'Photos' },
    { id: 'adeux', label: 'À deux' },
    { id: 'envies', label: 'Envies' },
    { id: 'priere', label: 'Prière' },
    { id: 'libres', label: 'Libres' },
  ];

  const VIEW_MODES: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'aleatoire', label: 'Aléatoire', icon: <Shuffle size={14} /> },
    { id: 'recents', label: 'Plus récents', icon: <Clock size={14} /> },
    { id: 'chrono', label: 'Chronologique', icon: <CalendarDays size={14} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 80 }}>
      {/* Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          background: T.paper2,
          borderRadius: T.radius,
          padding: '12px 16px',
          alignItems: 'center',
        }}
      >
        <Search size={16} color={T.muted} />
        <input
          type="text"
          placeholder="Chercher un instant..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontFamily: T.font,
            fontSize: 14,
            outline: 'none',
            color: T.ink,
          }}
        />
      </div>

      {/* View mode */}
      <div style={{ display: 'flex', gap: 6 }}>
        {VIEW_MODES.map((v) => (
          <button
            key={v.id}
            onClick={() => setViewMode(v.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 20,
              border: `1px solid ${viewMode === v.id ? CONTEXT.instants : T.border}`,
              background: viewMode === v.id ? CONTEXT.instants : 'transparent',
              color: viewMode === v.id ? '#fff' : T.muted,
              fontSize: 12,
              fontFamily: T.font,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {v.icon}
            {v.label}
          </button>
        ))}
      </div>

      {/* Source Filters */}
      <div style={{ display: 'flex', gap: 8, overflow: 'auto', paddingBottom: 4 }}>
        {FILTERS.map((f) => (
          <Button
            key={f.id}
            size="sm"
            variant={sourceFilter === f.id ? 'primary' : 'ghost'}
            onClick={() => setSourceFilter(f.id)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Instants List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((memory) => (
          <Card
            key={memory.id}
            onClick={() => setSelectedMemory(memory)}
            style={{
              cursor: 'pointer',
              borderLeft: `4px solid ${MOOD_COLORS[memory.mood]}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              {memory.photo_url && (
                <img
                  src={memory.photo_url}
                  alt=""
                  style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', marginRight: 12, flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                  <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>
                    {new Date(memory.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  {memory.source !== 'manual' && (
                    <span
                      style={{
                        fontSize: 10,
                        color: T.sage,
                        background: T.paper2,
                        borderRadius: 20,
                        padding: '2px 8px',
                        fontWeight: 600,
                      }}
                    >
                      {SOURCE_LABELS[memory.source]}
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>
                  {memory.text}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginLeft: 12 }}>
                {memory.favorite && <Star size={14} fill={CONTEXT.envies} color={CONTEXT.envies} />}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: MOOD_COLORS[memory.mood],
                    flexShrink: 0,
                  }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: T.muted, fontSize: 14 }}>Aucun instant trouvé</p>
        </Card>
      )}

      {/* Create Button */}
      <Button full onClick={onCreateClick}>
        <Plus size={16} style={{ marginRight: 8 }} />
        Créer un instant
      </Button>

      {/* Instant Detail Modal */}
      <Modal isOpen={!!selectedMemory} onClose={() => setSelectedMemory(null)} title="Instant">
        {selectedMemory && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {selectedMemory.photo_url && (
              <img
                src={selectedMemory.photo_url}
                alt=""
                style={{ width: '100%', maxHeight: 280, borderRadius: T.radius, objectFit: 'cover' }}
              />
            )}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>
                  {new Date(selectedMemory.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <button
                  onClick={() =>
                    toggleFavorite(selectedMemory.id, { favorite: !selectedMemory.favorite })
                  }
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                >
                  <Star
                    size={18}
                    fill={selectedMemory.favorite ? CONTEXT.envies : 'none'}
                    color={CONTEXT.envies}
                  />
                </button>
              </div>
              <p style={{ fontSize: 16, fontWeight: 500, margin: '8px 0 0 0', lineHeight: 1.5 }}>
                {selectedMemory.text}
              </p>
              {selectedMemory.source !== 'manual' && (
                <p style={{ fontSize: 12, color: T.sage, margin: '8px 0 0 0' }}>
                  {SOURCE_LABELS[selectedMemory.source]}
                </p>
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
          </div>
        )}
      </Modal>
    </div>
  );
};
