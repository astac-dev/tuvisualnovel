import React, { useEffect, useRef } from 'react';
import { MinigameBridge } from '../../minigames_api/bridge';
import { MinigamePayload } from '../../types/engine';

interface MinigamePlayerProps {
  minigameId: string;
  difficulty?: string;
  onComplete: (payload: MinigamePayload) => void;
  onClose?: () => void;
}

export const MinigamePlayer: React.FC<MinigamePlayerProps> = ({ 
  minigameId, 
  difficulty = 'normal', 
  onComplete,
  onClose 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Escuchar eventos desde el iframe usando el Bridge
    const cleanup = MinigameBridge.listen((payload) => {
      onComplete(payload);
    });

    return cleanup;
  }, [onComplete]);

  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // Enviar parámetros iniciales al minijuego una vez que carga
      iframeRef.current.contentWindow.postMessage({
        type: 'MINIGAME_INIT',
        payload: { difficulty }
      }, '*');
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div className="w-[80%] h-[80%] bg-slate-900 border border-slate-700 shadow-2xl rounded-xl overflow-hidden relative flex flex-col">
        {/* Header Bar */}
        <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
          <span className="text-sm font-medium text-slate-300">Minigame Sandbox: {minigameId}</span>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-red-400 hover:text-red-300 text-sm font-bold"
            >
              CERRAR
            </button>
          )}
        </div>
        
        {/* Iframe Sandbox */}
        <div className="flex-1 bg-black relative">
          <iframe 
            ref={iframeRef}
            src={`/minigames/${minigameId}/index.html`}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin"
            onLoad={handleIframeLoad}
            title={`Minigame: ${minigameId}`}
          />
        </div>
      </div>
    </div>
  );
};
