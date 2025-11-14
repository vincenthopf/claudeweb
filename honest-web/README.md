# THE HONEST WEB

**A brutally transparent website that exposes its own infrastructure**

![Status: Experimental](https://img.shields.io/badge/status-experimental-orange)
![CO2: Minimal](https://img.shields.io/badge/CO2-minimal-green)
![Tracking: None](https://img.shields.io/badge/tracking-none-green)

## What Is This?

Most websites lie by omission. They track you silently, manipulate you subtly, hide their environmental cost, and make cancellation impossible while signup is instant.

**The Honest Web refuses.**

This is a single-page web experience that exposes everything normally hidden:

- ✅ **Real-time carbon footprint** - Based on CO2.js methodology from The Green Web Foundation
- ✅ **Every HTTP request** - Visualized as it happens
- ✅ **Potential tracking points** - Exposed and explicitly disabled
- ✅ **Dark patterns** - Named, explained, and rejected
- ✅ **Accessibility features** - Not optional, but foundational
- ✅ **Session time tracking** - Your most precious resource

## Philosophy

This project exists at the intersection of:

- **Net Art** - The web as artistic medium
- **Digital Brutalism** - Honest, raw, functional design
- **Ethical Design** - Transparency as default
- **Web Sustainability** - Measuring and minimizing environmental impact
- **Data Transparency** - Making the invisible visible

## Technical Details

### Carbon Calculation

Implements the Sustainable Web Design (SWD) methodology:

```
CO2 emissions = Data transferred (GB) × 0.81 kWh/GB × 442g CO2/kWh
```

**Learning FYI:** This is the same methodology used by the W3C and adopted as an international standard for website carbon measurement.

### Design Principles

1. **No build tools** - Pure HTML, CSS, JavaScript
2. **No frameworks** - Vanilla JS for maximum transparency
3. **No tracking** - Zero cookies, analytics, or pixels
4. **No obfuscation** - Readable, commented source code
5. **Brutalist aesthetic** - Exposed grid, bold typography, high contrast
6. **Accessible by default** - WCAG AA compliance minimum

### Architecture

```
honest-web/
├── index.html          # Single-page experience (all-in-one)
└── README.md           # This file
```

**Learning FYI:** The entire experience is in a single HTML file to minimize HTTP requests and maximize transparency. View source to see everything.

## Performance

- **Page weight:** ~15KB uncompressed
- **HTTP requests:** 1 (just the HTML)
- **CO2 per view:** ~0.01g (97% better than average)
- **Load time:** <100ms on 3G

**Learning FYI:** The average website produces 0.36g CO2 per page view. By keeping it minimal, we're 36x more efficient.

## What This Critiques

### The Attention Economy
- Infinite scroll addiction
- Engagement metrics over user value
- Time as extractable resource

### Surveillance Capitalism
- Invisible tracking
- Cross-site profiling
- Data as commodity

### Dark Patterns
- Confirmshaming ("No thanks, I hate saving money")
- Hidden costs (surprise fees)
- Roach motels (easy in, impossible out)
- Fake urgency ("Only 2 left!")

### Greenwashing
- Ignoring carbon footprint
- Unlimited data transfer without accountability
- "Cloud" as abstraction hiding environmental cost

## How to Use

Simply open `index.html` in a browser. That's it.

No build step. No npm install. No bundler. No server required.

**This is intentional.** The web doesn't need to be complicated.

## Deployment

Can be deployed anywhere:

- GitHub Pages
- Netlify
- Vercel
- Any static host
- Or just... open the file

## Browser Support

Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**Learning FYI:** No polyfills needed because we use only established web standards.

## Inspiration

- **brutalist-web.design** - David Bryant Copeland's manifesto
- **The Green Web Foundation** - CO2.js and sustainable web practices
- **Neobrutalism** - Figma, Gumroad design evolution
- **EU Digital Fairness Act** - Making transparency mandatory
- **Net art movement** - Web as artistic medium

## Contributing

This is an art piece, not a product. Fork it. Remix it. Make it yours.

The code is intentionally simple and readable. No gatekeeping.

## License

CC0 - Public Domain

The web belongs to everyone.

---

**Learning FYI:** This project demonstrates that ethical, accessible, sustainable web design doesn't require sacrificing aesthetics or impact. In fact, constraints breed creativity.

Built with honesty in 2025.
