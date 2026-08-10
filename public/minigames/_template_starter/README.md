# Guía Rápida: Crea tu propio Minijuego

¡Hola estudiante! Esta carpeta es una plantilla limpia para que puedas programar tu propio minijuego usando HTML, CSS y JavaScript, y luego conectarlo directamente a TuVisualNovel.

## 🚀 Pasos para empezar

### 1. Duplica esta carpeta
Nunca trabajes directamente en `_template_starter`. Copia esta carpeta y ponle un nombre sin espacios relacionado a tu juego (por ejemplo: `mi_juego_memoria` o `laberinto`).

### 2. Edita la Interfaz (HTML y CSS)
- Abre `index.html` y diseña la estructura de tu juego.
- Todo tu diseño debe verse bien en una ventana, ya que aparecerá flotando sobre la novela visual.
- Puedes agregar tus propios archivos `.css` o usar etiquetas `<style>`.

### 3. Programa la Lógica (JavaScript)
- Abre `game.js`. Aquí es donde escribirás las reglas de tu juego.
- **¡Importante!** Mantén la importación de `bridge.js` en tu `index.html`, ya que es el puente que conecta tu código con el motor de TuVisualNovel.

### 4. Avisa cuando el juego termine
Cuando el jugador gane o pierda, debes llamar a la función `window.NovelBridge.finish()`.
Mira el ejemplo en `game.js` para ver cómo sumar puntos o dar recompensas dependiendo de si el jugador ganó o perdió.

### 5. Conéctalo en TuVisualNovel
1. Ve al Editor Visual.
2. Arrastra el nodo **Minijuego** (categoría naranja/amarilla).
3. Haz clic en el nodo y en el Panel Inspector, en la caja "Minijuego ID", escribe exactamente el nombre de la carpeta de tu juego (ej: `mi_juego_memoria`).
4. ¡Prueba tu novela! Al llegar a ese nodo, tu código HTML/JS se abrirá automáticamente.

---

> **Tip de Pro:** Revisa el código de los otros minijuegos (como `terminal_hack` o `quiz_challenge`) para inspirarte y ver cómo otros desarrolladores usaron JavaScript para hacer cosas increíbles.
