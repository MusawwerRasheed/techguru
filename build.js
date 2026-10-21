const fs = require('fs');
const path = require('path');
const fm = require('front-matter');
const { marked } = require('marked');
const { Feed } = require('feed');

// ── Config ──────────────────────────────────────────────────────────────
const SITE = {
  title: 'TechGuru',
  description: 'Your daily dose of tech — AI, web dev, programming, and everything in between.',
  url: 'https://techguru2026.netlify.app',
  author: 'TechGuru',
  language: 'en',
};

const POSTS_DIR = path.join(__dirname, 'posts');
const DIST_DIR = path.join(__dirname, 'dist');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const STATIC_DIR = path.join(__dirname, 'static');

// ── Helpers ─────────────────────────────────────────────────────────────
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES_DIR, `${name}.html`), 'utf-8');
}

function slugify(filename) {
  return filename.replace(/\.md$/, '');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatIsoDate(d) {
  if (!d) return new Date().toISOString().split('T')[0];
  const dateObj = d instanceof Date ? d : new Date(d);
  if (isNaN(dateObj.getTime())) return new Date().toISOString().split('T')[0];
  return dateObj.toISOString().split('T')[0];
}

function estimateReadTime(content) {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Parse Posts ─────────────────────────────────────────────────────────
function getAllPosts() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('⚠️  No posts/ directory found. Creating it...');
    ensureDir(POSTS_DIR);
    return [];
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  
  const posts = files.map(file => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const { attributes, body } = fm(raw);
    const slug = slugify(file);
    const htmlContent = marked(body);
    const readTime = estimateReadTime(body);

    return {
      slug,
      title: attributes.title || slug,
      date: formatIsoDate(attributes.date),
      description: attributes.description || '',
      tags: attributes.tags || [],
      cover: attributes.cover || null,
      author: attributes.author || SITE.author,
      htmlContent,
      readTime,
      body,
    };
  });

  // Sort by date descending (newest first)
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return posts;
}

// ── Build Pages ─────────────────────────────────────────────────────────
function buildPostPage(post, template) {
  const tagsHtml = post.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
  const coverHtml = post.cover
    ? `<div class="post-cover"><img src="${escapeHtml(post.cover)}" alt="${escapeHtml(post.title)}" loading="lazy"/></div>`
    : '';

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Person', name: post.author },
    url: `${SITE.url}/posts/${post.slug}.html`,
  });

  let html = template
    .replace(/{{SITE_TITLE}}/g, SITE.title)
    .replace(/{{SITE_URL}}/g, SITE.url)
    .replace(/{{POST_TITLE}}/g, escapeHtml(post.title))
    .replace(/{{POST_DATE}}/g, formatDate(post.date))
    .replace(/{{POST_DATE_ISO}}/g, post.date)
    .replace(/{{POST_DESCRIPTION}}/g, escapeHtml(post.description))
    .replace(/{{POST_TAGS}}/g, tagsHtml)
    .replace(/{{POST_COVER}}/g, coverHtml)
    .replace(/{{POST_CONTENT}}/g, post.htmlContent)
    .replace(/{{POST_READ_TIME}}/g, post.readTime)
    .replace(/{{POST_AUTHOR}}/g, escapeHtml(post.author))
    .replace(/{{POST_JSON_LD}}/g, jsonLd);

  const outDir = path.join(DIST_DIR, 'posts');
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, `${post.slug}.html`), html);
}

function buildHomePage(posts, template) {
  const postsHtml = posts.map(post => {
    const tagsHtml = post.tags.slice(0, 3).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
    const coverAttr = post.cover ? `style="--cover: url('${post.cover}')"` : '';
    return `
      <a href="/posts/${post.slug}.html" class="post-card" ${coverAttr}>
        <div class="post-card-inner">
          <div class="post-card-meta">
            <time datetime="${post.date}">${formatDate(post.date)}</time>
            <span class="dot">·</span>
            <span>${post.readTime} min read</span>
          </div>
          <h2 class="post-card-title">${escapeHtml(post.title)}</h2>
          <p class="post-card-desc">${escapeHtml(post.description)}</p>
          <div class="post-card-tags">${tagsHtml}</div>
        </div>
      </a>`;
  }).join('\n');

  const html = template
    .replace(/{{SITE_TITLE}}/g, SITE.title)
    .replace(/{{SITE_DESCRIPTION}}/g, SITE.description)
    .replace(/{{SITE_URL}}/g, SITE.url)
    .replace(/{{POSTS}}/g, postsHtml)
    .replace(/{{POST_COUNT}}/g, posts.length);

  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html);
}

// ── SEO Files ───────────────────────────────────────────────────────────
function buildSitemap(posts) {
  const today = new Date().toISOString().split('T')[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE.url}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  posts.forEach(post => {
    xml += `
  <url>
    <loc>${SITE.url}/posts/${post.slug}.html</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  xml += '\n</urlset>';
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), xml);
}

function buildRobotsTxt() {
  const content = `User-agent: *
Allow: /

Sitemap: ${SITE.url}/sitemap.xml
`;
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), content);
}

function buildRssFeed(posts) {
  const feed = new Feed({
    title: SITE.title,
    description: SITE.description,
    id: SITE.url,
    link: SITE.url,
    language: SITE.language,
    copyright: `© ${new Date().getFullYear()} ${SITE.title}`,
    updated: posts.length ? new Date(posts[0].date) : new Date(),
  });

  posts.forEach(post => {
    feed.addItem({
      title: post.title,
      id: `${SITE.url}/posts/${post.slug}.html`,
      link: `${SITE.url}/posts/${post.slug}.html`,
      description: post.description,
      content: post.htmlContent,
      date: new Date(post.date),
      author: [{ name: post.author }],
    });
  });

  fs.writeFileSync(path.join(DIST_DIR, 'rss.xml'), feed.rss2());
}

// ── Copy Static Assets ─────────────────────────────────────────────────
function copyStatic() {
  if (!fs.existsSync(STATIC_DIR)) return;

  function copyRecursive(src, dest) {
    ensureDir(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  copyRecursive(STATIC_DIR, DIST_DIR);
}

// ── Main Build ──────────────────────────────────────────────────────────
function build() {
  console.log('\n🚀 TechGuru Build Starting...\n');

  // Clean dist
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  ensureDir(DIST_DIR);

  // Copy static files first
  copyStatic();

  // Parse all posts
  const posts = getAllPosts();
  console.log(`📝 Found ${posts.length} post(s)`);

  // Load templates
  const homeTemplate = readTemplate('home');
  const postTemplate = readTemplate('post');

  // Build pages
  buildHomePage(posts, homeTemplate);
  posts.forEach(post => buildPostPage(post, postTemplate));

  // Build SEO files
  buildSitemap(posts);
  buildRobotsTxt();
  buildRssFeed(posts);

  console.log(`✅ Built ${posts.length} post(s) + homepage`);
  console.log(`📍 Sitemap: dist/sitemap.xml`);
  console.log(`📡 RSS Feed: dist/rss.xml`);
  console.log(`🤖 Robots: dist/robots.txt`);
  console.log(`\n🎉 Build complete! Output in dist/\n`);
}

build();
