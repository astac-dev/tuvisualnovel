import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Node, Edge } from '@xyflow/react';

export const exportProjectToWebBundle = async (
  projectName: string,
  nodes: Node[],
  edges: Edge[]
) => {
  const zip = new JSZip();

  // 1. Data del Juego (El AST / Grafo Visual)
  const gameData = {
    projectName,
    version: '1.0.0',
    nodes,
    edges,
    exportedAt: new Date().toISOString()
  };
  
  // En lugar de crear un gameData.json separado que requerirá fetch() y causará error CORS 
  // al abrir el index.html localmente (file://), inyectamos la data directamente.
  const stringifiedData = JSON.stringify(gameData);

  // 2. Archivo index.html (Standalone Runner)
  // Este es el punto de entrada que un navegador leerá al abrir el juego offline.
  // En un entorno de producción real, inyectaríamos el build minificado de React.
  const indexHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${projectName}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body, html { margin: 0; padding: 0; width: 100vw; height: 100vh; background: #0f172a; color: #fff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; overflow: hidden; }
    #game-container { width: 100%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center; background-image: url('assets/images/bg/default.jpg'); background-size: cover; background-position: center; }
    
    .dialogue-box { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); width: 80%; max-width: 900px; background: rgba(15, 23, 42, 0.9); border-top: 2px solid rgba(255,255,255,0.1); padding: 30px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); cursor: pointer; transition: all 0.2s; user-select: none; }
    .dialogue-box:hover { background: rgba(15, 23, 42, 0.95); }
    .speaker-name { font-size: 22px; font-weight: bold; color: #60a5fa; margin-bottom: 15px; }
    .dialogue-text { font-size: 20px; line-height: 1.5; color: #e2e8f0; }
    .next-indicator { position: absolute; bottom: 15px; right: 20px; font-size: 14px; color: #94a3b8; animation: pulse 1.5s infinite; }
    
    .decision-container { display: flex; flex-direction: column; gap: 15px; width: 100%; max-width: 500px; z-index: 10; }
    .decision-btn { padding: 20px; font-size: 18px; font-weight: bold; background: rgba(30, 41, 59, 0.95); color: white; border: 1px solid #475569; border-radius: 12px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
    .decision-btn:hover { background: #059669; border-color: #34d399; transform: scale(1.02); }
    
    .end-screen { text-align: center; background: rgba(0,0,0,0.8); padding: 40px; border-radius: 20px; }
    
    @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
  </style>
</head>
<body>
  <div id="game-container"></div>
  <script>
    // Data inyectada
    window.GAME_DATA = ${stringifiedData};
    const nodes = window.GAME_DATA.nodes || [];
    const edges = window.GAME_DATA.edges || [];
    let currentNodeId = null;
    let currentBg = 'assets/images/bg/default.jpg';
    let currentSprite = null;
    let autoInterval = null;
    const container = document.getElementById('game-container');

    // 1. Encontrar el nodo inicial
    const targetIds = new Set(edges.map(e => e.target));
    let startNode = nodes.find(n => !targetIds.has(n.id));
    if (!startNode && nodes.length > 0) startNode = nodes[0];

    // 2. Motor de Renderizado
    function renderNode() {
      if (!currentNodeId) return;
      const node = nodes.find(n => n.id === currentNodeId);
      if (!node) return;

      // Actualizar entorno visual
      if (node.data.background) currentBg = node.data.background;
      if (node.data.sprite !== undefined) currentSprite = node.data.sprite;
      container.style.backgroundImage = 'url(' + currentBg + ')';

      let spriteHtml = '';
      if (currentSprite) {
         spriteHtml = '<img src="' + currentSprite + '" style="position:absolute; bottom:0; left:50%; transform:translateX(-50%); max-height:90%; z-index:5; pointer-events:none;" />';
      }

      container.innerHTML = spriteHtml; // Limpiar pantalla pero mantener sprite

      if (node.type === 'dialogue') {
        const speaker = node.data.speaker || '';
        const fullText = node.data.text || '';
        
        container.innerHTML += \`
          <div style="position:absolute; bottom:30px; left:50%; transform:translateX(-50%); width:100%; max-width:900px; z-index:20; padding: 0 20px; box-sizing: border-box;">
            
            <div style="position:relative; width:100%;">
              <div style="position:absolute; top:-35px; right:15px; display:flex; gap:15px; z-index:30;">
                <button onclick="event.stopPropagation(); toggleAuto()" id="auto-btn" style="background:none; border:none; color:#94a3b8; font-size:12px; font-weight:bold; text-transform:uppercase; cursor:pointer; letter-spacing:1px; transition:0.2s;">Auto</button>
                <button onclick="event.stopPropagation(); skipDialogues()" style="background:none; border:none; color:#94a3b8; font-size:12px; font-weight:bold; text-transform:uppercase; cursor:pointer; letter-spacing:1px; transition:0.2s;">Skip</button>
              </div>

              <div id="dialogue-box-element" style="background:rgba(15, 23, 42, 0.85); backdrop-filter:blur(12px); border-top:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:24px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5); cursor:pointer; min-height:100px; position:relative;">
                \${speaker ? \`<div style="font-size:20px; font-weight:bold; background:linear-gradient(to right, #60a5fa, #c084fc); -webkit-background-clip:text; color:transparent; margin-bottom:8px; display:inline-block;">\${speaker}</div>\` : ''}
                <div id="dialogue-text-element" style="font-size:18px; color:#e2e8f0; line-height:1.6; font-family:serif; min-height:4rem;"></div>
                
                <button id="next-indicator" style="display:none; position:absolute; bottom:16px; right:24px; background:none; border:none; color:#60a5fa; font-weight:bold; text-transform:uppercase; font-size:12px; letter-spacing:2px; cursor:pointer; animation:pulse 2s infinite;">Next ▼</button>
              </div>
            </div>
          </div>
        \`;

        let isTyping = true;
        let currentIndex = 0;
        let typeInterval = null;
        const textElement = document.getElementById('dialogue-text-element');
        const nextIndicator = document.getElementById('next-indicator');
        const boxElement = document.getElementById('dialogue-box-element');

        const finishTyping = () => {
          clearInterval(typeInterval);
          textElement.textContent = fullText;
          isTyping = false;
          nextIndicator.style.display = 'block';
        };

        typeInterval = setInterval(() => {
          if (currentIndex < fullText.length) {
            textElement.textContent += fullText[currentIndex];
            currentIndex++;
          } else {
            finishTyping();
          }
        }, 30);

        boxElement.onclick = (e) => {
          e.stopPropagation();
          if (isTyping) {
            finishTyping();
          } else {
            advance();
          }
        };

        nextIndicator.onclick = (e) => {
          e.stopPropagation();
          advance();
        };
      } 
      else if (node.type === 'decision') {
        const options = node.data.options || [];
        let html = '<div class="decision-container" style="z-index:20;">';
        options.forEach((opt, index) => {
          html += \`<button class="decision-btn" onclick="advance('handle-\${index}')">\${opt}</button>\`;
        });
        html += '</div>';
        container.innerHTML += html;
      }
      else if (node.type === 'variable' || node.type === 'inventory') {
        // Nodos lógicos invisibles: saltamos instantáneamente
        advance();
      }
      else if (node.type === 'minigame') {
        const minigameId = node.data.minigameId || 'quiz';
        container.innerHTML = \`
          <div style="position:absolute; inset:0; z-index:50; background:rgba(0,0,0,0.9); display:flex; align-items:center; justify-content:center; flex-direction:column;">
            <div style="width:80%; height:80%; background:#0f172a; border:2px solid #334155; border-radius:12px; display:flex; flex-direction:column; overflow:hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
              <div style="height:45px; background:#1e293b; display:flex; align-items:center; justify-content:space-between; padding:0 20px; border-bottom:1px solid #334155;">
                <span style="color:#94a3b8; font-size:14px; font-weight:bold;">MINIJUEGO: \${minigameId}</span>
                <button onclick="advance()" style="background:rgba(239, 68, 68, 0.2); border:1px solid #ef4444; border-radius:6px; color:#ef4444; font-weight:bold; cursor:pointer; padding:5px 15px; transition:0.2s;">
                  SALTAR
                </button>
              </div>
              <iframe id="minigame-frame" src="./minigames/\${minigameId}/index.html" style="flex:1; border:none; background:#000;" sandbox="allow-scripts allow-same-origin"></iframe>
            </div>
            <p style="color:#64748b; font-size:12px; margin-top:15px;">Nota offline: Asegúrate de tener los archivos del minijuego en la carpeta /minigames/\${minigameId}/</p>
          </div>
        \`;

        // Escuchar cuando el iframe mande el mensaje de victoria
        const handleMinigameMsg = (e) => {
          if (e.data && e.data.type === 'MINIGAME_COMPLETE') {
            window.removeEventListener('message', handleMinigameMsg);
            advance();
          }
        };
        window.addEventListener('message', handleMinigameMsg);
      }
      else {
        // Default o tipos no soportados en el mini-motor
        advance();
      }
    }

    // 3. Sistema de Avance (Navegación del Grafo)
    window.advance = function(sourceHandle) {
      let possibleEdges = edges.filter(e => e.source === currentNodeId);
      if (sourceHandle) {
        possibleEdges = possibleEdges.filter(e => e.sourceHandle === sourceHandle);
      }

      if (possibleEdges.length > 0) {
        currentNodeId = possibleEdges[0].target;
        renderNode();
        
        // Si avanzamos a un nodo que NO es diálogo, detener Auto/Skip
        const nextNode = nodes.find(n => n.id === currentNodeId);
        if (nextNode && nextNode.type !== 'dialogue' && autoInterval) {
           clearInterval(autoInterval);
           autoInterval = null;
        }
      } else {
        // Fin de la historia
        if (autoInterval) clearInterval(autoInterval);
        container.innerHTML = \`
          <div class="end-screen">
            <h1 style="color:#34d399; font-size: 36px; margin-bottom:10px;">FIN</h1>
            <p style="color:#94a3b8;">Gracias por jugar.</p>
          </div>
        \`;
      }
    };

    window.toggleAuto = function() {
      if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
        const btn = document.getElementById('auto-btn');
        if(btn) btn.style.color = '#94a3b8';
      } else {
        autoInterval = setInterval(() => {
          const nextIndicator = document.getElementById('next-indicator');
          // Solo avanzar automáticamente si ya terminó de escribir
          if (nextIndicator && nextIndicator.style.display === 'block') {
            advance();
          } else {
            // Si está escribiendo, podríamos forzarlo, pero es mejor esperar.
            // Para el modo Auto usualmente se espera a que termine de escribir.
          }
        }, 2000);
        const btn = document.getElementById('auto-btn');
        if(btn) btn.style.color = '#fff';
      }
    };

    window.skipDialogues = function() {
      if (autoInterval) clearInterval(autoInterval);
      const btn = document.getElementById('auto-btn');
      if(btn) btn.style.color = '#94a3b8';
      
      autoInterval = setInterval(() => {
        const node = nodes.find(n => n.id === currentNodeId);
        if (node && node.type !== 'dialogue') {
           clearInterval(autoInterval);
           autoInterval = null;
        } else {
           // Saltar inmediatamente al siguiente nodo sin importar Typewriter
           let possibleEdges = edges.filter(e => e.source === currentNodeId);
           if(possibleEdges.length > 0) {
             currentNodeId = possibleEdges[0].target;
             renderNode();
           } else {
             clearInterval(autoInterval);
             advance(); // Fin
           }
        }
      }, 50); // Saltar rápido
    };

    // 4. Iniciar el juego automáticamente
    if (startNode) {
      currentNodeId = startNode.id;
      renderNode();
    } else {
      container.innerHTML = "<h1 style='color:red'>El mapa está vacío.</h1>";
    }
  </script>
</body>
</html>`;
  
  zip.file('index.html', indexHtml);

  // 3. Crear carpetas de estructura requerida (para que el alumno arrastre media si quiere)
  zip.folder('assets/audio/bgm');
  zip.folder('assets/audio/sfx');
  zip.folder('assets/images/bg');
  zip.folder('assets/images/sprites');
  zip.folder('minigames');

  // Inject used visual assets (Sprites & Backgrounds)
  const usedAssets = new Set<string>();
  nodes.forEach(node => {
    if (node.data.background) usedAssets.add(String(node.data.background));
    if (node.data.sprite) usedAssets.add(String(node.data.sprite));
  });

  for (const assetUrl of usedAssets) {
    if (assetUrl && assetUrl.startsWith('/assets/images/')) {
      try {
        const res = await fetch(assetUrl);
        const blob = await res.blob();
        // Remove leading slash for ZIP relative path
        const relativePath = assetUrl.substring(1); 
        zip.file(relativePath, blob);
      } catch (e) {
        console.warn(`No se pudo empaquetar asset: ${assetUrl}`, e);
      }
    }
  }

  // Inject default minigame to prevent offline empty iframe crash
  try {
    const minigameHtml = await fetch(`${import.meta.env.BASE_URL}minigames/quiz_lab/index.html`).then(res => res.text());
    zip.file('minigames/quiz_lab/index.html', minigameHtml);
  } catch (e) {
    console.warn("No se pudo empaquetar quiz_lab automáticamente. Se requerirá inserción manual.", e);
  }

  // 4. Generar y descargar el ZIP
  try {
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${projectName.replace(/\s+/g, '_')}_Bundle.zip`);
    return true;
  } catch (e) {
    console.error("Error al exportar:", e);
    return false;
  }
};
