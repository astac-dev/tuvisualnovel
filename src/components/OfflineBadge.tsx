import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const OfflineBadge: React.FC = () => {
  return (
    <div 
      className="flex items-center gap-1.5 px-3 py-1 bg-emerald-900/40 border border-emerald-500/50 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)]"
      title="TuVisualNovel está operando sin conexión, garantizando privacidad total de los datos escolares."
    >
      <ShieldCheck size={14} className="text-emerald-400" />
      <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
        100% Offline & Private
      </span>
    </div>
  );
};
