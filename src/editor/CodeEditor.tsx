import React, { useRef, useEffect } from 'react';
import MonacoEditor, { useMonaco, loader } from '@monaco-editor/react';
import * as monacoCore from 'monaco-editor';

// Forzar a @monaco-editor/react a usar nuestra versión local en vez del CDN (jsdelivr)
// Al no proveer worker, Monaco usará el hilo principal (suficiente para un DSL educativo pequeño)
loader.config({ monaco: monacoCore });

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  syntaxError: string | null;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, syntaxError }) => {
  const monaco = useMonaco();
  const editorRef = useRef(null);

  useEffect(() => {
    if (monaco) {
      // Registrar un lenguaje personalizado
      monaco.languages.register({ id: 'novelcraft-dsl' });

      // Configurar tokens para colorear la sintaxis
      monaco.languages.setMonarchTokensProvider('novelcraft-dsl', {
        tokenizer: {
          root: [
            [/(label|scene|showSprite|hideSprite|say|choice|score|inventory|playMinigame)/, "keyword"],
            [/".*?"/, "string"],
            [/'.*?'/, "string"],
            [/\/\/.*$/, "comment"],
            [/[0-9]+/, "number"],
            [/[{}()\[\]]/, "bracket"],
          ]
        }
      });

      // Configurar tema personalizado basado en vs-dark
      monaco.editor.defineTheme('novelcraft-theme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: '569cd6', fontStyle: 'bold' },
          { token: 'string', foreground: 'ce9178' },
          { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
          { token: 'number', foreground: 'b5cea8' },
        ],
        colors: {
          'editor.background': '#1e1e1e',
        }
      });
    }
  }, [monaco]);

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <div className="absolute top-0 w-full h-8 bg-[#2d2d2d] flex items-center justify-between px-4 text-xs text-slate-400 z-10 border-b border-slate-700/50">
        <span>story.nvl (NovelCraft DSL)</span>
        {syntaxError ? (
          <span className="text-red-400 font-medium">⚠️ Error de Sintaxis</span>
        ) : (
          <span className="text-emerald-400 font-medium">✔️ Sincronizado</span>
        )}
      </div>
      
      {syntaxError && (
        <div className="absolute top-8 w-full bg-red-900/90 text-white text-xs p-2 z-20 border-b border-red-500 shadow-lg font-mono whitespace-pre-wrap">
          {syntaxError}
        </div>
      )}

      <div className="pt-8 h-full">
        <MonacoEditor
          height="100%"
          language="novelcraft-dsl"
          theme="novelcraft-theme"
          value={code}
          onChange={(value) => onChange(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            wordWrap: 'on',
            scrollBeyondLastLine: false,
          }}
          onMount={(editor) => {
            editorRef.current = editor as any;
          }}
        />
      </div>
    </div>
  );
};
