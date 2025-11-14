# Traces

*A meditation on digital impermanence*

![Status](https://img.shields.io/badge/status-experimental-blue)
![Type](https://img.shields.io/badge/type-web%20art-purple)

## Concept

**Traces** is an interactive web experience that explores the paradox of digital memory: everything online feels both eternal and instantly disposable. Through minimalist interaction design, it creates a space where your digital presence is acknowledged but never permanent.

Move your cursor or touch the screen. Watch as luminous particles bloom in your wake, then slowly fade, decay, and disappear. Each mark you leave is temporary. Nothing persists. Everything is fleeting.

This is not a game. This is not a tool. This is a moment to contemplate the nature of our digital footprints.

## Artistic Intent

We live in an age where everything is recorded, archived, cached. Yet paradoxically, our attention spans shrink and our experiences feel increasingly ephemeral. **Traces** materializes this tension.

The experience asks:
- What does it mean to leave a mark in digital space?
- Can we create beauty in impermanence?
- What happens when we accept that nothing needs to last forever?

**Influences:**
- Minimalist art (Agnes Martin, James Turrell)
- Japanese aesthetics of impermanence (wabi-sabi, mono no aware)
- Early internet art and net.art movements
- Generative art (Casey Reas, Tyler Hobbs)

## Technical Implementation

### Architecture

The experience is built with vanilla JavaScript and HTML5 Canvas, prioritizing performance and simplicity:

- **Particle System**: Each interaction spawns particles with independent lifecycles
- **Decay Mechanism**: Particles fade through gradual alpha reduction tied to a life value
- **Physics Simulation**: Subtle velocity, friction, and gravity create organic movement
- **Performance**: Particle count limited to 1000, with automatic cleanup of dead particles

### Key Features

1. **Responsive Interaction**
   - Mouse movement tracking with interpolation
   - Touch support for mobile devices
   - Particle emission scales with movement speed

2. **Visual Design**
   - Radial gradients for glow effects
   - HSL color space for smooth variation
   - Partial canvas clearing creates motion trails
   - Blue-cyan palette evokes digital/technological themes

3. **Optimization**
   - RequestAnimationFrame for smooth 60fps animation
   - Particle pooling and cleanup
   - Emission throttling to prevent performance degradation
   - Reduced motion support for accessibility

### File Structure

```
traces/
├── index.html          # HTML structure and semantic markup
├── style.css           # Minimalist styling and responsive design
├── traces.js           # Core particle system and interaction logic
└── README.md           # This file
```

## Running Locally

**Traces** is a static web experience. No build process, no dependencies, no server required.

### Option 1: Python Server
```bash
cd traces
python -m http.server 8000
```
Then open http://localhost:8000

### Option 2: Node.js Server
```bash
cd traces
npx serve
```

### Option 3: Direct File
Simply open `index.html` in a modern browser. Note: Some browsers may restrict Canvas features when opening local files.

## Browser Support

Works in all modern browsers supporting:
- HTML5 Canvas
- ES6+ JavaScript
- CSS Grid and Custom Properties

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

Deploy anywhere that serves static files:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- AWS S3 + CloudFront
- Your own server

No build step required. Just upload the files.

## Performance Notes

**Particle Budget**: The system maintains a maximum of 1000 particles. When this limit is reached, the oldest 200 particles are removed. This prevents memory issues while maintaining visual richness.

**Emission Rate**: Particles are emitted every 30ms during movement. The count scales with speed (max 5 particles per emission).

**Frame Rate**: Target is 60fps. On lower-end devices, particle count may automatically reduce through the lifecycle system.

## Customization

Want to modify the experience? Key parameters in `traces.js`:

```javascript
// Particle lifecycle
this.decay = 0.003 + Math.random() * 0.005; // How fast particles fade

// Visual properties
this.hue = 200 + Math.random() * 60; // Color range (blue-cyan)
this.size = 2 + Math.random() * 4; // Particle size

// Physics
this.friction = 0.98; // How quickly particles slow down
this.gravity = 0.01; // Downward drift

// System limits
if (this.particles.length > 1000) { // Maximum particles
```

## Philosophy

This project rejects the notion that digital art must be complex, gamified, or "engaging" in the traditional sense. It offers something quieter: a space for reflection.

In a web full of infinite scrolls, notifications, and persistent data, **Traces** provides an alternative experience—one that respects the beauty of things that don't last.

## Credits

Created by Claude (Anthropic) as an exploration of creative coding and digital art.

Inspired by countless artists, designers, and thinkers who've questioned the nature of digital experience.

## License

This is experimental art. Use it, modify it, learn from it. No restrictions.

---

*"Everything flows and nothing stays."* — Heraclitus

*"This too shall pass."* — Persian Sufi poets
