// FRAGMENTS - A Meditation on Digital Attention
// An interactive experience about focus, distraction, and stillness

class Particle {
    constructor(x, y, config = {}) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * (config.velocityScale || 2);
        this.vy = (Math.random() - 0.5) * (config.velocityScale || 2);
        this.life = 1.0;
        this.maxLife = config.maxLife || 1.0;
        this.size = config.size || Math.random() * 3 + 1;
        this.color = config.color || { r: 255, g: 255, b: 255 };
        this.targetX = config.targetX || null;
        this.targetY = config.targetY || null;
        this.isDistraction = config.isDistraction || false;
    }

    update(state, mouseX, mouseY) {
        // Apply different behaviors based on state
        if (state === 'chaos') {
            // Chaotic, random movement
            this.vx += (Math.random() - 0.5) * 0.5;
            this.vy += (Math.random() - 0.5) * 0.5;

            // Slight mouse repulsion
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100 && dist > 0) {
                this.vx += (dx / dist) * 0.5;
                this.vy += (dy / dist) * 0.5;
            }
        } else if (state === 'calming') {
            // Slow down and organize
            this.vx *= 0.95;
            this.vy *= 0.95;

            // Move towards center
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            this.vx += (centerX - this.x) * 0.0005;
            this.vy += (centerY - this.y) * 0.0005;
        } else if (state === 'emergence') {
            // Move to target positions if they exist
            if (this.targetX !== null && this.targetY !== null) {
                const dx = this.targetX - this.x;
                const dy = this.targetY - this.y;
                this.vx += dx * 0.01;
                this.vy += dy * 0.01;
                this.vx *= 0.9;
                this.vy *= 0.9;
            } else {
                // Gentle orbital movement
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const dx = centerX - this.x;
                const dy = centerY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 0) {
                    // Circular orbit
                    const angle = Math.atan2(dy, dx);
                    this.vx += Math.cos(angle + Math.PI / 2) * 0.1;
                    this.vy += Math.sin(angle + Math.PI / 2) * 0.1;

                    // Maintain distance
                    this.vx += (dx / dist) * 0.001 * (200 - dist);
                    this.vy += (dy / dist) * 0.001 * (200 - dist);
                }

                this.vx *= 0.99;
                this.vy *= 0.99;
            }
        }

        // Apply velocity with damping
        const damping = state === 'chaos' ? 0.99 : 0.97;
        this.vx *= damping;
        this.vy *= damping;

        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // Life decay for distraction particles
        if (this.isDistraction) {
            this.life -= 0.01;
        }

        return this.life > 0;
    }

    draw(ctx, state) {
        // Color based on state
        let color = { ...this.color };

        if (state === 'calming') {
            // Transition to blue
            color.r = Math.max(0, color.r - 5);
            color.g = Math.min(255, color.g + 2);
            color.b = Math.min(255, color.b + 5);
        } else if (state === 'emergence') {
            // Transition to gold/white
            color.r = Math.min(255, color.r + 3);
            color.g = Math.min(255, color.g + 2);
            color.b = Math.max(100, color.b - 3);
        }

        this.color = color;

        const alpha = this.life * (state === 'emergence' ? 0.9 : 0.7);

        // Glow effect
        ctx.shadowBlur = state === 'emergence' ? 15 : 10;
        ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;

        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class FragmentsExperience {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.state = 'chaos'; // chaos, calming, emergence
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastInteractionTime = Date.now();
        this.stillnessThreshold = 5000; // 5 seconds for calming
        this.emergenceThreshold = 15000; // 15 seconds for emergence
        this.isRunning = false;
        this.messages = [
            'BREATHE',
            'BE HERE',
            'YOU ARE ENOUGH',
            'LET GO',
            'JUST BE'
        ];
        this.currentMessage = '';

        this.setupCanvas();
        this.setupEventListeners();
        this.initParticles();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    setupEventListeners() {
        // Enter button
        document.getElementById('enter').addEventListener('click', () => {
            document.getElementById('intro').classList.add('hidden');
            document.getElementById('stillness-indicator').classList.add('visible');
            this.isRunning = true;
            this.animate();
        });

        // Mouse movement
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            // Update custom cursor position
            document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
            document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');

            // Reset stillness on movement
            if (this.isRunning) {
                this.resetStillness();
            }
        });

        // Clicks create chaos
        document.addEventListener('click', (e) => {
            if (!this.isRunning) return;

            // Create explosion of distraction particles
            this.createExplosion(e.clientX, e.clientY, 20);

            // Fragment existing particles
            this.fragmentParticles();

            // Reset to chaos
            this.resetStillness();
            this.state = 'chaos';

            // Hide message
            document.getElementById('message').classList.remove('visible');
        });
    }

    initParticles() {
        // Start with a single particle at center
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        for (let i = 0; i < 300; i++) {
            const angle = (i / 300) * Math.PI * 2;
            const radius = 100;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            this.particles.push(new Particle(x, y, {
                velocityScale: 0.5,
                size: Math.random() * 2 + 1
            }));
        }
    }

    createExplosion(x, y, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, {
                velocityScale: 8,
                maxLife: 1.0,
                size: Math.random() * 4 + 1,
                color: { r: 255, g: 100 + Math.random() * 100, b: 50 },
                isDistraction: true
            }));
        }
    }

    fragmentParticles() {
        // Split random particles into smaller ones
        const particlesToFragment = this.particles.filter(p => !p.isDistraction)
            .slice(0, 10);

        particlesToFragment.forEach(p => {
            for (let i = 0; i < 3; i++) {
                this.particles.push(new Particle(p.x, p.y, {
                    velocityScale: 3,
                    size: p.size * 0.7,
                    color: { ...p.color }
                }));
            }
        });
    }

    resetStillness() {
        this.lastInteractionTime = Date.now();
        this.currentMessage = '';
    }

    updateState() {
        const stillnessDuration = Date.now() - this.lastInteractionTime;

        // Update stillness bar
        const stillnessBar = document.getElementById('stillness-bar');
        const maxDuration = this.emergenceThreshold;
        const progress = Math.min(100, (stillnessDuration / maxDuration) * 100);
        stillnessBar.style.width = progress + '%';

        // State transitions
        if (stillnessDuration > this.emergenceThreshold) {
            if (this.state !== 'emergence') {
                this.state = 'emergence';
                this.prepareEmergence();
                this.showMessage();
            }
        } else if (stillnessDuration > this.stillnessThreshold) {
            if (this.state === 'chaos') {
                this.state = 'calming';
            }
        } else {
            if (this.state !== 'chaos') {
                this.state = 'chaos';
            }
        }
    }

    prepareEmergence() {
        // Create target positions for particles to spell out message
        this.currentMessage = this.messages[Math.floor(Math.random() * this.messages.length)];

        // For simplicity, create a circular mandala pattern
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        this.particles.forEach((p, i) => {
            const angle = (i / this.particles.length) * Math.PI * 4;
            const radius = 150 + Math.sin(angle * 3) * 50;
            p.targetX = centerX + Math.cos(angle) * radius;
            p.targetY = centerY + Math.sin(angle) * radius;
        });
    }

    showMessage() {
        const messageEl = document.getElementById('message');
        messageEl.textContent = this.currentMessage;
        messageEl.classList.add('visible');
    }

    update() {
        this.updateState();

        // Update particles
        this.particles = this.particles.filter(p =>
            p.update(this.state, this.mouseX, this.mouseY)
        );

        // Maintain minimum particle count
        while (this.particles.length < 200 && this.state === 'chaos') {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            this.particles.push(new Particle(x, y, {
                velocityScale: 1
            }));
        }
    }

    draw() {
        // Fade effect for trails
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw particles
        this.particles.forEach(p => p.draw(this.ctx, this.state));
    }

    animate() {
        if (!this.isRunning) return;

        this.update();
        this.draw();

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    const experience = new FragmentsExperience();
});
