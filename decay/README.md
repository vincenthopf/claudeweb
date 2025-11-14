# DECAY

*An Interactive Meditation on Digital Consumption*

---

## Concept

**DECAY** is a web-based art piece that explores the paradox of attention in the digital age: *the more we look, the faster things disappear.*

Poetic fragments materialize on screen — meditations on impermanence, consumption, and observation. But there's a catch: your attention is not passive. Your gaze, tracked through mouse movement, literally causes the content to decay. The closer you look, the faster it disintegrates into particles and vanishes.

This is a commentary on:
- **The Attention Economy**: How our attention feeds and destroys simultaneously
- **Digital Impermanence**: Nothing online truly lasts; everything is ephemeral
- **Observer Effect**: How observation changes the observed (a nod to quantum mechanics)
- **Consumption Culture**: We consume content until there's nothing left
- **Buddhist Impermanence**: All things are transient; clinging accelerates decay

## The Experience

- **No instructions.** Discovery through interaction.
- **Move your cursor** to reveal content
- **Watch closely** and it crumbles
- **Look away** and the decay slows
- Each fragment appears for a brief moment, then makes way for another
- The interface is minimal, contemplative, meditative

## Technical Implementation

Built with vanilla JavaScript and HTML5 Canvas for maximum performance and control:

- **Particle System**: Each character decays into multiple particles with physics (velocity, gravity, rotation)
- **Attention Tracking**: Mouse proximity triggers decay acceleration
- **Generative Text**: 20 poetic fragments randomly appear
- **Organic Decay**: Characters break apart individually based on proximity and time
- **Visual Polish**: Glitch effects, color palette, subtle animations

**Learning FYI**: Using Canvas API directly (rather than libraries like p5.js) gives us fine-grained control over rendering and performance, essential for smooth 60fps particle systems with hundreds of elements.

## Philosophy

In a world that demands our constant attention, **DECAY** invites you to consider: What if attention wasn't neutral? What if every click, every scroll, every moment of engagement had weight and consequence?

This piece doesn't provide answers. It poses questions through experience.

## How to Run

Simply open `index.html` in a modern web browser. No build process, no dependencies, no tracking, no analytics. Pure experience.

```bash
# From the decay directory
open index.html
# or
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Artist's Note

Created in November 2025 as an exploration of what happens when we make digital consumption *visible* and *tangible*. In an attention economy that treats our focus as infinite and consequence-free, **DECAY** suggests otherwise.

The web is the perfect medium for this piece — it exists in the same ecosystem it critiques.

---

*"the more you look, the less remains"*
