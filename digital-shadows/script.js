/**
 * Digital Shadows - Interactive Visual Essay
 * Main JavaScript - Tracking, Analysis, and Visualization
 */

// ==================== DATA COLLECTION ====================

const trackingData = {
    mousePositions: [],
    clicks: [],
    scrollEvents: [],
    hesitations: [],
    sectionTimes: {},
    startTime: Date.now(),
    dataPointCount: 0
};

let currentSection = null;
let lastMouseMove = Date.now();
let previousMousePos = { x: 0, y: 0 };
let mouseVelocity = 0;

// ==================== CANVAS SETUP ====================

const canvas = document.getElementById('trackingCanvas');
const ctx = canvas.getContext('2d');
const shadowCanvas = document.getElementById('shadowCanvas');
const shadowCtx = shadowCanvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (shadowCanvas) {
        shadowCanvas.width = shadowCanvas.offsetWidth;
        shadowCanvas.height = shadowCanvas.offsetHeight;
    }
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ==================== MOUSE TRACKING ====================

const trail = [];
const MAX_TRAIL_LENGTH = 100;

document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    const timeDelta = now - lastMouseMove;

    // Calculate velocity
    const dx = e.clientX - previousMousePos.x;
    const dy = e.clientY - previousMousePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    mouseVelocity = timeDelta > 0 ? distance / timeDelta : 0;

    // Store position
    trackingData.mousePositions.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: now,
        velocity: mouseVelocity
    });

    // Detect hesitation (slow movement)
    if (mouseVelocity < 0.1 && timeDelta > 500) {
        trackingData.hesitations.push({
            x: e.clientX,
            y: e.clientY,
            timestamp: now,
            duration: timeDelta
        });
    }

    // Add to trail
    trail.push({
        x: e.clientX,
        y: e.clientY + window.scrollY,
        timestamp: now,
        velocity: mouseVelocity
    });

    if (trail.length > MAX_TRAIL_LENGTH) {
        trail.shift();
    }

    previousMousePos = { x: e.clientX, y: e.clientY };
    lastMouseMove = now;
    trackingData.dataPointCount++;

    updateDataDisplays();
});

// Track clicks
document.addEventListener('click', (e) => {
    trackingData.clicks.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
        target: e.target.tagName
    });
    trackingData.dataPointCount++;
});

// Track scroll
let lastScrollTime = Date.now();
let scrollVelocity = 0;

window.addEventListener('scroll', () => {
    const now = Date.now();
    const timeDelta = now - lastScrollTime;
    const scrollDelta = window.scrollY - (trackingData.scrollEvents[trackingData.scrollEvents.length - 1]?.position || 0);

    scrollVelocity = timeDelta > 0 ? Math.abs(scrollDelta) / timeDelta : 0;

    trackingData.scrollEvents.push({
        position: window.scrollY,
        timestamp: now,
        velocity: scrollVelocity
    });

    lastScrollTime = now;
    trackingData.dataPointCount++;

    updateDataDisplays();
    checkRevealElements();
});

// ==================== CANVAS RENDERING ====================

function drawTrail() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scrollOffset = window.scrollY;

    trail.forEach((point, index) => {
        const age = Date.now() - point.timestamp;
        const opacity = Math.max(0, 1 - age / 2000); // Fade over 2 seconds
        const size = 2 + point.velocity * 10; // Size based on velocity

        ctx.fillStyle = `rgba(0, 255, 136, ${opacity * 0.15})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y - scrollOffset, size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections
        if (index > 0) {
            const prevPoint = trail[index - 1];
            ctx.strokeStyle = `rgba(0, 255, 136, ${opacity * 0.1})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(prevPoint.x, prevPoint.y - scrollOffset);
            ctx.lineTo(point.x, point.y - scrollOffset);
            ctx.stroke();
        }
    });

    // Draw hesitation markers
    trackingData.hesitations.forEach(hesitation => {
        const age = Date.now() - hesitation.timestamp;
        if (age < 10000) { // Show for 10 seconds
            const opacity = Math.max(0, 1 - age / 10000);
            ctx.fillStyle = `rgba(255, 0, 85, ${opacity * 0.3})`;
            ctx.beginPath();
            ctx.arc(hesitation.x, hesitation.y - scrollOffset + window.scrollY, 20, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    requestAnimationFrame(drawTrail);
}

drawTrail();

// ==================== DATA DISPLAYS ====================

function updateDataDisplays() {
    const mousePos = trackingData.mousePositions[trackingData.mousePositions.length - 1];

    if (mousePos) {
        updateElement('mousePos', `(${Math.round(mousePos.x)}, ${Math.round(mousePos.y)})`);
        updateElement('mouseVel', `${(mouseVelocity * 1000).toFixed(1)} px/s`);
    }

    updateElement('hesitations', trackingData.hesitations.length);
    updateElement('scrollData', `${Math.round(window.scrollY)}px @ ${(scrollVelocity * 1000).toFixed(0)} px/s`);
    updateElement('clickData', trackingData.clicks.length);
    updateElement('screenData', `${window.innerWidth}x${window.innerHeight}`);

    const sessionDuration = Math.round((Date.now() - trackingData.startTime) / 1000);
    updateElement('timeData', `${sessionDuration}s`);
    updateElement('readTime', `${sessionDuration}s`);

    // Update data point counter
    updateElement('dataPointCount', trackingData.dataPointCount);

    // Update behavioral analysis
    updateBehavioralAnalysis();
}

function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = value;
    }
}

// ==================== BEHAVIORAL ANALYSIS ====================

function updateBehavioralAnalysis() {
    // Emotional state (based on mouse smoothness)
    const recentVelocities = trackingData.mousePositions
        .slice(-20)
        .map(p => p.velocity);
    const avgVelocity = recentVelocities.reduce((a, b) => a + b, 0) / recentVelocities.length || 0;
    const velocityVariance = recentVelocities.reduce((sum, v) => sum + Math.pow(v - avgVelocity, 2), 0) / recentVelocities.length;

    let emotionalState = 'Calm';
    if (velocityVariance > 0.5) emotionalState = 'Anxious';
    else if (avgVelocity > 2) emotionalState = 'Rushed';
    else if (avgVelocity < 0.3) emotionalState = 'Hesitant';

    updateElement('emotionalState', emotionalState);

    // Attention level (based on scroll behavior and time)
    const scrollPauses = trackingData.scrollEvents.filter(e => e.velocity < 0.1).length;
    const scrollTotal = trackingData.scrollEvents.length;
    const pauseRatio = scrollTotal > 0 ? scrollPauses / scrollTotal : 0;

    let attentionLevel = 'Moderate';
    if (pauseRatio > 0.6) attentionLevel = 'High - Reading carefully';
    else if (pauseRatio < 0.3) attentionLevel = 'Low - Skimming';
    else if (trackingData.hesitations.length > 10) attentionLevel = 'High - Deliberate';

    updateElement('attentionLevel', attentionLevel);

    // Intent prediction (based on hesitation patterns)
    const recentHesitations = trackingData.hesitations.filter(h => Date.now() - h.timestamp < 5000);
    let intent = 'Exploring';
    if (recentHesitations.length > 3) intent = 'Considering action';
    else if (trackingData.clicks.length > 5) intent = 'Actively engaging';
    else if (scrollVelocity > 2) intent = 'Seeking specific content';

    updateElement('intentPrediction', intent);

    // Vulnerability markers
    const hesitationBeforeClicks = trackingData.clicks.filter((click, i) => {
        const recentHesitation = trackingData.hesitations.find(h =>
            Math.abs(h.timestamp - click.timestamp) < 2000 &&
            Math.sqrt(Math.pow(h.x - click.x, 2) + Math.pow(h.y - click.y, 2)) < 50
        );
        return !!recentHesitation;
    }).length;

    const vulnerabilityScore = trackingData.clicks.length > 0
        ? (hesitationBeforeClicks / trackingData.clicks.length * 100).toFixed(0)
        : 0;

    updateElement('vulnerability', `${vulnerabilityScore}% of clicks show hesitation`);
}

// ==================== PROGRESSIVE DISCLOSURE ====================

function checkRevealElements() {
    const scrollPosition = window.scrollY + window.innerHeight * 0.7;

    // Reveal data list items
    document.querySelectorAll('.data-list li[data-reveal]').forEach(item => {
        const rect = item.getBoundingClientRect();
        const itemTop = rect.top + window.scrollY;

        if (scrollPosition > itemTop && !item.classList.contains('revealed')) {
            setTimeout(() => {
                item.classList.add('revealed');
            }, parseInt(item.dataset.reveal) * 100);
        }
    });

    // Reveal insight cards
    document.querySelectorAll('.insight-card[data-reveal]').forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardTop = rect.top + window.scrollY;

        if (scrollPosition > cardTop && !card.classList.contains('revealed')) {
            setTimeout(() => {
                card.classList.add('revealed');
            }, parseInt(card.dataset.reveal) * 100);
        }
    });
}

// ==================== FAKE TIMER (Dark Pattern Example) ====================

function startFakeTimer() {
    const timerEl = document.getElementById('fakeTimer');
    if (!timerEl) return;

    let minutes = 23;
    let seconds = 45;

    setInterval(() => {
        seconds--;
        if (seconds < 0) {
            seconds = 59;
            minutes--;
        }
        if (minutes < 0) {
            // Reset to create false urgency
            minutes = 23;
            seconds = 45;
        }

        timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// ==================== SHADOW VISUALIZATION ====================

function generateShadowVisualization() {
    if (!shadowCanvas || !shadowCtx) return;

    shadowCtx.fillStyle = '#151515';
    shadowCtx.fillRect(0, 0, shadowCanvas.width, shadowCanvas.height);

    // Create a unique visualization based on user's interaction patterns
    const positions = trackingData.mousePositions;
    if (positions.length < 10) return;

    // Sample positions for performance
    const sampledPositions = positions.filter((_, i) => i % 10 === 0);

    // Draw connection network
    shadowCtx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
    shadowCtx.lineWidth = 1;

    for (let i = 1; i < sampledPositions.length; i++) {
        const p1 = sampledPositions[i - 1];
        const p2 = sampledPositions[i];

        // Map to canvas coordinates
        const x1 = (p1.x / window.innerWidth) * shadowCanvas.width;
        const y1 = (p1.y / window.innerHeight) * shadowCanvas.height * 0.3;
        const x2 = (p2.x / window.innerWidth) * shadowCanvas.width;
        const y2 = (p2.y / window.innerHeight) * shadowCanvas.height * 0.3;

        shadowCtx.beginPath();
        shadowCtx.moveTo(x1, y1 + 100);
        shadowCtx.lineTo(x2, y2 + 100);
        shadowCtx.stroke();
    }

    // Draw velocity bars
    const barWidth = shadowCanvas.width / 50;
    sampledPositions.slice(-50).forEach((pos, i) => {
        const x = i * barWidth;
        const height = pos.velocity * 1000;
        const y = shadowCanvas.height - height;

        const hue = (pos.velocity * 50) % 360;
        shadowCtx.fillStyle = `hsla(${hue}, 100%, 50%, 0.3)`;
        shadowCtx.fillRect(x, y, barWidth - 2, height);
    });

    // Draw hesitation clusters
    trackingData.hesitations.forEach(h => {
        const x = (h.x / window.innerWidth) * shadowCanvas.width;
        const y = shadowCanvas.height / 2;

        shadowCtx.fillStyle = 'rgba(255, 0, 85, 0.2)';
        shadowCtx.beginPath();
        shadowCtx.arc(x, y, 30, 0, Math.PI * 2);
        shadowCtx.fill();
    });

    // Draw unique "fingerprint"
    const centerX = shadowCanvas.width / 2;
    const centerY = shadowCanvas.height - 100;
    const avgVelocity = sampledPositions.reduce((sum, p) => sum + p.velocity, 0) / sampledPositions.length;
    const hesitationCount = trackingData.hesitations.length;
    const clickCount = trackingData.clicks.length;

    // Create concentric circles based on behavior
    for (let i = 0; i < 5; i++) {
        const radius = 20 + i * 15;
        const segments = 8 + i * 4;

        for (let j = 0; j < segments; j++) {
            const angle = (j / segments) * Math.PI * 2;
            const variance = Math.sin(angle * clickCount) * avgVelocity * 5 +
                           Math.cos(angle * hesitationCount) * 3;
            const r = radius + variance;

            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;

            shadowCtx.fillStyle = `rgba(0, 255, 136, ${0.1 + i * 0.1})`;
            shadowCtx.beginPath();
            shadowCtx.arc(x, y, 3, 0, Math.PI * 2);
            shadowCtx.fill();
        }
    }
}

// ==================== SECTION TIMING ====================

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            if (!trackingData.sectionTimes[sectionId]) {
                trackingData.sectionTimes[sectionId] = {
                    enterTime: Date.now(),
                    totalTime: 0
                };
            } else {
                trackingData.sectionTimes[sectionId].enterTime = Date.now();
            }
            currentSection = sectionId;
        } else {
            const sectionId = entry.target.id;
            if (trackingData.sectionTimes[sectionId]?.enterTime) {
                const exitTime = Date.now();
                const enterTime = trackingData.sectionTimes[sectionId].enterTime;
                trackingData.sectionTimes[sectionId].totalTime += exitTime - enterTime;
                trackingData.sectionTimes[sectionId].enterTime = null;
            }
        }
    });
}, { threshold: 0.5 });

// Observe all sections
document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
});

// ==================== INITIALIZATION ====================

function init() {
    // Start fake timer for dark pattern example
    startFakeTimer();

    // Initial data display update
    updateDataDisplays();

    // Generate shadow visualization periodically
    setInterval(() => {
        generateShadowVisualization();
    }, 2000);

    // Initial reveal check
    checkRevealElements();

    // Log a welcome message
    console.log('%c⚠️ SURVEILLANCE NOTICE', 'color: #ff0055; font-size: 20px; font-weight: bold;');
    console.log('%cThis website is intentionally tracking your behavior as part of an interactive essay on surveillance capitalism.', 'color: #00ff88; font-size: 14px;');
    console.log('%cAll data is kept locally and never sent to any server.', 'color: #00ff88; font-size: 14px;');
    console.log('%cOpen the trackingData object to see what we collect:', 'color: #ffaa00; font-size: 12px;');
    console.log(trackingData);
}

// Start everything when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ==================== EXPORT FOR DEBUGGING ====================

// Make tracking data accessible in console
window.trackingData = trackingData;

// Log tracking stats every 30 seconds
setInterval(() => {
    console.log('%cTracking Stats:', 'color: #00ff88; font-weight: bold;');
    console.log(`  Mouse positions: ${trackingData.mousePositions.length}`);
    console.log(`  Clicks: ${trackingData.clicks.length}`);
    console.log(`  Hesitations: ${trackingData.hesitations.length}`);
    console.log(`  Scroll events: ${trackingData.scrollEvents.length}`);
    console.log(`  Total data points: ${trackingData.dataPointCount}`);
    console.log(`  Session duration: ${Math.round((Date.now() - trackingData.startTime) / 1000)}s`);
}, 30000);
