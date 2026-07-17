import React, { useEffect, useState } from 'react';
import { Plus, Check, Trash2, Pencil, Image as ImageIcon } from 'lucide-react';
import { useBucketStore } from '../stores/bucketStore';
import { useMemoryStore } from '../stores/memoryStore';
import { Card, Button, Modal, ErrorBanner, Spinner, ActionSheet, LongPressWrapper } from '../components/UI';
import { BucketItem } from '../types';
import { T, CONTEXT } from '../theme';

interface EnviesPageProps {
  onCreateMemoryFor?: (item: BucketItem) => void;
}

const inputStyle: React.CSSProperties = {
  border: `1px solid ${T.border}`,
  borderRadius: T.radius,
  padding: '12px 16px',
  fontFamily: T.font,
  fontSize: 14,
  outline: 'none',
  color: T.ink,
  background: T.surface,
};

export const EnviesPage: React.FC<EnviesPageProps> = ({ onCreateMemoryFor }) => {
  const { items, loading, error, loadItems, addItem, toggleComplete, updateTitle, deleteItem } = useBucketStore();
  const memories = useMemoryStore((state) => state.memories);
  const [newTitle, setNewTitle] = useState('');
  const [newTiming, setNewTiming] = useState<'ce_soir' | 'plus_tard'>('plus_tard');
  const [showAdd, setShowAdd] = useState(false);
  const [actionItem, setActionItem] = useState<BucketItem | null>(null);
  const [editItem, setEditItem] = useState<BucketItem | null>(null);
  const [editTitle, setEditTitle] = useState('');

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

  const openEdit = (item: BucketItem) => {
    setEditItem(item);
    setEditTitle(item.title);
  };

  const handleSaveEdit = async () => {
    if (!editItem || !editTitle.trim()) return;
    await updateTitle(editItem.id, editTitle.trim());
    setEditItem(null);
  };

  const pending = items.filter((i) => !i.completed);
  const ceSoir = pending.filter((i) => i.timing === 'ce_soir');
  const plusTard = pending.filter((i) => i.timing === 'plus_tard');
  const completed = items.filter((i) => i.completed);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 80 }}>
      {error && <ErrorBanner message={error} />}

      {showAdd ? (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" variant={newTiming === 'ce_soir' ? 'primary' : 'ghost'} onClick={() => setNewTiming('ce_soir')} style={newTiming === 'ce_soir' ? { background: CONTEXT.envies } : {}}>
              Ce soir
            </Button>
            <Button size="sm" variant={newTiming === 'plus_tard' ? 'primary' : 'ghost'} onClick={() => setNewTiming('plus_tard')} style={newTiming === 'plus_tard' ? { background: CONTEXT.envies } : {}}>
              Plus tard
            </Button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" placeholder="Une envie..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} autoFocus style={{ flex: 1, ...inputStyle }} />
            <Button size="sm" onClick={handleAdd} style={{ background: CONTEXT.envies }}>Ajouter</Button>
          </div>
        </Card>
      ) : (
        <Button full onClick={() => setShowAdd(true)} style={{ background: CONTEXT.envies }}>
          <Plus size={16} style={{ marginRight: 8 }} />
          Une envie ?
        </Button>
      )}

      {loading && items.length === 0 ? (
        <Spinner label="Chargement des envies..." />
      ) : (
        <>
          {ceSoir.length > 0 && (
            <EnvieGroup title="Ce soir" items={ceSoir} onToggle={handleToggleComplete} onLongPress={setActionItem} />
          )}
          {plusTard.length > 0 && (
            <EnvieGroup title="Plus tard" items={plusTard} onToggle={handleToggleComplete} onLongPress={setActionItem} />
          )}

          {completed.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: T.muted, margin: 0 }}>Réalisé ✓</h3>
              {completed.map((item) => {
                const linkedMemory = memoryForItem(item.id);
                return (
                  <Card key={item.id} onContextMenu={(e) => { e.preventDefault(); setActionItem(item); }} style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.85 }}>
                    <LongPressWrapper onLongPress={() => setActionItem(item)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button
                          onClick={() => handleToggleComplete(item)}
                          style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: CONTEXT.envies, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        >
                          <Check size={14} color="#fff" />
                        </button>
                        <p style={{ flex: 1, fontSize: 14, margin: 0, textDecoration: 'line-through', color: T.ink }}>{item.title}</p>
                      </div>
                      {linkedMemory ? (
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: T.paper2, borderRadius: T.radius - 4, padding: 10, marginTop: 10 }}>
                          {linkedMemory.photo_url ? (
                            <img src={linkedMemory.photo_url} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: T.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <ImageIcon size={16} color={T.muted} />
                            </div>
                          )}
                          <p style={{ fontSize: 12.5, color: T.ink, margin: 0, lineHeight: 1.4 }}>{linkedMemory.text}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => onCreateMemoryFor?.(item)}
                          style={{ background: 'none', border: `1px dashed ${T.border}`, borderRadius: T.radius - 4, padding: '8px 10px', fontSize: 12.5, color: CONTEXT.envies, cursor: 'pointer', fontFamily: T.font, textAlign: 'left', marginTop: 10 }}
                        >
                          + Garder un souvenir de ce moment
                        </button>
                      )}
                    </LongPressWrapper>
                  </Card>
                );
              })}
            </div>
          )}

          {items.length === 0 && (
            <Card style={{ textAlign: 'center', padding: 40, color: T.muted }}>
              Une petite idée aujourd'hui peut devenir un beau souvenir demain.
            </Card>
          )}
        </>
      )}

      <ActionSheet
        isOpen={!!actionItem}
        onClose={() => setActionItem(null)}
        items={
          actionItem
            ? [
                { key: 'edit', icon: <Pencil size={16} />, label: 'Modifier', onClick: () => openEdit(actionItem) },
                { key: 'delete', icon: <Trash2 size={16} color="#C0392B" />, label: 'Supprimer', danger: true, onClick: () => deleteItem(actionItem.id) },
              ]
            : []
        }
      />

      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Modifier l'envie">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} autoFocus style={inputStyle} />
          <div style={{ display: 'flex', gap: 8 }}>
            <Button full variant="secondary" onClick={() => setEditItem(null)}>Annuler</Button>
            <Button full onClick={handleSaveEdit} style={{ background: CONTEXT.envies }}>Enregistrer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

interface EnvieGroupProps {
  title: string;
  items: BucketItem[];
  onToggle: (item: BucketItem) => void;
  onLongPress: (item: BucketItem) => void;
}

const EnvieGroup: React.FC<EnvieGroupProps> = ({ title, items, onToggle, onLongPress }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <h3 style={{ fontSize: 14, fontWeight: 600, color: T.muted, margin: 0 }}>{title}</h3>
    {items.map((item) => (
      <Card key={item.id} onContextMenu={(e) => { e.preventDefault(); onLongPress(item); }} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <LongPressWrapper onLongPress={() => onLongPress(item)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => onToggle(item)}
              style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${CONTEXT.envies}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <Check size={14} color={CONTEXT.envies} style={{ opacity: 0 }} />
            </button>
            <p style={{ flex: 1, fontSize: 14, margin: 0, color: T.ink }}>{item.title}</p>
          </div>
        </LongPressWrapper>
      </Card>
    ))}
  </div>
);
