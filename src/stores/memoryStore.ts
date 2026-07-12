import { create } from 'zustand';
import { Memory, Collection } from '../types';

interface MemoryStore {
  memories: Memory[];
  collections: Collection[];
  setMemories: (memories: Memory[]) => void;
  addMemory: (memory: Memory) => void;
  updateMemory: (id: string, memory: Partial<Memory>) => void;
  deleteMemory: (id: string) => void;
  setCollections: (collections: Collection[]) => void;
  addCollection: (collection: Collection) => void;
}

export const useMemoryStore = create<MemoryStore>((set) => ({
  memories: [],
  collections: [],
  setMemories: (memories) => set({ memories }),
  addMemory: (memory) => set((state) => ({ memories: [memory, ...state.memories] })),
  updateMemory: (id, memory) =>
    set((state) => ({
      memories: state.memories.map((m) => (m.id === id ? { ...m, ...memory } : m)),
    })),
  deleteMemory: (id) => set((state) => ({ memories: state.memories.filter((m) => m.id !== id) })),
  setCollections: (collections) => set({ collections }),
  addCollection: (collection) => set((state) => ({ collections: [collection, ...state.collections] })),
}));
