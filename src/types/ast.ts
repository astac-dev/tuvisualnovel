export type ASTNode = 
  | LabelNode 
  | SceneNode 
  | ShowSpriteNode 
  | SayNode 
  | ScoreNode 
  | InventoryNode 
  | ChoiceNode;

export interface LabelNode {
  type: 'label';
  id: string; // e.g. "inicio"
}

export interface SceneNode {
  type: 'scene';
  backgroundUrl: string;
  transition?: string; // e.g. "dissolve"
}

export interface ShowSpriteNode {
  type: 'showSprite';
  characterId: string;
  position: 'left' | 'center' | 'right' | { x: number, y: number };
  scale: number;
}

export interface SayNode {
  type: 'say';
  speaker: string;
  text: string;
}

export interface ScoreNode {
  type: 'score';
  action: 'add' | 'set' | 'subtract';
  key: string;
  value: number;
}

export interface InventoryNode {
  type: 'inventory';
  action: 'add' | 'remove';
  itemId: string;
}

export interface ChoiceNode {
  type: 'choice';
  options: Record<string, string>; // { "Text to show": "target_label" }
}

export interface NovelAST {
  nodes: ASTNode[];
}
