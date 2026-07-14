import { create } from 'zustand';
import { Memory, Collection } from '../types';
import { getMemories, createMemory, updateMemory as updateMemoryRemote, deleteMemory as deleteMemoryRemote } from '../services/supabase';

interface MemoryStore {
  memories: Memory[];
  collections: Collection[];
  loading: boolean;
  error: string | null;
  loadMemories: () => Promise<void>;
  setMemories: (memories: Memory[]) => void;
  addMemory: (memory: Memory) => Promise<void>;
  updateMemory: (id: string, memory: Partial<Memory>) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  setCollections: (collections: Collection[]) => void;
  addCollection: (collection: Collection) => void;
}

export const useMemoryStore = create<MemoryStore>((set, get) => ({
  memories: [],
  collections: [],
  loading: false,
  error: null,

  loadMemories: async () => {
    set({ loading: true, error: null });
    try {
      const memories = await getMemories();
      set({ memories, loading: false });
    } catch (e: any) {
      set({ error: e.message || 'Erreur de chargement', loading: false });
    }
  },

  setMemories: (memories) => set({ memories }),

  addMemory: async (memory) => {
    // optimistic update
    set((state) => ({ memories: [memory, ...state.memories] }));
    try {
      const saved = await createMemory(memory);
      set((state) => ({
        memories: state.memories.map((m) => (m.id === memory.id ? saved : m)),
      }));
    } catch (e: any) {
      // rollback on failure
      set((state) => ({
        memories: state.memories.filter((m) => m.id !== memory.id),
        error: e.message || "Erreur lors de l'enregistrement",
      }));
      throw e;
    }
  },

  updateMemory: async (id, memory) => {
    const previous = get().memories;
    set((state) => ({
      memories: state.memories.map((m) => (m.id === id ? { ...m, ...memory } : m)),
    }));
    try {
      await updateMemoryRemote(id, memory);
    } catch (e: any) {
      set({ memories: previous, error: e.message || 'Erreur lors de la mise à jour' });
      throw e;
    }
  },

  deleteMemory: async (id) => {
    const previous = get().memories;
    set((state) => ({ memories: state.memories.filter((m) => m.id !== id) }));
    try {
      await deleteMemoryRemote(id);
    } catch (e: any) {
      set({ memories: previous, error: e.message || 'Erreur lors de la suppression' });
      throw e;
    }
  },

  setCollections: (collections) => set({ collections }),
  addCollection: (collection) => set((state) => ({ collections: [collection, ...state.collections] })),
}));
