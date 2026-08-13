import * as acorn from 'acorn';
import { NovelAST, ASTNode } from '../types/ast';

/**
 * Convierte el código DSL JS al AST interno usando Acorn.
 * Soporta llamadas a funciones específicas como label(), scene(), say(), etc.
 */
export const parseCodeToAST = (code: string): NovelAST => {
  const ast: NovelAST = { nodes: [] };
  
  try {
    const parsed = acorn.parse(code, { ecmaVersion: 2020 }) as any;
    
    // Recorremos los nodos del programa principal
    if (parsed.type === 'Program') {
      for (const statement of parsed.body) {
        if (statement.type === 'ExpressionStatement' && statement.expression.type === 'CallExpression') {
          const call = statement.expression;
          if (call.callee.type === 'Identifier') {
            const funcName = call.callee.name;
            const args = call.arguments;
            
            switch (funcName) {
              case 'label':
                if (args[0] && args[0].type === 'Literal') {
                  ast.nodes.push({ type: 'jump', action: 'label', target: String(args[0].value) });
                }
                break;
              
              case 'scene':
                if (args[0] && args[0].type === 'Literal') {
                  const node: ASTNode = { type: 'scene', backgroundUrl: args[0].value };
                  // Opcional options argument
                  if (args[1] && args[1].type === 'ObjectExpression') {
                    const transProp = args[1].properties.find((p: any) => p.key.name === 'transition');
                    if (transProp && transProp.value.type === 'Literal') {
                      node.transition = transProp.value.value;
                    }
                  }
                  ast.nodes.push(node);
                }
                break;
              
              case 'say':
                if (args[0] && args[1] && args[0].type === 'Literal' && args[1].type === 'Literal') {
                  ast.nodes.push({ type: 'say', speaker: args[0].value, text: args[1].value });
                }
                break;
            }
          } else if (call.callee.type === 'MemberExpression') {
             // Handle score.add(), inventory.add()
             const objectName = call.callee.object.name;
             const methodName = call.callee.property.name;
             const args = call.arguments;
             
             if (objectName === 'score' && args[0] && args[1]) {
                ast.nodes.push({ 
                  type: 'score', 
                  action: methodName as any, 
                  key: args[0].value, 
                  value: args[1].value 
                });
             } else if (objectName === 'inventory' && args[0]) {
                ast.nodes.push({
                  type: 'inventory',
                  action: methodName as any,
                  itemId: args[0].value
                });
             }
          }
        }
      }
    }
  } catch (e) {
    console.error("Syntax Error Parsing DSL:", e);
    // En caso de error de sintaxis, devolvemos lo parseado hasta el momento
    // o lanzamos un error que el editor pueda atrapar para mostrar un linter visual.
  }
  
  return ast;
};
