import { NovelAST, ASTNode } from '../types/ast';

/**
 * Genera código JS a partir del AST interno.
 */
export const generateCodeFromAST = (ast: NovelAST): string => {
  let code = '// NovelCraft DSL Code\n';
  
  for (const node of ast.nodes) {
    switch (node.type) {
      case 'label':
        code += `label("${node.id}");\n`;
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
        
      case 'showSprite':
        const pos = typeof node.position === 'string' ? `"${node.position}"` : `{ x: ${node.position.x}, y: ${node.position.y} }`;
        code += `showSprite("${node.characterId}", { position: ${pos}, scale: ${node.scale} });\n`;
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
