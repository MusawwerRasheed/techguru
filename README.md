# ⚡ TechGuru

A modern, SEO-optimized tech blog built for daily publishing and Netlify deployment.

![Dark glassmorphism design with neon accents](https://img.shields.io/badge/design-dark%20glassmorphism-0a0a0f?style=for-the-badge&labelColor=0a0a0f&color=00e5ff)

## Quick Start

```bash
# Install dependencies
npm install

# Build the site
npm run build

# Preview locally
npm run dev
```

## Writing a New Post

### Option 1: Use the scaffold script
```bash
npm run new-post -- "My Awesome Post Title"
```

### Option 2: Create manually
Create a new `.md` file in the `posts/` directory:

```markdown
---
title: "Your Post Title"
date: 2026-10-21
description: "A compelling description for SEO (150-160 chars ideal)"
tags: [AI, Web Dev, Tutorial]
author: TechGuru
---

Your post content here. Full Markdown supported.
```

### Then build and push
```bash
npm run build
git add .
git commit -m "New post: Your Post Title"
git push
```

Netlify will auto-deploy on push.

## Project Structure

```
techguru/
├── posts/              ← Your blog posts (Markdown)
├── templates/          ← HTML templates (home + post)
├── static/             ← CSS and static assets
├── scripts/            ← Helper scripts
├── build.js            ← Build script (MD → HTML)
├── netlify.toml        ← Netlify configuration
└── dist/               ← Built output (auto-generated)
```

## SEO Features

- ✅ Auto-generated `sitemap.xml`
- ✅ `robots.txt` with sitemap reference
- ✅ RSS feed at `/rss.xml`
- ✅ Open Graph meta tags on every page
- ✅ Twitter Card meta tags
- ✅ JSON-LD structured data (BlogPosting schema)
- ✅ Canonical URLs
- ✅ Semantic HTML5

## Google Search Console Setup

1. Deploy to Netlify
2. Go to [Google Search Console](https://search.google.com/search-console)
3. Add your site URL (`https://techguru.netlify.app`)
4. Verify ownership (Netlify DNS or HTML tag method)
5. Submit your sitemap: `https://techguru.netlify.app/sitemap.xml`
6. Google will start crawling and indexing your posts

## Netlify Deployment

1. Push this repo to GitHub
2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repo
5. Build settings are auto-detected from `netlify.toml`
6. Deploy!

## Daily Workflow

```
1. Write post → posts/my-new-topic.md
2. Build      → npm run build
3. Push       → git push
4. Done       → Netlify deploys automatically
```

## License

MIT
