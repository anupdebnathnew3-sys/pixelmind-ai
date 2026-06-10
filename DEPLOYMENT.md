# Deployment Guide — PixelMind AI

This guide covers deploying the PixelMind AI SPA to all major platforms.

## Before You Deploy

### 1. Set environment variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure `VITE_APP_URL` to your production domain.

### 2. Verify the build

```bash
npm install
npm run type-check
npm run build
```

The `dist/` folder should contain multiple JS chunks in `dist/assets/` (not a single large HTML file).

---

## Netlify (Recommended)

**One-click deploy via Netlify UI:**

1. Push repo to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → New site from Git
3. Select your repo
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy

The `netlify.toml` and `public/_redirects` files handle SPA routing and security headers automatically.

**Environment variables in Netlify:**
- Site settings → Environment variables → Add variable
- Add `VITE_APP_URL` = `https://yourdomain.com`

---

## Vercel

**Deploy via Vercel CLI:**

```bash
npm i -g vercel
vercel --prod
```

Or connect via [vercel.com](https://vercel.com):
1. Import Git repository
2. Framework preset: Vite (auto-detected)
3. Build command: `npm run build`
4. Output directory: `dist`

The `vercel.json` file handles SPA routing, security headers, and asset caching automatically.

---

## GitHub Pages

GitHub Pages does not support server-side routing. The `public/404.html` + redirect script in `index.html` handle this:

### Setup

1. Go to repo Settings → Pages
2. Source: **GitHub Actions** (recommended) or **Deploy from branch → gh-pages**

### GitHub Actions workflow (recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          VITE_BASE_URL: /your-repo-name/   # Set this if deploying to a subdirectory
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

> **Important:** If deploying to `username.github.io/repo-name/` (not a custom domain), set `VITE_BASE_URL=/repo-name/` in the workflow env, and change `pathSegmentsToKeep = 1` in `public/404.html`.

### Custom domain on GitHub Pages

1. In Pages settings, add your custom domain
2. GitHub will add a `CNAME` file to the repo root
3. Leave `VITE_BASE_URL` blank (deploying to root)
4. Leave `pathSegmentsToKeep = 0` in `public/404.html`

---

## Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com) → Create application → Connect Git
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Deploy

The `public/_redirects` file handles SPA routing automatically on Cloudflare Pages.

---

## Self-Hosted / VPS (Nginx)

Add this to your Nginx server block:

```nginx
server {
    listen 80;
    server_name pixelmindai.com www.pixelmindai.com;
    root /var/www/pixelmind/dist;
    index index.html;

    # SPA routing fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Security headers
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Page refreshing shows 404 | SPA routing fallback not configured — check platform config |
| Assets not loading on GitHub Pages subdirectory | Set `VITE_BASE_URL=/repo-name/` and `pathSegmentsToKeep=1` in 404.html |
| Build fails: "Cannot find module" | Run `npm install` first |
| TypeScript errors blocking build | Run `npm run type-check` to see all errors |
| Styles broken in production | Tailwind v4 requires the `@tailwindcss/vite` plugin — already included in `vite.config.ts` |
