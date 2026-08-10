import { create } from 'zustand';
import { GameState, GameStateDelta, SlotId, SaveSlot } from '../types/engine';

interface GameStore extends GameState {
  // Actions
  addScore: (key: string, value: number) => void;
  setFlag: (key: string, value: boolean) => void;
  addInventory: (itemId: string) => void;
  removeInventory: (itemId: string) => void;
  setLabel: (label: string) => void;
  
  // Rollback System
  saveSnapshot: (label: string) => void;
  rollback: () => void;
  reset: () => void;

  // Persistencia / Save Slots
  saveToSlot: (slotId: SlotId) => void;
  loadFromSlot: (slotId: SlotId) => boolean;
  clearTempSlot: () => void;
}

const initialState: GameState = {
  score: {},
  flags: {},
  inventory: [],
  currentLabel: 'inicio',
  history: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  addScore: (key, value) => set((state) => ({
    score: { ...state.score, [key]: (state.score[key] || 0) + value }
  })),

  setFlag: (key, value) => set((state) => ({
    flags: { ...state.flags, [key]: value }
  })),

  addInventory: (itemId) => set((state) => {
    if (state.inventory.includes(itemId)) return state;
    return { inventory: [...state.inventory, itemId] };
  }),

  removeInventory: (itemId) => set((state) => ({
    inventory: state.inventory.filter(id => id !== itemId)
  })),

  setLabel: (label) => set({ currentLabel: label }),

  saveSnapshot: (label) => set((state) => {
    // Deep clone the state patch (excluding history)
    const patch: Partial<GameState> = {
      score: { ...state.score },
      flags: { ...state.flags },
      inventory: [...state.inventory],
      currentLabel: state.currentLabel
    };

    const delta: GameStateDelta = {
      timestamp: Date.now(),
      label,
      patch
    };

    // Keep only last 50 snapshots to prevent memory leaks
    const newHistory = [...state.history, delta].slice(-50);
    
    return { history: newHistory };
  }),

  rollback: () => set((state) => {
    if (state.history.length === 0) return state;
    
    const newHistory = [...state.history];
    const lastSnapshot = newHistory.pop();
    
    if (!lastSnapshot) return state;
    
    return {
      ...lastSnapshot.patch,
      history: newHistory
    };
  }),

  reset: () => set(initialState),

  // --- PERSISTENCE LOGIC ---
  saveToSlot: (slotId) => {
    const state = get();
    // Extraemos solo la data relevante para guardar (sin el historial completo de RAM)
    const stateData: Partial<GameState> = {
      score: { ...state.score },
      flags: { ...state.flags },
      inventory: [...state.inventory],
      currentLabel: state.currentLabel
    };

    const slotData: SaveSlot = {
      id: slotId,
      timestamp: Date.now(),
      stateData
    };

    try {
      localStorage.setItem(`tuvisualnovel_save_${slotId}`, JSON.stringify(slotData));
    } catch (e) {
      console.error("Error guardando partida en disco:", e);
    }
  },

  loadFromSlot: (slotId) => {
    try {
      const dataStr = localStorage.getItem(`tuvisualnovel_save_${slotId}`);
      if (!dataStr) return false;

      const slotData: SaveSlot = JSON.parse(dataStr);
      set({
        ...slotData.stateData,
        // Vaciamos el historial de rollback al cargar una partida para limpiar la RAM
        history: [] 
      });
      return true;
    } catch (e) {
      console.error("Error cargando partida:", e);
      return false;
    }
  },

  clearTempSlot: () => {
    localStorage.removeItem('tuvisualnovel_save_temp');
  }
}));
