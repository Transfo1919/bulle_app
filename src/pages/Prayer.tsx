import React, { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { usePrayerStore } from '../stores/prayerStore';
import { Card, Button, Modal, Divider } from '../components/UI';
import { PrayerTopic } from '../types';
import { getRandomPrayerTopics } from '../services/moduleService';

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

export const PrayerPage: React.FC = () => {
  const {
    toPortTopics,
    recognitionTopics,
    addToPortTopic,
    addRecognitionTopic,
    markAnswered,
    deleteTopic,
  } = usePrayerStore();

  const [newTitle, setNewTitle] = useState('');
  const [category, setCategory] = useState<'toport' | 'recognition'>('toport');
  const [showAdd, setShowAdd] = useState(false);
  const [prayTogether, setPrayTogether] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<PrayerTopic[]>([]);

  const handleAdd = () => {
    if (newTitle.trim()) {
      const topic: PrayerTopic = {
        id: `prayer_${Date.now()}`,
        title: newTitle.trim(),
        type: 'ponctuel',
        status: 'active',
        created_at: new Date().toISOString(),
      };

      if (category === 'toport') {
        addToPortTopic(topic);
      } else {
        addRecognitionTopic(topic);
      }

      setNewTitle('');
      setShowAdd(false);
    }
  };

  const handlePrayTogether = () => {
    const allActive = [
      ...toPortTopics.filter((t) => t.status === 'active'),
      ...recognitionTopics,
    ];
    if (allActive.length > 0) {
      setSelectedTopics(getRandomPrayerTopics(allActive, Math.min(3, allActive.length)));
      setPrayTogether(true);
    }
  };

  const allTopics = toPortTopics.length + recognitionTopics.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 80 }}>
      {/* Pray Together Button */}
      {toPortTopics.length > 0 && (
        <Button
          full
          onClick={handlePrayTogether}
          style={{ background: T.sage }}
        >
          Prier ensemble
        </Button>
      )}

      {/* Add Topic */}
      {showAdd ? (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              size="sm"
              variant={category === 'toport' ? 'primary' : 'ghost'}
              onClick={() => setCategory('toport')}
            >
              À porter
            </Button>
            <Button
              size="sm"
              variant={category === 'recognition' ? 'primary' : 'ghost'}
              onClick={() => setCategory('recognition')}
            >
              Reconnaissance
            </Button>
          </div>
          <input
            type="text"
            placeholder="Ajouter un sujet..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
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
          </div>
        </Card>
      ) : (
        <Button full onClick={() => setShowAdd(true)}>
          <Plus size={16} style={{ marginRight: 8 }} />
          Ajouter un sujet
        </Button>
      )}

      {/* À porter */}
      {toPortTopics.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: T.muted, margin: '0 0 12px 0' }}>
            À porter
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {toPortTopics.map((topic) => (
              <Card
                key={topic.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <button
                  onClick={() => markAnswered(topic.id)}
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
                  {topic.status === 'answered' && <Check size={14} color={T.sage} />}
                </button>
                <p style={{ flex: 1, fontSize: 14, margin: 0 }}>{topic.title}</p>
                <button
                  onClick={() => deleteTopic(topic.id, 'toport')}
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
        </div>
      )}

      {/* Reconnaissance */}
      {recognitionTopics.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: T.muted, margin: '0 0 12px 0' }}>
            Reconnaissance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recognitionTopics.map((topic) => (
              <Card key={topic.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: T.sage,
                    flexShrink: 0,
                  }}
                />
                <p style={{ flex: 1, fontSize: 14, margin: 0 }}>{topic.title}</p>
                <button
                  onClick={() => deleteTopic(topic.id, 'recognition')}
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
        </div>
      )}

      {allTopics === 0 && (
        <Card style={{ textAlign: 'center', padding: 40, color: T.muted }}>
          Commencez par ajouter un sujet de prière...
        </Card>
      )}

      {/* Pray Together Modal */}
      <Modal
        isOpen={prayTogether}
        onClose={() => setPrayTogether(false)}
        title="Prier ensemble"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedTopics.map((topic) => (
            <div key={topic.id}>
              <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{topic.title}</p>
              {topic.description && (
                <p style={{ fontSize: 12, color: T.muted, margin: '4px 0 0 0' }}>
                  {topic.description}
                </p>
              )}
            </div>
          ))}
          <Divider />
          <Button full onClick={() => setPrayTogether(false)}>
            Fermer
          </Button>
        </div>
      </Modal>
    </div>
  );
};
