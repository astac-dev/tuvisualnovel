import * as acorn from 'acorn';
import { Node, Edge } from '@xyflow/react';

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
    
    const typeCounters: Record<string, number> = {};
    let lastNodeId: string | null = null;
    let autoY = 50;

    const addNode = (type: string, data: any) => {
      if (!typeCounters[type]) typeCounters[type] = 0;
      const index = typeCounters[type]++;
      
      const existingNodesOfType = currentNodes.filter(n => n.type === type);
      const existingNode = existingNodesOfType[index];

      const id = existingNode ? existingNode.id : getId();
      const position = existingNode ? existingNode.position : { x: 300, y: autoY };
      
      autoY += 300;

      const node: Node = { id, type, position, data };
      newNodes.push(node);

      if (lastNodeId && type !== 'label' && type !== 'jump') {
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
                }
                break;
              case 'end':
                if (newNodes.length > 0) {
                   newNodes[newNodes.length - 1].data.isEnding = true;
                }
                break;
              case 'label':
              case 'goto':
                if (args[0]) {
                  addNode('jump', { action: funcName, target: args[0].value });
                }
                break;
              case 'scene':
                if (args[0]) {
                  addNode('scene', { backgroundUrl: args[0].value, transition: args[1] ? args[1].value : 'instant' });
                }
                break;
              case 'showSprite':
                if (args[0]) {
                  let position = 'center';
                  let expression = '';
                  if (args[1] && args[1].type === 'ObjectExpression') {
                    args[1].properties.forEach((p: any) => {
                      if (p.key.name === 'position') position = p.value.value;
                      if (p.key.name === 'expression') expression = p.value.value;
                    });
                  }
                  addNode('sprite', { action: 'show', characterId: args[0].value, position, expression });
                }
                break;
              case 'hideSprite':
                if (args[0]) {
                  addNode('sprite', { action: 'hide', characterId: args[0].value });
                }
                break;
              case 'playBGM':
              case 'playSFX':
                if (args[0]) {
                  addNode('audio', { action: funcName, fileUrl: args[0].value });
                }
                break;
              case 'stopBGM':
                addNode('audio', { action: 'stopBGM' });
                break;
              case 'playMinigame':
                if (args[0]) {
                  let difficulty = 'normal';
                  if (args[1] && args[1].type === 'ObjectExpression') {
                     args[1].properties.forEach((p: any) => {
                        if (p.key.name === 'difficulty') difficulty = p.value.value;
                     });
                  }
                  addNode('minigame', { minigameId: args[0].value, difficulty });
                }
                break;
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
        } else if (statement.type === 'IfStatement') {
          const testCode = code.substring(statement.test.start, statement.test.end);
          addNode('condition', { expression: testCode });
        }
      }
    }
  } catch (e: any) {
    syntaxError = `Syntax Error: ${e.message}`;
  }

  return { nodes: newNodes, edges, syntaxError };
};

export const syncGraphToCode = (nodes: Node[], edges: Edge[]): string => {
  let code = '// TuVisualNovel DSL Code\n';
  
  const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);

  for (const node of sortedNodes) {
    switch (node.type) {
      case 'dialogue':
        const safeText = (node.data.text as string || '').replace(/"/g, '\\"');
        code += `say("${node.data.speaker || ''}", "${safeText}");\n`;
        if (node.data.isEnding) {
          code += `end();\n`;
        }
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
      case 'jump':
        code += `${node.data.action || 'goto'}("${node.data.target || 'label'}");\n`;
        break;
      case 'scene':
        code += `scene("${node.data.backgroundUrl || ''}", "${node.data.transition || 'instant'}");\n`;
        break;
      case 'sprite':
        if (node.data.action === 'hide') {
          code += `hideSprite("${node.data.characterId || ''}");\n`;
        } else {
          code += `showSprite("${node.data.characterId || ''}", { position: "${node.data.position || 'center'}", expression: "${node.data.expression || 'normal'}" });\n`;
        }
        break;
      case 'audio':
        if (node.data.action === 'stopBGM') {
          code += `stopBGM();\n`;
        } else {
          code += `${node.data.action || 'playBGM'}("${node.data.fileUrl || ''}");\n`;
        }
        break;
      case 'condition':
        code += `if (${node.data.expression || 'true'}) {\n  // goto("true_path");\n} else {\n  // goto("false_path");\n}\n`;
        break;
    }
  }
  
  return code;
};
