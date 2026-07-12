import { create } from 'zustand';
import { BucketItem } from '../types';

interface BucketStore {
  items: BucketItem[];
  setItems: (items: BucketItem[]) => void;
  addItem: (item: BucketItem) => void;
  toggleComplete: (id: string) => void;
  deleteItem: (id: string) => void;
}

export const useBucketStore = create<BucketStore>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  toggleComplete: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed, completed_at: !item.completed ? new Date().toISOString() : undefined } : item
      ),
    })),
  deleteItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
}));
