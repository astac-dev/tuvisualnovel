/**
 * game.js - Lógica de tu minijuego
 * 
 * Este archivo contiene la estructura básica para empezar a programar.
 */

// 1. Escuchar la configuración inicial (Opcional pero recomendado)
if (window.NovelBridge) {
  window.NovelBridge.onInit((config) => {
    // Aquí recibes variables que configuraste en el nodo "Minijuego" en TuVisualNovel
    console.log("El juego ha iniciado con esta configuración:", config);
    
    // Ejemplo:
    // if (config.difficulty === 'hard') {
    //   // Hacer el juego más difícil
    // }
  });
}

// 2. Aquí va la lógica de tu juego (Temporizadores, eventos de click, canvas, etc.)
// ...



// 3. Función para terminar el juego y avisarle al motor de la novela visual
function terminarJuego(fueVictoria) {
  
  // Puedes mostrar un mensaje final o animación aquí antes de cerrar
  console.log(fueVictoria ? "¡Ganaste!" : "Perdiste...");

  // Llamar al puente de comunicación
  if (window.NovelBridge) {
    window.NovelBridge.finish({
      success: fueVictoria,
      scoreGained: fueVictoria ? 50 : 0, // Puntos a sumar en la novela
      // itemsUnlocked: fueVictoria ? ["llave_secreta"] : [] // Objetos para el inventario
    });
  }
}
