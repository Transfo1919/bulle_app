import { create } from 'zustand';
import { Game, GameSession } from '../types';

interface GameStore {
  games: Game[];
  sessions: GameSession[];
  setGames: (games: Game[]) => void;
  setSessions: (sessions: GameSession[]) => void;
  addSession: (session: GameSession) => void;
  getRandomGame: () => Game | null;
}

export const useGameStore = create<GameStore>((set, get) => ({
  games: [],
  sessions: [],
  setGames: (games) => set({ games }),
  setSessions: (sessions) => set({ sessions }),
  addSession: (session) => set((state) => ({ sessions: [session, ...state.sessions] })),
  getRandomGame: () => {
    const games = get().games.filter((g) => g.enabled);
    return games.length ? games[Math.floor(Math.random() * games.length)] : null;
  },
}));
