export type ASTNode = 
  | JumpNode 
  | SceneNode 
  | SpriteNode 
  | SayNode 
  | ScoreNode 
  | InventoryNode 
  | ChoiceNode
  | AudioNode
  | ConditionNode
  | MinigameNode;

export interface JumpNode {
  type: 'jump';
  action: 'label' | 'goto';
  target: string;
}

export interface SceneNode {
  type: 'scene';
  backgroundUrl: string;
  transition?: 'instant' | 'dissolve' | 'fade';
}

export interface SpriteNode {
  type: 'sprite';
  action: 'show' | 'hide';
  characterId: string;
  position?: 'left' | 'center' | 'right' | { x: number, y: number };
  expression?: string;
  scale?: number;
}

export interface AudioNode {
  type: 'audio';
  action: 'playBGM' | 'stopBGM' | 'playSFX';
  fileUrl: string;
  volume?: number;
}

export interface SayNode {
  type: 'say';
  speaker: string;
  text: string;
  isEnding?: boolean;
}

export interface ScoreNode {
  type: 'score';
  action: 'add' | 'set' | 'subtract' | 'sub';
  key: string;
  value: number;
}

export interface InventoryNode {
  type: 'inventory';
  action: 'add' | 'remove';
  itemId: string;
}

export interface ChoiceOption {
  target: string;
  condition?: string;
}

export interface ChoiceNode {
  type: 'choice';
  options: Record<string, string | ChoiceOption>;
}

export interface ConditionNode {
  type: 'condition';
  expression: string;
}

export interface MinigameNode {
  type: 'minigame';
  minigameId: string;
  difficulty: string;
}

export interface NovelAST {
  nodes: ASTNode[];
}
