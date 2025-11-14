// Simplified Perlin noise implementation
// Based on Ken Perlin's improved noise
class PerlinNoise {
  constructor() {
    this.permutation = []
    for (let i = 0; i < 256; i++) {
      this.permutation[i] = i
    }
    // Shuffle
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]]
    }
    // Duplicate permutation array
    this.p = [...this.permutation, ...this.permutation]
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  lerp(t, a, b) {
    return a + t * (b - a)
  }

  grad(hash, x, y) {
    const h = hash & 3
    const u = h < 2 ? x : y
    const v = h < 2 ? y : x
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }

  noise(x, y) {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255

    x -= Math.floor(x)
    y -= Math.floor(y)

    const u = this.fade(x)
    const v = this.fade(y)

    const a = this.p[X] + Y
    const b = this.p[X + 1] + Y

    return this.lerp(
      v,
      this.lerp(u, this.grad(this.p[a], x, y), this.grad(this.p[b], x - 1, y)),
      this.lerp(u, this.grad(this.p[a + 1], x, y - 1), this.grad(this.p[b + 1], x - 1, y - 1))
    )
  }
}

export default PerlinNoise
