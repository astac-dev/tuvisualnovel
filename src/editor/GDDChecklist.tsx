import React, { useState, useEffect } from 'react';
import { useEditorStore } from './editorStore';
import { CheckSquare, Square, X } from 'lucide-react';

interface GDDChecklistProps {
  onClose: () => void;
}

export const GDDChecklist: React.FC<GDDChecklistProps> = ({ onClose }) => {
  const { nodes } = useEditorStore();
  
  // Auto-eval checks
  const minigameCount = nodes.filter(n => n.type === 'minigame').length;
  const endingCount = nodes.filter(n => n.data.isEnding).length;
  
  const hasMinigame = minigameCount >= 1;
  const hasEndings = endingCount >= 3;

  // Manual checks
  const [tested, setTested] = useState(false);
  const [credits, setCredits] = useState(false);

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-xl w-full max-w-md overflow-hidden">
        
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Evaluación Pedagógica (GDD)</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={16}/></button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            {hasEndings ? <CheckSquare className="text-emerald-500 mt-0.5" size={18} /> : <Square className="text-slate-500 mt-0.5" size={18} />}
            <div>
              <p className={`text-sm font-semibold ${hasEndings ? 'text-emerald-400' : 'text-slate-300'}`}>3 Finales Distintos</p>
              <p className="text-xs text-slate-500">Auto: {endingCount}/3 nodos marcados con 'isEnding'.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {hasMinigame ? <CheckSquare className="text-emerald-500 mt-0.5" size={18} /> : <Square className="text-slate-500 mt-0.5" size={18} />}
            <div>
              <p className={`text-sm font-semibold ${hasMinigame ? 'text-emerald-400' : 'text-slate-300'}`}>Mecánica de Minijuego</p>
              <p className="text-xs text-slate-500">Auto: {minigameCount} nodos tipo Minijuego encontrados.</p>
            </div>
          </div>

          <div className="h-px bg-slate-700 w-full my-2"></div>

          <div className="flex items-start gap-3 cursor-pointer" onClick={() => setTested(!tested)}>
            {tested ? <CheckSquare className="text-blue-500 mt-0.5" size={18} /> : <Square className="text-slate-500 mt-0.5" size={18} />}
            <div>
              <p className={`text-sm font-semibold ${tested ? 'text-blue-400' : 'text-slate-300'}`}>Playtest Completo</p>
              <p className="text-xs text-slate-500">Manual: He probado que todas mis ramas narrativas funcionan.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 cursor-pointer" onClick={() => setCredits(!credits)}>
            {credits ? <CheckSquare className="text-blue-500 mt-0.5" size={18} /> : <Square className="text-slate-500 mt-0.5" size={18} />}
            <div>
              <p className={`text-sm font-semibold ${credits ? 'text-blue-400' : 'text-slate-300'}`}>Créditos y Ética</p>
              <p className="text-xs text-slate-500">Manual: He dado crédito a las imágenes y sonidos descargados.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
