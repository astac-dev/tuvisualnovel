/**
 * NovelBridge SDK
 * 
 * Este archivo actúa como un puente de comunicación entre tu minijuego
 * y el motor principal de TuVisualNovel.
 * 
 * Permite recibir configuraciones (dificultad, límites de tiempo) y enviar
 * los resultados (victoria, puntos, objetos desbloqueados) al terminar.
 */

window.NovelBridge = {
  _initCallback: null,

  /**
   * Registra una función que se ejecutará cuando el motor de TuVisualNovel
   * inicie este minijuego.
   * 
   * @param {function} callback Función que recibe un objeto con la configuración.
   * Ejemplo: NovelBridge.onInit((config) => { console.log(config.difficulty); });
   */
  onInit: function(callback) {
    this._initCallback = callback;
  },

  /**
   * Llama a este método cuando el jugador termine el minijuego.
   * 
   * @param {object} resultData Objeto con los resultados de la partida.
   * Debe tener la siguiente estructura:
   * {
   *   success: true/false,       // Si el jugador ganó o perdió
   *   scoreGained: 25,           // Puntos obtenidos (opcional)
   *   itemsUnlocked: ["item1"],  // IDs de items para el inventario (opcional)
   *   targetLabel: "capitulo_2"  // Hacia dónde saltar en la historia (opcional)
   * }
   */
  finish: function(resultData) {
    // Se envía el mensaje al padre (El motor de la Novela Visual)
    window.parent.postMessage({
      type: 'MINIGAME_COMPLETE',
      payload: resultData
    }, '*');
  }
};

// Escuchador interno para recibir la inicialización desde el Motor principal
window.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'MINIGAME_INIT') {
    if (window.NovelBridge._initCallback) {
      window.NovelBridge._initCallback(event.data.payload || {});
    }
  }
});
