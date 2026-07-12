import React from 'react';
import { Image, Gamepad2, Gift, Heart, Plus } from 'lucide-react';
import { useMemoryStore } from '../stores/memoryStore';
import { useGameStore } from '../stores/gameStore';
import { Card, Button } from '../components/UI';

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

interface HomeProps {
  onNavigate: (tab: string) => void;
}

export const HomePage: React.FC<HomeProps> = ({ onNavigate }) => {
  const memories = useMemoryStore((state) => state.memories);
  const games = useGameStore((state) => state.games);
  const getRandomGame = useGameStore((state) => state.getRandomGame);

  const featuredMemory = memories[0];
  const randomGame = getRandomGame();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        paddingBottom: 80,
      }}
    >
      {/* Featured Memory */}
      {featuredMemory && (
        <Card
          onClick={() => onNavigate('souvenirs')}
          style={{
            background: 'linear-gradient(135deg,#C9D8C5 0%,#A8C2B5 100%)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <div style={{ color: T.surface }}>
            <p style={{ fontSize: 12, opacity: 0.8, margin: 0 }}>Dernier souvenir</p>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: '8px 0' }}>
              {featuredMemory.title || featuredMemory.text.substring(0, 40)}
            </h3>
          </div>
        </Card>
      )}

      {/* Quick Navigation */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        <Card
          onClick={() => onNavigate('souvenirs')}
          style={{
            textAlign: 'center',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Image size={28} color={T.sage} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>Souvenirs</span>
          <span style={{ fontSize: 11, color: T.muted }}>{memories.length}</span>
        </Card>

        <Card
          onClick={() => onNavigate('jeux')}
          style={{
            textAlign: 'center',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Gamepad2 size={28} color={T.sage} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>Jeux</span>
          <span style={{ fontSize: 11, color: T.muted }}>{games.length}</span>
        </Card>

        <Card
          onClick={() => onNavigate('bucket')}
          style={{
            textAlign: 'center',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Gift size={28} color={T.sage} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>Bucket</span>
        </Card>

        <Card
          onClick={() => onNavigate('priere')}
          style={{
            textAlign: 'center',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Heart size={28} color={T.sage} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>Prière</span>
        </Card>
      </div>

      {/* Random Game Button */}
      {randomGame && (
        <Button
          full
          onClick={() => onNavigate('jeux')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Gamepad2 size={16} />
          Jeu aléatoire
        </Button>
      )}

      {/* Create Memory Button */}
      <Button
        full
        onClick={() => onNavigate('souvenirs')}
        variant="secondary"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Plus size={16} />
        Créer un souvenir
      </Button>
    </div>
  );
};
