// Variables globales
let secretCode = [];
let maxAttempts = 8;
let currentAttempts = 0;
let isGameOver = false;

// Elementos del DOM
const outputDiv = document.getElementById('output');
const inputField = document.getElementById('commandInput');
const submitBtn = document.getElementById('submitBtn');
const attemptsSpan = document.getElementById('attemptsLeft');

// Inicializar NovelBridge
if (window.NovelBridge) {
  window.NovelBridge.onInit((config) => {
    // Podemos recibir configuración de dificultad desde la Novela Visual
    if (config.difficulty === 'hard') {
      maxAttempts = 5;
    } else if (config.difficulty === 'easy') {
      maxAttempts = 12;
    }
    attemptsSpan.textContent = maxAttempts;
    printMsg(`[Sistema] Modo de dificultad recibido: ${config.difficulty || 'normal'}`, 'warning');
  });
}

function initGame() {
  // Generar código aleatorio de 4 dígitos únicos
  let digits = [0,1,2,3,4,5,6,7,8,9];
  for (let i = 0; i < 4; i++) {
    let randomIndex = Math.floor(Math.random() * digits.length);
    secretCode.push(digits[randomIndex]);
    digits.splice(randomIndex, 1); // Remover para que no se repita
  }
  // console.log("Secreto (sólo para dev):", secretCode.join(''));
}

function printMsg(text, cssClass = '') {
  const p = document.createElement('p');
  p.textContent = text;
  if (cssClass) p.className = cssClass;
  outputDiv.appendChild(p);
  outputDiv.scrollTop = outputDiv.scrollHeight;
}

function checkGuess(guess) {
  if (guess.length !== 4 || isNaN(guess)) {
    printMsg(`> ${guess}`);
    printMsg("Error: El código debe contener exactamente 4 números.", "error");
    return;
  }

  currentAttempts++;
  let guessArr = guess.split('').map(Number);
  
  let correctPositions = 0;
  let correctNumbers = 0;

  for (let i = 0; i < 4; i++) {
    if (guessArr[i] === secretCode[i]) {
      correctPositions++;
    } else if (secretCode.includes(guessArr[i])) {
      correctNumbers++;
    }
  }

  printMsg(`> ${guess}`);
  
  if (correctPositions === 4) {
    printMsg("¡ACCESO CONCEDIDO! Sistema vulnerado.", "success");
    endGame(true);
  } else {
    printMsg(`Analizando... [${correctPositions}] exactos, [${correctNumbers}] en posición incorrecta.`);
    attemptsSpan.textContent = maxAttempts - currentAttempts;
    
    if (currentAttempts >= maxAttempts) {
      printMsg("¡ALERTA! Demasiados intentos fallidos. Bloqueo de seguridad activado.", "error");
      printMsg(`El código correcto era: ${secretCode.join('')}`, "error");
      endGame(false);
    }
  }
}

function endGame(isWin) {
  isGameOver = true;
  inputField.disabled = true;
  submitBtn.disabled = true;

  setTimeout(() => {
    // Informamos al motor de la Visual Novel el resultado
    if (window.NovelBridge) {
      window.NovelBridge.finish({
        success: isWin,
        scoreGained: isWin ? 30 : 0,
        itemsUnlocked: isWin ? ["pase_seguridad"] : []
      });
    }
  }, 2000); // Pequeño retraso para que el estudiante lea el resultado final
}

// Event Listeners
submitBtn.addEventListener('click', () => {
  if (isGameOver) return;
  const val = inputField.value;
  inputField.value = '';
  checkGuess(val);
  inputField.focus();
});

inputField.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    submitBtn.click();
  }
});

// Arrancar
initGame();
