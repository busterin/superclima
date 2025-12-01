// ------------------------------
// Configuración del juego
// ------------------------------
const TOTAL_TIME = 60;   // segundos de partida
const TARGET_SWITCHES = 30; // interruptores que hay que apagar
const NUM_SWITCHES = 8;

const SWITCH_ON_SRC = "./images/interruptoron.jpg";
const SWITCH_OFF_SRC = "./images/interruptoroff.jpg"; // ajusta si tu archivo se llama distinto

// Intervalos (en ms) para encender interruptores:
const MIN_SPAWN_INTERVAL = 600;
const MAX_SPAWN_INTERVAL = 1200;

// ------------------------------
// Estado
// ------------------------------
let timeLeft = TOTAL_TIME;
let score = 0;
let gameRunning = false;

let timerInterval = null;
let spawnTimeout = null;

const switches = []; // array de objetos { element, isOn }

// ------------------------------
// Inicialización
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  setupUI();
  createSwitches();
  resetGame();
  startGame();
});

// ------------------------------
// Funciones de UI
// ------------------------------
function setupUI() {
  document.getElementById("target").textContent = TARGET_SWITCHES;

  const retryBtn = document.getElementById("retry-btn");
  const nextBtn = document.getElementById("next-btn");

  retryBtn.addEventListener("click", () => {
    hideOverlay();
    resetGame();
    startGame();
  });

  nextBtn.addEventListener("click", () => {
    // Aquí podrás enlazar al siguiente minijuego cuando lo tengas:
    // window.location.href = "minijuego2.html";
    // De momento simplemente reiniciamos:
    hideOverlay();
    resetGame();
    startGame();
  });
}

function createSwitches() {
  const grid = document.getElementById("switch-grid");
  grid.innerHTML = ""; // por si acaso

  for (let i = 0; i < NUM_SWITCHES; i++) {
    const switchDiv = document.createElement("div");
    switchDiv.classList.add("switch");

    const img = document.createElement("img");
    img.src = SWITCH_OFF_SRC;
    img.alt = "Interruptor";

    switchDiv.appendChild(img);
    grid.appendChild(switchDiv);

    const switchData = {
      element: switchDiv,
      imgElement: img,
      isOn: false,
    };

    switchDiv.addEventListener("click", () => handleSwitchClick(switchData));

    switches.push(switchData);
  }
}

// ------------------------------
// Lógica del juego
// ------------------------------
function resetGame() {
  timeLeft = TOTAL_TIME;
  score = 0;
  gameRunning = false;
  updateTime();
  updateScore();

  // Apagar todos los interruptores
  switches.forEach((sw) => {
    sw.isOn = false;
    sw.imgElement.src = SWITCH_OFF_SRC;
  });

  clearIntervalsAndTimeouts();
}

function startGame() {
  gameRunning = true;
  startTimer();
  scheduleNextSpawn();
}

function clearIntervalsAndTimeouts() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  if (spawnTimeout) {
    clearTimeout(spawnTimeout);
    spawnTimeout = null;
  }
}

// Cronómetro
function startTimer() {
  updateTime();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTime();

    if (timeLeft <= 0) {
      timeLeft = 0;
      updateTime();
      endGame();
    }
  }, 1000);
}

function updateTime() {
  const timeSpan = document.getElementById("time-remaining");
  timeSpan.textContent = timeLeft.toString();
}

function updateScore() {
  const scoreSpan = document.getElementById("score");
  scoreSpan.textContent = score.toString();
}

// Encender interruptores al azar
function scheduleNextSpawn() {
  if (!gameRunning) return;

  const delay =
    Math.floor(
      Math.random() * (MAX_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL + 1)
    ) + MIN_SPAWN_INTERVAL;

  spawnTimeout = setTimeout(() => {
    turnOnRandomSwitch();
    scheduleNextSpawn();
  }, delay);
}

function turnOnRandomSwitch() {
  if (!gameRunning) return;

  // Buscamos interruptores que estén apagados:
  const offSwitches = switches.filter((sw) => !sw.isOn);

  if (offSwitches.length === 0) {
    // Todos encendidos, no hacemos nada en esta ronda
    return;
  }

  const randomIndex = Math.floor(Math.random() * offSwitches.length);
  const chosenSwitch = offSwitches[randomIndex];

  chosenSwitch.isOn = true;
  chosenSwitch.imgElement.src = SWITCH_ON_SRC;
}

// Click sobre interruptor
function handleSwitchClick(switchData) {
  if (!gameRunning) return;

  if (switchData.isOn) {
    // Solo cuenta si estaba encendido
    switchData.isOn = false;
    switchData.imgElement.src = SWITCH_OFF_SRC;

    score++;
    updateScore();

    if (score >= TARGET_SWITCHES) {
      // Has ganado antes de que acabe el tiempo
      endGame(true);
    }
  }
}

// Fin de partida
function endGame(forceWin = false) {
  if (!gameRunning) return;

  gameRunning = false;
  clearIntervalsAndTimeouts();

  const win = forceWin || score >= TARGET_SWITCHES;

  if (win) {
    showOverlay(
      "¡Lo has conseguido! 🎉",
      "Has apagado suficientes interruptores a tiempo. ¡La energía te lo agradece!"
    );
  } else {
    showOverlay(
      "Has fallado 😢",
      "No has llegado a apagar 30 interruptores. ¡Inténtalo de nuevo!"
    );
  }
}

// ------------------------------
// Overlay de resultado
// ------------------------------
function showOverlay(title, message) {
  const overlay = document.getElementById("result-overlay");
  const titleEl = document.getElementById("result-title");
  const messageEl = document.getElementById("result-message");

  titleEl.textContent = title;
  messageEl.textContent = message;
  overlay.classList.remove("hidden");
}

function hideOverlay() {
  const overlay = document.getElementById("result-overlay");
  overlay.classList.add("hidden");
}
