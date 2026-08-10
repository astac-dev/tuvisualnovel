import React, { useState } from 'react';
import { useEditorStore } from './editorStore';
import { misterioLaboratorioAST, dilemaHistoricoAST } from '../templates/demoProject';
import { storageManager, AutoSaveData } from '../utils/storage';
import { Beaker, BookOpen, FilePlus, DatabaseBackup } from 'lucide-react';

interface TemplateSelectorProps {
  onSelect: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect }) => {
  const { setNodes, setEdges } = useEditorStore();
  const [savedProject, setSavedProject] = useState<AutoSaveData | null>(null);

  React.useEffect(() => {
    storageManager.loadProject('current_project').then(data => {
      if (data && data.nodes && data.nodes.length > 0) {
        setSavedProject(data);
      }
    }).catch(e => console.error("Error al buscar backup", e));
  }, []);

  const handleSelectTemplate = (type: 'blank' | 'lab' | 'ethics' | 'recover') => {
    if (type === 'blank') {
      setNodes([]);
      setEdges([]);
    } else if (type === 'lab') {
      setNodes(misterioLaboratorioAST.nodes);
      setEdges(misterioLaboratorioAST.edges);
    } else if (type === 'ethics') {
      setNodes(dilemaHistoricoAST.nodes);
      setEdges(dilemaHistoricoAST.edges);
    } else if (type === 'recover' && savedProject) {
      setNodes(savedProject.nodes);
      setEdges(savedProject.edges);
    }
    
    onSelect();
  };

  return (
    <div className="absolute inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent mb-4">
            Bienvenido a TuVisualNovel
          </h1>
          <p className="text-slate-400 text-lg">Selecciona un punto de partida para tu proyecto educativo.</p>
        </div>

        <div className={`grid grid-cols-1 ${savedProject ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
          
          {savedProject && (
            <div 
              onClick={() => handleSelectTemplate('recover')}
              className="bg-amber-900/40 border border-amber-500/50 hover:border-amber-400 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] flex flex-col items-center text-center group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider animate-pulse">
                Auto-Guardado
              </div>
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-amber-900/50 transition-colors">
                <DatabaseBackup size={32} className="text-amber-400 group-hover:text-amber-300" />
              </div>
              <h3 className="text-xl font-bold text-amber-200 mb-2">Recuperar Sesión</h3>
              <p className="text-sm text-amber-500/70">
                Última vez: {new Date(savedProject.timestamp).toLocaleTimeString()}
              </p>
            </div>
          )}

          <div 
            onClick={() => handleSelectTemplate('blank')}
            className="bg-slate-900/50 border border-slate-700 hover:border-blue-500 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-900/50 transition-colors">
              <FilePlus size={32} className="text-slate-400 group-hover:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">Proyecto en Blanco</h3>
            <p className="text-sm text-slate-500">Lienzo vacío. Ideal para creadores avanzados.</p>
          </div>

          <div 
            onClick={() => handleSelectTemplate('lab')}
            className="bg-slate-900/50 border border-slate-700 hover:border-emerald-500 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] flex flex-col items-center text-center group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
              Recomendado
            </div>
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-900/50 transition-colors">
              <Beaker size={32} className="text-slate-400 group-hover:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">El Misterio del Laboratorio</h3>
            <p className="text-sm text-slate-500">Incluye integración con minijuego de trivia científica e inventario.</p>
          </div>

          <div 
            onClick={() => handleSelectTemplate('ethics')}
            className="bg-slate-900/50 border border-slate-700 hover:border-purple-500 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-900/50 transition-colors">
              <BookOpen size={32} className="text-slate-400 group-hover:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">Dilema Histórico</h3>
            <p className="text-sm text-slate-500">Enfocado en ramificaciones narrativas complejas basadas en decisiones.</p>
          </div>

        </div>
      </div>
    </div>
  );
};
