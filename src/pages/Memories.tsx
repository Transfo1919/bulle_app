import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useMemoryStore } from '../stores/memoryStore';
import { Card, Button, Modal, Divider } from '../components/UI';
import { Memory, Mood } from '../types';

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

const MOOD_COLORS = {
  soleil: '#D4924A',
  calme: T.sage,
  gris: '#8E8E93',
  tempete: '#7B7FC4',
};

interface MemoriesPageProps {
  onCreateClick: () => void;
}

export const MemoriesPage: React.FC<MemoriesPageProps> = ({ onCreateClick }) => {
  const memories = useMemoryStore((state) => state.memories);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [filterMood, setFilterMood] = useState<Mood | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = memories.filter((m) => {
    if (filterMood && m.mood !== filterMood) return false;
    if (searchTerm && !m.text.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

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
          placeholder="Chercher un souvenir..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontFamily: T.font,
            fontSize: 14,
            outline: 'none',
          }}
        />
      </div>

      {/* Mood Filters */}
      <div style={{ display: 'flex', gap: 8, overflow: 'auto', paddingBottom: 8 }}>
        <Button
          size="sm"
          variant={filterMood === null ? 'primary' : 'ghost'}
          onClick={() => setFilterMood(null)}
        >
          Tous
        </Button>
        {(Object.keys(MOOD_COLORS) as Mood[]).map((mood) => (
          <Button
            key={mood}
            size="sm"
            variant={filterMood === mood ? 'primary' : 'ghost'}
            onClick={() => setFilterMood(mood)}
            style={{
              background:
                filterMood === mood ? MOOD_COLORS[mood] : 'transparent',
              color: filterMood === mood ? T.surface : MOOD_COLORS[mood],
            }}
          >
            {mood}
          </Button>
        ))}
      </div>

      {/* Memories List */}
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
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: T.muted, margin: '0 0 4px 0' }}>
                  {new Date(memory.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>
                  {memory.text}
                </p>
              </div>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: MOOD_COLORS[memory.mood],
                  marginLeft: 12,
                  flexShrink: 0,
                }}
              />
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: T.muted, fontSize: 14 }}>Aucun souvenir trouvé</p>
        </Card>
      )}

      {/* Create Button */}
      <Button full onClick={onCreateClick}>
        <Plus size={16} style={{ marginRight: 8 }} />
        Nouveau souvenir
      </Button>

      {/* Memory Detail Modal */}
      <Modal
        isOpen={!!selectedMemory}
        onClose={() => setSelectedMemory(null)}
        title="Souvenir"
      >
        {selectedMemory && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>
                {new Date(selectedMemory.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p style={{ fontSize: 16, fontWeight: 500, margin: '8px 0 0 0', lineHeight: 1.5 }}>
                {selectedMemory.text}
              </p>
            </div>

            {selectedMemory.location && (
              <>
                <Divider />
                <div>
                  <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>Localisation</p>
                  <p style={{ fontSize: 14, margin: '4px 0 0 0' }}>{selectedMemory.location}</p>
                </div>
              </>
            )}

            {selectedMemory.collection_id && (
              <>
                <Divider />
                <div>
                  <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>Collection</p>
                  <p style={{ fontSize: 14, margin: '4px 0 0 0' }}>{selectedMemory.collection_id}</p>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
