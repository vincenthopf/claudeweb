/**
 * DECAY - An Interactive Meditation on Digital Consumption
 * The more you look, the faster it dies.
 */

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const intro = document.getElementById('intro');

let width, height;
let mouse = { x: -1000, y: -1000 };
let particles = [];
let contentItems = [];
let ambientParticles = [];
let lastSpawnTime = 0;
const SPAWN_INTERVAL = 8000; // 8 seconds between content
let cursorTrail = [];

// Poetic fragments about impermanence, attention, consumption
const TEXTS = [
    "the more you look",
    "the less remains",
    "attention devours",
    "everything you touch",
    "turns to dust",
    "what we consume",
    "consumes us",
    "observation destroys",
    "nothing lasts",
    "even this moment",
    "is already gone",
    "you cannot hold",
    "what refuses to stay",
    "disappearing as we speak",
    "the weight of your gaze",
    "unraveling",
    "pixel by pixel",
    "we are all decay",
    "ephemeral",
    "fleeting beauty",
];

// Particle class
class Particle {
    constructor(x, y, char, color = '#fff') {
        this.x = x;
        this.y = y;
        this.char = char;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.life = 1.0;
        this.decay = 0.005 + Math.random() * 0.01;
        this.size = 12 + Math.random() * 8;
        this.color = color;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // gravity
        this.life -= this.decay;
        this.rotation += this.rotationSpeed;
        return this.life > 0;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.font = `${this.size}px Georgia`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillText(this.char, 0, 0);
        ctx.restore();
    }
}

// Ambient particle class for background atmosphere
class AmbientParticle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = 1 + Math.random() * 2;
        this.opacity = 0.1 + Math.random() * 0.2;
        this.pulseSpeed = 0.001 + Math.random() * 0.002;
        this.pulseOffset = Math.random() * Math.PI * 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
    }

    draw(timestamp) {
        const pulse = Math.sin(timestamp * this.pulseSpeed + this.pulseOffset);
        const currentOpacity = this.opacity * (0.5 + pulse * 0.5);

        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Content Item class (text that can decay)
class ContentItem {
    constructor(text, x, y) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.fontSize = 32 + Math.random() * 24;
        this.integrity = 1.0; // 1.0 = fully intact, 0.0 = fully decayed
        this.decayRate = 0;
        this.maxDecayRate = 0.003;
        this.decayAcceleration = 0.0001;
        this.attentionRadius = 200;
        this.active = true;
        this.glitchAmount = 0;
        this.opacity = 0; // Start invisible for fade-in
        this.fadeInSpeed = 0.02;

        // Color palette - muted, contemplative
        const colors = [
            '#ffffff',
            '#e8d5c4',
            '#c4b5a0',
            '#a8c5d8',
            '#d8b5c4',
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];

        // Create character map for decay
        this.chars = text.split('');
        this.charStates = this.chars.map(() => ({
            intact: true,
            decayProgress: 0,
        }));
    }

    isNearMouse() {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.attentionRadius;
    }

    update() {
        if (this.integrity <= 0) {
            this.active = false;
            return;
        }

        // Fade in animation
        if (this.opacity < 1.0) {
            this.opacity = Math.min(this.opacity + this.fadeInSpeed, 1.0);
        }

        // Increase decay rate when mouse is near (attention causes decay)
        if (this.isNearMouse()) {
            this.decayRate = Math.min(
                this.decayRate + this.decayAcceleration,
                this.maxDecayRate
            );
            this.glitchAmount = Math.min(this.glitchAmount + 0.1, 5);
        } else {
            this.decayRate *= 0.95; // slowly reduce decay when not looking
            this.glitchAmount *= 0.9;
        }

        this.integrity -= this.decayRate;

        // Decay individual characters
        this.charStates.forEach((state, i) => {
            if (state.intact && this.decayRate > 0) {
                state.decayProgress += this.decayRate * 100;

                if (state.decayProgress > Math.random() * 50) {
                    state.intact = false;
                    // Create particles from this character
                    const charWidth = this.fontSize * 0.6;
                    const startX = this.x - (this.text.length * charWidth) / 2;
                    const charX = startX + i * charWidth;

                    // Create multiple particles per character
                    for (let j = 0; j < 3; j++) {
                        particles.push(
                            new Particle(
                                charX + (Math.random() - 0.5) * 10,
                                this.y + (Math.random() - 0.5) * 10,
                                this.chars[i],
                                this.color
                            )
                        );
                    }
                }
            }
        });
    }

    draw() {
        if (!this.active) return;

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.font = `${this.fontSize}px Georgia`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw each character individually
        const charWidth = this.fontSize * 0.6;
        const startX = this.x - (this.text.length * charWidth) / 2;

        this.chars.forEach((char, i) => {
            if (this.charStates[i].intact) {
                const charX = startX + i * charWidth;
                const offsetY = Math.sin(Date.now() * 0.001 + i) * this.glitchAmount;
                const offsetX = Math.cos(Date.now() * 0.002 + i) * this.glitchAmount;

                ctx.globalAlpha = this.integrity * this.opacity;
                ctx.fillText(char, charX + offsetX, this.y + offsetY);
            }
        });

        ctx.restore();

        // Debug: draw attention radius (remove for production)
        // ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.attentionRadius, 0, Math.PI * 2);
        // ctx.stroke();
    }
}

// Initialize canvas size
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

// Initialize ambient particles
function initAmbientParticles() {
    ambientParticles = [];
    const count = Math.floor((width * height) / 10000); // Density based on screen size
    for (let i = 0; i < count; i++) {
        ambientParticles.push(new AmbientParticle());
    }
}

// Draw vignette effect
function drawVignette() {
    const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.7
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}

// Update cursor trail
function updateCursorTrail() {
    if (mouse.x !== -1000) {
        cursorTrail.push({ x: mouse.x, y: mouse.y, life: 1.0 });
        if (cursorTrail.length > 20) cursorTrail.shift();
    }

    cursorTrail = cursorTrail.filter(point => {
        point.life -= 0.05;
        return point.life > 0;
    });
}

// Draw cursor trail
function drawCursorTrail() {
    cursorTrail.forEach((point, i) => {
        const size = (i / cursorTrail.length) * 3;
        ctx.fillStyle = `rgba(255, 255, 255, ${point.life * 0.3})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Spawn new content
function spawnContent() {
    const text = TEXTS[Math.floor(Math.random() * TEXTS.length)];
    const x = width / 2 + (Math.random() - 0.5) * width * 0.3;
    const y = height / 2 + (Math.random() - 0.5) * height * 0.3;
    contentItems.push(new ContentItem(text, x, y));
}

// Main animation loop
function animate(timestamp) {
    // Clear canvas with fade effect for trail
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // Update and draw ambient particles
    ambientParticles.forEach(particle => {
        particle.update();
        particle.draw(timestamp);
    });

    // Update and draw cursor trail
    updateCursorTrail();
    drawCursorTrail();

    // Spawn new content periodically
    if (timestamp - lastSpawnTime > SPAWN_INTERVAL || contentItems.length === 0) {
        spawnContent();
        lastSpawnTime = timestamp;
    }

    // Update and draw content items
    contentItems = contentItems.filter(item => {
        item.update();
        item.draw();
        return item.active;
    });

    // Update and draw particles
    particles = particles.filter(particle => {
        const alive = particle.update();
        if (alive) particle.draw();
        return alive;
    });

    // Draw vignette overlay
    drawVignette();

    requestAnimationFrame(animate);
}

// Event listeners
window.addEventListener('resize', () => {
    resize();
    initAmbientParticles();
});

canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // Hide intro after first movement
    if (!intro.classList.contains('hidden')) {
        intro.classList.add('hidden');
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;

    if (!intro.classList.contains('hidden')) {
        intro.classList.add('hidden');
    }
});

// Initialize
resize();
initAmbientParticles();
animate(0);
