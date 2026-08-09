import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { NovelAST } from '../types/ast';

export const exportProject = async (ast: NovelAST, projectName: string = 'MyNovel') => {
  const zip = new JSZip();

  // Guardar el AST como JSON
  zip.file('project.json', JSON.stringify(ast, null, 2));

  // Generar un HTML ejecutable muy básico como template
  const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${projectName}</title>
  <style>
    body { margin: 0; background: black; overflow: hidden; }
  </style>
</head>
<body>
  <div id="game-container"></div>
  <script>
    // Aquí iría el runtime final empaquetado del Engine
    console.log("Loading project data...", ${JSON.stringify(ast)});
    alert("Juego exportado exitosamente. Runtime de producción pendiente de empaquetado.");
  </script>
</body>
</html>
  `;
  zip.file('index.html', indexHtml);

  // Generar y descargar el archivo
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${projectName}.zip`);
};
