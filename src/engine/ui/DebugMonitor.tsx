import React, { useState } from 'react';
import { useGameStore } from '../gameStore';
import { Bug, Minimize2, Maximize2 } from 'lucide-react';

export const DebugMonitor: React.FC = () => {
  const { score, flags, inventory, currentLabel } = useGameStore();
  const [minimized, setMinimized] = useState(false);

  if (minimized) {
    return (
      <button 
        onClick={() => setMinimized(false)}
        className="absolute bottom-4 left-4 z-50 bg-slate-900/90 border border-slate-700 text-slate-400 p-2 rounded hover:text-white hover:border-slate-500 transition-colors glass"
        title="Restaurar Debugger"
      >
        <Bug size={16} />
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 left-4 z-50 w-72 bg-slate-900/80 border border-slate-700 shadow-xl rounded-lg overflow-hidden glass text-xs font-mono">
      <div className="bg-slate-800/80 px-3 py-2 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-2 text-slate-300">
          <Bug size={14} className="text-emerald-400" />
          <span className="font-bold">DEBUG MONITOR</span>
        </div>
        <button onClick={() => setMinimized(true)} className="text-slate-500 hover:text-slate-300">
          <Minimize2 size={14} />
        </button>
      </div>

      <div className="p-3 max-h-64 overflow-y-auto custom-scrollbar">
        <div className="mb-3">
          <div className="text-slate-500 font-bold mb-1 uppercase tracking-wider">Estado Central</div>
          <div className="flex justify-between text-slate-300">
            <span>Label actual:</span>
            <span className="text-blue-400">{currentLabel}</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="text-slate-500 font-bold mb-1 uppercase tracking-wider">Scores (Numéricos)</div>
          {Object.keys(score).length === 0 ? <div className="text-slate-600 italic">No variables set</div> : null}
          {Object.entries(score).map(([key, val]) => (
            <div key={key} className="flex justify-between text-slate-300">
              <span>{key}:</span>
              <span className="text-purple-400">{val}</span>
            </div>
          ))}
        </div>

        <div className="mb-3">
          <div className="text-slate-500 font-bold mb-1 uppercase tracking-wider">Flags (Booleanos)</div>
          {Object.keys(flags).length === 0 ? <div className="text-slate-600 italic">No flags set</div> : null}
          {Object.entries(flags).map(([key, val]) => (
            <div key={key} className="flex justify-between text-slate-300">
              <span>{key}:</span>
              <span className={val ? 'text-emerald-400' : 'text-red-400'}>{val ? 'true' : 'false'}</span>
            </div>
          ))}
        </div>

        <div>
          <div className="text-slate-500 font-bold mb-1 uppercase tracking-wider">Inventario</div>
          <div className="text-orange-300 flex flex-wrap gap-1">
            {inventory.length === 0 ? <span className="text-slate-600 italic">Vacío</span> : null}
            {inventory.map(item => <span key={item} className="bg-slate-800 px-1 rounded">{item}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
};
