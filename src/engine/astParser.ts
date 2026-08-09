import * as acorn from 'acorn';
import { Node, Edge } from '@xyflow/react';

// Generador de IDs únicos para nodos nuevos
let idCounter = 1000;
const getId = () => `node_auto_${idCounter++}`;

export const syncCodeToGraph = (
  code: string,
  currentNodes: Node[]
): { nodes: Node[]; edges: Edge[]; syntaxError: string | null } => {
  const newNodes: Node[] = [];
  const edges: Edge[] = [];
  let syntaxError: string | null = null;

  try {
    const parsed = acorn.parse(code, { ecmaVersion: 2020 }) as any;
    
    // Contadores por tipo para intentar reutilizar IDs y Posiciones (Reconciliación)
    const typeCounters: Record<string, number> = {};
    let lastNodeId: string | null = null;
    let autoY = 50;

    const addNode = (type: string, data: any) => {
      if (!typeCounters[type]) typeCounters[type] = 0;
      const index = typeCounters[type]++;
      
      // Buscar nodo existente del mismo tipo y orden
      const existingNodesOfType = currentNodes.filter(n => n.type === type);
      const existingNode = existingNodesOfType[index];

      const id = existingNode ? existingNode.id : getId();
      const position = existingNode ? existingNode.position : { x: 300, y: autoY };
      
      autoY += 150; // Simple Vertical Stack Auto-Layout

      const node: Node = { id, type, position, data };
      newNodes.push(node);

      // Simple lineal edge connecting sequential nodes
      if (lastNodeId && type !== 'label') {
        edges.push({
          id: `e-${lastNodeId}-${id}`,
          source: lastNodeId,
          target: id
        });
      }
      
      lastNodeId = id;
      return id;
    };

    if (parsed.type === 'Program') {
      for (const statement of parsed.body) {
        if (statement.type === 'ExpressionStatement' && statement.expression.type === 'CallExpression') {
          const call = statement.expression;
          const args = call.arguments;

          if (call.callee.type === 'Identifier') {
            const funcName = call.callee.name;
            
            switch (funcName) {
              case 'say':
                if (args[0] && args[1]) {
                  addNode('dialogue', { speaker: args[0].value, text: args[1].value });
                }
                break;
              case 'choice':
                if (args[0] && args[0].type === 'ObjectExpression') {
                  const options = args[0].properties.map((p: any) => p.key.value || p.key.name);
                  addNode('decision', { options });
                  // Edges para las opciones se conectarían a los labels objetivo (requiere 2da pasada)
                }
                break;
              // ... otros mapeos podrían ir aquí
            }
          } else if (call.callee.type === 'MemberExpression') {
             const objectName = call.callee.object.name;
             const methodName = call.callee.property.name;
             
             if (objectName === 'score' && args[0] && args[1]) {
                addNode('variable', { action: methodName, key: args[0].value, value: args[1].value });
             } else if (objectName === 'inventory' && args[0]) {
                addNode('inventory', { action: methodName, itemId: args[0].value });
             }
          }
        }
      }
    }
  } catch (e: any) {
    // Capturamos el error de Acorn (pos, loc, message)
    syntaxError = `Syntax Error: ${e.message}`;
  }

  return { nodes: newNodes, edges, syntaxError };
};

export const syncGraphToCode = (nodes: Node[], edges: Edge[]): string => {
  let code = '// NovelCraft DSL Code\n';
  
  // Ordenar nodos por Y para generar código estructurado de arriba a abajo
  const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);

  for (const node of sortedNodes) {
    switch (node.type) {
      case 'dialogue':
        const safeText = (node.data.text as string || '').replace(/"/g, '\\"');
        code += `say("${node.data.speaker || ''}", "${safeText}");\n`;
        break;
      case 'decision':
        const opts = (node.data.options as string[]) || [];
        code += `choice({\n`;
        opts.forEach(opt => {
          code += `  "${opt}": "target_label",\n`;
        });
        code += `});\n`;
        break;
      case 'variable':
        code += `score.${node.data.action || 'set'}("${node.data.key || 'score'}", ${node.data.value || 0});\n`;
        break;
      case 'inventory':
        code += `inventory.${node.data.action || 'add'}("${node.data.itemId || 'item'}");\n`;
        break;
      case 'minigame':
        code += `playMinigame("${node.data.minigameId || 'game'}", { difficulty: "${node.data.difficulty || 'normal'}" });\n`;
        break;
      // custom default para labels, scenes etc.
    }
  }
  
  return code;
};
