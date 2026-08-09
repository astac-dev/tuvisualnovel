import React from 'react';
import { useGameStore } from '../gameStore';
import { Package, X } from 'lucide-react';

interface InventoryOverlayProps {
  onClose: () => void;
}

export const InventoryOverlay: React.FC<InventoryOverlayProps> = ({ onClose }) => {
  const { inventory } = useGameStore();

  return (
    <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-md flex items-center justify-center p-8">
      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden glass">
        
        <div className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center">
          <div className="flex items-center gap-3 text-orange-400">
            <Package size={24} />
            <h2 className="text-xl font-bold text-slate-100">Inventario</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {inventory.length === 0 ? (
            <div className="text-center py-12 text-slate-500 italic">
              El inventario está vacío.
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {inventory.map((itemId, idx) => (
                <div key={idx} className="aspect-square bg-slate-800/80 border border-slate-700 rounded-lg flex flex-col items-center justify-center p-2 hover:border-orange-500/50 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-slate-700 rounded-full mb-2 group-hover:scale-110 transition-transform flex items-center justify-center text-slate-400">
                    {/* Placeholder Icon */}
                    📦
                  </div>
                  <span className="text-[10px] text-slate-300 truncate w-full text-center uppercase tracking-wider font-semibold">
                    {itemId.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};
