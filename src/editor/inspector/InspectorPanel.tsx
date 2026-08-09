import React from 'react';
import { useEditorStore } from '../editorStore';
import { Settings } from 'lucide-react';

export const InspectorPanel: React.FC = () => {
  const { nodes, selectedNodeId, updateNodeData } = useEditorStore();
  
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="w-80 border-l border-slate-700/50 glass z-10 p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-700/50 pb-4">
          <Settings size={18} className="text-slate-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Inspector</h2>
        </div>
        <div className="flex-1 text-slate-500 text-sm text-center">
          Selecciona un nodo para editar sus propiedades.
        </div>
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    updateNodeData(selectedNode.id, { [key]: value });
  };

  const renderForm = () => {
    switch (selectedNode.type) {
      case 'dialogue':
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Speaker / Personaje</label>
              <input 
                type="text" 
                value={String(selectedNode.data.speaker || '')} 
                onChange={e => handleChange('speaker', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                placeholder="Nombre del personaje..."
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Texto del Diálogo</label>
              <textarea 
                value={String(selectedNode.data.text || '')} 
                onChange={e => handleChange('text', e.target.value)}
                rows={4}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                placeholder="Escribe el diálogo aquí..."
              />
            </div>
            
            <div className="flex items-center gap-2 mt-2 bg-red-900/20 p-2 rounded border border-red-500/20">
              <input 
                type="checkbox" 
                checked={Boolean(selectedNode.data.isEnding || false)}
                onChange={e => handleChange('isEnding', e.target.checked)}
                className="cursor-pointer"
              />
              <label className="text-xs text-slate-300">Marcar como Final de Historia</label>
            </div>

            <div className="pt-4 border-t border-slate-700/50 mt-2">
              <label className="block text-xs text-slate-400 font-medium mb-1">Visuales (Opcional)</label>
              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  value={String(selectedNode.data.background || '')} 
                  onChange={e => handleChange('background', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                  placeholder="URL Fondo (ej: /assets/bg/lab.jpg)"
                />
                <input 
                  type="text" 
                  value={String(selectedNode.data.sprite || '')} 
                  onChange={e => handleChange('sprite', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                  placeholder="URL Personaje (ej: /assets/char.png)"
                />
              </div>
            </div>
          </div>
        );

      case 'variable':
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Acción (Set, Add, Sub)</label>
              <select
                value={String(selectedNode.data.action || 'set')}
                onChange={e => handleChange('action', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-purple-500"
              >
                <option value="set">SET (Asignar)</option>
                <option value="add">ADD (Sumar)</option>
                <option value="sub">SUB (Restar)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Variable Key</label>
              <input 
                type="text" 
                value={String(selectedNode.data.key || '')} 
                onChange={e => handleChange('key', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-purple-500"
                placeholder="ej: puntos_ciencia"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Valor</label>
              <input 
                type="number" 
                value={Number(selectedNode.data.value ?? 0)} 
                onChange={e => handleChange('value', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-purple-500"
              />
            </div>
          </div>
        );

      // We can add forms for 'decision', 'inventory', 'minigame' similarly
      default:
        return <div className="text-sm text-slate-400">Editor no disponible para este nodo.</div>;
    }
  };

  return (
    <div className="w-80 border-l border-slate-700/50 glass z-10 p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-700/50 pb-4">
        <Settings size={18} className="text-slate-200" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-100">Inspector</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500">{selectedNode.id}</span>
          <span className="text-xs font-bold uppercase text-blue-400">{selectedNode.type}</span>
        </div>

        {renderForm()}
      </div>
    </div>
  );
};
