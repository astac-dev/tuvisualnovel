export interface GameState {
  score: Record<string, number>;
  flags: Record<string, boolean>;
  inventory: string[];
  currentLabel: string;
  history: GameStateDelta[];
}

export interface GameStateDelta {
  timestamp: number;
  label: string;
  patch: Partial<GameState>;
}

export interface MinigamePayload {
  scoreGained?: number;
  itemsWon?: string[];
  targetLabel?: string;
}

export type SlotId = 'slot_1' | 'slot_2' | 'slot_3' | 'temp';

export interface SaveSlot {
  id: SlotId;
  timestamp: number;
  stateData: Partial<GameState>;
}
