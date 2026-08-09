import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Map, X } from 'lucide-react';
import { useEditorStore } from '../editorStore';

export const DecisionNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const removeNode = useEditorStore(state => state.removeNode);
  const options: string[] = Array.isArray(data.options) ? data.options : ['Option 1', 'Option 2'];

  return (
    <div className={`w-56 bg-slate-800 border-2 rounded-xl shadow-lg transition-colors overflow-hidden ${selected ? 'border-emerald-400' : 'border-slate-600'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-emerald-400 border-2 border-slate-900" />
      
      <div className="bg-emerald-900/60 px-3 py-2 flex items-center justify-between border-b border-emerald-500/30">
        <div className="flex items-center gap-2">
          <Map size={14} className="text-emerald-300" />
          <span className="text-xs font-semibold text-emerald-100 tracking-wide uppercase">Decision</span>
        </div>
        <button onClick={() => removeNode(id)} className="text-slate-400 hover:text-red-400 transition-colors ml-1 cursor-pointer"><X size={14} /></button>
      </div>
      
      <div className="p-3 flex flex-col gap-2">
        {options.map((opt, i) => (
          <div key={i} className="text-xs bg-slate-900/50 px-2 py-1.5 rounded text-slate-200 flex justify-between items-center relative">
            <span className="truncate pr-4">{opt}</span>
            <Handle 
              type="source" 
              position={Position.Right} 
              id={`handle-${i}`}
              className="w-2 h-2 bg-emerald-400 border border-slate-900 absolute -right-[5px] top-1/2 -translate-y-1/2" 
            />
          </div>
        ))}
      </div>
    </div>
  );
};
