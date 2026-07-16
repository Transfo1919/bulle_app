import { create } from 'zustand';
import { CustomQuestion, CustomDefi } from '../types';
import {
  getCustomQuestionsRemote,
  createCustomQuestionRemote,
  deleteCustomQuestionRemote,
  getCustomDefisRemote,
  createCustomDefiRemote,
  deleteCustomDefiRemote,
} from '../services/supabase';

interface CustomContentStore {
  questions: CustomQuestion[];
  defis: CustomDefi[];
  loadCustomContent: () => Promise<void>;
  addQuestion: (theme: string, question: string) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  addDefi: (text: string) => Promise<void>;
  deleteDefi: (id: string) => Promise<void>;
}

export const useCustomContentStore = create<CustomContentStore>((set, get) => ({
  questions: [],
  defis: [],
  loadCustomContent: async () => {
    try {
      const [questions, defis] = await Promise.all([getCustomQuestionsRemote(), getCustomDefisRemote()]);
      set({ questions, defis });
    } catch {
      /* silencieux */
    }
  },
  addQuestion: async (theme, question) => {
    try {
      const saved = await createCustomQuestionRemote({ theme, question, created_at: new Date().toISOString() });
      set((state) => ({ questions: [saved, ...state.questions] }));
    } catch {
      /* silencieux */
    }
  },
  deleteQuestion: async (id) => {
    const previous = get().questions;
    set((state) => ({ questions: state.questions.filter((q) => q.id !== id) }));
    try {
      await deleteCustomQuestionRemote(id);
    } catch {
      set({ questions: previous });
    }
  },
  addDefi: async (text) => {
    try {
      const saved = await createCustomDefiRemote({ text, created_at: new Date().toISOString() });
      set((state) => ({ defis: [saved, ...state.defis] }));
    } catch {
      /* silencieux */
    }
  },
  deleteDefi: async (id) => {
    const previous = get().defis;
    set((state) => ({ defis: state.defis.filter((d) => d.id !== id) }));
    try {
      await deleteCustomDefiRemote(id);
    } catch {
      set({ defis: previous });
    }
  },
}));
