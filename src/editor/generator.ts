import { NovelAST, ASTNode } from '../types/ast';

/**
 * Genera código JS a partir del AST interno.
 */
export const generateCodeFromAST = (ast: NovelAST): string => {
  let code = '// TuVisualNovel DSL Code\n';
  
  for (const node of ast.nodes) {
    switch (node.type) {
      case 'jump':
        if (node.action === 'label') {
          code += `label("${node.target}");\n`;
        } else if (node.action === 'goto') {
          code += `goto("${node.target}");\n`;
        }
        break;
        
      case 'scene':
        if (node.transition) {
          code += `scene("${node.backgroundUrl}", { transition: "${node.transition}" });\n`;
        } else {
          code += `scene("${node.backgroundUrl}");\n`;
        }
        break;
        
      case 'say':
        // Escapamos comillas dobles si las hay
        const safeText = node.text.replace(/"/g, '\\"');
        code += `say("${node.speaker}", "${safeText}");\n`;
        break;
        
      case 'sprite':
        if (node.action === 'show') {
          let options = [];
          if (node.position) {
             const pos = typeof node.position === 'string' ? `"${node.position}"` : `{ x: ${node.position.x}, y: ${node.position.y} }`;
             options.push(`position: ${pos}`);
          }
          if (node.scale) {
             options.push(`scale: ${node.scale}`);
          }
          if (options.length > 0) {
             code += `showSprite("${node.characterId}", { ${options.join(', ')} });\n`;
          } else {
             code += `showSprite("${node.characterId}");\n`;
          }
        } else {
          code += `hideSprite("${node.characterId}");\n`;
        }
        break;
        
      case 'score':
        code += `score.${node.action}("${node.key}", ${node.value});\n`;
        break;
        
      case 'inventory':
        code += `inventory.${node.action}("${node.itemId}");\n`;
        break;
        
      case 'choice':
        code += `choice({\n`;
        for (const [text, target] of Object.entries(node.options)) {
          code += `  "${text}": "${target}",\n`;
        }
        code += `});\n`;
        break;
    }
  }
  
  return code;
};
