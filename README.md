# 🥑 Avocado-OpenClaw

> A collection of interactive web apps and games designed for touchscreen devices, built with HTML5, CSS3, and vanilla JavaScript. Optimized for Orange Pi touchscreen displays (800x480).

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen?logo=github)](https://10923anonymous.github.io/Avocado-OpenClaw/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Games](#games)
- [Apps](#apps)
- [Technical Architecture](#technical-architecture)
- [Installation & Usage](#installation--usage)
- [Customization](#customization)
- [File Structure](#file-structure)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Avocado-OpenClaw** is a curated collection of web-based applications and games designed specifically for touchscreen interfaces. Originally built for Orange Pi touchscreen displays running at 800x480 resolution, these apps feature:

- 🎮 **Touch-optimized controls** - No keyboard required
- 📱 **Responsive design** - Adapts to various screen sizes
- 🎨 **Beautiful avocado-themed UI** - Consistent green/yellow color scheme
- 🔊 **Custom sound effects** - Immersive audio experience
- 💾 **Local storage persistence** - Saves high scores and preferences

---

## ✨ Features

### Core Features
- **Virtual Keypad** - On-screen numeric keyboard for touchscreen devices
- **Fullscreen Support** - Toggle fullscreen mode for immersive experience
- **Sound Effects** - Custom audio for interactions and events
- **Local Storage** - Persistent settings and high scores
- **Responsive Canvas** - Games adapt to container size

### UI/UX Features
- Avocado-themed color palette (greens, yellows, earth tones)
- Smooth animations and transitions
- Touch-friendly button sizes
- Visual feedback for all interactions

---

## 🎮 Games

### 1. 🥑 Avocado Flappy
**Location:** `avocado-website/games/avocado-flappy/`

A Flappy Bird-inspired game featuring a flying avocado that navigates through giant avocado pillars.

**Features:**
- 🎨 **Customization System** - Change avocado skin, flesh, pit colors; wing styles (leaf, angel, bat, butterfly); pillar colors
- 🔊 **Custom Sounds** - Bounce sound for jumping, splat sound for collisions
- 🎯 **Progressive Difficulty** - Chainsaw bananas appear after score 5
- 🏆 **High Score Tracking** - Best score saved locally
- 🎮 **Multiple Input Methods** - Touch, mouse, or spacebar

**Controls:**
- Tap/Click/Space - Jump/Flap

---

### 2. 🐍 Snake Game
**Location:** `snake-game/`

A modern take on the classic Snake game with AI opponents and moving food.

**Features:**
- 🤖 **AI Rivals** - Compete against computer-controlled snakes
- 🍎 **Moving Food** - Food items move around the board
- 📱 **Touch Controls** - Swipe or on-screen D-pad
- 🎨 **Modern Graphics** - Smooth animations, gradient effects

**Controls:**
- Swipe - Change direction
- On-screen buttons - Alternative control

---

### 3. 🐍 Snake Game (Original)
**Location:** `snake-game-original/`

The classic Snake game implementation.

**Features:**
- Classic arcade-style gameplay
- Score tracking
- Increasing difficulty

---

### 4. 🐍 Snake Game (Mobile)
**Location:** `snake-game-mobile/`

Mobile-optimized version of Snake.

**Features:**
- Touch-optimized controls
- Responsive design for mobile devices

---

### 5. 🏙️ City Driver
**Location:** `city-driver/`

A driving simulation game.

**Features:**
- City environment driving
- Touch controls

---

## 📱 Apps

### 1. 🍅 Pomodoro Timer
**Location:** `avocado-website/apps/pomodoro/`

A feature-rich Pomodoro timer for productivity and focus.

**Features:**
- ⭕ **Circle & Digital Modes** - Visual timer display options
- 🎵 **Music Selection** - Choose from Lofi, Rain, Fire, or None
- ⏱️ **Customizable Durations** - Set focus and break times
- 📊 **Progress Tracking** - Completed sessions and total focus time
- 🔊 **Audio Alerts** - Bell sound when timer completes
- 🎨 **Visual Progress Ring** - Animated circular progress indicator
- 📋 **Presets** - Quick select 25/5, 45/15, 50/10, 90/20

**Music Options:**
- 🎵 Lofi - Chill background music
- 🌧️ Rain - Rain sounds for focus
- 🔥 Fire - Crackling fire sounds
- 🔇 None - No background music

---

### 2. 🎲 Number Generator
**Location:** `avocado-website/apps/number-gen/`

A versatile random number and decision-making tool.

**Features:**
- 🎲 **Dice Roller** - Roll D4, D6, D8, D10, D12, D20, D100, or custom
- 🔢 **Random Number** - Generate numbers in any range
- 🪙 **Coin Flip** - 3D animated coin flip with sound
- 📋 **Name Picker** - Random selection from a list
- 🔐 **Password Generator** - Secure password creation with options

**Coin Flip:**
- 3D spinning animation
- Gold (Heads) and Silver (Tails) coins
- Custom sound effect

---

### 3. ⏲️ Timer
**Location:** `avocado-website/apps/timer/`

A simple countdown timer.

**Features:**
- Set custom duration
- Visual countdown display
- Audio alert when complete

---

### 4. 🧮 Calculator
**Location:** `avocado-website/apps/calculator/`

A basic calculator app.

**Features:**
- Standard arithmetic operations
- Touch-optimized buttons
- Clear display

---

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Graphics:** HTML5 Canvas API
- **Audio:** Web Audio API, HTML5 Audio
- **Storage:** LocalStorage API
- **Build:** Static files (no build step required)

### Key Components

#### Virtual Keypad (`avocado-website/apps/virtual-keypad.js`)
A reusable on-screen numeric keyboard for touchscreen devices.

```javascript
// Usage
const keypad = new VirtualKeypad({
    allowDecimal: true,
    allowNegative: false,
    minValue: 0,
    maxValue: 100,
    onInput: (value) => console.log(value),
    onClose: () => console.log('Closed')
});
keypad.open(inputElement, initialValue);
```

**Features:**
- Numeric input (0-9)
- Decimal point support
- Negative number toggle
- Backspace and clear
- Min/max value validation
- Slide-up animation

#### Game Loop Architecture
All games use a standard game loop pattern:

```javascript
function gameLoop() {
    update();  // Update game state
    draw();    // Render frame
    requestAnimationFrame(gameLoop);
}
```

#### Input Handling
- **Touch Events:** `touchstart`, `touchend`
- **Mouse Events:** `mousedown`, `mouseup`
- **Keyboard:** `keydown` for spacebar/arrow keys
- **Prevent Default:** Stops scrolling/zooming on touch

#### Audio System
- Pre-loaded audio files
- Error handling for missing files
- Volume control support

### File Organization
```
avocado-website/
├── apps/                    # Utility applications
│   ├── pomodoro/           # Pomodoro timer
│   ├── number-gen/         # Number generator
│   ├── timer/              # Simple timer
│   ├── calculator/         # Calculator
│   ├── virtual-keypad.js   # Reusable keypad
│   └── virtual-keyboard.js # Text keyboard
├── games/                   # Games
│   └── avocado-flappy/     # Flappy Bird clone
├── sounds/                  # Audio assets
├── index.html              # Main landing page
└── touchscreen.html        # Touchscreen dashboard
```

---

## 🚀 Installation & Usage

### Method 1: GitHub Pages (Recommended)
The project is automatically deployed to GitHub Pages:

🔗 **Live URL:** https://10923anonymous.github.io/Avocado-OpenClaw/

### Method 2: Local Server
1. Clone the repository:
```bash
git clone