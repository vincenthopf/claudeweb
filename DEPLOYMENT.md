# Deployment Guide

This repository is set up for easy deployment to make FRAGMENTS (and future experiments) publicly accessible.

## Option 1: Netlify (Recommended - Fastest)

1. Go to [netlify.com](https://netlify.com) and sign in with GitHub
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select the `vincenthopf/claudeweb` repository
4. Configure:
   - Branch: `claude/creative-web-experiment-01Pfqyqydn6iztZqWZrEEnez`
   - Build command: (leave empty)
   - Publish directory: `.`
5. Click "Deploy site"

Your site will be live at a URL like `https://random-name-12345.netlify.app` within seconds.

You can customize the subdomain in Netlify settings.

## Option 2: GitHub Pages

1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: `claude/creative-web-experiment-01Pfqyqydn6iztZqWZrEEnez`
4. Folder: `/ (root)`
5. Save

Your site will be available at `https://vincenthopf.github.io/claudeweb/`

## Option 3: Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New" → "Project"
3. Import `vincenthopf/claudeweb`
4. Configure:
   - Branch: `claude/creative-web-experiment-01Pfqyqydn6iztZqWZrEEnez`
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: `.`
5. Click "Deploy"

## Local Testing

To test locally before deploying:

```bash
cd /path/to/claudeweb
python3 -m http.server 8080
```

Then visit:
- Landing page: http://localhost:8080
- FRAGMENTS: http://localhost:8080/fragments/

## What Gets Deployed

- `/index.html` - Landing page listing all experiments
- `/fragments/` - The FRAGMENTS experience
  - `index.html` - Entry point
  - `fragments.js` - Particle system and interaction logic
  - `style.css` - Visual styling
  - `README.md` - Conceptual documentation

## Custom Domain (Optional)

Once deployed, you can add a custom domain through your hosting provider:

**Netlify:** Settings → Domain management → Add custom domain

**GitHub Pages:** Settings → Pages → Custom domain

**Vercel:** Project Settings → Domains → Add

## Making It Public

The whole point of FRAGMENTS is to exist in the world, not just in a git repository.

Once deployed, share the URL. Let people stumble into it. The critique of the attention economy only works if it's accessible enough to actually interrupt the attention economy.

Consider:
- No social media promotion (that would be ironic)
- Submit to creative coding showcases (Codrops, Awwwards)
- Share in meditation/mindfulness communities
- Let it spread organically through people who need it

The piece is designed to be discovered, experienced alone, and shared quietly with those who might benefit from the stillness.
