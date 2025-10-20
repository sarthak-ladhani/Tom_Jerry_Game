// Game Configuration
const CONFIG = {
    GAME_DURATION: 90, // seconds
    ROWS: 3,
    COLS: 4,
    HOLE_RADIUS: 50,
    JERRY_RADIUS: 35,
    INITIAL_POP_INTERVAL: 1200, // ms
    MIN_POP_INTERVAL: 400, // ms
    DIFFICULTY_INCREASE_RATE: 0.98, // multiplier for decreasing interval
    JERRY_SHOW_TIME: 800, // ms Jerry stays visible
};

// Game State
const gameState = {
    score: 0,
    timeRemaining: CONFIG.GAME_DURATION,
    highScore: 0,
    isPlaying: false,
    holes: [],
    popInterval: CONFIG.INITIAL_POP_INTERVAL,
    activeJerries: new Set(),
    gameLoopId: null,
    popTimeoutId: null,
    timerIntervalId: null,
};

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const gameMessage = document.getElementById('gameMessage');

// Sound Effects (using Web Audio API)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Sound generation functions
function playHitSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playMissSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 200;
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

function playGameOverSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
    oscillator.type = 'triangle';

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Hole class
class Hole {
    constructor(x, y, index) {
        this.x = x;
        this.y = y;
        this.index = index;
        this.hasJerry = false;
        this.jerryAppearTime = 0;
        this.animation = 0; // for pop-up animation
    }

    draw() {
        // Draw hole (brown circle with darker center)
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.arc(this.x, this.y, CONFIG.HOLE_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Inner shadow
        ctx.fillStyle = '#3d2817';
        ctx.beginPath();
        ctx.arc(this.x, this.y, CONFIG.HOLE_RADIUS - 10, 0, Math.PI * 2);
        ctx.fill();

        // Draw Jerry if present
        if (this.hasJerry && this.animation > 0) {
            this.drawJerry();
        }
    }

    drawJerry() {
        const popProgress = Math.min(this.animation / 0.3, 1); // 0 to 1
        const yOffset = CONFIG.JERRY_RADIUS * (1 - popProgress);

        ctx.save();
        ctx.translate(this.x, this.y - yOffset);

        // Jerry's body (gray circle)
        ctx.fillStyle = '#8B8B8B';
        ctx.beginPath();
        ctx.arc(0, 0, CONFIG.JERRY_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Jerry's ears (pink inner)
        // Left ear
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.arc(-CONFIG.JERRY_RADIUS * 0.6, -CONFIG.JERRY_RADIUS * 0.7, CONFIG.JERRY_RADIUS * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Right ear
        ctx.beginPath();
        ctx.arc(CONFIG.JERRY_RADIUS * 0.6, -CONFIG.JERRY_RADIUS * 0.7, CONFIG.JERRY_RADIUS * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Outer ears
        ctx.fillStyle = '#8B8B8B';
        ctx.beginPath();
        ctx.arc(-CONFIG.JERRY_RADIUS * 0.6, -CONFIG.JERRY_RADIUS * 0.8, CONFIG.JERRY_RADIUS * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(CONFIG.JERRY_RADIUS * 0.6, -CONFIG.JERRY_RADIUS * 0.8, CONFIG.JERRY_RADIUS * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-CONFIG.JERRY_RADIUS * 0.3, -CONFIG.JERRY_RADIUS * 0.2, CONFIG.JERRY_RADIUS * 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(CONFIG.JERRY_RADIUS * 0.3, -CONFIG.JERRY_RADIUS * 0.2, CONFIG.JERRY_RADIUS * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-CONFIG.JERRY_RADIUS * 0.25, -CONFIG.JERRY_RADIUS * 0.25, CONFIG.JERRY_RADIUS * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(CONFIG.JERRY_RADIUS * 0.35, -CONFIG.JERRY_RADIUS * 0.25, CONFIG.JERRY_RADIUS * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.arc(0, CONFIG.JERRY_RADIUS * 0.1, CONFIG.JERRY_RADIUS * 0.12, 0, Math.PI * 2);
        ctx.fill();

        // Whiskers
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        // Left whiskers
        ctx.beginPath();
        ctx.moveTo(-CONFIG.JERRY_RADIUS * 0.2, CONFIG.JERRY_RADIUS * 0.1);
        ctx.lineTo(-CONFIG.JERRY_RADIUS * 0.8, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-CONFIG.JERRY_RADIUS * 0.2, CONFIG.JERRY_RADIUS * 0.2);
        ctx.lineTo(-CONFIG.JERRY_RADIUS * 0.8, CONFIG.JERRY_RADIUS * 0.3);
        ctx.stroke();

        // Right whiskers
        ctx.beginPath();
        ctx.moveTo(CONFIG.JERRY_RADIUS * 0.2, CONFIG.JERRY_RADIUS * 0.1);
        ctx.lineTo(CONFIG.JERRY_RADIUS * 0.8, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(CONFIG.JERRY_RADIUS * 0.2, CONFIG.JERRY_RADIUS * 0.2);
        ctx.lineTo(CONFIG.JERRY_RADIUS * 0.8, CONFIG.JERRY_RADIUS * 0.3);
        ctx.stroke();

        ctx.restore();
    }

    showJerry() {
        this.hasJerry = true;
        this.jerryAppearTime = Date.now();
        this.animation = 0;
        gameState.activeJerries.add(this.index);
    }

    hideJerry() {
        this.hasJerry = false;
        this.animation = 0;
        gameState.activeJerries.delete(this.index);
    }

    updateAnimation(deltaTime) {
        if (this.hasJerry) {
            this.animation = Math.min(this.animation + deltaTime, 1);

            // Auto-hide Jerry after show time
            if (Date.now() - this.jerryAppearTime > CONFIG.JERRY_SHOW_TIME) {
                this.hideJerry();
            }
        }
    }

    isClicked(mouseX, mouseY) {
        const distance = Math.sqrt(
            Math.pow(mouseX - this.x, 2) + Math.pow(mouseY - this.y, 2)
        );
        return distance < CONFIG.HOLE_RADIUS;
    }

    hitJerry(mouseX, mouseY) {
        if (!this.hasJerry || this.animation < 0.5) return false;

        const distance = Math.sqrt(
            Math.pow(mouseX - this.x, 2) + Math.pow(mouseY - this.y, 2)
        );
        return distance < CONFIG.JERRY_RADIUS;
    }
}

// Initialize holes
function initHoles() {
    gameState.holes = [];
    const paddingX = 100;
    const paddingY = 80;
    const spacingX = (canvas.width - 2 * paddingX) / (CONFIG.COLS - 1);
    const spacingY = (canvas.height - 2 * paddingY) / (CONFIG.ROWS - 1);

    let index = 0;
    for (let row = 0; row < CONFIG.ROWS; row++) {
        for (let col = 0; col < CONFIG.COLS; col++) {
            const x = paddingX + col * spacingX;
            const y = paddingY + row * spacingY;
            gameState.holes.push(new Hole(x, y, index++));
        }
    }
}

// Load high score from localStorage
function loadHighScore() {
    const saved = localStorage.getItem('tomJerryHighScore');
    gameState.highScore = saved ? parseInt(saved) : 0;
    highScoreElement.textContent = gameState.highScore;
}

// Save high score to localStorage
function saveHighScore() {
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('tomJerryHighScore', gameState.highScore);
        highScoreElement.textContent = gameState.highScore;
    }
}

// Update UI
function updateUI() {
    scoreElement.textContent = gameState.score;
    timerElement.textContent = gameState.timeRemaining;
}

// Pop Jerry from random hole
function popJerry() {
    if (!gameState.isPlaying) return;

    // Get available holes (without Jerry)
    const availableHoles = gameState.holes.filter(hole => !hole.hasJerry);

    if (availableHoles.length > 0) {
        const randomHole = availableHoles[Math.floor(Math.random() * availableHoles.length)];
        randomHole.showJerry();
    }

    // Increase difficulty over time
    gameState.popInterval = Math.max(
        CONFIG.MIN_POP_INTERVAL,
        gameState.popInterval * CONFIG.DIFFICULTY_INCREASE_RATE
    );

    // Schedule next pop
    gameState.popTimeoutId = setTimeout(popJerry, gameState.popInterval);
}

// Handle canvas click
function handleCanvasClick(event) {
    if (!gameState.isPlaying) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    let hitDetected = false;

    for (const hole of gameState.holes) {
        if (hole.hitJerry(mouseX, mouseY)) {
            gameState.score++;
            updateUI();
            hole.hideJerry();
            playHitSound();
            hitDetected = true;

            // Visual feedback
            createHitEffect(hole.x, hole.y);
            break;
        }
    }

    if (!hitDetected) {
        // Check if clicked on an empty hole
        for (const hole of gameState.holes) {
            if (hole.isClicked(mouseX, mouseY) && !hole.hasJerry) {
                playMissSound();
                break;
            }
        }
    }
}

// Create hit effect animation
function createHitEffect(x, y) {
    const startTime = Date.now();
    const duration = 300;

    function animate() {
        const elapsed = Date.now() - startTime;
        if (elapsed > duration) return;

        const progress = elapsed / duration;
        const radius = CONFIG.JERRY_RADIUS * (1 + progress);
        const alpha = 1 - progress;

        ctx.save();
        ctx.strokeStyle = `rgba(255, 200, 0, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        requestAnimationFrame(animate);
    }

    animate();
}

// Game loop
let lastTime = Date.now();
function gameLoop() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastTime) / 1000; // in seconds
    lastTime = currentTime;

    // Clear canvas
    ctx.fillStyle = '#8BC34A'; // grass green background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw holes
    for (const hole of gameState.holes) {
        hole.updateAnimation(deltaTime);
        hole.draw();
    }

    if (gameState.isPlaying) {
        gameState.gameLoopId = requestAnimationFrame(gameLoop);
    }
}

// Start game timer
function startTimer() {
    gameState.timerIntervalId = setInterval(() => {
        gameState.timeRemaining--;
        updateUI();

        if (gameState.timeRemaining <= 0) {
            endGame();
        }
    }, 1000);
}

// Start game
function startGame() {
    // Reset game state
    gameState.score = 0;
    gameState.timeRemaining = CONFIG.GAME_DURATION;
    gameState.isPlaying = true;
    gameState.popInterval = CONFIG.INITIAL_POP_INTERVAL;
    gameState.activeJerries.clear();

    // Reset holes
    gameState.holes.forEach(hole => hole.hideJerry());

    // Update UI
    updateUI();
    gameMessage.classList.add('hidden');
    startBtn.classList.add('hidden');
    restartBtn.classList.add('hidden');

    // Start game systems
    lastTime = Date.now();
    gameLoop();
    startTimer();
    popJerry();
}

// End game
function endGame() {
    gameState.isPlaying = false;

    // Clear all timeouts and intervals
    if (gameState.popTimeoutId) {
        clearTimeout(gameState.popTimeoutId);
    }
    if (gameState.timerIntervalId) {
        clearInterval(gameState.timerIntervalId);
    }
    if (gameState.gameLoopId) {
        cancelAnimationFrame(gameState.gameLoopId);
    }

    // Save high score
    saveHighScore();

    // Play game over sound
    playGameOverSound();

    // Show game over message
    const isNewHighScore = gameState.score === gameState.highScore && gameState.score > 0;
    gameMessage.innerHTML = `
        <div>Game Over!</div>
        <div style="font-size: 1.5rem; margin-top: 10px;">
            Final Score: ${gameState.score}
        </div>
        ${isNewHighScore ? '<div style="font-size: 1.2rem; color: #FFD700; margin-top: 5px;">🎉 New High Score! 🎉</div>' : ''}
    `;
    gameMessage.classList.remove('hidden');
    restartBtn.classList.remove('hidden');
}

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
canvas.addEventListener('click', handleCanvasClick);

// Initialize game
function init() {
    initHoles();
    loadHighScore();

    // Draw initial state
    ctx.fillStyle = '#8BC34A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    gameState.holes.forEach(hole => hole.draw());

    // Show welcome message
    gameMessage.innerHTML = `
        <div>Welcome to Tom & Jerry!</div>
        <div style="font-size: 1.2rem; margin-top: 10px;">
            Click "Start Game" to begin
        </div>
    `;
    gameMessage.classList.remove('hidden');
}

// Start when page loads
init();
