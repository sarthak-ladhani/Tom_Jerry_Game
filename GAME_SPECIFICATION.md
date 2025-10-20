# Tom & Jerry Whack-A-Mole - Complete Game Specification

## 1. Project Overview

### 1.1 Game Concept
A web-based whack-a-mole game themed around the classic Tom & Jerry cartoon. Players assume the role of Tom (the cat) and must whack Jerry (the mouse) as he pops up from various holes. The game features a global leaderboard where players worldwide can compete for the highest score.

### 1.2 Target Audience
- Casual gamers of all ages
- Mobile and desktop users
- Players who enjoy quick, competitive arcade-style games

### 1.3 Platform & Access
- **Platform:** Web browser (desktop and mobile)
- **Hosting:** GitHub Pages
- **URL Pattern:** `https://[username].github.io/Tom_Jerry_Game/`
- **Responsive:** Yes, optimized for smartphones and tablets

---

## 2. Technology Stack

### 2.1 Frontend Technologies
- **HTML5:** Structure and Canvas API
- **CSS3:** Styling, animations, and responsive design
- **JavaScript (ES6+):** Game logic and interactivity
- **Canvas API:** Game rendering

### 2.2 Backend/Database
- **Firebase Realtime Database:** Global leaderboard storage
- **Firebase SDK Version:** 10.7.1 (compat mode)

### 2.3 Audio
- **Web Audio API:** Procedural sound generation (no audio files needed)

### 2.4 Version Control
- **Git/GitHub:** Source control and hosting

---

## 3. File Structure

```
Tom_Jerry_Game/
├── index.html              # Main HTML structure
├── styles.css              # All styling and animations
├── game.js                 # Complete game logic
├── firebase-config.js      # Firebase configuration
├── GAME_SPECIFICATION.md   # This document
├── FIREBASE_SETUP.md       # Firebase setup instructions
├── .gitignore              # Git ignore rules
└── README.md               # Project overview (optional)
```

---

## 4. Game Mechanics

### 4.1 Core Gameplay Loop

1. **Game Start:**
   - Player clicks "Start Game" button
   - Name input modal appears
   - Player enters name (required, max 20 characters)
   - Game begins immediately after name submission

2. **During Gameplay:**
   - Jerry randomly pops up from holes
   - Player clicks/taps Jerry to score points
   - Each successful hit = +1 point
   - Jerry disappears after 800ms if not hit
   - Pop-up frequency increases over time (difficulty progression)
   - Timer counts down from 90 seconds

3. **Game End:**
   - Timer reaches 0
   - Final score displayed
   - Score automatically saved to global Firebase leaderboard
   - Player notified if they made top 5
   - "Play Again" button appears

### 4.2 Game Configuration Constants

```javascript
CONFIG = {
    GAME_DURATION: 90,              // seconds
    ROWS: 3,                        // grid rows
    COLS: 4,                        // grid columns (total 12 holes)
    HOLE_RADIUS: 50,                // pixels
    JERRY_RADIUS: 35,               // pixels
    HIT_RADIUS_MULTIPLIER: 1.8,     // 80% larger hit detection
    INITIAL_POP_INTERVAL: 1200,     // ms between Jerry appearances
    MIN_POP_INTERVAL: 400,          // minimum interval (max difficulty)
    DIFFICULTY_INCREASE_RATE: 0.98, // multiplier per pop
    JERRY_SHOW_TIME: 800,           // ms Jerry stays visible
}
```

### 4.3 Difficulty Progression

- **Initial State:** Jerry pops up every 1200ms
- **Progression:** Each pop reduces interval by 2% (multiply by 0.98)
- **Maximum Difficulty:** Interval reaches minimum of 400ms
- **Formula:** `newInterval = currentInterval * 0.98`
- **Result:** Game becomes progressively harder as time progresses

### 4.4 Scoring System

- **Hit Jerry:** +1 point
- **Miss/Empty hole click:** No penalty (just miss sound)
- **Final Score:** Total hits in 90 seconds
- **No maximum score limit**

---

## 5. UI/UX Design Specifications

### 5.1 Layout Structure

```
┌─────────────────────────────────────────┐
│           Header with Title             │
│        [🏆 Leaderboard Button]          │
├─────────────────────────────────────────┤
│  [Player] [Score: 0] [Time: 90]        │
├─────────────────────────────────────────┤
│                                         │
│         Game Canvas (800x600)           │
│     [12 holes in 4x3 grid layout]      │
│                                         │
├─────────────────────────────────────────┤
│     [Start Game] [Play Again]          │
├─────────────────────────────────────────┤
│          How to Play:                   │
│          • Instructions...              │
└─────────────────────────────────────────┘
```

### 5.2 Color Scheme

**Primary Colors:**
- Purple gradient background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- White game container: `#ffffff`
- Grass green canvas: `#8BC34A`

**Info Boxes:**
- Pink gradient: `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)`

**Buttons:**
- Primary: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Secondary: `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)`
- Leaderboard: `linear-gradient(135deg, #FFD700 0%, #FFA500 100%)`

**Leaderboard Rankings:**
- 1st Place (Gold): `linear-gradient(135deg, #FFD700 0%, #FFA500 100%)`
- 2nd Place (Silver): `linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)`
- 3rd Place (Bronze): `linear-gradient(135deg, #CD7F32 0%, #B87333 100%)`
- Others: `linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)`

### 5.3 Typography

- **Font Family:** 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Heading (h1):** 2.5rem (mobile: 1.4rem)
- **Info Box Label:** 0.9rem (mobile: 0.7rem)
- **Info Box Value:** 1.8rem (mobile: 1.2rem)
- **Button Text:** 1.2rem (mobile: 1rem)
- **Instructions:** 1rem (mobile: 0.85rem)

### 5.4 Canvas Specifications

- **Dimensions:** 800px width × 600px height
- **Responsive:** Scales to fit container with `max-width: 100%`
- **Background:** #8BC34A (grass green)
- **Border Radius:** 10px
- **Custom Cursor:** 64×64px hammer emoji (🔨)

### 5.5 Game Elements Design

**Holes:**
- Outer circle: Brown (#654321), radius 50px
- Inner shadow circle: Darker brown (#3d2817), radius 40px

**Jerry Character:**
- Body: Gray circle (#8B8B8B), radius 35px
- Ears: Pink inner (#FFB6C1), gray outer (#8B8B8B)
- Eyes: Black circles with white shine
- Nose: Pink (#FFB6C1)
- Whiskers: Black lines, 2px width
- Pop-up animation: Smooth vertical emergence over 300ms

**Hammer Cursor:**
- Desktop: 64×64px hammer emoji in cursor
- Mobile: Visible 80×80px hammer element that follows touch/mouse
- Hit animation: Rotate -30deg and scale 1.3× on click

### 5.6 Responsive Breakpoints

**Desktop (> 768px):**
- Full padding: 20-30px
- Canvas: 800×600px (scales down proportionally)
- Info boxes: Horizontal layout
- Button padding: 15px 40px

**Mobile (≤ 768px):**
- Reduced padding: 5-10px
- Canvas: Full width of container
- Info boxes: Still horizontal but smaller
- Button padding: 12px 25px
- Hide date in leaderboard entries

---

## 6. Game Features Specification

### 6.1 Player Name System

**Modal Appearance:**
- Appears when "Start Game" or "Play Again" is clicked
- Cannot be closed without entering a name
- Semi-transparent dark overlay (rgba(0, 0, 0, 0.8))

**Input Field:**
- Text input with placeholder "Your Name"
- Max length: 20 characters
- Validation: Cannot be empty
- Supports Enter key to submit
- Auto-focus on modal open

**Storage:**
- Stored in game state during session
- Sent to Firebase with score
- Displayed in game info during play
- Shown in game over message

### 6.2 Global Leaderboard System

**Firebase Structure:**
```
leaderboard/
  └── [auto-generated-id]/
      ├── name: "Player Name"
      ├── score: 42
      ├── date: "12/20/2024"
      └── timestamp: 1734700800000
```

**Display Specifications:**
- Shows top 5 players only (stores top 100)
- Sorted by score (descending)
- Each entry shows:
  - Rank with medal emoji (🥇🥈🥉) or #4, #5
  - Player name (truncated if too long)
  - Score with "pts" suffix
  - Date (hidden on mobile)

**Leaderboard Button:**
- Located in header next to title
- Gold gradient background
- Trophy emoji (🏆)
- Opens modal on click

**Modal Features:**
- Close button (×) in top-right
- Click outside to close
- Smooth fade-in animation
- Scrollable list if many entries
- Auto-updates in real-time when new scores added

**Data Management:**
- Real-time listener for Firebase updates
- Automatic cleanup: keeps only top 100 scores
- Old/low scores automatically deleted
- Loading state: "Loading leaderboard..."
- Error handling with user-friendly messages

### 6.3 Sound Effects System

**Implementation:** Web Audio API (procedural generation)

**Hit Sound:**
- Oscillator type: sine wave
- Frequency: 800 Hz
- Duration: 100ms
- Volume: 0.3
- Envelope: Exponential decay

**Miss Sound:**
- Oscillator type: sawtooth wave
- Frequency: 200 Hz
- Duration: 200ms
- Volume: 0.1
- Envelope: Exponential decay

**Game Over Sound:**
- Oscillator type: triangle wave
- Start frequency: 400 Hz
- End frequency: 200 Hz (downward sweep)
- Duration: 500ms
- Volume: 0.2
- Envelope: Exponential decay

### 6.4 Visual Effects

**Hit Effect Animation (500ms duration):**

1. **Expanding Golden Ring:**
   - Start: Jerry's radius
   - End: 3× Jerry's radius
   - Color: Gold (rgba(255, 215, 0, alpha))
   - Line width: 6px
   - Opacity: 1.0 → 0.0

2. **Secondary Orange Ring:**
   - Start: Jerry's radius
   - End: 2.5× Jerry's radius
   - Color: Orange (rgba(255, 140, 0, alpha))
   - Line width: 4px
   - Opacity: 0.7 → 0.0

3. **Burst Particles (8 particles):**
   - Spawn at Jerry's center
   - Radiate outward in 8 directions (45° apart)
   - Distance: 0 → 2× Jerry's radius
   - Size: 8px → 4px
   - Color: Gold (rgba(255, 215, 0, alpha))
   - Opacity: 1.0 → 0.0

4. **"HIT!" Text (350ms):**
   - Font: Bold 32px Arial
   - Color: Gold with orange outline
   - Position: Above Jerry, rises 40px
   - Opacity: 1.0 → 0.0
   - Text outline: 3px orange stroke

### 6.5 Mobile Optimizations

**Touch Support:**
- Add `touchstart` event listener (in addition to `click`)
- Extract touch coordinates from `event.touches[0]`
- Prevent default touch behaviors: `touch-action: none`

**Visible Hammer Cursor:**
- 80×80px hammer emoji element
- Fixed position, follows touch/mouse
- `pointer-events: none` (doesn't block clicks)
- z-index: 1000 (always on top)
- Hidden when game not active

**Hammer Hit Animation:**
- Rotate -30deg
- Scale 1.3×
- Duration: 200ms
- Triggered on every click/tap

**Body Scroll Lock:**
- Add class `playing` to body during game
- CSS: `overflow: hidden; position: fixed; width: 100%;`
- Prevents accidental page scrolling during gameplay

**Layout Adjustments:**
- Reduce all padding by 50-70%
- Make canvas fill most of viewport
- Shrink font sizes by 20-30%
- Stack elements more tightly

---

## 7. Code Architecture

### 7.1 Game State Object

```javascript
gameState = {
    score: 0,
    timeRemaining: 90,
    isPlaying: false,
    holes: [],                    // Array of Hole instances
    popInterval: 1200,            // Current pop interval (decreases)
    activeJerries: Set(),         // Set of hole indices with Jerry
    gameLoopId: null,             // requestAnimationFrame ID
    popTimeoutId: null,           // setTimeout ID for next pop
    timerIntervalId: null,        // setInterval ID for countdown
    hammerCursor: null,           // DOM element reference
    hitEffects: [],               // Array of active hit effect objects
    playerName: '',               // Current player's name
    leaderboard: [],              // Array of leaderboard entries
}
```

### 7.2 Hole Class

```javascript
class Hole {
    constructor(x, y, index)

    Properties:
    - x: number (canvas x position)
    - y: number (canvas y position)
    - index: number (0-11)
    - hasJerry: boolean
    - jerryAppearTime: number (timestamp)
    - animation: number (0-1, animation progress)

    Methods:
    - draw(): Render hole and Jerry on canvas
    - drawJerry(): Render Jerry character details
    - showJerry(): Make Jerry appear
    - hideJerry(): Make Jerry disappear
    - updateAnimation(deltaTime): Update animation progress
    - isClicked(mouseX, mouseY): Check if hole was clicked
    - hitJerry(mouseX, mouseY): Check if Jerry was hit (larger radius)
}
```

### 7.3 Core Functions

**Initialization:**
- `init()`: Initialize game on page load
- `initHoles()`: Create 12 Hole instances in grid
- `loadLeaderboard()`: Set up Firebase real-time listener
- `createHammerCursor()`: Create mobile hammer element

**Game Flow:**
- `requestStartGame()`: Show name input modal
- `submitName()`: Validate and save player name
- `actuallyStartGame()`: Initialize and start game
- `endGame()`: Clean up, save score, show results
- `gameLoop()`: Main rendering loop (requestAnimationFrame)
- `startTimer()`: Start 90-second countdown

**Gameplay:**
- `popJerry()`: Randomly select hole and show Jerry
- `handleCanvasClick(event)`: Process click/tap events
- `createHitEffect(x, y)`: Add hit effect to array
- `drawHitEffects()`: Render all active hit effects
- `updateUI()`: Update score/time/player name displays

**Leaderboard:**
- `loadLeaderboard()`: Firebase real-time listener
- `addToLeaderboard(name, score)`: Push score to Firebase
- `displayLeaderboard()`: Render top 5 to modal
- `cleanupLeaderboard()`: Delete scores beyond top 100
- `showLeaderboard()`: Open leaderboard modal
- `hideLeaderboard()`: Close leaderboard modal

**Sound:**
- `playHitSound()`: Generate hit sound
- `playMissSound()`: Generate miss sound
- `playGameOverSound()`: Generate game over sound

**Hammer:**
- `updateHammerPosition(event)`: Update hammer cursor position
- CSS class `.hitting`: Animation for hammer swing

### 7.4 Event Listeners

```javascript
// Game controls
startBtn.addEventListener('click', requestStartGame)
restartBtn.addEventListener('click', requestStartGame)
canvas.addEventListener('click', handleCanvasClick)
canvas.addEventListener('touchstart', handleCanvasClick)

// Name input
submitNameBtn.addEventListener('click', submitName)
playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitName()
})

// Leaderboard
leaderboardBtn.addEventListener('click', showLeaderboard)
closeLeaderboardBtn.addEventListener('click', hideLeaderboard)
leaderboardModal.addEventListener('click', (e) => {
    if (e.target === leaderboardModal) hideLeaderboard()
})

// Hammer tracking
document.addEventListener('mousemove', updateHammerPosition)
document.addEventListener('touchmove', updateHammerPosition, {passive: false})
```

### 7.5 Animation Loop

```javascript
function gameLoop() {
    currentTime = Date.now()
    deltaTime = (currentTime - lastTime) / 1000
    lastTime = currentTime

    // Clear canvas
    fillCanvasBackground()

    // Update and draw all holes
    for (hole of holes) {
        hole.updateAnimation(deltaTime)
        hole.draw()
    }

    // Draw hit effects on top
    drawHitEffects()

    // Continue loop if playing
    if (isPlaying) {
        requestAnimationFrame(gameLoop)
    }
}
```

---

## 8. Firebase Integration

### 8.1 Firebase Configuration

**File:** `firebase-config.js`

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
}

firebase.initializeApp(firebaseConfig)
const database = firebase.database()
const leaderboardRef = database.ref('leaderboard')
```

### 8.2 Database Structure

```
your-project-default-rtdb/
└── leaderboard/
    ├── -NxAbC123xyz/
    │   ├── name: "Alice"
    │   ├── score: 45
    │   ├── date: "12/20/2024"
    │   └── timestamp: 1734700800000
    ├── -NxAbC456def/
    │   ├── name: "Bob"
    │   ├── score: 38
    │   ├── date: "12/20/2024"
    │   └── timestamp: 1734701200000
    └── ...
```

### 8.3 Security Rules

```json
{
  "rules": {
    "leaderboard": {
      ".read": true,
      ".write": true,
      "$entry": {
        ".validate": "newData.hasChildren(['name', 'score', 'date', 'timestamp']) && newData.child('score').isNumber() && newData.child('name').isString()"
      }
    }
  }
}
```

**Rule Explanation:**
- `.read: true` - Anyone can read the leaderboard
- `.write: true` - Anyone can write to the leaderboard
- `.validate` - Ensures entries have required fields with correct types

### 8.4 Firebase Operations

**Load Leaderboard (Real-time):**
```javascript
leaderboardRef
    .orderByChild('score')
    .limitToLast(100)
    .on('value', (snapshot) => {
        // Process data
        // Sort descending
        // Update UI
    })
```

**Add Score:**
```javascript
leaderboardRef.push({
    name: playerName,
    score: finalScore,
    date: new Date().toLocaleDateString(),
    timestamp: Date.now()
}, (error) => {
    // Handle success/error
})
```

**Cleanup Old Scores:**
```javascript
leaderboardRef.orderByChild('score').once('value', (snapshot) => {
    // Get all entries
    // Sort by score
    // Delete entries beyond top 100
})
```

---

## 9. HTML Structure

### 9.1 Main Container

```html
<body>
    <div class="game-container">
        <!-- Header -->
        <!-- Game Info -->
        <!-- Canvas Container -->
        <!-- Controls -->
        <!-- Instructions -->
    </div>

    <!-- Name Modal -->
    <!-- Leaderboard Modal -->

    <!-- Scripts -->
</body>
```

### 9.2 Header

```html
<header>
    <h1>🐱 Tom & Jerry Whack-A-Mole 🐭</h1>
    <button id="leaderboardBtn" class="btn-leaderboard">
        🏆 Leaderboard
    </button>
</header>
```

### 9.3 Game Info Boxes

```html
<div class="game-info">
    <div class="info-box">
        <span class="label">Player:</span>
        <span id="playerName" class="value">-</span>
    </div>
    <div class="info-box">
        <span class="label">Score:</span>
        <span id="score" class="value">0</span>
    </div>
    <div class="info-box">
        <span class="label">Time:</span>
        <span id="timer" class="value">90</span>
    </div>
</div>
```

### 9.4 Canvas Container

```html
<div class="canvas-container">
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <div id="gameMessage" class="game-message hidden"></div>
</div>
```

### 9.5 Name Input Modal

```html
<div id="nameModal" class="modal hidden">
    <div class="modal-content">
        <h2>Enter Your Name</h2>
        <input type="text" id="playerNameInput"
               placeholder="Your Name"
               maxlength="20"
               autocomplete="off">
        <div class="modal-buttons">
            <button id="submitNameBtn" class="btn btn-primary">
                Start Playing
            </button>
        </div>
    </div>
</div>
```

### 9.6 Leaderboard Modal

```html
<div id="leaderboardModal" class="modal hidden">
    <div class="modal-content leaderboard-content">
        <div class="modal-header">
            <h2>🏆 Leaderboard</h2>
            <button id="closeLeaderboardBtn" class="btn-close">✕</button>
        </div>
        <div id="leaderboardList" class="leaderboard-list">
            <!-- Populated by JavaScript -->
        </div>
    </div>
</div>
```

### 9.7 Script Imports

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js"></script>
<script src="firebase-config.js"></script>

<!-- Game Code -->
<script src="game.js"></script>
```

---

## 10. CSS Specifications

### 10.1 Global Styles

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}
```

### 10.2 Modal Styles

```css
.modal {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    animation: fadeIn 0.3s ease;
}

.modal-content {
    background: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    max-width: 500px;
    width: 90%;
    animation: slideUp 0.3s ease;
}
```

### 10.3 Animations

```css
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from {
        transform: translateY(50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes hammer-hit {
    0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
    50% { transform: translate(-50%, -50%) rotate(-30deg) scale(1.3); }
    100% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
}
```

---

## 11. Deployment Instructions

### 11.1 GitHub Repository Setup

1. Create new GitHub repository: `Tom_Jerry_Game`
2. Initialize local repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin [your-repo-url]
   git push -u origin main
   ```

### 11.2 Enable GitHub Pages

1. Go to repository Settings
2. Navigate to "Pages" section
3. Select "Deploy from a branch"
4. Choose branch: `main`
5. Choose folder: `/ (root)`
6. Click "Save"
7. Wait 1-2 minutes for deployment

### 11.3 Firebase Setup

See `FIREBASE_SETUP.md` for complete instructions:
1. Create Firebase project
2. Enable Realtime Database
3. Get configuration
4. Update `firebase-config.js`
5. Set security rules
6. Test connection

### 11.4 Testing Checklist

- [ ] Game loads without errors
- [ ] Name input modal appears on start
- [ ] Jerry pops up randomly
- [ ] Click detection works
- [ ] Score increases on hits
- [ ] Timer counts down correctly
- [ ] Sound effects play
- [ ] Hit effects display
- [ ] Game ends at 0 seconds
- [ ] Score saves to Firebase
- [ ] Leaderboard displays scores
- [ ] Leaderboard syncs across devices
- [ ] Mobile responsive layout works
- [ ] Touch controls work on mobile
- [ ] Hammer cursor follows touch

---

## 12. Performance Considerations

### 12.1 Canvas Optimization

- Use `requestAnimationFrame` for smooth 60fps rendering
- Clear canvas once per frame, not per element
- Pre-calculate hole positions (don't recalculate each frame)
- Limit hit effects to reasonable number (max 5 concurrent)

### 12.2 Firebase Optimization

- Use real-time listener instead of polling
- Limit queries to top 100 scores only
- Index by score for efficient queries
- Clean up old scores to prevent bloat

### 12.3 Memory Management

- Remove event listeners on game end
- Cancel animation frames and timeouts
- Clear hit effects array periodically
- Detach Firebase listeners when not needed

---

## 13. Browser Compatibility

### 13.1 Minimum Requirements

- **Chrome:** Version 90+
- **Firefox:** Version 88+
- **Safari:** Version 14+
- **Edge:** Version 90+
- **Mobile Safari:** iOS 14+
- **Chrome Mobile:** Version 90+

### 13.2 Required Features

- HTML5 Canvas
- ES6 JavaScript (arrow functions, classes, const/let)
- CSS3 (flexbox, gradients, animations)
- Web Audio API
- LocalStorage (fallback if Firebase fails)
- Touch events (mobile)

---

## 14. Future Enhancement Ideas

### 14.1 Potential Features

- **Power-ups:** Temporary bonus items (freeze time, double points)
- **Levels:** Different difficulty presets
- **Themes:** Alternative character sets
- **Combos:** Bonus points for consecutive hits
- **Achievements:** Badges for milestones
- **Sound Toggle:** Mute/unmute button
- **Difficulty Selector:** Easy/Medium/Hard modes
- **Multiplayer:** Real-time competitive mode
- **Daily Challenges:** Special events with unique rules
- **User Profiles:** Authentication and personal stats

### 14.2 Technical Improvements

- **Authentication:** Firebase Auth for verified players
- **Rate Limiting:** Prevent score spam
- **Admin Panel:** Moderate leaderboard
- **Analytics:** Track player engagement
- **PWA:** Make installable as app
- **Offline Mode:** Play without internet
- **Sprite Sheets:** Use images instead of canvas drawing
- **Background Music:** Add ambient music

---

## 15. Troubleshooting Guide

### 15.1 Common Issues

**Issue:** Firebase not connecting
- **Solution:** Check firebase-config.js has correct values
- **Solution:** Verify internet connection
- **Solution:** Check Firebase Console for database status

**Issue:** Clicks not registering
- **Solution:** Verify canvas event listeners attached
- **Solution:** Check hit radius calculation
- **Solution:** Ensure canvas coordinates scale correctly

**Issue:** Performance lag
- **Solution:** Reduce active hit effects
- **Solution:** Simplify Jerry drawing (fewer details)
- **Solution:** Throttle Firebase updates

**Issue:** Mobile touch not working
- **Solution:** Add touchstart event listener
- **Solution:** Extract touch coordinates correctly
- **Solution:** Prevent default touch behaviors

**Issue:** Leaderboard not updating
- **Solution:** Check Firebase security rules
- **Solution:** Verify real-time listener attached
- **Solution:** Check for console errors

---

## 16. Credits & Attribution

### 16.1 Inspiration

- Classic whack-a-mole arcade games
- Tom & Jerry cartoon series by Hanna-Barbera

### 16.2 Technologies Used

- HTML5 Canvas API
- Web Audio API
- Firebase Realtime Database
- GitHub Pages
- Vanilla JavaScript (no frameworks)

### 16.3 License

- Code: Open source (specify license if publishing)
- Tom & Jerry theme: For educational purposes (not commercial use)
- Firebase: Subject to Firebase terms of service

---

## 17. Version History

### Version 1.0 (Initial Release)
- Core whack-a-mole gameplay
- 4×3 grid with 12 holes
- 90-second timer
- Score tracking
- Local high score (localStorage)

### Version 2.0 (Mobile Optimization)
- Mobile-responsive design
- Touch controls
- Visible hammer cursor
- Larger hit detection
- Enhanced visual effects
- Prominent "HIT!" feedback

### Version 3.0 (Player System)
- Name input before game
- Player name display
- Personalized messages
- Local leaderboard
- Top 5 display with medals

### Version 4.0 (Global Leaderboard)
- Firebase integration
- Global cross-device sync
- Real-time updates
- Top 100 storage
- Automatic cleanup
- Remove clear leaderboard option

---

## 18. Contact & Support

For questions or issues with this specification:
- GitHub Issues: [repository-url]/issues
- Documentation: See FIREBASE_SETUP.md
- Firebase Help: https://firebase.google.com/support

---

**END OF SPECIFICATION DOCUMENT**

*This document provides complete specifications to recreate the Tom & Jerry Whack-A-Mole game from scratch. All technical details, design specifications, and implementation guidelines are included.*

**Last Updated:** December 2024
**Version:** 4.0
**Author:** Claude Code (AI Assistant)
