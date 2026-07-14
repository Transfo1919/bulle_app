import React, { useEffect, useState } from 'react';
import { Plus, Check, Trash2, Image as ImageIcon } from 'lucide-react';
import { useBucketStore } from '../stores/bucketStore';
import { useMemoryStore } from '../stores/memoryStore';
import { Card, Button } from '../components/UI';
import { BucketItem } from '../types';
import { T, CONTEXT } from '../theme';

interface BucketPageProps {
  onCreateMemoryFor?: (item: BucketItem) => void;
}

export const BucketPage: React.FC<BucketPageProps> = ({ onCreateMemoryFor }) => {
  const { items, loadItems, addItem, toggleComplete, deleteItem } = useBucketStore();
  const memories = useMemoryStore((state) => state.memories);
  const [newTitle, setNewTitle] = useState('');
  const [newTiming, setNewTiming] = useState<'ce_soir' | 'plus_tard'>('plus_tard');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const memoryForItem = (itemId: string) =>
    memories.find((m) => m.source === 'bucket' && m.source_id === itemId);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await addItem(newTitle.trim(), newTiming);
    setNewTitle('');
    setShowAdd(false);
  };

  const handleToggleComplete = async (item: BucketItem) => {
    const willComplete = !item.completed;
    await toggleComplete(item.id);
    if (willComplete && !memoryForItem(item.id)) {
      onCreateMemoryFor?.(item);
    }
  };

  const pending = items.filter((i) => !i.completed);
  const ceSoir = pending.filter((i) => i.timing === 'ce_soir');
  const plusTard = pending.filter((i) => i.timing === 'plus_tard');
  const completed = items.filter((i) => i.completed);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 80 }}>
      {showAdd ? (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              size="sm"
              variant={newTiming === 'ce_soir' ? 'primary' : 'ghost'}
              onClick={() => setNewTiming('ce_soir')}
              style={newTiming === 'ce_soir' ? { background: CONTEXT.envies } : {}}
            >
              Ce soir
            </Button>
            <Button
              size="sm"
              variant={newTiming === 'plus_tard' ? 'primary' : 'ghost'}
              onClick={() => setNewTiming('plus_tard')}
              style={newTiming === 'plus_tard' ? { background: CONTEXT.envies } : {}}
            >
              Plus tard
            </Button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Une envie..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
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
            <Button size="sm" onClick={handleAdd} style={{ background: CONTEXT.envies }}>
              Ajouter
            </Button>
          </div>
        </Card>
      ) : (
        <Button full onClick={() => setShowAdd(true)} style={{ background: CONTEXT.envies }}>
          <Plus size={16} style={{ marginRight: 8 }} />
          Une envie ?
        </Button>
      )}

      {ceSoir.length > 0 && (
        <EnvieGroup
          title="Ce soir"
          items={ceSoir}
          onToggle={handleToggleComplete}
          onDelete={deleteItem}
        />
      )}

      {plusTard.length > 0 && (
        <EnvieGroup
          title="Plus tard"
          items={plusTard}
          onToggle={handleToggleComplete}
          onDelete={deleteItem}
        />
      )}

      {completed.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: T.muted, margin: 0 }}>Réalisé ✓</h3>
          {completed.map((item) => {
            const linkedMemory = memoryForItem(item.id);
            return (
              <Card key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.85 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={() => handleToggleComplete(item)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: 'none',
                      background: CONTEXT.envies,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={14} color="#fff" />
                  </button>
                  <p style={{ flex: 1, fontSize: 14, margin: 0, textDecoration: 'line-through', color: T.ink }}>
                    {item.title}
                  </p>
                  <button
                    onClick={() => deleteItem(item.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                  >
                    <Trash2 size={16} color={T.muted} />
                  </button>
                </div>

                {linkedMemory ? (
                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                      background: T.paper2,
                      borderRadius: T.radius - 4,
                      padding: 10,
                    }}
                  >
                    {linkedMemory.photo_url ? (
                      <img
                        src={linkedMemory.photo_url}
                        alt=""
                        style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: T.border,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <ImageIcon size={16} color={T.muted} />
                      </div>
                    )}
                    <p style={{ fontSize: 12.5, color: T.ink, margin: 0, lineHeight: 1.4 }}>
                      {linkedMemory.text}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => onCreateMemoryFor?.(item)}
                    style={{
                      background: 'none',
                      border: `1px dashed ${T.border}`,
                      borderRadius: T.radius - 4,
                      padding: '8px 10px',
                      fontSize: 12.5,
                      color: CONTEXT.envies,
                      cursor: 'pointer',
                      fontFamily: T.font,
                      textAlign: 'left',
                    }}
                  >
                    + Garder un souvenir de ce moment
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {items.length === 0 && (
        <Card style={{ textAlign: 'center', padding: 40, color: T.muted }}>
          Commencez à rêver ensemble...
        </Card>
      )}
    </div>
  );
};

interface EnvieGroupProps {
  title: string;
  items: BucketItem[];
  onToggle: (item: BucketItem) => void;
  onDelete: (id: string) => void;
}

const EnvieGroup: React.FC<EnvieGroupProps> = ({ title, items, onToggle, onDelete }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <h3 style={{ fontSize: 14, fontWeight: 600, color: T.muted, margin: 0 }}>{title}</h3>
    {items.map((item) => (
      <Card key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => onToggle(item)}
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: `2px solid ${CONTEXT.envies}`,
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Check size={14} color={CONTEXT.envies} style={{ opacity: 0 }} />
        </button>
        <p style={{ flex: 1, fontSize: 14, margin: 0, color: T.ink }}>{item.title}</p>
        <button
          onClick={() => onDelete(item.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <Trash2 size={16} color={T.muted} />
        </button>
      </Card>
    ))}
  </div>
);
