import { Node, Edge } from '@xyflow/react';

export const misterioLaboratorioAST = {
  nodes: [
    {
      id: 'node_1',
      type: 'dialogue',
      position: { x: 250, y: 50 },
      data: { speaker: 'Elena', text: 'El laboratorio está extrañamente silencioso hoy...' }
    },
    {
      id: 'node_2',
      type: 'variable',
      position: { x: 250, y: 200 },
      data: { action: 'set', key: 'puntos_ciencia', value: 0 }
    },
    {
      id: 'node_3',
      type: 'dialogue',
      position: { x: 250, y: 350 },
      data: { speaker: 'Profesor Martín', text: '¡Rápido Elena! Necesito que resuelvas esta fórmula antes de que el servidor colapse.' }
    },
    {
      id: 'node_4',
      type: 'minigame',
      position: { x: 250, y: 500 },
      data: { minigameId: 'quiz_lab', difficulty: 'hard' }
    },
    {
      id: 'node_5',
      type: 'decision',
      position: { x: 250, y: 650 },
      data: { options: ['Intentar abrir el servidor', 'Huir del laboratorio'] }
    },
    {
      id: 'node_6',
      type: 'inventory',
      position: { x: 50, y: 800 },
      data: { action: 'add', itemId: 'llave_acceso_server' }
    },
    {
      id: 'node_7',
      type: 'dialogue',
      position: { x: 450, y: 800 },
      data: { speaker: 'Elena', text: '¡Demasiado peligroso! Nos vamos de aquí.' }
    }
  ] as Node[],
  edges: [
    { id: 'e1-2', source: 'node_1', target: 'node_2' },
    { id: 'e2-3', source: 'node_2', target: 'node_3' },
    { id: 'e3-4', source: 'node_3', target: 'node_4' },
    { id: 'e4-5', source: 'node_4', target: 'node_5' },
    // Opcion 1 -> node 6
    { id: 'e5-6', source: 'node_5', target: 'node_6', sourceHandle: 'handle-0' },
    // Opcion 2 -> node 7
    { id: 'e5-7', source: 'node_5', target: 'node_7', sourceHandle: 'handle-1' }
  ] as Edge[]
};
