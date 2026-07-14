import { create } from 'zustand';
import { PrayerTopic } from '../types';
import { getPrayerTopics, createPrayerTopic, markPrayerAnswered, deletePrayerTopic } from '../services/moduleService';

interface PrayerStore {
  topics: PrayerTopic[];
  loading: boolean;
  error: string | null;
  loadTopics: () => Promise<void>;
  setTopics: (topics: PrayerTopic[]) => void;
  addToPortTopic: (title: string) => Promise<void>;
  addRecognitionTopic: (title: string) => Promise<void>;
  markAnswered: (id: string) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
}

export const usePrayerStore = create<PrayerStore>((set, get) => ({
  topics: [],
  loading: false,
  error: null,

  loadTopics: async () => {
    set({ loading: true, error: null });
    try {
      const topics = await getPrayerTopics();
      set({ topics, loading: false });
    } catch (e: any) {
      set({ error: e.message || 'Erreur de chargement', loading: false });
    }
  },

  setTopics: (topics) => set({ topics }),

  addToPortTopic: async (title) => {
    try {
      const saved = await createPrayerTopic(title, 'toport');
      set((state) => ({ topics: [saved, ...state.topics] }));
    } catch (e: any) {
      set({ error: e.message || "Erreur lors de l'ajout" });
      throw e;
    }
  },

  addRecognitionTopic: async (title) => {
    try {
      const saved = await createPrayerTopic(title, 'recognition');
      set((state) => ({ topics: [saved, ...state.topics] }));
    } catch (e: any) {
      set({ error: e.message || "Erreur lors de l'ajout" });
      throw e;
    }
  },

  markAnswered: async (id) => {
    const topic = get().topics.find((t) => t.id === id);
    if (!topic) return;
    const previous = get().topics;
    set((state) => ({
      topics: state.topics.map((t) =>
        t.id === id ? { ...t, status: 'answered' as const, category: 'recognition' as const } : t
      ),
    }));
    try {
      const saved = await markPrayerAnswered(topic);
      set((state) => ({ topics: state.topics.map((t) => (t.id === id ? saved : t)) }));
    } catch (e: any) {
      set({ topics: previous, error: e.message || 'Erreur lors de la mise à jour' });
      throw e;
    }
  },

  deleteTopic: async (id) => {
    const previous = get().topics;
    set((state) => ({ topics: state.topics.filter((t) => t.id !== id) }));
    try {
      await deletePrayerTopic(id);
    } catch (e: any) {
      set({ topics: previous, error: e.message || 'Erreur lors de la suppression' });
      throw e;
    }
  },
}));
