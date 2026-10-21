/**
 * Quick script to scaffold a new blog post.
 * Usage: npm run new-post -- "My Post Title"
 *        or: node scripts/new-post.js "My Post Title"
 */

const fs = require('fs');
const path = require('path');

const title = process.argv[2];

if (!title) {
  console.log('\n❌ Please provide a post title:');
  console.log('   npm run new-post -- "My Post Title"\n');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const date = new Date().toISOString().split('T')[0];
const filename = `${slug}.md`;
const filepath = path.join(__dirname, '..', 'posts', filename);

if (fs.existsSync(filepath)) {
  console.log(`\n❌ Post already exists: posts/${filename}\n`);
  process.exit(1);
}

const template = `---
title: "${title}"
date: ${date}
description: "Write a compelling description for SEO (150-160 chars ideal)"
tags: [Tech]
author: TechGuru
---

Write your post content here using Markdown.

## Section Heading

Your content goes here...

\`\`\`javascript
// Code blocks are fully supported
console.log('Hello, TechGuru!');
\`\`\`

---

*What are your thoughts? Share your perspective!*
`;

fs.writeFileSync(filepath, template);

console.log(`\n✅ Created new post: posts/${filename}`);
console.log(`📅 Date: ${date}`);
console.log(`🔗 Slug: ${slug}`);
console.log(`\n📝 Edit your post at: posts/${filename}`);
console.log(`🚀 Then run: npm run build\n`);
