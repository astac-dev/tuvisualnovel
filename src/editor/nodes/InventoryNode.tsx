import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Package, X } from 'lucide-react';
import { useEditorStore } from '../editorStore';

export const InventoryNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const removeNode = useEditorStore(state => state.removeNode);
  return (
    <div className={`w-48 bg-slate-800 border-2 rounded-xl shadow-lg transition-colors overflow-hidden ${selected ? 'border-orange-400' : 'border-slate-600'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-orange-400 border-2 border-slate-900" />
      
      <div className="bg-orange-900/60 px-3 py-2 flex items-center justify-between border-b border-orange-500/30">
        <div className="flex items-center gap-2">
          <Package size={14} className="text-orange-300" />
          <span className="text-xs font-semibold text-orange-100 tracking-wide uppercase">Inventory</span>
        </div>
        <button onClick={() => removeNode(id)} className="text-slate-400 hover:text-red-400 transition-colors ml-1 cursor-pointer"><X size={14} /></button>
      </div>
      
      <div className="p-3">
        <div className="text-[10px] uppercase text-emerald-400 font-bold mb-1">{String(data.action || 'add')} Item</div>
        <div className="text-xs text-emerald-100 font-mono bg-emerald-900/50 px-2 py-1 rounded border border-emerald-500/30 text-center truncate">
          {String(data.itemId || 'unknown_item')}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-orange-400 border-2 border-slate-900" />
    </div>
  );
};
