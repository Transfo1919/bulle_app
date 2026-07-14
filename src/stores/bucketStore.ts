import { create } from 'zustand';
import { BucketItem } from '../types';
import { getBucketItems, createBucketItem, toggleBucketItemComplete, deleteBucketItem } from '../services/moduleService';

interface BucketStore {
  items: BucketItem[];
  loading: boolean;
  error: string | null;
  loadItems: () => Promise<void>;
  setItems: (items: BucketItem[]) => void;
  addItem: (title: string, timing: 'ce_soir' | 'plus_tard') => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const useBucketStore = create<BucketStore>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  loadItems: async () => {
    set({ loading: true, error: null });
    try {
      const items = await getBucketItems();
      set({ items, loading: false });
    } catch (e: any) {
      set({ error: e.message || 'Erreur de chargement', loading: false });
    }
  },

  setItems: (items) => set({ items }),

  addItem: async (title, timing) => {
    try {
      const saved = await createBucketItem(title, timing);
      set((state) => ({ items: [saved, ...state.items] }));
    } catch (e: any) {
      set({ error: e.message || "Erreur lors de l'ajout" });
      throw e;
    }
  },

  toggleComplete: async (id) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return;
    const previous = get().items;
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i)),
    }));
    try {
      const saved = await toggleBucketItemComplete(item);
      set((state) => ({ items: state.items.map((i) => (i.id === id ? saved : i)) }));
    } catch (e: any) {
      set({ items: previous, error: e.message || 'Erreur lors de la mise à jour' });
      throw e;
    }
  },

  deleteItem: async (id) => {
    const previous = get().items;
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
    try {
      await deleteBucketItem(id);
    } catch (e: any) {
      set({ items: previous, error: e.message || 'Erreur lors de la suppression' });
      throw e;
    }
  },
}));
