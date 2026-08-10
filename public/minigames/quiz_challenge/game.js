const questions = [
  {
    q: "¿Cuál es el lenguaje estándar para estructurar la web?",
    options: ["Python", "HTML", "C++", "Java"],
    correct: 1
  },
  {
    q: "¿Qué significan las siglas CSS?",
    options: ["Cascading Style Sheets", "Computer Style System", "Creative Style Source", "Cascading Simple Sheets"],
    correct: 0
  },
  {
    q: "¿Qué etiqueta HTML se usa para incluir código JavaScript?",
    options: ["<js>", "<javascript>", "<script>", "<code>"],
    correct: 2
  }
];

let currentQuestionIndex = 0;
let correctAnswers = 0;
let timeLimit = 15; // 15 seconds per question
let timeLeft = timeLimit;
let timerInterval = null;
let isAnswered = false;

const questionText = document.getElementById('questionText');
const optionsGrid = document.getElementById('optionsGrid');
const timerFill = document.getElementById('timerFill');
const currentQSpan = document.getElementById('currentQ');
const resultScreen = document.getElementById('resultScreen');

if (window.NovelBridge) {
  window.NovelBridge.onInit((config) => {
    if (config.difficulty === 'hard') timeLimit = 8;
    if (config.difficulty === 'easy') timeLimit = 25;
    timeLeft = timeLimit;
  });
}

function loadQuestion() {
  isAnswered = false;
  timeLeft = timeLimit;
  updateTimerUI();
  
  const qData = questions[currentQuestionIndex];
  currentQSpan.textContent = currentQuestionIndex + 1;
  document.getElementById('totalQ').textContent = questions.length;
  questionText.textContent = qData.q;
  
  optionsGrid.innerHTML = '';
  
  qData.options.forEach((opt, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = () => handleAnswer(index, btn);
    optionsGrid.appendChild(btn);
  });

  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft -= 0.1;
    updateTimerUI();
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 100);
}

function updateTimerUI() {
  const percentage = (timeLeft / timeLimit) * 100;
  timerFill.style.width = `${Math.max(0, percentage)}%`;
  
  if (percentage < 30) {
    timerFill.style.backgroundColor = '#f56565'; // Red
  } else if (percentage < 60) {
    timerFill.style.backgroundColor = '#ecc94b'; // Yellow
  } else {
    timerFill.style.backgroundColor = '#48bb78'; // Green
  }
}

function handleAnswer(selectedIndex, btnElement) {
  if (isAnswered) return;
  isAnswered = true;
  clearInterval(timerInterval);
  
  const correctIndex = questions[currentQuestionIndex].correct;
  const buttons = optionsGrid.querySelectorAll('.option-btn');
  
  buttons.forEach(btn => btn.disabled = true);
  
  if (selectedIndex === correctIndex) {
    btnElement.classList.add('correct');
    correctAnswers++;
  } else {
    btnElement.classList.add('incorrect');
    buttons[correctIndex].classList.add('correct'); // Highlight correct
  }
  
  setTimeout(nextQuestion, 1500);
}

function handleTimeout() {
  if (isAnswered) return;
  isAnswered = true;
  
  const correctIndex = questions[currentQuestionIndex].correct;
  const buttons = optionsGrid.querySelectorAll('.option-btn');
  
  buttons.forEach(btn => btn.disabled = true);
  buttons[correctIndex].classList.add('correct');
  
  setTimeout(nextQuestion, 1500);
}

function nextQuestion() {
  currentQuestionIndex++;
  
  if (currentQuestionIndex < questions.length) {
    loadQuestion();
  } else {
    endGame();
  }
}

function endGame() {
  document.querySelector('.header').classList.add('hidden');
  questionText.parentElement.classList.add('hidden');
  optionsGrid.classList.add('hidden');
  resultScreen.classList.remove('hidden');
  
  const accuracy = correctAnswers / questions.length;
  const isWin = accuracy >= 0.66;
  
  document.getElementById('finalTitle').textContent = isWin ? '¡Prueba Superada!' : 'Prueba Fallida';
  document.getElementById('finalStats').textContent = `Respuestas correctas: ${correctAnswers} de ${questions.length}`;
  
  setTimeout(() => {
    if (window.NovelBridge) {
      window.NovelBridge.finish({
        success: isWin,
        scoreGained: correctAnswers * 10
      });
    }
  }, 2500);
}

loadQuestion();
