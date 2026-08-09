import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from './gameStore';
import { Undo2, ChevronRight, FastForward } from 'lucide-react';

interface DialogueBoxProps {
  speaker?: string;
  text: string;
  onNext: () => void;
  typingSpeed?: number;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ 
  speaker, 
  text, 
  onNext,
  typingSpeed = 30
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const { rollback, history } = useGameStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Efecto Typewriter
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let currentIndex = 0;

    const typeChar = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
        timeoutRef.current = setTimeout(typeChar, typingSpeed);
      } else {
        setIsTyping(false);
      }
    };

    typeChar();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, typingSpeed]);

  const handleInteract = () => {
    if (isTyping) {
      // Regla pedida: 1er click, revelar todo el texto
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setDisplayedText(text);
      setIsTyping(false);
    }
  };

  const handleRollback = (e: React.MouseEvent) => {
    e.stopPropagation();
    rollback();
  };

  return (
    <div className="absolute bottom-8 left-0 w-full flex justify-center z-30 px-8 pointer-events-none">
      <div 
        className="w-full max-w-4xl bg-slate-900/85 backdrop-blur-md border-t border-slate-700/50 rounded-xl p-6 shadow-2xl relative pointer-events-auto cursor-pointer"
        onClick={handleInteract}
      >
        {/* Undo Rollback Button */}
        <button 
          onClick={handleRollback}
          disabled={history.length === 0}
          className={`absolute -top-12 left-0 flex items-center gap-2 px-3 py-1.5 rounded-t-lg bg-slate-900/85 backdrop-blur-md border-x border-t border-slate-700/50 transition-colors ${history.length === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-blue-400 hover:text-blue-300'}`}
        >
          <Undo2 size={16} /> <span className="text-sm font-semibold uppercase tracking-wider">Undo</span>
        </button>

        {/* Auto/Skip toggles */}
        <div className="absolute -top-10 right-4 flex gap-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">
          <button className="hover:text-white transition-colors">Auto</button>
          <button className="flex items-center gap-1 hover:text-white transition-colors"><FastForward size={14} /> Skip</button>
        </div>

        {speaker && (
          <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 inline-block">
            {speaker}
          </div>
        )}
        
        <div className="text-slate-200 text-lg leading-relaxed min-h-[4rem] font-serif">
          {displayedText}
        </div>

        {/* Flecha Siguiente interactiva */}
        {!isTyping && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute bottom-4 right-6 text-blue-400 hover:text-white animate-pulse transition-colors flex items-center gap-1"
          >
            <span className="text-xs font-bold tracking-widest uppercase">Next</span>
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
};
