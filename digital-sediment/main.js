import * as THREE from 'three';

// ===== CONFIGURATION =====
const CONFIG = {
  particlesPerClick: 50,
  particleSize: 0.02,
  gravity: -0.001,
  damping: 0.98,
  settledVelocityThreshold: 0.0001,
  layerCompressionRate: 0.00001, // How fast layers compress over time
  maxParticles: 100000,
  colorPalettes: [
    ['#ff00ff', '#00ffff', '#ffff00'],
    ['#ff0066', '#0066ff', '#66ff00'],
    ['#ff3300', '#00ff99', '#9900ff'],
    ['#ff6600', '#0099ff', '#ff0099'],
  ]
};

// ===== PARTICLE SYSTEM =====
class Particle {
  constructor(x, y, z, color) {
    this.position = new THREE.Vector3(x, y, z);
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      Math.random() * 0.02,
      (Math.random() - 0.5) * 0.02
    );
    this.color = color;
    this.settled = false;
    this.age = 0;
    this.layerDepth = 0; // How many layers deep this particle is
  }

  update(deltaTime) {
    if (this.settled) {
      this.age += deltaTime;
      return;
    }

    // Apply gravity
    this.velocity.y += CONFIG.gravity;

    // Apply damping
    this.velocity.multiplyScalar(CONFIG.damping);

    // Update position
    this.position.add(this.velocity);

    // Check if settled (velocity near zero and below certain y threshold)
    if (Math.abs(this.velocity.y) < CONFIG.settledVelocityThreshold && this.position.y < 0) {
      this.settled = true;
      this.velocity.set(0, 0, 0);
    }

    this.age += deltaTime;
  }
}

// ===== LAYER MANAGER =====
class LayerManager {
  constructor() {
    this.layers = [];
    this.totalMarks = 0;
  }

  addParticles(particles) {
    this.layers.push({
      particles,
      createdAt: Date.now(),
      compressed: false
    });
    this.totalMarks += particles.length;
  }

  update(deltaTime) {
    // Compress older layers
    const now = Date.now();
    this.layers.forEach((layer, index) => {
      const age = (now - layer.createdAt) / 1000; // age in seconds
      const depthFactor = this.layers.length - index; // deeper = more compression

      layer.particles.forEach(particle => {
        if (particle.settled) {
          particle.layerDepth = depthFactor;
          // Compress downward over time
          const compressionAmount = CONFIG.layerCompressionRate * age * depthFactor * deltaTime;
          particle.position.y -= compressionAmount;
        }
      });
    });
  }

  getMetrics() {
    const now = Date.now();
    const oldestLayer = this.layers[0];
    const oldestAge = oldestLayer ? (now - oldestLayer.createdAt) / 1000 : 0;

    const settledCount = this.layers.reduce((acc, layer) => {
      return acc + layer.particles.filter(p => p.settled).length;
    }, 0);

    // Calculate compression depth (how far down particles have compressed)
    let maxCompression = 0;
    this.layers.forEach(layer => {
      layer.particles.forEach(p => {
        if (p.settled && p.position.y < maxCompression) {
          maxCompression = p.position.y;
        }
      });
    });

    return {
      layerCount: this.layers.length,
      totalMarks: this.totalMarks,
      oldestAge,
      compressionDepth: Math.abs(maxCompression)
    };
  }

  getAllParticles() {
    return this.layers.flatMap(layer => layer.particles);
  }
}

// ===== MAIN APPLICATION =====
class DigitalSediment {
  constructor() {
    this.clock = new THREE.Clock();
    this.layerManager = new LayerManager();
    this.activeParticles = [];
    this.currentPaletteIndex = 0;

    this.initScene();
    this.initGeometry();
    this.initEventListeners();
    this.animate();
  }

  initScene() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 2);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('canvas'),
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Handle resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  initGeometry() {
    // We'll use InstancedMesh for performance
    // Start with initial capacity, will recreate as needed
    this.particleGeometry = new THREE.SphereGeometry(CONFIG.particleSize, 8, 8);
    this.particleMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });

    // Start with a reasonable capacity
    this.instancedMesh = new THREE.InstancedMesh(
      this.particleGeometry,
      this.particleMaterial,
      10000
    );
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // Enable per-instance colors
    this.instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(10000 * 3),
      3
    );
    this.instancedMesh.instanceColor.setUsage(THREE.DynamicDrawUsage);

    this.scene.add(this.instancedMesh);
  }

  initEventListeners() {
    const canvas = document.getElementById('canvas');

    const handleInteraction = (clientX, clientY) => {
      // Convert screen coordinates to world coordinates
      const x = (clientX / window.innerWidth) * 2 - 1;
      const y = -(clientY / window.innerHeight) * 2 + 1;

      // Project to world space
      const vector = new THREE.Vector3(x, y, 0.5);
      vector.unproject(this.camera);
      const dir = vector.sub(this.camera.position).normalize();
      const distance = -this.camera.position.z / dir.z;
      const pos = this.camera.position.clone().add(dir.multiplyScalar(distance));

      this.spawnParticles(pos.x, pos.y, pos.z);
    };

    // Mouse events
    canvas.addEventListener('click', (e) => {
      handleInteraction(e.clientX, e.clientY);
    });

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleInteraction(touch.clientX, touch.clientY);
    });
  }

  spawnParticles(x, y, z) {
    // Rotate through color palettes
    const palette = CONFIG.colorPalettes[this.currentPaletteIndex];
    this.currentPaletteIndex = (this.currentPaletteIndex + 1) % CONFIG.colorPalettes.length;

    const particles = [];
    const color = palette[Math.floor(Math.random() * palette.length)];

    for (let i = 0; i < CONFIG.particlesPerClick; i++) {
      const particle = new Particle(x, y, z, color);
      particles.push(particle);
      this.activeParticles.push(particle);
    }

    // Check if we need to resize instancedMesh
    const totalParticles = this.layerManager.getAllParticles().length + this.activeParticles.length;
    if (totalParticles > this.instancedMesh.count) {
      this.resizeInstancedMesh(Math.min(totalParticles * 1.5, CONFIG.maxParticles));
    }
  }

  resizeInstancedMesh(newCount) {
    this.scene.remove(this.instancedMesh);

    const count = Math.floor(newCount);
    this.instancedMesh = new THREE.InstancedMesh(
      this.particleGeometry,
      this.particleMaterial,
      count
    );
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // Re-enable per-instance colors with new capacity
    this.instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(count * 3),
      3
    );
    this.instancedMesh.instanceColor.setUsage(THREE.DynamicDrawUsage);

    this.scene.add(this.instancedMesh);
  }

  update(deltaTime) {
    // Update active particles
    this.activeParticles.forEach(particle => particle.update(deltaTime));

    // Move settled particles to layer manager
    const settled = this.activeParticles.filter(p => p.settled);
    if (settled.length > 0) {
      this.layerManager.addParticles(settled);
      this.activeParticles = this.activeParticles.filter(p => !p.settled);
    }

    // Update layer compression
    this.layerManager.update(deltaTime);

    // Update instanced mesh
    this.updateInstancedMesh();

    // Update UI
    this.updateUI();
  }

  updateInstancedMesh() {
    const allParticles = [...this.activeParticles, ...this.layerManager.getAllParticles()];

    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();

    allParticles.forEach((particle, i) => {
      if (i >= this.instancedMesh.count) return;

      // Set position
      matrix.setPosition(particle.position);
      this.instancedMesh.setMatrixAt(i, matrix);

      // Set color with age-based opacity
      const opacity = particle.settled ?
        Math.max(0.3, 1 - (particle.age / 100000)) : 1;

      color.set(particle.color);
      this.instancedMesh.setColorAt(i, color);
    });

    // Hide unused instances
    for (let i = allParticles.length; i < this.instancedMesh.count; i++) {
      matrix.setPosition(0, -1000, 0); // Move far away
      this.instancedMesh.setMatrixAt(i, matrix);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
  }

  updateUI() {
    const metrics = this.layerManager.getMetrics();

    document.getElementById('active-count').textContent = this.activeParticles.length;
    document.getElementById('layer-count').textContent = metrics.layerCount;
    document.getElementById('total-marks').textContent = metrics.totalMarks.toLocaleString();

    const ageSeconds = Math.floor(metrics.oldestAge);
    const ageMinutes = Math.floor(ageSeconds / 60);
    const ageHours = Math.floor(ageMinutes / 60);

    let ageDisplay;
    if (ageHours > 0) {
      ageDisplay = `${ageHours}h ${ageMinutes % 60}m`;
    } else if (ageMinutes > 0) {
      ageDisplay = `${ageMinutes}m ${ageSeconds % 60}s`;
    } else {
      ageDisplay = `${ageSeconds}s`;
    }

    document.getElementById('oldest-layer').textContent = ageDisplay;
    document.getElementById('compression-depth').textContent = metrics.compressionDepth.toFixed(2) + 'm';
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const deltaTime = this.clock.getDelta() * 1000; // Convert to milliseconds
    this.update(deltaTime);
    this.renderer.render(this.scene, this.camera);
  }
}

// ===== INITIALIZE =====
new DigitalSediment();
