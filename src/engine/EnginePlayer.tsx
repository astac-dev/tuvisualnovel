import React, { useState, useEffect, useMemo } from 'react';
import { useEditorStore } from '../editor/editorStore';
import { useGameStore } from './gameStore';
import { StageRenderer } from './StageRenderer';
import { DialogueBox } from './DialogueBox';
import { MinigamePlayer } from './ui/MinigamePlayer';
import { DebugMonitor } from './ui/DebugMonitor';
import { InventoryOverlay } from './ui/InventoryOverlay';
import { X, PlayCircle } from 'lucide-react';

interface EnginePlayerProps {
  onClose: () => void;
}

export const EnginePlayer: React.FC<EnginePlayerProps> = ({ onClose }) => {
  const { nodes, edges } = useEditorStore();
  const gameStore = useGameStore();
  
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [currentBg, setCurrentBg] = useState<string>("/assets/bg_laboratorio.jpg");
  const [activeSprites, setActiveSprites] = useState<any[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);

  // Initialize Game
  useEffect(() => {
    gameStore.reset();
    
    // Buscar nodo raíz (el primero que no es target de nada, o el primer nodo)
    const targetIds = new Set(edges.map(e => e.target));
    let startNode = nodes.find(n => !targetIds.has(n.id));
    if (!startNode && nodes.length > 0) startNode = nodes[0];
    
    if (startNode) {
      setCurrentNodeId(startNode.id);
    }
  }, []);

  const currentNode = useMemo(() => {
    return nodes.find(n => n.id === currentNodeId) || null;
  }, [currentNodeId, nodes]);

  // Helper to advance to next node
  const advanceToNext = (sourceHandle?: string) => {
    if (!currentNodeId) return;

    let possibleEdges = edges.filter(e => e.source === currentNodeId);
    if (sourceHandle) {
      possibleEdges = possibleEdges.filter(e => e.sourceHandle === sourceHandle);
    }

    if (possibleEdges.length > 0) {
      // By default take the first matching edge
      setCurrentNodeId(possibleEdges[0].target);
    } else {
      // No next edge -> End of logic branch
      console.log("End of branch reached.");
      setCurrentNodeId(null);
    }
  };

  // Logic Processor
  useEffect(() => {
    if (!currentNode) return;

    // Actualizar entorno visual si el nodo define nuevos assets
    if (currentNode.type === 'scene' && currentNode.data.backgroundUrl) {
      setCurrentBg(String(currentNode.data.backgroundUrl));
      setTimeout(() => advanceToNext(), 1000); // Wait for transition
    } else if (currentNode.data.background) {
      setCurrentBg(String(currentNode.data.background));
    }

    if (currentNode.type === 'sprite') {
      const charId = String(currentNode.data.characterId);
      if (currentNode.data.action === 'show') {
         setActiveSprites(prev => {
            const exists = prev.find(s => s.id === charId);
            // Defaulting sprite URL generation for demo purposes
            const url = `/assets/${charId}.png`; 
            if (exists) {
               return prev.map(s => s.id === charId ? { ...s, url, position: currentNode.data.position || 'center' } : s);
            }
            return [...prev, { id: charId, url, position: currentNode.data.position || 'center', scale: 1 }];
         });
      } else if (currentNode.data.action === 'hide') {
         setActiveSprites(prev => prev.filter(s => s.id !== charId));
      }
      setTimeout(() => advanceToNext(), 100);
    } else if (currentNode.data.sprite) {
       setActiveSprites([{ id: 'legacy_char', url: String(currentNode.data.sprite), position: 'center', scale: 1 }]);
    }

    if (currentNode.type === 'dialogue') {
       setActiveSpeaker(String(currentNode.data.speaker || 'Narrador'));
    }

    // Ejecutar lógica inmediata (sin esperar interacciones)
    if (currentNode.type === 'variable') {
      const { action, key, value } = currentNode.data;
      if (action === 'set' && key) {
        const currentVal = gameStore.score[String(key)] || 0;
        const targetVal = Number(value);
        gameStore.addScore(String(key), targetVal - currentVal);
      }
      setTimeout(() => advanceToNext(), 100);
    }

    if (currentNode.type === 'inventory') {
      const { action, itemId } = currentNode.data;
      if (action === 'add' && itemId) {
        gameStore.addInventory(String(itemId));
      } else if (action === 'remove' && itemId) {
        gameStore.removeInventory(String(itemId));
      }
      setTimeout(() => advanceToNext(), 100);
    }
  }, [currentNodeId, currentNode]);

  return (
    <div className="fixed inset-4 bg-[#0f172a] border border-slate-700 shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col animate-in zoom-in-95 duration-200">
      
      {/* Playtest Header */}
      <div className="h-12 bg-slate-900 border-b border-slate-700/50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <PlayCircle size={18} />
          <span className="font-bold tracking-wide uppercase text-sm">Simulador en Vivo</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowInventory(!showInventory)}
            className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-orange-400 transition-colors"
          >
            📦 Inventario
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 bg-red-900/40 text-red-400 hover:bg-red-900/80 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Engine Canvas */}
      <div className="flex-1 relative bg-black">
        <StageRenderer 
          backgroundUrl={currentBg} 
          sprites={activeSprites}
          activeSpeaker={activeSpeaker}
        />

        {showInventory && <InventoryOverlay onClose={() => setShowInventory(false)} />}
        
        <div className="absolute top-4 left-4 z-40 pointer-events-none">
          <DebugMonitor />
        </div>

        {/* --- NODE RENDERERS --- */}
        
        {currentNode?.type === 'dialogue' && (
          <DialogueBox 
            speaker={String(currentNode.data.speaker || 'Narrador')}
            text={String(currentNode.data.text || '...')}
            onNext={() => advanceToNext()}
          />
        )}

        {currentNode?.type === 'minigame' && (
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md">
            <MinigamePlayer 
              minigameId={String(currentNode.data.minigameId || 'quiz_lab')}
              onClose={() => advanceToNext()}
              onComplete={() => advanceToNext()}
            />
          </div>
        )}

        {currentNode?.type === 'decision' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-30">
            <div className="flex flex-col gap-4 w-full max-w-md">
              {(currentNode.data.options as string[] || ['Opción 1']).map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => advanceToNext(`handle-${i}`)}
                  className="w-full px-6 py-4 bg-slate-800/90 hover:bg-emerald-600/90 text-white font-medium text-lg rounded-xl border border-slate-600 hover:border-emerald-400 transition-all shadow-lg transform hover:scale-105"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Debug UI - End of Branch */}
        {!currentNode && (
          <div className="absolute inset-0 flex flex-col gap-4 items-center justify-center bg-black/80 backdrop-blur-sm z-50">
             <div className="bg-slate-900 px-8 py-6 rounded-2xl border-2 border-slate-700 flex flex-col items-center gap-4">
                <span className="text-4xl">🏁</span>
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">Fin de la Escena</h2>
                <button onClick={onClose} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-white transition-colors">Volver al Editor</button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};
