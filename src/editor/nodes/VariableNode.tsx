import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Code, X } from 'lucide-react';
import { useEditorStore } from '../editorStore';

export const VariableNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const removeNode = useEditorStore(state => state.removeNode);
  return (
    <div className={`w-48 bg-slate-800 border-2 rounded-xl shadow-lg transition-colors overflow-hidden ${selected ? 'border-purple-400' : 'border-slate-600'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-400 border-2 border-slate-900" />
      
      <div className="bg-purple-900/60 px-3 py-2 flex items-center justify-between border-b border-purple-500/30">
        <div className="flex items-center gap-2">
          <Code size={14} className="text-purple-300" />
          <span className="text-xs font-semibold text-purple-100 tracking-wide uppercase">Variable</span>
        </div>
        <button onClick={() => removeNode(id)} className="text-slate-400 hover:text-red-400 transition-colors ml-1 cursor-pointer"><X size={14} /></button>
      </div>
      
      <div className="p-3 flex flex-col gap-1">
        <div className="text-xs font-bold text-amber-200 truncate">
          <span className="text-[10px] text-amber-500 mr-1">{String(data.action || 'SET')}</span>
          {String(data.key || 'var_name')}
        </div>
        <div className="text-xs text-amber-100 font-mono bg-amber-900/50 px-2 py-1 rounded border border-amber-500/30 text-center">
          = {String(data.value ?? 0)}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-400 border-2 border-slate-900" />
    </div>
  );
};
