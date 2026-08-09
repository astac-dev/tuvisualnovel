import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';
import { DiagnosticWarning } from './debugger/logicChecker';

export type ViewMode = 'visual' | 'code';

interface EditorState {
  // UI State
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // React Flow State
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  diagnostics: DiagnosticWarning[];
  
  // Actions
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;
  setSelectedNodeId: (id: string | null) => void;
  setDiagnostics: (diagnostics: DiagnosticWarning[]) => void;
  
  // Helpers
  updateNodeData: (id: string, data: any) => void;
  removeNode: (id: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  viewMode: 'visual',
  setViewMode: (mode) => set({ viewMode: mode }),
  
  nodes: [],
  edges: [],
  selectedNodeId: null,
  diagnostics: [],

  setNodes: (nodes) => set((state) => ({
    nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes
  })),
  
  setEdges: (edges) => set((state) => ({
    edges: typeof edges === 'function' ? edges(state.edges) : edges
  })),
  
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  
  setDiagnostics: (diagnostics) => set({ diagnostics }),
  
  updateNodeData: (id, newData) => set((state) => ({
    nodes: state.nodes.map(node => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, ...newData } };
      }
      return node;
    })
  })),

  removeNode: (id) => set((state) => ({
    nodes: state.nodes.filter(node => node.id !== id),
    edges: state.edges.filter(edge => edge.source !== id && edge.target !== id)
  }))
}));
