'use strict';

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Pre-load audio files
const splatSound = new Audio('splat.mp3');
splatSound.preload = 'auto';

function playJumpSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playSplatSound() {
    // Play the MP3 sound effect
    if (splatSound.readyState >= 2) {
        splatSound.currentTime = 0;
        splatSound.play().catch(e => console.log('Audio play failed:', e));
    }
}

let gameState = 'start'; // start, playing, gameOver
let score = 0;
let bestScore = 0;
let frames = 0;
let gameSpeed = 2;
let difficultyMultiplier = 1;

// Canvas dimensions
let canvasWidth, canvasHeight;

// Default customization
const defaultCustomization = {
    skinColor: '#2d5016',
    fleshColor: '#e8f5a8',
    pitColor: '#4a3728',
    wingStyle: 'leaf',
    wingColor: '#90c040',
    pillarSkinColor: '#3d6b1f',
    pillarFleshColor: '#d4e88c',
    bananaColor: '#ffe135',
    bladeColor: '#c0c0c0'
};

let customization = { ...defaultCustomization };

// Load saved customization
function loadCustomization() {
    try {
        const saved = localStorage.getItem('avocadoFlappyCustomization');
        if (saved) {
            customization = { ...defaultCustomization, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.log('Failed to load customization');
    }
}

// Save customization
function saveCustomization() {
    try {
        localStorage.setItem('avocadoFlappyCustomization', JSON.stringify(customization));
    } catch (e) {
        console.log('Failed to save customization');
    }
}

// Load best score
function loadBestScore() {
    try {
        const saved = localStorage.getItem('avocadoFlappyBest');
        if (saved) {
            bestScore = parseInt(saved, 10);
            document.getElementById('best').textContent = bestScore;
        }
    } catch (e) {
        console.log('Failed to load best score');
    }
}

// Save best score
function saveBestScore() {
    try {
        localStorage.setItem('avocadoFlappyBest', bestScore.toString());
    } catch (e) {
        console.log('Failed to save best score');
    }
}

// Resize canvas
function resizeCanvas() {
    const container = canvas.parentElement;
    canvasWidth = container.clientWidth;
    canvasHeight = container.clientHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}

// Avocado bird
const bird = {
    x: 0,
    y: 0,
    width: 40,
    height: 50,
    velocity: 0,
    gravity: 0.4,
    jumpStrength: -8,
    rotation: 0,
    wingAngle: 0,
    
    reset() {
        this.x = canvasWidth * 0.2;
        this.y = canvasHeight / 2;
        this.velocity = 0;
        this.rotation = 0;
        this.wingAngle = 0;
    },
    
    jump() {
        this.velocity = this.jumpStrength;
        playJumpSound();
    },
    
    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;
        
        // Rotation based on velocity
        this.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (this.velocity * 0.1)));
        
        // Wing animation
        this.wingAngle += 0.3;
        
        // Floor/ceiling collision
        if (this.y + this.height / 2 > canvasHeight - 20) {
            this.y = canvasHeight - 20 - this.height / 2;
            gameOver();
        }
        if (this.y - this.height / 2 < 0) {
            this.y = this.height / 2;
            this.velocity = 0;
        }
    },
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const w = this.width;
        const h = this.height;
        
        // Draw wings based on style
        this.drawWings(w, h);
        
        // Draw avocado body (egg shape)
        ctx.fillStyle = customization.skinColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, w/2, h/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw flesh (inner part)
        ctx.fillStyle = customization.fleshColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, w/2 - 4, h/2 - 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pit
        ctx.fillStyle = customization.pitColor;
        ctx.beginPath();
        ctx.ellipse(0, 5, w/4, h/5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw highlight on pit
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.ellipse(-3, 2, w/10, h/12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-8, -10, 3, 0, Math.PI * 2);
        ctx.arc(8, -10, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw eye shine
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-9, -11, 1, 0, Math.PI * 2);
        ctx.arc(7, -11, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw smile
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -5, 8, 0.2, Math.PI - 0.2);
        ctx.stroke();
        
        ctx.restore();
    },
    
    drawWings(w, h) {
        const wingFlap = Math.sin(this.wingAngle) * 10;
        ctx.fillStyle = customization.wingColor;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        
        switch(customization.wingStyle) {
            case 'leaf':
                // Left wing
                ctx.beginPath();
                ctx.ellipse(-w/2 - 5, -5 + wingFlap, 15, 8, -0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Right wing
                ctx.beginPath();
                ctx.ellipse(w/2 + 5, -5 + wingFlap, 15, 8, 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'angel':
                // Angel wings
                ctx.fillStyle = '#fff';
                // Left wing
                ctx.beginPath();
                ctx.moveTo(-w/2, -10);
                ctx.quadraticCurveTo(-w/2 - 25, -20 + wingFlap, -w/2 - 20, 5);
                ctx.quadraticCurveTo(-w/2 - 10, 0, -w/2, 5);
                ctx.fill();
                ctx.stroke();
                // Right wing
                ctx.beginPath();
                ctx.moveTo(w/2, -10);
                ctx.quadraticCurveTo(w/2 + 25, -20 + wingFlap, w/2 + 20, 5);
                ctx.quadraticCurveTo(w/2 + 10, 0, w/2, 5);
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'bat':
                // Bat wings
                ctx.fillStyle = customization.wingColor;
                // Left wing
                ctx.beginPath();
                ctx.moveTo(-w/2, 0);
                ctx.lineTo(-w/2 - 30, -15 + wingFlap);
                ctx.lineTo(-w/2 - 25, 0 + wingFlap);
                ctx.lineTo(-w/2 - 20, -5 + wingFlap);
                ctx.lineTo(-w/2 - 10, 5);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // Right wing
                ctx.beginPath();
                ctx.moveTo(w/2, 0);
                ctx.lineTo(w/2 + 30, -15 + wingFlap);
                ctx.lineTo(w/2 + 25, 0 + wingFlap);
                ctx.lineTo(w/2 + 20, -5 + wingFlap);
                ctx.lineTo(w/2 + 10, 5);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'butterfly':
                // Butterfly wings
                // Left upper
                ctx.beginPath();
                ctx.ellipse(-w/2 - 10, -15 + wingFlap, 12, 8, -0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Left lower
                ctx.beginPath();
                ctx.ellipse(-w/2 - 8, 5 + wingFlap, 8, 6, -0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Right upper
                ctx.beginPath();
                ctx.ellipse(w/2 + 10, -15 + wingFlap, 12, 8, 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Right lower
                ctx.beginPath();
                ctx.ellipse(w/2 + 8, 5 + wingFlap, 8, 6, 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                break;
        }
    }
};

// Pillars (Giant Avocados)
let pillars = [];
const pillarWidth = 70;
const pillarGap = 160;
const pillarSpacing = 250;

function createPillar() {
    const minHeight = 60;
    const maxGapY = canvasHeight - minHeight - pillarGap - minHeight;
    const gapY = minHeight + Math.random() * maxGapY;
    
    return {
        x: canvasWidth,
        gapY: gapY,
        gapHeight: pillarGap,
        width: pillarWidth,
        passed: false
    };
}

function drawGiantAvocado(x, y, width, height, isTop) {
    const skinColor = customization.pillarSkinColor;
    const fleshColor = customization.pillarFleshColor;
    
    ctx.save();
    
    if (isTop) {
        // Top avocado (hanging down)
        ctx.translate(x + width/2, y);
        
        // Skin
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.ellipse(0, height/2, width/2, height/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Flesh
        ctx.fillStyle = fleshColor;
        ctx.beginPath();
        ctx.ellipse(0, height/2, width/2 - 6, height/2 - 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Pit (at bottom)
        ctx.fillStyle = customization.pitColor;
        ctx.beginPath();
        ctx.ellipse(0, height - width/4, width/5, width/6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Stem
        ctx.fillStyle = '#4a3728';
        ctx.fillRect(-4, -10, 8, 15);
    } else {
        // Bottom avocado (growing up)
        ctx.translate(x + width/2, y + height);
        
        // Skin
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.ellipse(0, -height/2, width/2, height/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Flesh
        ctx.fillStyle = fleshColor;
        ctx.beginPath();
        ctx.ellipse(0, -height/2, width/2 - 6, height/2 - 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Pit (at top)
        ctx.fillStyle = customization.pitColor;
        ctx.beginPath();
        ctx.ellipse(0, -height + width/4, width/5, width/6, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Texture dots
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < 8; i++) {
        const dx = (Math.random() - 0.5) * width * 0.6;
        const dy = (Math.random() - 0.5) * height * 0.6;
        ctx.beginPath();
        ctx.arc(dx, dy, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// Banana Chainsaws
let chainsaws = [];
const chainsawSize = 45;

function createChainsaw() {
    return {
        x: canvasWidth + 50,
        y: 50 + Math.random() * (canvasHeight - 150),
        size: chainsawSize,
        rotation: 0,
        rotationSpeed: 0.15 + Math.random() * 0.1,
        verticalSpeed: (Math.random() - 0.5) * 1.5
    };
}

function drawBananaChainsaw(chainsaw) {
    ctx.save();
    ctx.translate(chainsaw.x, chainsaw.y);
    ctx.rotate(chainsaw.rotation);
    
    const s = chainsaw.size;
    
    // Draw banana body
    ctx.fillStyle = customization.bananaColor;
    ctx.beginPath();
    ctx.arc(0, 0, s/2, 0.3, Math.PI * 2 - 0.3);
    ctx.bezierCurveTo(s/3, s/3, -s/3, s/3, 0, s/2);
    ctx.fill();
    
    // Draw chainsaw blade (teeth around the banana)
    ctx.fillStyle = customization.bladeColor;
    const teeth = 12;
    for (let i = 0; i < teeth; i++) {
        const angle = (i / teeth) * Math.PI * 2;
        const tx = Math.cos(angle) * (s/2 + 5);
        const ty = Math.sin(angle) * (s/2 + 5);
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(angle + Math.PI/2);
        ctx.fillRect(-3, -8, 6, 12);
        ctx.restore();
    }
    
    // Draw center cap
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(0, 0, s/6, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw center bolt
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.arc(0, 0, s/12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// Particles
let particles = [];

function createSplatParticles(x, y) {
    const colors = [customization.skinColor, customization.fleshColor, customization.pitColor];
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            size: 5 + Math.random() * 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // gravity
        p.life -= 0.02;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    for (const p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// Game functions
function startGame() {
    gameState = 'playing';
    score = 0;
    frames = 0;
    gameSpeed = 2;
    difficultyMultiplier = 1;
    
    document.getElementById('score').textContent = score;
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    
    bird.reset();
    pillars = [];
    chainsaws = [];
    particles = [];
    
    // Create first pillar
    pillars.push(createPillar());
    pillars[0].x = canvasWidth + 100;
}

function gameOver() {
    gameState = 'gameOver';
    playSplatSound();
    createSplatParticles(bird.x, bird.y);
    
    if (score > bestScore) {
        bestScore = score;
        document.getElementById('best').textContent = bestScore;
        saveBestScore();
    }
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

function update() {
    if (gameState !== 'playing') {
        updateParticles();
        return;
    }
    
    frames++;
    bird.update();
    
    // Increase difficulty
    difficultyMultiplier = 1 + score / 20;
    gameSpeed = 2 * difficultyMultiplier;
    
    // Update pillars
    for (let i = pillars.length - 1; i >= 0; i--) {
        const p = pillars[i];
        p.x -= gameSpeed;
        
        // Check collision
        const birdLeft = bird.x - bird.width/2 + 5;
        const birdRight = bird.x + bird.width/2 - 5;
        const birdTop = bird.y - bird.height/2 + 5;
        const birdBottom = bird.y + bird.height/2 - 5;
        
        const pillarLeft = p.x;
        const pillarRight = p.x + p.width;
        
        // Horizontal collision
        if (birdRight > pillarLeft && birdLeft < pillarRight) {
            // Check top and bottom collision
            if (birdTop < p.gapY || birdBottom > p.gapY + p.gapHeight) {
                gameOver();
                return;
            }
        }
        
        // Score
        if (!p.passed && birdLeft > pillarRight) {
            p.passed = true;
            score++;
            document.getElementById('score').textContent = score;
        }
        
        // Remove off-screen pillars
        if (p.x + p.width < -50) {
            pillars.splice(i, 1);
        }
    }
    
    // Add new pillars
    const lastPillar = pillars[pillars.length - 1];
    if (!lastPillar || lastPillar.x < canvasWidth - pillarSpacing) {
        pillars.push(createPillar());
    }
    
    // Update chainsaws (appear after score 5)
    if (score >= 5) {
        // Spawn chainsaws occasionally
        if (frames % 180 === 0 && Math.random() < 0.5) {
            chainsaws.push(createChainsaw());
        }
    }
    
    for (let i = chainsaws.length - 1; i >= 0; i--) {
        const c = chainsaws[i];
        c.x -= gameSpeed * 1.2; // Chainsaws move slightly faster
        c.y += c.verticalSpeed;
        c.rotation += c.rotationSpeed;
        
        // Bounce off edges
        if (c.y < 30 || c.y > canvasHeight - 80) {
            c.verticalSpeed *= -1;
        }
        
        // Check collision with bird
        const dx = bird.x - c.x;
        const dy = bird.y - c.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < (bird.width/2 + c.size/2 - 10)) {
            gameOver();
            return;
        }
        
        // Remove off-screen chainsaws
        if (c.x < -100) {
            chainsaws.splice(i, 1);
        }
    }
    
    updateParticles();
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#E0F6FF');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw clouds
    drawClouds();
    
    // Draw pillars
    for (const p of pillars) {
        // Top pillar
        drawGiantAvocado(p.x, 0, p.width, p.gapY, true);
        // Bottom pillar
        drawGiantAvocado(p.x, p.gapY + p.gapHeight, p.width, canvasHeight - p.gapY - p.gapHeight, false);
    }
    
    // Draw chainsaws
    for (const c of chainsaws) {
        drawBananaChainsaw(c);
    }
    
    // Draw bird
    if (gameState !== 'gameOver' || particles.length === 0) {
        bird.draw();
    }
    
    // Draw particles
    drawParticles();
    
    // Draw ground
    ctx.fillStyle = '#7cb342';
    ctx.fillRect(0, canvasHeight - 20, canvasWidth, 20);
    ctx.fillStyle = '#558b2f';
    ctx.fillRect(0, canvasHeight - 20, canvasWidth, 5);
}

let cloudOffset = 0;
function drawClouds() {
    cloudOffset -= 0.3;
    if (cloudOffset < -200) cloudOffset = 0;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    
    const clouds = [
        { x: 50 + cloudOffset, y: 80, size: 40 },
        { x: 200 + cloudOffset, y: 120, size: 30 },
        { x: 350 + cloudOffset, y: 60, size: 50 },
        { x: 500 + cloudOffset, y: 100, size: 35 },
        { x: -150 + cloudOffset, y: 90, size: 45 }
    ];
    
    for (const c of clouds) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
        ctx.arc(c.x + c.size * 0.8, c.y, c.size * 0.7, 0, Math.PI * 2);
        ctx.arc(c.x - c.size * 0.8, c.y, c.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Input handling
function handleInput(e) {
    e.preventDefault();
    
    if (gameState === 'playing') {
        bird.jump();
    } else if (gameState === 'start' && e.target.id === 'gameCanvas') {
        startGame();
    }
}

// Event listeners
canvas.addEventListener('mousedown', handleInput);
canvas.addEventListener('touchstart', handleInput, { passive: false });

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'playing') {
            bird.jump();
        } else if (gameState === 'start') {
            startGame();
        } else if (gameState === 'gameOver') {
            startGame();
        }
    }
});

// Button event listeners with debug
document.getElementById('startBtn').addEventListener('click', (e) => {
    console.log('Start button clicked!');
    startGame();
});
document.getElementById('restartBtn').addEventListener('click', (e) => {
    console.log('Restart button clicked!');
    startGame();
});
document.getElementById('menuBtn').addEventListener('click', () => {
    gameState = 'start';
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
});

// Customization modal
document.getElementById('customizeBtn').addEventListener('click', () => {
    document.getElementById('customizeModal').classList.remove('hidden');
    updateCustomizationUI();
});

document.getElementById('saveCustomize').addEventListener('click', () => {
    saveCustomization();
    document.getElementById('customizeModal').classList.add('hidden');
});

document.getElementById('resetCustomize').addEventListener('click', () => {
    customization = { ...defaultCustomization };
    updateCustomizationUI();
});

// Wing style selection
document.querySelectorAll('.wing-option').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.wing-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        customization.wingStyle = btn.dataset.wing;
    });
});

// Color inputs
function setupColorInput(id, key) {
    document.getElementById(id).addEventListener('input', (e) => {
        customization[key] = e.target.value;
    });
}

setupColorInput('skinColor', 'skinColor');
setupColorInput('fleshColor', 'fleshColor');
setupColorInput('pitColor', 'pitColor');
setupColorInput('wingColor', 'wingColor');
setupColorInput('pillarSkinColor', 'pillarSkinColor');
setupColorInput('pillarFleshColor', 'pillarFleshColor');
setupColorInput('bananaColor', 'bananaColor');
setupColorInput('bladeColor', 'bladeColor');

function updateCustomizationUI() {
    document.getElementById('skinColor').value = customization.skinColor;
    document.getElementById('fleshColor').value = customization.fleshColor;
    document.getElementById('pitColor').value = customization.pitColor;
    document.getElementById('wingColor').value = customization.wingColor;
    document.getElementById('pillarSkinColor').value = customization.pillarSkinColor;
    document.getElementById('pillarFleshColor').value = customization.pillarFleshColor;
    document.getElementById('bananaColor').value = customization.bananaColor;
    document.getElementById('bladeColor').value = customization.bladeColor;
    
    document.querySelectorAll('.wing-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.wing === customization.wingStyle);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    resizeCanvas();
    loadBestScore();
    loadCustomization();
    updateCustomizationUI();
    bird.reset();
    gameLoop();
});

window.addEventListener('resize', resizeCanvas);

// Fullscreen functions
function updateFullscreenButton() {
    const btn = document.getElementById('fullscreenBtn');
    if (document.fullscreenElement) {
        btn.innerHTML = '&#x1F5D9;';
        btn.title = 'Exit Fullscreen';
    } else {
        btn.innerHTML = '&#x26F6;';
        btn.title = 'Enter Fullscreen';
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

document.addEventListener('fullscreenchange', updateFullscreenButton);
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        updateFullscreenButton();
    }
});
window.addEventListener('focus', updateFullscreenButton);

// Auto-enter fullscreen if user was in fullscreen on previous page
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('wasFullscreen') === 'true') {
        localStorage.removeItem('wasFullscreen');
        setTimeout(() => {
            toggleFullscreen();
        }, 100);
    }
});

// Save fullscreen state before leaving
document.getElementById('backBtn').addEventListener('click', (e) => {
    if (document.fullscreenElement) {
        localStorage.setItem('wasFullscreen', 'true');
    }
});
