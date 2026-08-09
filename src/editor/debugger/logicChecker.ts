import { Node, Edge } from '@xyflow/react';

export interface DiagnosticWarning {
  nodeId: string;
  type: 'orphan' | 'dead-end' | 'missing-asset';
  message: string;
}

export const runLogicChecker = (nodes: Node[], edges: Edge[]): DiagnosticWarning[] => {
  const warnings: DiagnosticWarning[] = [];
  
  if (nodes.length === 0) return warnings;

  // 1. Identificar Orígenes y Grafos Dirigidos
  const targetIds = new Set(edges.map(e => e.target));
  const sourceIds = new Set(edges.map(e => e.source));
  
  // Nodo raíz (heurística): El primero que no es target de nadie, o el primer nodo
  let rootNode = nodes.find(n => !targetIds.has(n.id));
  if (!rootNode) rootNode = nodes[0];

  // Algoritmo BFS para encontrar Nodos Huérfanos
  const visited = new Set<string>();
  const queue = [rootNode.id];

  while (queue.length > 0) {
    const currId = queue.shift()!;
    if (!visited.has(currId)) {
      visited.add(currId);
      // Encontrar vecinos
      const outboundEdges = edges.filter(e => e.source === currId);
      for (const edge of outboundEdges) {
        queue.push(edge.target);
      }
    }
  }

  nodes.forEach(node => {
    // Check Orphan
    if (!visited.has(node.id)) {
      warnings.push({
        nodeId: node.id,
        type: 'orphan',
        message: `El nodo está desconectado del flujo principal y nunca será ejecutado.`
      });
    }

    // Check Dead-end
    if (!sourceIds.has(node.id)) {
      // Si no tiene salidas, debe estar marcado explícitamente como final válido
      if (!node.data.isEnding) {
        warnings.push({
          nodeId: node.id,
          type: 'dead-end',
          message: `Callejón sin salida detectado. El flujo se detiene aquí. Si es un final, márcalo como 'isEnding' en el Inspector.`
        });
      }
    }
  });

  return warnings;
};
