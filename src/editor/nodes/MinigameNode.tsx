import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Gamepad2, X } from 'lucide-react';
import { useEditorStore } from '../editorStore';

export const MinigameNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const removeNode = useEditorStore(state => state.removeNode);
  return (
    <div className={`w-52 bg-slate-800 border-2 rounded-xl shadow-lg transition-colors overflow-hidden ${selected ? 'border-yellow-400' : 'border-slate-600'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-yellow-400 border-2 border-slate-900" />
      
      <div className="bg-purple-900/60 px-3 py-2 flex items-center justify-between border-b border-purple-500/30">
        <div className="flex items-center gap-2">
          <Gamepad2 size={14} className="text-purple-300" />
          <span className="text-xs font-semibold text-yellow-100 tracking-wide uppercase">Minigame</span>
        </div>
        <button onClick={() => removeNode(id)} className="text-slate-400 hover:text-red-400 transition-colors ml-1 cursor-pointer"><X size={14} /></button>
      </div>
      
      <div className="p-3">
        <div className="text-xs font-bold text-purple-200 truncate flex items-center justify-center mb-1">
          {String(data.minigameId || 'unnamed_game')}
        </div>
        <div className="text-[10px] text-center text-purple-300/70 uppercase">
          Diff: {String(data.difficulty || 'normal')}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-yellow-400 border-2 border-slate-900" />
    </div>
  );
};
