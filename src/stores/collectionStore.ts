import { create } from 'zustand';
import { Collection } from '../types';
import { getCollectionsRemote, createCollectionRemote, deleteCollectionRemote } from '../services/supabase';

interface CollectionStore {
  collections: Collection[];
  loadCollections: () => Promise<void>;
  addCollection: (name: string) => Promise<Collection | null>;
  deleteCollection: (id: string) => Promise<void>;
}

export const useCollectionStore = create<CollectionStore>((set, get) => ({
  collections: [],
  loadCollections: async () => {
    try {
      const collections = await getCollectionsRemote();
      set({ collections });
    } catch {
      /* silencieux : les collections restent une fonctionnalité secondaire */
    }
  },
  addCollection: async (name) => {
    try {
      const saved = await createCollectionRemote({ name, created_at: new Date().toISOString() });
      set((state) => ({ collections: [saved, ...state.collections] }));
      return saved;
    } catch {
      return null;
    }
  },
  deleteCollection: async (id) => {
    const previous = get().collections;
    set((state) => ({ collections: state.collections.filter((c) => c.id !== id) }));
    try {
      await deleteCollectionRemote(id);
    } catch {
      set({ collections: previous });
    }
  },
}));
