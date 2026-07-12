import React, { useState } from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';
import { useBucketStore } from '../stores/bucketStore';
import { Card, Button, Modal } from '../components/UI';
import { BucketItem } from '../types';

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

export const BucketPage: React.FC = () => {
  const { items, addItem, toggleComplete, deleteItem } = useBucketStore();
  const [newTitle, setNewTitle] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showMemoryPrompt, setShowMemoryPrompt] = useState<BucketItem | null>(null);

  const handleAdd = () => {
    if (newTitle.trim()) {
      addItem({
        id: `bucket_${Date.now()}`,
        title: newTitle.trim(),
        completed: false,
        created_at: new Date().toISOString(),
      });
      setNewTitle('');
      setShowAdd(false);
    }
  };

  const handleToggleComplete = (item: BucketItem) => {
    toggleComplete(item.id);
    if (!item.completed) {
      setShowMemoryPrompt(item);
    }
  };

  const completed = items.filter((i) => i.completed);
  const pending = items.filter((i) => !i.completed);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 80 }}>
      {/* Add Item */}
      {showAdd ? (
        <Card style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Ajouter un rêve..."
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
            }}
          />
          <Button size="sm" onClick={handleAdd}>
            Ajouter
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setNewTitle('');
              setShowAdd(false);
            }}
          >
            Annuler
          </Button>
        </Card>
      ) : (
        <Button full onClick={() => setShowAdd(true)}>
          <Plus size={16} style={{ marginRight: 8 }} />
          Ajouter un rêve
        </Button>
      )}

      {/* Pending Items */}
      {pending.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: T.muted, margin: 0 }}>À réaliser</h3>
          {pending.map((item) => (
            <Card
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
              }}
            >
              <button
                onClick={() => handleToggleComplete(item)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: `2px solid ${T.sage}`,
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check size={14} color={T.sage} style={{ opacity: 0 }} />
              </button>
              <p style={{ flex: 1, fontSize: 14, margin: 0 }}>{item.title}</p>
              <button
                onClick={() => deleteItem(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <Trash2 size={16} color={T.muted} />
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Completed Items */}
      {completed.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: T.muted, margin: 0 }}>Réalisé ✓</h3>
          {completed.map((item) => (
            <Card
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                opacity: 0.6,
              }}
            >
              <button
                onClick={() => handleToggleComplete(item)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: 'none',
                  background: T.sage,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check size={14} color={T.surface} />
              </button>
              <p style={{ flex: 1, fontSize: 14, margin: 0, textDecoration: 'line-through' }}>
                {item.title}
              </p>
              <button
                onClick={() => deleteItem(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <Trash2 size={16} color={T.muted} />
              </button>
            </Card>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <Card style={{ textAlign: 'center', padding: 40, color: T.muted }}>
          Commencez à rêver ensemble...
        </Card>
      )}

      {/* Memory Suggestion Modal */}
      <Modal
        isOpen={!!showMemoryPrompt}
        onClose={() => setShowMemoryPrompt(null)}
      >
        {showMemoryPrompt && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 16, fontWeight: 600 }}>
              Créer un souvenir de "{showMemoryPrompt.title}" ?
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button full onClick={() => setShowMemoryPrompt(null)} variant="secondary">
                Plus tard
              </Button>
              <Button full onClick={() => setShowMemoryPrompt(null)}>
                Créer le souvenir
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
