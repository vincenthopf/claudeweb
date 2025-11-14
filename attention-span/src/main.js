import './style.css'
import PerlinNoise from './perlin.js'

// Canvas setup
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
let width = canvas.width = window.innerWidth
let height = canvas.height = window.innerHeight
let dpr = window.devicePixelRatio || 1

// Scale for retina displays
canvas.width = width * dpr
canvas.height = height * dpr
canvas.style.width = `${width}px`
canvas.style.height = `${height}px`
ctx.scale(dpr, dpr)

// Perlin noise for organic flow
const perlin = new PerlinNoise()

// State
let isVisible = true
let totalAttentionTime = 0
let lastTime = Date.now()
let particles = []
let globalTime = 0
const maxParticles = 300
const connectionDistance = 120
const spawnRate = 0.3 // particles per frame when visible

// Particle class
class Particle {
  constructor(x, y, creationTime) {
    this.x = x
    this.y = y
    this.baseX = x
    this.baseY = y
    this.noiseOffsetX = Math.random() * 1000
    this.noiseOffsetY = Math.random() * 1000
    this.baseRadius = Math.random() * 1.5 + 0.8
    this.radius = this.baseRadius
    this.alpha = 0
    this.targetAlpha = 0.7 + Math.random() * 0.2
    this.creationTime = creationTime
    this.life = 1.0
    this.decaying = false
    this.breathPhase = Math.random() * Math.PI * 2
  }

  update(isVisible, deltaTime, time) {
    // Organic flow using Perlin noise
    const noiseScale = 0.002
    const noiseStrength = 0.5
    const noiseX = perlin.noise(this.baseX * noiseScale + this.noiseOffsetX, time * 0.0001)
    const noiseY = perlin.noise(this.baseY * noiseScale + this.noiseOffsetY, time * 0.0001 + 100)

    this.x = this.baseX + noiseX * noiseStrength * 100
    this.y = this.baseY + noiseY * noiseStrength * 100

    // Gentle drift of base position
    this.baseX += (Math.random() - 0.5) * 0.2
    this.baseY += (Math.random() - 0.5) * 0.2

    // Soft boundaries - wrap around
    if (this.baseX < -50) this.baseX = width + 50
    if (this.baseX > width + 50) this.baseX = -50
    if (this.baseY < -50) this.baseY = height + 50
    if (this.baseY > height + 50) this.baseY = -50

    // Breathing effect
    const breathSpeed = 0.001
    this.radius = this.baseRadius + Math.sin(time * breathSpeed + this.breathPhase) * 0.3

    // Fade in when created
    if (this.alpha < this.targetAlpha) {
      this.alpha += 0.015
    }

    // Decay when not visible
    if (!isVisible) {
      this.decaying = true
      this.life -= deltaTime * 0.0005 // Slow, devastating decay
    }

    return this.life > 0
  }

  draw(ctx, hue, time) {
    const alpha = this.alpha * this.life

    // Color variation based on life and position
    const colorVariation = (this.x + this.y) * 0.02
    const particleHue = (hue + colorVariation) % 360
    const saturation = 60 + this.life * 20
    const lightness = 55 + (1 - this.life) * 15

    // Draw subtle glow
    if (alpha > 0.3) {
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3)
      gradient.addColorStop(0, `hsla(${particleHue}, ${saturation}%, ${lightness}%, ${alpha * 0.15})`)
      gradient.addColorStop(1, `hsla(${particleHue}, ${saturation}%, ${lightness}%, 0)`)
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw particle
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${particleHue}, ${saturation}%, ${lightness}%, ${alpha})`
    ctx.fill()
  }
}

// Spawn new particle
function spawnParticle() {
  if (particles.length >= maxParticles) return

  const x = Math.random() * width
  const y = Math.random() * height
  particles.push(new Particle(x, y, totalAttentionTime))
}

// Draw connections between nearby particles
function drawConnections(hue) {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < connectionDistance) {
        // Connection strength based on distance, life, and alpha
        const distanceFactor = (1 - distance / connectionDistance)
        const lifeFactor = Math.min(particles[i].life, particles[j].life)
        const alphaFactor = Math.min(particles[i].alpha, particles[j].alpha)
        const alpha = distanceFactor * lifeFactor * alphaFactor * 0.25

        if (alpha > 0.01) {
          // Subtle color variation for connections
          const avgX = (particles[i].x + particles[j].x) / 2
          const avgY = (particles[i].y + particles[j].y) / 2
          const colorShift = (avgX + avgY) * 0.02
          const connectionHue = (hue + colorShift) % 360
          const saturation = 60 + lifeFactor * 15

          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `hsla(${connectionHue}, ${saturation}%, 60%, ${alpha})`
          ctx.lineWidth = 0.5 + distanceFactor * 0.3
          ctx.stroke()
        }
      }
    }
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate)

  const now = Date.now()
  const deltaTime = now - lastTime
  lastTime = now
  globalTime += deltaTime

  // Track attention time
  if (isVisible) {
    totalAttentionTime += deltaTime
  }

  // Calculate color based on attention time
  // Slowly cycle through hues - warm to cool spectrum
  const hue = (totalAttentionTime * 0.008) % 360

  // Clear canvas with subtle trail effect
  ctx.fillStyle = 'rgba(10, 10, 10, 0.1)'
  ctx.fillRect(0, 0, width, height)

  // Spawn new particles when visible
  if (isVisible && Math.random() < spawnRate) {
    spawnParticle()
  }

  // Update particles
  particles = particles.filter(particle => particle.update(isVisible, deltaTime, globalTime))

  // Draw connections first (background layer)
  drawConnections(hue)

  // Draw particles on top
  particles.forEach(particle => particle.draw(ctx, hue, globalTime))
}

// Page Visibility API
document.addEventListener('visibilitychange', () => {
  isVisible = !document.hidden
})

// Handle window blur/focus as well
window.addEventListener('blur', () => {
  isVisible = false
})

window.addEventListener('focus', () => {
  isVisible = true
})

// Handle resize
window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth
  height = canvas.height = window.innerHeight
  dpr = window.devicePixelRatio || 1

  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  ctx.scale(dpr, dpr)
})

// Start animation
animate()

// Spawn initial particles
for (let i = 0; i < 20; i++) {
  spawnParticle()
}
