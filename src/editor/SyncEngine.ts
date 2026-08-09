import { useEffect, useState, useRef } from 'react';
import { useEditorStore } from './editorStore';
import { syncCodeToGraph, syncGraphToCode } from '../engine/astParser';

export const useSyncEngine = () => {
  const { nodes, edges, setNodes, setEdges } = useEditorStore();
  const [code, setCode] = useState<string>('// NovelCraft DSL Code\n');
  const [syntaxError, setSyntaxError] = useState<string | null>(null);
  
  // Ref para prevenir loops de sincronización
  const isUpdatingFromVisual = useRef(false);

  // Efecto: Cuando cambian los Nodos (Visual -> Código)
  useEffect(() => {
    // Si estamos en medio de un parseo desde código, ignoramos este efecto
    if (!isUpdatingFromVisual.current) {
      isUpdatingFromVisual.current = true;
      const newCode = syncGraphToCode(nodes, edges);
      setCode(newCode);
      setSyntaxError(null); // Si se generó desde visual, está libre de errores
      
      // Permitimos el próximo ciclo
      setTimeout(() => { isUpdatingFromVisual.current = false; }, 50);
    }
  }, [nodes, edges]);

  // Handler: Cuando el usuario escribe Código (Código -> Visual)
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    
    // Evitar loop visual infinito
    isUpdatingFromVisual.current = true;
    
    const result = syncCodeToGraph(newCode, nodes);
    
    if (result.syntaxError) {
      setSyntaxError(result.syntaxError);
    } else {
      setSyntaxError(null);
      // Solo actualizamos el grafo si el código es sintácticamente correcto
      if (result.nodes.length > 0 || newCode.trim() === '') {
        setNodes(result.nodes);
        setEdges(result.edges);
      }
    }

    setTimeout(() => { isUpdatingFromVisual.current = false; }, 50);
  };

  return {
    code,
    handleCodeChange,
    syntaxError
  };
};
