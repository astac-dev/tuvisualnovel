import React, { useEffect, useState, useRef } from 'react';
import { useEditorStore } from '../editorStore';
import { runLogicChecker } from './logicChecker';
import { AlertTriangle, AlertCircle, Minus, Maximize2 } from 'lucide-react';

export const DebuggerPanel: React.FC = () => {
  const { nodes, edges, diagnostics, setDiagnostics } = useEditorStore();
  const [pos, setPos] = useState({ x: window.innerWidth - 340, y: 80 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('debugger_pos');
    if (saved) {
      try { setPos(JSON.parse(saved)); } catch(e) {}
    }
    const savedMin = localStorage.getItem('debugger_min');
    if (savedMin) setIsMinimized(savedMin === 'true');
  }, []);

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newVal = !isMinimized;
    setIsMinimized(newVal);
    localStorage.setItem('debugger_min', String(newVal));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const issues = runLogicChecker(nodes, edges);
      setDiagnostics(issues);
    }, 800);
    return () => clearTimeout(timer);
  }, [nodes, edges, setDiagnostics]);

  if (diagnostics.length === 0) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem('debugger_pos', JSON.stringify(pos));
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div 
      className="absolute w-80 bg-red-950/90 backdrop-blur-md border border-red-500/50 rounded-lg shadow-2xl z-40 overflow-hidden select-none"
      style={{ left: pos.x, top: pos.y, touchAction: 'none' }}
    >
      <div 
        className="bg-red-900/70 px-3 py-2 border-b border-red-500/30 flex items-center justify-between text-red-200 cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="flex items-center gap-2 pointer-events-none">
          <AlertTriangle size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Linter Warnings ({diagnostics.length})</span>
        </div>
        <button onClick={toggleMinimize} className="text-red-300 hover:text-white transition-colors cursor-pointer z-50">
          {isMinimized ? <Maximize2 size={14} /> : <Minus size={14} />}
        </button>
      </div>
      
      {!isMinimized && (
        <div className="max-h-48 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-2">
          {diagnostics.map((diag, i) => (
            <div key={i} className="bg-black/40 rounded p-2 border-l-2 border-red-500">
              <div className="flex items-center gap-2 text-red-400 mb-1">
                <AlertCircle size={12} />
                <span className="text-[10px] font-mono font-bold uppercase">{diag.type} - {diag.nodeId}</span>
              </div>
              <p className="text-xs text-red-200/80 leading-tight">{diag.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
