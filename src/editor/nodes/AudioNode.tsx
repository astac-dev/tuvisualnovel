import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Music, AlertTriangle, X } from 'lucide-react';
import { useEditorStore } from '../editorStore';

export const AudioNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const diagnostics = useEditorStore(state => state.diagnostics);
  const removeNode = useEditorStore(state => state.removeNode);
  const error = diagnostics.find(d => d.nodeId === id);
  const borderClass = error ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : (selected ? 'border-cyan-400' : 'border-slate-600');

  return (
    <div className={`w-48 bg-slate-800 border-2 rounded-xl shadow-lg transition-colors overflow-hidden ${borderClass}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-cyan-400 border-2 border-slate-900" />
      
      <div className="bg-cyan-900/60 px-3 py-2 flex items-center justify-between border-b border-cyan-500/30">
        <div className="flex items-center gap-2">
          <Music size={14} className="text-cyan-300" />
          <span className="text-xs font-semibold text-cyan-100 tracking-wide uppercase">Audio</span>
        </div>
        <div className="flex items-center gap-1">
          {error && <span title={error.message}><AlertTriangle size={14} className="text-red-400 animate-pulse" /></span>}
          <button onClick={() => removeNode(id)} className="text-slate-400 hover:text-red-400 transition-colors ml-1 cursor-pointer"><X size={14} /></button>
        </div>
      </div>
      
      <div className="p-3 flex flex-col gap-2">
        <div className="text-xs font-bold text-cyan-200 uppercase">{String(data.action || 'playBGM')}</div>
        {data.action !== 'stopBGM' && (
          <div className="text-xs text-slate-300 bg-slate-900/50 p-2 rounded border border-slate-700/50 truncate">
            {String(data.fileUrl || 'audio.mp3')}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-cyan-400 border-2 border-slate-900" />
    </div>
  );
};
