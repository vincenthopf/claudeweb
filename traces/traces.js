/**
 * TRACES — A meditation on digital impermanence
 *
 * This experience creates ephemeral particles that respond to user movement,
 * gradually fading to represent the transient nature of digital presence.
 */

class Particle {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx + (Math.random() - 0.5) * 0.5;
        this.vy = vy + (Math.random() - 0.5) * 0.5;

        // Lifecycle properties
        this.life = 1.0;
        this.decay = 0.003 + Math.random() * 0.005; // Variable decay rate

        // Visual properties
        this.size = 2 + Math.random() * 4;
        this.hue = 200 + Math.random() * 60; // Blue to cyan range
        this.saturation = 60 + Math.random() * 40;
        this.lightness = 50 + Math.random() * 30;

        // Physics
        this.friction = 0.98;
        this.gravity = 0.01;
    }

    update() {
        // Apply physics
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity * 0.1; // Subtle downward drift

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Decay over time
        this.life -= this.decay;

        return this.life > 0;
    }

    draw(ctx) {
        const alpha = this.life;

        // Outer glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${alpha * 0.3})`);
        gradient.addColorStop(1, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, 0)`);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core particle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness + 20}%, ${alpha})`;
        ctx.fill();
    }
}

class TracesCanvas {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0, prevX: 0, prevY: 0 };
        this.isActive = false;
        this.lastEmit = 0;
        this.emitInterval = 30; // Milliseconds between emissions

        this.init();
    }

    init() {
        this.resize();
        this.setupEventListeners();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        // Mouse events
        window.addEventListener('mousemove', (e) => this.onMove(e.clientX, e.clientY));
        window.addEventListener('mousedown', () => this.activate());

        // Touch events
        window.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.onMove(touch.clientX, touch.clientY);
        }, { passive: false });

        window.addEventListener('touchstart', (e) => {
            this.activate();
            const touch = e.touches[0];
            this.onMove(touch.clientX, touch.clientY);
        });

        // Resize
        window.addEventListener('resize', () => this.resize());
    }

    activate() {
        if (!this.isActive) {
            this.isActive = true;
            document.body.classList.add('active');
        }
    }

    onMove(x, y) {
        this.mouse.prevX = this.mouse.x || x;
        this.mouse.prevY = this.mouse.y || y;
        this.mouse.x = x;
        this.mouse.y = y;

        this.activate();

        // Emit particles based on movement speed and time
        const now = Date.now();
        if (now - this.lastEmit > this.emitInterval) {
            this.emitParticles();
            this.lastEmit = now;
        }
    }

    emitParticles() {
        const dx = this.mouse.x - this.mouse.prevX;
        const dy = this.mouse.y - this.mouse.prevY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Number of particles based on movement speed
        const count = Math.min(Math.floor(distance / 10), 5);

        for (let i = 0; i < count; i++) {
            // Interpolate position along movement path
            const t = i / count;
            const x = this.mouse.prevX + dx * t;
            const y = this.mouse.prevY + dy * t;

            // Velocity based on movement direction but slower
            const vx = dx * 0.05;
            const vy = dy * 0.05;

            this.particles.push(new Particle(x, y, vx, vy));
        }

        // Limit total particles for performance
        if (this.particles.length > 1000) {
            this.particles = this.particles.slice(-800);
        }
    }

    update() {
        // Update and filter dead particles
        this.particles = this.particles.filter(particle => particle.update());
    }

    draw() {
        // Fade effect instead of clearing (creates trails)
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw all particles
        this.particles.forEach(particle => particle.draw(this.ctx));

        // Draw particle count for debugging (optional - remove in production)
        // this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        // this.ctx.font = '12px monospace';
        // this.ctx.fillText(`Particles: ${this.particles.length}`, 10, 20);
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new TracesCanvas());
} else {
    new TracesCanvas();
}

/**
 * Learning FYI:
 *
 * This implementation uses several key techniques:
 *
 * 1. Particle System Architecture:
 *    - Each Particle is an independent object with its own lifecycle
 *    - Particles update their position based on velocity and physics
 *    - They fade out over time through a 'life' property
 *
 * 2. Performance Optimization:
 *    - Particle limit prevents memory issues (max 1000)
 *    - Dead particles are filtered out each frame
 *    - Emission is throttled by time interval
 *
 * 3. Visual Techniques:
 *    - Radial gradients create a glow effect
 *    - HSL color space allows smooth color variation
 *    - Partial canvas clearing creates motion trails
 *
 * 4. Interaction Design:
 *    - Particle count scales with movement speed
 *    - Particles inherit movement direction as velocity
 *    - Touch and mouse events are unified
 *
 * 5. Artistic Intent:
 *    - Decay rate randomization creates organic variation
 *    - Subtle gravity adds natural downward drift
 *    - Blue/cyan palette suggests digital/technological theme
 *    - Friction ensures particles slow down naturally
 */
