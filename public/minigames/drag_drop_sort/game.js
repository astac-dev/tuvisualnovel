const itemsData = [
  { id: 'item1', text: 'Manzana', category: 'organico' },
  { id: 'item2', text: 'Botella de Plástico', category: 'inorganico' },
  { id: 'item3', text: 'Cáscara de Plátano', category: 'organico' },
  { id: 'item4', text: 'Lata de Aluminio', category: 'inorganico' },
  { id: 'item5', text: 'Hojas secas', category: 'organico' },
  { id: 'item6', text: 'Bolsa de nylon', category: 'inorganico' }
];

let totalItems = itemsData.length;
let itemsPlaced = 0;

const itemsPool = document.getElementById('itemsPool');
const dropZones = document.querySelectorAll('.drop-zone');
const verifyBtn = document.getElementById('verifyBtn');

// Inicializar NovelBridge (Opcional, si envían config)
if (window.NovelBridge) {
  window.NovelBridge.onInit((config) => {
    console.log("Configuración del engine:", config);
  });
}

function initGame() {
  // Desordenar los items aleatoriamente
  itemsData.sort(() => Math.random() - 0.5);

  itemsData.forEach(data => {
    const el = document.createElement('div');
    el.classList.add('draggable-item');
    el.textContent = data.text;
    el.setAttribute('draggable', 'true');
    el.dataset.id = data.id;
    el.dataset.category = data.category;
    
    // Eventos Drag and Drop
    el.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', data.id);
      setTimeout(() => el.classList.add('dragging'), 0);
    });
    
    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
    });

    itemsPool.appendChild(el);
  });
}

// Configurar zonas para soltar
dropZones.forEach(zone => {
  const container = zone.querySelector('.items-container');

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('drag-over');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    
    const id = e.dataTransfer.getData('text/plain');
    const draggableEl = document.querySelector(`[data-id='${id}']`);
    
    if (draggableEl) {
      // Si el elemento viene del pool original, contamos
      if (draggableEl.parentElement === itemsPool) {
        itemsPlaced++;
      }
      container.appendChild(draggableEl);
      checkAllPlaced();
    }
  });
});

// Permitir devolver al pool original
itemsPool.addEventListener('dragover', e => e.preventDefault());
itemsPool.addEventListener('drop', (e) => {
  e.preventDefault();
  const id = e.dataTransfer.getData('text/plain');
  const draggableEl = document.querySelector(`[data-id='${id}']`);
  
  if (draggableEl && draggableEl.parentElement !== itemsPool) {
    itemsPlaced--;
    itemsPool.appendChild(draggableEl);
    checkAllPlaced();
  }
});

function checkAllPlaced() {
  verifyBtn.disabled = itemsPlaced !== totalItems;
}

verifyBtn.addEventListener('click', () => {
  let mistakes = 0;
  
  dropZones.forEach(zone => {
    const zoneCategory = zone.dataset.category;
    const items = zone.querySelectorAll('.draggable-item');
    
    items.forEach(item => {
      item.setAttribute('draggable', 'false'); // Desactivar drag
      if (item.dataset.category === zoneCategory) {
        item.classList.add('correct');
      } else {
        item.classList.add('incorrect');
        mistakes++;
      }
    });
  });

  verifyBtn.disabled = true;
  verifyBtn.textContent = mistakes === 0 ? '¡Perfecto!' : 'Completado con errores';

  setTimeout(() => {
    if (window.NovelBridge) {
      window.NovelBridge.finish({
        success: mistakes === 0,
        scoreGained: mistakes === 0 ? 20 : 5
      });
    }
  }, 2000);
});

initGame();
