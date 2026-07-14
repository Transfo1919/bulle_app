import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Check, Archive } from 'lucide-react';
import { usePrayerStore } from '../stores/prayerStore';
import { Card, Button, Modal, Divider } from '../components/UI';
import { PrayerTopic } from '../types';
import { getRandomPrayerTopics, isPrayerTopicArchived } from '../services/moduleService';
import { T, CONTEXT } from '../theme';

interface PrayerPageProps {
  onCreateMemoryFor?: (topic: PrayerTopic) => void;
}

export const PrayerPage: React.FC<PrayerPageProps> = ({ onCreateMemoryFor }) => {
  const { topics, loadTopics, addToPortTopic, addRecognitionTopic, markAnswered, deleteTopic } =
    usePrayerStore();

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  const enCoursTopics = topics.filter((t) => t.category === 'toport');
  const recognitionTopics = topics.filter(
    (t) => t.category === 'recognition' && !isPrayerTopicArchived(t)
  );
  const archivedTopics = topics.filter(
    (t) => t.category === 'recognition' && isPrayerTopicArchived(t)
  );

  const [newTitle, setNewTitle] = useState('');
  const [category, setCategory] = useState<'toport' | 'recognition'>('toport');
  const [showAdd, setShowAdd] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [prayTogether, setPrayTogether] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<PrayerTopic[]>([]);
  const [justAnswered, setJustAnswered] = useState<PrayerTopic | null>(null);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    if (category === 'toport') {
      await addToPortTopic(newTitle.trim());
    } else {
      await addRecognitionTopic(newTitle.trim());
    }
    setNewTitle('');
    setShowAdd(false);
  };

  const handleMarkAnswered = async (topic: PrayerTopic) => {
    await markAnswered(topic.id);
    setJustAnswered(topic);
  };

  const handlePrayTogether = () => {
    const pool = [...enCoursTopics, ...recognitionTopics];
    if (pool.length > 0) {
      setSelectedTopics(getRandomPrayerTopics(pool, Math.min(3, pool.length)));
      setPrayTogether(true);
    }
  };

  const allTopics = enCoursTopics.length + recognitionTopics.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 80 }}>
      {allTopics > 0 && (
        <Button full onClick={handlePrayTogether} style={{ background: CONTEXT.priere }}>
          Prier ensemble
        </Button>
      )}

      {showAdd ? (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              size="sm"
              variant={category === 'toport' ? 'primary' : 'ghost'}
              onClick={() => setCategory('toport')}
              style={category === 'toport' ? { background: CONTEXT.priere } : {}}
            >
              En cours
            </Button>
            <Button
              size="sm"
              variant={category === 'recognition' ? 'primary' : 'ghost'}
              onClick={() => setCategory('recognition')}
              style={category === 'recognition' ? { background: CONTEXT.priere } : {}}
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
              color: T.ink,
              background: T.surface,
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" onClick={handleAdd} style={{ background: CONTEXT.priere }}>
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
        <Button full onClick={() => setShowAdd(true)} style={{ background: CONTEXT.priere }}>
          <Plus size={16} style={{ marginRight: 8 }} />
          Ajouter un sujet
        </Button>
      )}

      {enCoursTopics.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: T.muted, margin: '0 0 12px 0' }}>
            En cours
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {enCoursTopics.map((topic) => (
              <Card key={topic.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => handleMarkAnswered(topic)}
                  title="Marquer comme exaucé"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    border: `2px solid ${CONTEXT.priere}`,
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Check size={14} color={CONTEXT.priere} style={{ opacity: 0 }} />
                </button>
                <p style={{ flex: 1, fontSize: 14, margin: 0, color: T.ink }}>{topic.title}</p>
                <button
                  onClick={() => deleteTopic(topic.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <Trash2 size={16} color={T.muted} />
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

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
                    background: CONTEXT.priere,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={14} color="#fff" />
                </div>
                <p style={{ flex: 1, fontSize: 14, margin: 0, color: T.ink }}>{topic.title}</p>
                <button
                  onClick={() => deleteTopic(topic.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
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

      {archivedTopics.length > 0 && (
        <button
          onClick={() => setShowArchive(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: T.muted,
            fontSize: 12,
            fontFamily: T.font,
            padding: '4px 0',
          }}
        >
          <Archive size={14} />
          {archivedTopics.length} sujet{archivedTopics.length > 1 ? 's' : ''} archivé
          {archivedTopics.length > 1 ? 's' : ''} (30j+)
        </button>
      )}

      <Modal isOpen={prayTogether} onClose={() => setPrayTogether(false)} title="Prier ensemble">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedTopics.map((topic) => (
            <div key={topic.id}>
              <p style={{ fontSize: 11, color: T.muted, margin: '0 0 2px 0', textTransform: 'uppercase' }}>
                {topic.category === 'toport' ? 'En cours' : 'Reconnaissance'}
              </p>
              <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: T.ink }}>{topic.title}</p>
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

      <Modal isOpen={!!justAnswered} onClose={() => setJustAnswered(null)} title="Prière exaucée 🙏">
        {justAnswered && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 15, margin: 0, color: T.ink }}>
              "{justAnswered.title}" a rejoint votre reconnaissance.
            </p>
            <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
              Envie d'en garder un souvenir ?
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button full variant="secondary" onClick={() => setJustAnswered(null)}>
                Plus tard
              </Button>
              <Button
                full
                style={{ background: CONTEXT.priere }}
                onClick={() => {
                  onCreateMemoryFor?.(justAnswered);
                  setJustAnswered(null);
                }}
              >
                Créer le souvenir
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showArchive} onClose={() => setShowArchive(false)} title="Archives">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {archivedTopics.map((topic) => (
            <Card key={topic.id} style={{ opacity: 0.7 }}>
              <p style={{ fontSize: 14, margin: 0, color: T.ink }}>{topic.title}</p>
              {topic.answered_at && (
                <p style={{ fontSize: 11, color: T.muted, margin: '4px 0 0 0' }}>
                  Exaucé le{' '}
                  {new Date(topic.answered_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </Card>
          ))}
        </div>
      </Modal>
    </div>
  );
};
