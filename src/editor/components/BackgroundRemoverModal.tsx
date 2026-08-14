import React, { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon, Download, Cpu, Sparkles, AlertTriangle } from 'lucide-react';
import { removeBackgroundLocal } from '../../utils/backgroundRemoval';

interface BackgroundRemoverModalProps {
  initialImageUrl?: string;
  onClose: () => void;
}

export const BackgroundRemoverModal: React.FC<BackgroundRemoverModalProps> = ({ 
  initialImageUrl, 
  onClose 
}) => {
  const [mode, setMode] = useState<'canvas' | 'ai'>('canvas');
  const [tolerance, setTolerance] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [progressValue, setProgressValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  
  // Track last used original URL so we can re-process if mode or tolerance changes
  const [sourceUrl, setSourceUrl] = useState<string | null>(initialImageUrl || null);

  useEffect(() => {
    // Si tenemos una URL inicial (click derecho en un asset), la cargamos como source
    if (initialImageUrl) {
      setSourceUrl(initialImageUrl);
      setResultUrl(initialImageUrl); // Preview original
    }
  }, [initialImageUrl]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (resultUrl && resultUrl.startsWith('blob:')) {
        URL.revokeObjectURL(resultUrl);
      }
    };
  }, [resultUrl]);

  const processImage = async () => {
    if (!sourceUrl) return;
    
    setIsProcessing(true);
    setError(null);
    setProgressMsg('Procesando...');
    setProgressValue(0);

    try {
      const url = await removeBackgroundLocal(mode, sourceUrl, {
        tolerance,
        onProgress: (prog, label) => {
          setProgressValue(prog);
          setProgressMsg(label);
        }
      });
      
      // Clean up previous if it was a blob
      if (resultUrl && resultUrl.startsWith('blob:')) {
        URL.revokeObjectURL(resultUrl);
      }
      
      setResultUrl(url);
    } catch (err: any) {
      setError(err.message || "Error al procesar la imagen");
    } finally {
      setIsProcessing(false);
      setProgressMsg('');
      setProgressValue(0);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `sprite_nobg_${Date.now()}.png`;
    a.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const url = URL.createObjectURL(file);
      setSourceUrl(url);
      setResultUrl(url);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-3 text-slate-100">
            <ImageIcon className="text-purple-400" />
            <h2 className="font-bold tracking-wide">Removedor de Fondos</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 min-h-[500px]">
          {/* Controls Panel */}
          <div className="w-full lg:w-80 bg-slate-800/50 border-r border-slate-700 p-6 flex flex-col gap-6">
            
            {!sourceUrl && (
              <div 
                className="w-full h-32 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-800 hover:border-purple-400 transition-colors"
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e: any) => {
                    if (e.target.files && e.target.files[0]) {
                      const url = URL.createObjectURL(e.target.files[0]);
                      setSourceUrl(url);
                      setResultUrl(url);
                    }
                  };
                  input.click();
                }}
              >
                <ImageIcon size={32} className="mb-2 opacity-50" />
                <span className="text-sm">Click o Arrastrar imagen</span>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-slate-300">Método de Procesamiento</label>
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
                <button
                  onClick={() => setMode('canvas')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${mode === 'canvas' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Cpu size={16} /> Chroma/Canvas
                </button>
                <button
                  onClick={() => setMode('ai')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${mode === 'ai' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Sparkles size={16} /> Modo IA
                </button>
              </div>
              <p className="text-xs text-slate-500">
                {mode === 'ai' ? 'Usa redes neuronales locales (lento la primera vez, alta precisión).' : 'Elimina píxeles cercanos al blanco absoluto. Rápido pero rústico.'}
              </p>
            </div>

            {mode === 'canvas' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300 flex justify-between">
                  Tolerancia (Blanco) <span className="text-purple-400">{tolerance}</span>
                </label>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={tolerance} 
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex gap-3 text-red-200 text-sm">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="mt-auto flex flex-col gap-3">
              <button
                onClick={processImage}
                disabled={!sourceUrl || isProcessing}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Procesando...' : 'Aplicar Filtro'}
              </button>

              <button
                onClick={handleDownload}
                disabled={!resultUrl || resultUrl === sourceUrl || isProcessing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download size={18} /> Descargar PNG
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex-1 bg-[#2a2a2a] rounded-xl overflow-hidden relative shadow-inner border border-slate-700 flex items-center justify-center checkerboard-bg">
              {/* CSS para checkerboard */}
              <style dangerouslySetInnerHTML={{__html: `
                .checkerboard-bg {
                  background-image: linear-gradient(45deg, #404040 25%, transparent 25%), 
                                    linear-gradient(-45deg, #404040 25%, transparent 25%), 
                                    linear-gradient(45deg, transparent 75%, #404040 75%), 
                                    linear-gradient(-45deg, transparent 75%, #404040 75%);
                  background-size: 20px 20px;
                  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                }
              `}} />
              
              {resultUrl ? (
                <img 
                  src={resultUrl} 
                  alt="Preview" 
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-slate-500 font-medium">No hay imagen cargada</div>
              )}

              {isProcessing && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <div className="text-white font-bold mb-2">{progressMsg}</div>
                  {mode === 'ai' && (
                    <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 transition-all duration-300" style={{width: `${progressValue}%`}}></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
