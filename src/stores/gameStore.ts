import { create } from 'zustand';
import { Game, GameSession } from '../types';
import { createGameSession as createGameSessionRemote } from '../services/moduleService';

interface GameStore {
  games: Game[];
  sessions: GameSession[];
  setGames: (games: Game[]) => void;
  setSessions: (sessions: GameSession[]) => void;
  logSession: (gameId: string, summary?: string) => Promise<void>;
  getRandomGame: () => Game | null;
}

export const useGameStore = create<GameStore>((set, get) => ({
  games: [],
  sessions: [],
  setGames: (games) => set({ games }),
  setSessions: (sessions) => set({ sessions }),
  logSession: async (gameId, summary) => {
    try {
      const saved = await createGameSessionRemote(gameId, summary);
      set((state) => ({ sessions: [saved, ...state.sessions] }));
    } catch {
      // Session logging is best-effort; a failed log shouldn't block play.
    }
  },
  getRandomGame: () => {
    const games = get().games.filter((g) => g.enabled);
    return games.length ? games[Math.floor(Math.random() * games.length)] : null;
  },
}));
