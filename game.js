// Game Configuration
const CONFIG = {
    GAME_DURATION: 90, // seconds
    ROWS: 3,
    COLS: 4,
    HOLE_RADIUS: 50,
    JERRY_RADIUS: 35,
    HIT_RADIUS_MULTIPLIER: 1.8, // Make hit detection 80% larger than Jerry
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
    hammerCursor: null,
    hitEffects: [], // Store active hit effects
    playerName: '',
    leaderboard: [],
};

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const playerNameElement = document.getElementById('playerName');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const gameMessage = document.getElementById('gameMessage');
const nameModal = document.getElementById('nameModal');
const playerNameInput = document.getElementById('playerNameInput');
const submitNameBtn = document.getElementById('submitNameBtn');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const leaderboardModal = document.getElementById('leaderboardModal');
const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
const leaderboardList = document.getElementById('leaderboardList');

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
        // Larger hit detection area for easier gameplay
        return distance < (CONFIG.JERRY_RADIUS * CONFIG.HIT_RADIUS_MULTIPLIER);
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

// Load leaderboard from Firebase
function loadLeaderboard() {
    // Show loading state
    if (leaderboardList) {
        leaderboardList.innerHTML = '<div class="leaderboard-empty">Loading leaderboard...</div>';
    }

    // Listen for real-time updates from Firebase
    leaderboardRef.orderByChild('score').limitToLast(100).on('value', (snapshot) => {
        gameState.leaderboard = [];

        snapshot.forEach((childSnapshot) => {
            gameState.leaderboard.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });

        // Sort by score (descending) and keep only top 10
        gameState.leaderboard.sort((a, b) => b.score - a.score);
        gameState.leaderboard = gameState.leaderboard.slice(0, 10);

        // Update display if leaderboard modal is open
        if (!leaderboardModal.classList.contains('hidden')) {
            displayLeaderboard();
        }
    }, (error) => {
        console.error('Error loading leaderboard:', error);
        gameState.leaderboard = [];
    });
}

// Add score to Firebase leaderboard
function addToLeaderboard(name, score) {
    const entry = {
        name: name,
        score: score,
        date: new Date().toLocaleDateString(),
        timestamp: Date.now()
    };

    // Push to Firebase (it will auto-generate a unique ID)
    leaderboardRef.push(entry, (error) => {
        if (error) {
            console.error('Error adding score to leaderboard:', error);
            alert('Failed to save score to leaderboard. Please check your internet connection.');
        } else {
            console.log('Score saved successfully!');

            // Clean up old entries (keep only top 100)
            cleanupLeaderboard();
        }
    });
}

// Clean up leaderboard to keep only top 100 scores
function cleanupLeaderboard() {
    leaderboardRef.orderByChild('score').once('value', (snapshot) => {
        const entries = [];
        snapshot.forEach((childSnapshot) => {
            entries.push({
                id: childSnapshot.key,
                score: childSnapshot.val().score
            });
        });

        // Sort by score descending
        entries.sort((a, b) => b.score - a.score);

        // Delete entries beyond top 100
        if (entries.length > 100) {
            const toDelete = entries.slice(100);
            toDelete.forEach((entry) => {
                leaderboardRef.child(entry.id).remove();
            });
        }
    });
}

// Display leaderboard
function displayLeaderboard() {
    leaderboardList.innerHTML = '';

    if (gameState.leaderboard.length === 0) {
        leaderboardList.innerHTML = '<div class="leaderboard-empty">No scores yet. Be the first!</div>';
        return;
    }

    // Show top 5
    const topFive = gameState.leaderboard.slice(0, 5);

    topFive.forEach((entry, index) => {
        const rank = index + 1;
        const item = document.createElement('div');
        item.className = `leaderboard-item ${rank <= 3 ? `top-${rank}` : ''}`;

        const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

        item.innerHTML = `
            <div class="leaderboard-rank">${rankEmoji}</div>
            <div class="leaderboard-name">${entry.name}</div>
            <div class="leaderboard-score">${entry.score} pts</div>
            <div class="leaderboard-date">${entry.date}</div>
        `;

        leaderboardList.appendChild(item);
    });
}

// Show leaderboard modal
function showLeaderboard() {
    displayLeaderboard();
    leaderboardModal.classList.remove('hidden');
}

// Hide leaderboard modal
function hideLeaderboard() {
    leaderboardModal.classList.add('hidden');
}

// Update UI
function updateUI() {
    scoreElement.textContent = gameState.score;
    timerElement.textContent = gameState.timeRemaining;
    if (gameState.playerName) {
        playerNameElement.textContent = gameState.playerName;
    }
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

    // Prevent default touch behavior to ensure accurate coordinates
    if (event.touches) {
        event.preventDefault();
    }

    // Support both mouse and touch events - get the touch/click coordinates
    let clientX, clientY;
    if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else if (event.clientX !== undefined) {
        clientX = event.clientX;
        clientY = event.clientY;
    } else {
        return; // No valid coordinates
    }

    // Update hammer position immediately to sync with hit detection
    if (gameState.hammerCursor) {
        gameState.hammerCursor.style.left = clientX + 'px';
        gameState.hammerCursor.style.top = clientY + 'px';
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (clientX - rect.left) * scaleX;
    const mouseY = (clientY - rect.top) * scaleY;

    let hitDetected = false;

    // Animate hammer cursor
    if (gameState.hammerCursor) {
        gameState.hammerCursor.classList.add('hitting');
        setTimeout(() => {
            if (gameState.hammerCursor) {
                gameState.hammerCursor.classList.remove('hitting');
            }
        }, 200);
    }

    for (const hole of gameState.holes) {
        if (hole.hitJerry(mouseX, mouseY)) {
            gameState.score++;
            updateUI();
            hole.hideJerry();
            playHitSound();
            hitDetected = true;

            // Enhanced visual feedback
            createHitEffect(hole.x, hole.y, mouseX, mouseY);
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

// Create enhanced hit effect animation
function createHitEffect(holeX, holeY, clickX, clickY) {
    const effect = {
        x: holeX,
        y: holeY,
        clickX: clickX,
        clickY: clickY,
        startTime: Date.now(),
        duration: 500,
    };

    gameState.hitEffects.push(effect);

    // Remove effect after duration
    setTimeout(() => {
        const index = gameState.hitEffects.indexOf(effect);
        if (index > -1) {
            gameState.hitEffects.splice(index, 1);
        }
    }, effect.duration);
}

// Draw all hit effects
function drawHitEffects() {
    const currentTime = Date.now();

    for (const effect of gameState.hitEffects) {
        const elapsed = currentTime - effect.startTime;
        if (elapsed > effect.duration) continue;

        const progress = elapsed / effect.duration;

        ctx.save();

        // Expanding golden ring
        const radius1 = CONFIG.JERRY_RADIUS * (1 + progress * 2);
        const alpha1 = 1 - progress;
        ctx.strokeStyle = `rgba(255, 215, 0, ${alpha1})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius1, 0, Math.PI * 2);
        ctx.stroke();

        // Secondary ring
        const radius2 = CONFIG.JERRY_RADIUS * (1 + progress * 1.5);
        const alpha2 = (1 - progress) * 0.7;
        ctx.strokeStyle = `rgba(255, 140, 0, ${alpha2})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius2, 0, Math.PI * 2);
        ctx.stroke();

        // Burst particles
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = CONFIG.JERRY_RADIUS * (1 + progress * 2);
            const px = effect.x + Math.cos(angle) * distance;
            const py = effect.y + Math.sin(angle) * distance;
            const particleAlpha = 1 - progress;
            const particleSize = 8 * (1 - progress * 0.5);

            ctx.fillStyle = `rgba(255, 215, 0, ${particleAlpha})`;
            ctx.beginPath();
            ctx.arc(px, py, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // "HIT!" text that fades and rises
        if (progress < 0.7) {
            const textProgress = progress / 0.7;
            const textAlpha = 1 - textProgress;
            const textY = effect.y - CONFIG.JERRY_RADIUS - (textProgress * 40);

            ctx.font = 'bold 32px Arial';
            ctx.fillStyle = `rgba(255, 215, 0, ${textAlpha})`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('HIT!', effect.x, textY);

            // Text outline
            ctx.strokeStyle = `rgba(255, 100, 0, ${textAlpha})`;
            ctx.lineWidth = 3;
            ctx.strokeText('HIT!', effect.x, textY);
        }

        ctx.restore();
    }
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

    // Draw hit effects on top
    drawHitEffects();

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

// Create mobile hammer cursor
function createHammerCursor() {
    if (!gameState.hammerCursor) {
        const hammer = document.createElement('div');
        hammer.className = 'hammer-cursor';
        hammer.textContent = '🔨';
        hammer.style.display = 'none';
        document.body.appendChild(hammer);
        gameState.hammerCursor = hammer;
    }
}

// Update hammer cursor position
function updateHammerPosition(event) {
    if (!gameState.hammerCursor || !gameState.isPlaying) return;

    let clientX, clientY;
    if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else if (event.clientX !== undefined) {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    if (clientX !== undefined && clientY !== undefined) {
        gameState.hammerCursor.style.display = 'block';
        gameState.hammerCursor.style.left = clientX + 'px';
        gameState.hammerCursor.style.top = clientY + 'px';
    }
}

// Show name input modal
function showNameInput() {
    nameModal.classList.remove('hidden');
    playerNameInput.value = '';
    playerNameInput.focus();
}

// Hide name input modal
function hideNameInput() {
    nameModal.classList.add('hidden');
}

// Handle name submission
function submitName() {
    const name = playerNameInput.value.trim();

    if (name.length === 0) {
        alert('Please enter your name!');
        return;
    }

    gameState.playerName = name;
    hideNameInput();
    actuallyStartGame();
}

// Request to start game (shows name input first)
function requestStartGame() {
    showNameInput();
}

// Actually start the game (after name is entered)
function actuallyStartGame() {
    // Reset game state
    gameState.score = 0;
    gameState.timeRemaining = CONFIG.GAME_DURATION;
    gameState.isPlaying = true;
    gameState.popInterval = CONFIG.INITIAL_POP_INTERVAL;
    gameState.activeJerries.clear();
    gameState.hitEffects = [];

    // Reset holes
    gameState.holes.forEach(hole => hole.hideJerry());

    // Update UI
    updateUI();
    gameMessage.classList.add('hidden');
    startBtn.classList.add('hidden');
    restartBtn.classList.add('hidden');

    // Lock body scroll on mobile
    document.body.classList.add('playing');

    // Show hammer cursor
    if (gameState.hammerCursor) {
        gameState.hammerCursor.style.display = 'block';
    }

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

    // Unlock body scroll
    document.body.classList.remove('playing');

    // Hide hammer cursor
    if (gameState.hammerCursor) {
        gameState.hammerCursor.style.display = 'none';
    }

    // Add score to leaderboard
    if (gameState.score > 0 && gameState.playerName) {
        addToLeaderboard(gameState.playerName, gameState.score);
    }

    // Play game over sound
    playGameOverSound();

    // Check if player made it to top 5
    const playerRank = gameState.leaderboard.findIndex(entry =>
        entry.name === gameState.playerName && entry.score === gameState.score
    ) + 1;

    const madeTopFive = playerRank > 0 && playerRank <= 5;

    // Show game over message
    gameMessage.innerHTML = `
        <div>Game Over, ${gameState.playerName}!</div>
        <div style="font-size: 1.5rem; margin-top: 10px;">
            Final Score: ${gameState.score}
        </div>
        ${madeTopFive ? `<div style="font-size: 1.2rem; color: #FFD700; margin-top: 5px;">🎉 Rank #${playerRank} on Leaderboard! 🎉</div>` : ''}
    `;
    gameMessage.classList.remove('hidden');
    restartBtn.classList.remove('hidden');
}

// Event listeners
startBtn.addEventListener('click', requestStartGame);
restartBtn.addEventListener('click', requestStartGame);
canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('touchstart', handleCanvasClick);

// Name input
submitNameBtn.addEventListener('click', submitName);
playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitName();
    }
});

// Leaderboard
leaderboardBtn.addEventListener('click', showLeaderboard);
closeLeaderboardBtn.addEventListener('click', hideLeaderboard);

// Close modals on background click
nameModal.addEventListener('click', (e) => {
    if (e.target === nameModal) {
        // Don't allow closing name modal by clicking background
        // Player must enter a name
    }
});

leaderboardModal.addEventListener('click', (e) => {
    if (e.target === leaderboardModal) {
        hideLeaderboard();
    }
});

// Track hammer cursor position
document.addEventListener('mousemove', updateHammerPosition);
document.addEventListener('touchmove', updateHammerPosition, { passive: false });

// Initialize game
function init() {
    initHoles();
    loadLeaderboard();
    createHammerCursor();

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
