import { create } from 'zustand';
import { PrayerTopic } from '../types';

interface PrayerStore {
  toPortTopics: PrayerTopic[];
  recognitionTopics: PrayerTopic[];
  setToPortTopics: (topics: PrayerTopic[]) => void;
  setRecognitionTopics: (topics: PrayerTopic[]) => void;
  addToPortTopic: (topic: PrayerTopic) => void;
  addRecognitionTopic: (topic: PrayerTopic) => void;
  markAnswered: (id: string) => void;
  deleteTopic: (id: string, category: 'toport' | 'recognition') => void;
}

export const usePrayerStore = create<PrayerStore>((set) => ({
  toPortTopics: [],
  recognitionTopics: [],
  setToPortTopics: (topics) => set({ toPortTopics: topics }),
  setRecognitionTopics: (topics) => set({ recognitionTopics: topics }),
  addToPortTopic: (topic) => set((state) => ({ toPortTopics: [...state.toPortTopics, topic] })),
  addRecognitionTopic: (topic) => set((state) => ({ recognitionTopics: [...state.recognitionTopics, topic] })),
  markAnswered: (id) =>
    set((state) => ({
      toPortTopics: state.toPortTopics.map((t) =>
        t.id === id ? { ...t, status: 'answered', answered_at: new Date().toISOString() } : t
      ),
    })),
  deleteTopic: (id, category) =>
    set((state) => ({
      toPortTopics: category === 'toport' ? state.toPortTopics.filter((t) => t.id !== id) : state.toPortTopics,
      recognitionTopics: category === 'recognition' ? state.recognitionTopics.filter((t) => t.id !== id) : state.recognitionTopics,
    })),
}));
