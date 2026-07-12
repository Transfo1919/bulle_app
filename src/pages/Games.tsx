import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { Card, Button } from '../components/UI';
import * as Icons from 'lucide-react';

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

interface GamesPageProps {
  onGameClick?: (gameId: string) => void;
}

export const GamesPage: React.FC<GamesPageProps> = ({ onGameClick }) => {
  const games = useGameStore((state) => state.games);
  const getRandomGame = useGameStore((state) => state.getRandomGame);

  const handleRandomGame = () => {
    const randomGame = getRandomGame();
    if (randomGame && onGameClick) {
      onGameClick(randomGame.id);
    }
  };

  const enabledGames = games.filter((g) => g.enabled);

  const getIconComponent = (iconName: string) => {
    const icon = Icons[iconName as keyof typeof Icons];
    return icon || Icons.Gamepad2;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 80 }}>
      {/* Random Game Button */}
      <Button
        full
        onClick={handleRandomGame}
        style={{
          background: T.sage,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Icons.Shuffle size={16} />
        Jeu aléatoire
      </Button>

      {/* Games Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        {enabledGames.map((game) => {
          const IconComponent = getIconComponent(game.icon);
          return (
            <Card
              key={game.id}
              onClick={() => onGameClick?.(game.id)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 12,
                padding: 20,
              }}
            >
              <IconComponent size={32} color={T.sage} />
              <h3 style={{ fontSize: 13, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>
                {game.name}
              </h3>
              <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>
                {game.description}
              </p>
            </Card>
          );
        })}
      </div>

      {enabledGames.length === 0 && (
        <Card style={{ textAlign: 'center', padding: 40, color: T.muted }}>
          Aucun jeu disponible pour le moment
        </Card>
      )}

      {/* Info */}
      <Card style={{ background: T.paper2, textAlign: 'center', fontSize: 12, color: T.muted }}>
        À la fin d'une partie, proposez de créer un souvenir !
      </Card>
    </div>
  );
};
