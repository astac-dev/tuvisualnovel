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

      case 'jump':
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Acción</label>
              <select value={String(selectedNode.data.action || 'goto')} onChange={e => handleChange('action', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-blue-500">
                <option value="goto">Ir a Etiqueta (GOTO)</option>
                <option value="label">Definir Etiqueta (LABEL)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Nombre de Etiqueta</label>
              <input type="text" value={String(selectedNode.data.target || '')} onChange={e => handleChange('target', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-blue-500" placeholder="ej: capitulo_2" />
            </div>
          </div>
        );
      case 'scene':
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">URL Fondo</label>
              <input type="text" value={String(selectedNode.data.backgroundUrl || '')} onChange={e => handleChange('backgroundUrl', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-cyan-500" placeholder="/assets/bg.jpg" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Transición</label>
              <select value={String(selectedNode.data.transition || 'instant')} onChange={e => handleChange('transition', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-cyan-500">
                <option value="instant">Instantánea</option>
                <option value="dissolve">Disolver</option>
                <option value="fade">Fade in/out</option>
              </select>
            </div>
          </div>
        );
      case 'sprite':
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Acción</label>
              <select value={String(selectedNode.data.action || 'show')} onChange={e => handleChange('action', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-pink-500">
                <option value="show">Mostrar</option>
                <option value="hide">Ocultar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">ID Personaje</label>
              <input type="text" value={String(selectedNode.data.characterId || '')} onChange={e => handleChange('characterId', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-pink-500" placeholder="ej: elena" />
            </div>
            {selectedNode.data.action !== 'hide' && (
              <>
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">Posición</label>
                  <select value={String(selectedNode.data.position || 'center')} onChange={e => handleChange('position', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-pink-500">
                    <option value="left">Izquierda</option>
                    <option value="center">Centro</option>
                    <option value="right">Derecha</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">Expresión</label>
                  <input type="text" value={String(selectedNode.data.expression || '')} onChange={e => handleChange('expression', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-pink-500" placeholder="ej: happy" />
                </div>
              </>
            )}
          </div>
        );
      case 'audio':
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Acción</label>
              <select value={String(selectedNode.data.action || 'playBGM')} onChange={e => handleChange('action', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-cyan-500">
                <option value="playBGM">Reproducir BGM (Loop)</option>
                <option value="playSFX">Reproducir Efecto (SFX)</option>
                <option value="stopBGM">Detener BGM</option>
              </select>
            </div>
            {selectedNode.data.action !== 'stopBGM' && (
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">Archivo de Audio</label>
                <input type="text" value={String(selectedNode.data.fileUrl || '')} onChange={e => handleChange('fileUrl', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-cyan-500" placeholder="ej: misterio.mp3" />
              </div>
            )}
          </div>
        );
      case 'condition':
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Expresión Lógica</label>
              <input type="text" value={String(selectedNode.data.expression || '')} onChange={e => handleChange('expression', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-purple-500" placeholder="ej: score.get('puntos') > 5" />
            </div>
          </div>
        );
      case 'inventory':
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Acción</label>
              <select value={String(selectedNode.data.action || 'add')} onChange={e => handleChange('action', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-orange-500">
                <option value="add">Añadir (ADD)</option>
                <option value="remove">Remover (REMOVE)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Item ID</label>
              <input type="text" value={String(selectedNode.data.itemId || '')} onChange={e => handleChange('itemId', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-orange-500" placeholder="ej: llave_lab" />
            </div>
          </div>
        );
      case 'minigame':
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Minijuego ID</label>
              <input type="text" value={String(selectedNode.data.minigameId || '')} onChange={e => handleChange('minigameId', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-yellow-500" placeholder="ej: quiz_lab" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Dificultad</label>
              <select value={String(selectedNode.data.difficulty || 'normal')} onChange={e => handleChange('difficulty', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-yellow-500">
                <option value="easy">Fácil</option>
                <option value="normal">Normal</option>
                <option value="hard">Difícil</option>
              </select>
            </div>
          </div>
        );
      case 'decision':
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Opciones (separadas por comas)</label>
              <textarea 
                value={Array.isArray(selectedNode.data.options) ? selectedNode.data.options.join(', ') : ''} 
                onChange={e => handleChange('options', e.target.value.split(',').map(o => o.trim()).filter(o => o))}
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-emerald-500"
                placeholder="Opción 1, Opción 2..."
              />
            </div>
          </div>
        );
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
