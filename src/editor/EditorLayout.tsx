import React, { useState, useEffect } from 'react';
import { Stage } from '../engine/Stage';
import { NodeGraph } from './NodeGraph';
import { InspectorPanel } from './inspector/InspectorPanel';
import { CodeEditor } from './CodeEditor';
import { useSyncEngine } from './SyncEngine';
import { useEditorStore } from './editorStore';
import { InventoryOverlay } from '../engine/ui/InventoryOverlay';
import { DebugMonitor } from '../engine/ui/DebugMonitor';
import { MinigamePlayer } from '../engine/ui/MinigamePlayer';
import { TemplateSelector } from './TemplateSelector';
import { storageManager } from '../utils/storage';
import { exportProjectToWebBundle } from '../utils/zipExporter';
import { OfflineBadge } from '../components/OfflineBadge';
import { DebuggerPanel } from './debugger/DebuggerPanel';
import { GDDChecklist } from './GDDChecklist';
import { EnginePlayer } from '../engine/EnginePlayer';
import { useAssetStore } from './assetStore';
import { 
  Undo, Redo, Play, Code, Box, 
  MessageSquare, Settings, Save, Map, Package, Gamepad2, GraduationCap, Image as ImageIcon, Users, Trash2, Upload,
  FastForward, UserCircle, Music, GitBranch
} from 'lucide-react';
import { BackgroundRemoverModal } from './components/BackgroundRemoverModal';

export const EditorLayout: React.FC = () => {
  const { viewMode, setViewMode } = useEditorStore();
  const { code, handleCodeChange, syntaxError } = useSyncEngine();
  const [showTemplateSelector, setShowTemplateSelector] = useState(true);
  const [activeTab, setActiveTab] = useState<'nodes' | 'sprites' | 'backgrounds'>('nodes');
  const [showInventory, setShowInventory] = useState(false);
  const [activeMinigame, setActiveMinigame] = useState<string | null>(null);
  const [showGDD, setShowGDD] = useState(false);
  const [isPlaytesting, setIsPlaytesting] = useState(false);
  const [playError, setPlayError] = useState<string | null>(null);
  const [editingSpriteUrl, setEditingSpriteUrl] = useState<string | null>(null);

  const handlePlay = () => {
    const { diagnostics, nodes } = useEditorStore.getState();
    if (nodes.length === 0) {
      setPlayError("El mapa está vacío. Añade un nodo inicial para jugar.");
      setTimeout(() => setPlayError(null), 4000);
      return;
    }
    if (diagnostics.length > 0) {
      setPlayError(`El simulador fue bloqueado. Existen ${diagnostics.length} errores de lógica en el GDD. Abre el panel "Linter Warnings" o revisa los nodos en rojo.`);
      setTimeout(() => setPlayError(null), 5000);
      return;
    }
    if (syntaxError) {
      setPlayError("Error de sintaxis en el código. Ve a la pestaña 'Code' para repararlo.");
      setTimeout(() => setPlayError(null), 4000);
      return;
    }
    
    // Iniciar Simulador
    setIsPlaytesting(true);
  };

  const handleExport = async () => {
    const { diagnostics, nodes, edges } = useEditorStore.getState();
    if (nodes.length === 0) {
      setPlayError("El mapa está vacío. Añade nodos antes de exportar.");
      setTimeout(() => setPlayError(null), 4000);
      return;
    }
    if (diagnostics.length > 0) {
      setPlayError(`Exportación bloqueada. Existen ${diagnostics.length} errores de lógica en el GDD. Resuélvelos primero.`);
      setTimeout(() => setPlayError(null), 5000);
      return;
    }
    if (syntaxError) {
      setPlayError("Exportación bloqueada. Error de sintaxis en el código.");
      setTimeout(() => setPlayError(null), 4000);
      return;
    }
    
    setPlayError("Empaquetando novela visual...");
    const success = await exportProjectToWebBundle("Mi_Novela_Visual", nodes, edges);
    if (success) {
      setPlayError("¡Proyecto exportado exitosamente como Bundle Autónomo!");
    } else {
      setPlayError("Hubo un error al exportar el proyecto.");
    }
    setTimeout(() => setPlayError(null), 4000);
  };

  // Auto-Save Loop
  useEffect(() => {
    const saveInterval = setInterval(() => {
      // Tomar estado estático de Zustand para evitar dependencias circulares masivas
      const { nodes, edges } = useEditorStore.getState();
      
      if (nodes.length > 0) {
        storageManager.saveProject({
          id: 'current_project',
          timestamp: Date.now(),
          nodes,
          edges
        }).catch(err => console.error("Auto-Save error:", err));
      }
    }, 30000); // 30 segundos

    return () => clearInterval(saveInterval);
  }, []);

  const handleDragStart = (event: React.DragEvent, nodeType: string, initialData?: any) => {
    if (initialData) {
       event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, data: initialData }));
    } else {
       event.dataTransfer.setData('application/reactflow', nodeType);
    }
    event.dataTransfer.effectAllowed = 'move';
  };

  const { backgrounds, sprites, fetchAssets, uploadAsset, deleteAsset } = useAssetStore();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'bg' | 'sprite') => {
    if (!event.target.files || event.target.files.length === 0) return;
    setIsUploading(true);
    const file = event.target.files[0];
    const success = await uploadAsset(file, type);
    if(success) console.log("Archivo subido con éxito");
    else alert("Error subiendo el archivo");
    setIsUploading(false);
    event.target.value = ''; // reset
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {showTemplateSelector && <TemplateSelector onSelect={() => setShowTemplateSelector(false)} />}
      {/* HEADER BAR */}
      <div className="h-14 border-b border-slate-700/50 glass flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowTemplateSelector(true)} 
            className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hover:scale-105 transition-transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            title="Volver al Menú Principal"
          >
            TuVisualNovel
          </button>
          <OfflineBadge />
          <div className="h-6 w-px bg-slate-700 mx-2"></div>
          <button className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white" title="Undo">
            <Undo size={18} />
          </button>
          <button className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white" title="Redo">
            <Redo size={18} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowGDD(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/60 rounded border border-emerald-500/30 transition-colors mr-2"
          >
            <GraduationCap size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Evaluar GDD</span>
          </button>

          <div className="flex bg-slate-800 rounded p-1 border border-slate-700">
            <button 
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${viewMode === 'visual' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Map size={16} /> Visual
            </button>
            <button 
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${viewMode === 'code' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Code size={16} /> Code
            </button>
          </div>
          
          <button onClick={handlePlay} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/50">
            <Play size={16} fill="currentColor" /> Playtest
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors border border-slate-600">
            <Save size={16} /> Export
          </button>
        </div>
      </div>
      {/* Modals & Overlays */}
      {showGDD && <GDDChecklist onClose={() => setShowGDD(false)} />}
      
      {editingSpriteUrl !== null && (
        <BackgroundRemoverModal 
          initialImageUrl={editingSpriteUrl} 
          onClose={() => setEditingSpriteUrl(null)} 
        />
      )}
      
      {/* Play Error Toast */}
      {playError && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-900/95 border-2 border-red-500 text-white px-6 py-4 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.4)] z-50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <span className="text-2xl">⚠️</span>
          <p className="font-semibold">{playError}</p>
        </div>
      )}

      {/* Engine Player Overlay */}
      {isPlaytesting && <EnginePlayer onClose={() => setIsPlaytesting(false)} />}

      {/* WORKSPACE AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        <DebuggerPanel />
        
        {/* LEFT SIDEBAR - TOOL PALETTE */}
        <div className="w-64 border-r border-slate-700/50 glass z-10 flex flex-col shadow-xl">
          <div className="flex flex-col p-3 gap-2 bg-slate-900/80 border-b border-slate-700/50 shadow-md">
             <div className="flex w-full gap-2">
                <button 
                  onClick={() => setActiveTab('nodes')}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all flex flex-col items-center justify-center gap-1 shadow-sm ${activeTab === 'nodes' ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-105' : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 hover:border-slate-500'}`}
                >
                  <Box size={16} /> Nodos
                </button>
                <button 
                  onClick={() => setActiveTab('sprites')}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all flex flex-col items-center justify-center gap-1 shadow-sm ${activeTab === 'sprites' ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] scale-105' : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 hover:border-slate-500'}`}
                >
                  <Users size={16} /> Personajes
                </button>
             </div>
             <button 
               onClick={() => setActiveTab('backgrounds')}
               className={`w-full py-2 mt-1 text-[11px] font-bold uppercase tracking-wider rounded-lg border transition-all flex items-center justify-center gap-2 shadow-sm ${activeTab === 'backgrounds' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-[1.02]' : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 hover:border-slate-500'}`}
             >
               <ImageIcon size={16} /> Fondos de escena
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
            {activeTab === 'nodes' && (
              <div className="flex flex-col gap-4">
                {/* 1. NARRATIVA */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">📖 Narrativa</h3>
                  <div className="p-2 bg-blue-900/40 border border-blue-500/50 rounded-lg cursor-grab hover:bg-blue-800/50 flex items-center gap-3 transition-colors" onDragStart={(e) => handleDragStart(e, 'dialogue')} draggable>
                    <MessageSquare size={16} className="text-blue-400" /> <span className="text-xs font-medium">Diálogo</span>
                  </div>
                  <div className="p-2 bg-blue-900/40 border border-blue-500/50 rounded-lg cursor-grab hover:bg-blue-800/50 flex items-center gap-3 transition-colors" onDragStart={(e) => handleDragStart(e, 'decision')} draggable>
                    <Map size={16} className="text-blue-400" /> <span className="text-xs font-medium">Decisión</span>
                  </div>
                  <div className="p-2 bg-blue-900/40 border border-blue-500/50 rounded-lg cursor-grab hover:bg-blue-800/50 flex items-center gap-3 transition-colors" onDragStart={(e) => handleDragStart(e, 'jump')} draggable>
                    <FastForward size={16} className="text-blue-400" /> <span className="text-xs font-medium">Etiqueta / Salto</span>
                  </div>
                </div>

                {/* 2. MULTIMEDIA */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">🎨 Multimedia & Escena</h3>
                  <div className="p-2 bg-cyan-900/40 border border-cyan-500/50 rounded-lg cursor-grab hover:bg-cyan-800/50 flex items-center gap-3 transition-colors" onDragStart={(e) => handleDragStart(e, 'scene')} draggable>
                    <ImageIcon size={16} className="text-cyan-400" /> <span className="text-xs font-medium">Escenario</span>
                  </div>
                  <div className="p-2 bg-pink-900/40 border border-pink-500/50 rounded-lg cursor-grab hover:bg-pink-800/50 flex items-center gap-3 transition-colors" onDragStart={(e) => handleDragStart(e, 'sprite')} draggable>
                    <UserCircle size={16} className="text-pink-400" /> <span className="text-xs font-medium">Sprite</span>
                  </div>
                  <div className="p-2 bg-cyan-900/40 border border-cyan-500/50 rounded-lg cursor-grab hover:bg-cyan-800/50 flex items-center gap-3 transition-colors" onDragStart={(e) => handleDragStart(e, 'audio')} draggable>
                    <Music size={16} className="text-cyan-400" /> <span className="text-xs font-medium">Audio</span>
                  </div>
                </div>

                {/* 3. LÓGICA Y ESTADO */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">🧠 Lógica y Estado</h3>
                  <div className="p-2 bg-purple-900/40 border border-purple-500/50 rounded-lg cursor-grab hover:bg-purple-800/50 flex items-center gap-3 transition-colors" onDragStart={(e) => handleDragStart(e, 'score')} draggable>
                    <Settings size={16} className="text-purple-400" /> <span className="text-xs font-medium">Variable / Puntos</span>
                  </div>
                  <div className="p-2 bg-orange-900/40 border border-orange-500/50 rounded-lg cursor-grab hover:bg-orange-800/50 flex items-center gap-3 transition-colors" onDragStart={(e) => handleDragStart(e, 'inventory')} draggable>
                    <Package size={16} className="text-orange-400" /> <span className="text-xs font-medium">Inventario</span>
                  </div>
                  <div className="p-2 bg-purple-900/40 border border-purple-500/50 rounded-lg cursor-grab hover:bg-purple-800/50 flex items-center gap-3 transition-colors" onDragStart={(e) => handleDragStart(e, 'condition')} draggable>
                    <GitBranch size={16} className="text-purple-400" /> <span className="text-xs font-medium">Condición</span>
                  </div>
                </div>

                {/* 4. MINIJUEGOS */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">🎮 Minijuegos</h3>
                  <div className="p-2 bg-amber-900/40 border border-amber-500/50 rounded-lg cursor-grab hover:bg-amber-800/50 flex items-center gap-3 transition-colors" onDragStart={(e) => handleDragStart(e, 'minigame')} draggable>
                    <Gamepad2 size={16} className="text-amber-400" /> <span className="text-xs font-medium">Minijuego Genérico</span>
                  </div>
                  <div className="p-2 bg-amber-900/40 border border-amber-500/50 rounded-lg cursor-grab hover:bg-amber-800/50 flex items-center gap-3 transition-colors" onDragStart={(e) => handleDragStart(e, 'minigame', { minigameId: 'terminal_hack' })} draggable>
                    <Code size={16} className="text-amber-400" /> <span className="text-xs font-medium">Terminal Hack</span>
                  </div>
                  <div className="p-2 bg-amber-900/40 border border-amber-500/50 rounded-lg cursor-grab hover:bg-amber-800/50 flex items-center gap-3 transition-colors" onDragStart={(e) => handleDragStart(e, 'minigame', { minigameId: 'drag_drop_sort' })} draggable>
                    <Package size={16} className="text-amber-400" /> <span className="text-xs font-medium">Clasificación D&D</span>
                  </div>
                  <div className="p-2 bg-amber-900/40 border border-amber-500/50 rounded-lg cursor-grab hover:bg-amber-800/50 flex items-center gap-3 transition-colors" onDragStart={(e) => handleDragStart(e, 'minigame', { minigameId: 'quiz_challenge' })} draggable>
                    <GraduationCap size={16} className="text-amber-400" /> <span className="text-xs font-medium">Trivia a Contrarreloj</span>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'sprites' && (
              <div className="flex flex-col gap-4">
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={16} className="text-purple-400" />
                    <h3 className="text-xs font-bold text-slate-300">Guía de Sprites</h3>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    <strong>Formato:</strong> PNG con fondo transparente.<br/>
                    <strong>Resolución recomendada:</strong> 800px de altura.<br/>
                    Importa tus archivos aquí para usarlos en el Inspector sin depender de tu disco duro.
                  </p>
                </div>
                
                <label className="flex items-center justify-center gap-2 w-full p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg cursor-pointer transition-colors shadow-lg shadow-purple-900/20 text-sm font-semibold">
                  <Upload size={16} /> {isUploading ? 'Subiendo...' : 'Importar Archivo'}
                  <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={(e) => handleFileUpload(e, 'sprite')} disabled={isUploading} />
                </label>
                
                <div className="flex flex-col gap-2 mt-2">
                  {sprites.length === 0 && <span className="text-xs text-slate-500 text-center">Sin personajes</span>}
                  {sprites.map((url, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-700 group cursor-pointer"
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setEditingSpriteUrl(url);
                      }}
                      title="Click derecho para remover fondo"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <img src={url} className="w-8 h-8 object-cover rounded bg-slate-900" alt="sprite" />
                        <span className="text-xs text-slate-300 truncate" title={url}>{url.split('/').pop()}</span>
                      </div>
                      <button onClick={() => deleteAsset(url)} className="text-slate-500 hover:text-red-400 p-1 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'backgrounds' && (
              <div className="flex flex-col gap-4">
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon size={16} className="text-emerald-400" />
                    <h3 className="text-xs font-bold text-slate-300">Guía de Fondos</h3>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    <strong>Formato:</strong> JPG o PNG.<br/>
                    <strong>Resolución ideal:</strong> 1920x1080 o 1280x720.<br/>
                    Las imágenes se ajustarán para cubrir toda la pantalla del juego.
                  </p>
                </div>
                
                <label className="flex items-center justify-center gap-2 w-full p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer transition-colors shadow-lg shadow-emerald-900/20 text-sm font-semibold">
                  <Upload size={16} /> {isUploading ? 'Subiendo...' : 'Importar Fondo'}
                  <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={(e) => handleFileUpload(e, 'bg')} disabled={isUploading} />
                </label>
                
                <div className="flex flex-col gap-2 mt-2">
                  {backgrounds.length === 0 && <span className="text-xs text-slate-500 text-center">Sin fondos importados</span>}
                  {backgrounds.map((url, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-700 group">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <img src={url} className="w-12 h-8 object-cover rounded bg-slate-900" alt="bg" />
                        <span className="text-xs text-slate-300 truncate" title={url}>{url.split('/').pop()}</span>
                      </div>
                      <button onClick={() => deleteAsset(url)} className="text-slate-500 hover:text-red-400 p-1 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER CANVAS */}
        <div className="flex-1 flex flex-col relative bg-[#0f172a]">
          {viewMode === 'visual' ? (
             <NodeGraph />
          ) : (
            <div className="flex-1 flex flex-col h-full">
              <div className="flex-1 w-full bg-black relative shadow-lg overflow-hidden">
                 <Stage backgroundUrl="" />
                 <DebugMonitor />
                 {showInventory && <InventoryOverlay onClose={() => setShowInventory(false)} />}
                 {activeMinigame && (
                   <MinigamePlayer 
                     minigameId={activeMinigame} 
                     onClose={() => setActiveMinigame(null)} 
                     onComplete={(p) => {
                       console.log("Minigame Finalizado:", p);
                       setActiveMinigame(null);
                     }} 
                   />
                 )}
                 
                 {/* Glass Overlay for Play Controls */}
                 <div className="absolute top-4 right-4 glass px-4 py-2 rounded-xl flex gap-2 z-20">
                   <button onClick={handlePlay} className="text-sm font-medium hover:text-blue-400 transition-colors">▶ Play</button>
                   <button className="text-sm font-medium hover:text-orange-400 transition-colors" onClick={() => setShowInventory(true)}>📦 Inv</button>
                   <button className="text-sm font-medium hover:text-red-400 transition-colors">■ Stop</button>
                 </div>
              </div>
              <div className="flex-1 w-full border-t border-slate-700/50 bg-[#1e1e1e] relative overflow-hidden">
                 <CodeEditor 
                   code={code} 
                   onChange={handleCodeChange} 
                   syntaxError={syntaxError} 
                 />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT INSPECTOR */}
        <InspectorPanel />
      </div>
    </div>
  );
};
