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
      position: { x: 250, y: 300 },
      data: { action: 'set', key: 'puntos_ciencia', value: 0 }
    },
    {
      id: 'node_3',
      type: 'dialogue',
      position: { x: 250, y: 550 },
      data: { speaker: 'Profesor Martín', text: '¡Rápido Elena! Necesito que resuelvas esta fórmula antes de que el servidor colapse.' }
    },
    {
      id: 'node_4',
      type: 'minigame',
      position: { x: 250, y: 800 },
      data: { minigameId: 'quiz_lab', difficulty: 'hard' }
    },
    {
      id: 'node_5',
      type: 'decision',
      position: { x: 250, y: 1050 },
      data: { options: ['Intentar abrir el servidor', 'Huir del laboratorio'] }
    },
    {
      id: 'node_6',
      type: 'inventory',
      position: { x: 50, y: 1300 },
      data: { action: 'add', itemId: 'llave_acceso_server' }
    },
    {
      id: 'node_8',
      type: 'dialogue',
      position: { x: 50, y: 1550 },
      data: { speaker: 'Elena', text: 'Listo, logre entrar. (Desactiva el servidor)', isEnding: true }
    },
    {
      id: 'node_7',
      type: 'dialogue',
      position: { x: 450, y: 1300 },
      data: { speaker: 'Elena', text: '¡Demasiado peligroso! Nos vamos de aquí.', isEnding: true }
    }
  ] as Node[],
  edges: [
    { id: 'e1-2', source: 'node_1', target: 'node_2' },
    { id: 'e2-3', source: 'node_2', target: 'node_3' },
    { id: 'e3-4', source: 'node_3', target: 'node_4' },
    { id: 'e4-5', source: 'node_4', target: 'node_5' },
    // Opcion 1 -> node 6
    { id: 'e5-6', source: 'node_5', target: 'node_6', sourceHandle: 'handle-0' },
    // node 6 -> node 8
    { id: 'e6-8', source: 'node_6', target: 'node_8' },
    // Opcion 2 -> node 7
    { id: 'e5-7', source: 'node_5', target: 'node_7', sourceHandle: 'handle-1' }
  ] as Edge[]
};

export const dilemaHistoricoAST = {
  nodes: [
    {
      id: 'node_1',
      type: 'dialogue',
      position: { x: 250, y: 50 },
      data: { speaker: 'Narrador', text: 'Año 1810, Dolores Hidalgo. El destino de la Nueva España pende de un hilo.' }
    },
    {
      id: 'node_2',
      type: 'dialogue',
      position: { x: 250, y: 350 },
      data: { speaker: 'Miguel Hidalgo', text: '¡El momento ha llegado! ¿Qué debemos hacer frente al avance de las tropas realistas?' }
    },
    {
      id: 'node_3',
      type: 'decision',
      position: { x: 250, y: 650 },
      data: { options: ['Tocar la campana y llamar al pueblo', 'Esperar refuerzos de Allende', 'Huir hacia el norte'] }
    },
    {
      id: 'node_4',
      type: 'dialogue',
      position: { x: -50, y: 950 },
      data: { speaker: 'Narrador', text: 'El grito resonó en la historia. ¡Viva la independencia!', isEnding: true }
    },
    {
      id: 'node_5',
      type: 'dialogue',
      position: { x: 250, y: 950 },
      data: { speaker: 'Narrador', text: 'La espera fue prudente, pero el enemigo se fortaleció. La lucha sería más dura.', isEnding: true }
    },
    {
      id: 'node_6',
      type: 'dialogue',
      position: { x: 550, y: 950 },
      data: { speaker: 'Narrador', text: 'La insurrección se disolvió antes de empezar. El curso de la historia cambió.', isEnding: true }
    }
  ] as Node[],
  edges: [
    { id: 'e1-2', source: 'node_1', target: 'node_2' },
    { id: 'e2-3', source: 'node_2', target: 'node_3' },
    { id: 'e3-4', source: 'node_3', target: 'node_4', sourceHandle: 'handle-0' },
    { id: 'e3-5', source: 'node_3', target: 'node_5', sourceHandle: 'handle-1' },
    { id: 'e3-6', source: 'node_3', target: 'node_6', sourceHandle: 'handle-2' }
  ] as Edge[]
};
