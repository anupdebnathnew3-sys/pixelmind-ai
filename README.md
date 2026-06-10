# PixelMind AI

AI-powered metadata and content generation platform for image creators, photographers, and stock contributors.

## Features

- **AI Prompt Generator** — generate optimized prompts for Midjourney, DALL·E, Stable Diffusion
- **Stock Metadata Generator** — titles, descriptions, keywords for Adobe Stock, Shutterstock, Getty
- **Event Calendar** — content planning calendar for creators
- **Team Management** — invite teammates and share API credits
- **Admin Panel** — full site management: content, users, plans, API keys, theming

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | React 19 + TypeScript + Vite 7      |
| Styling     | Tailwind CSS v4                     |
| State       | Zustand v5 (persisted)              |
| Routing     | React Router v7                     |
| Charts      | Recharts                            |
| Icons       | Lucide React                        |
| Animation   | Framer Motion                       |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type-check without building
npm run type-check

# Production build
npm run build

# Preview production build locally
npm run preview
```

## Environment Variables

Copy `.env.example` to `.env` before running:

```bash
cp .env.example .env
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for platform-specific deployment instructions.

## Deployment

The app is a React SPA using BrowserRouter. All deployment platforms need a routing fallback to serve `index.html` for all paths.

| Platform        | Config file                    |
|-----------------|-------------------------------|
| Netlify         | `netlify.toml` + `public/_redirects` |
| Vercel          | `vercel.json`                  |
| GitHub Pages    | `public/404.html` + `index.html` script |
| Cloudflare Pages| `public/_redirects`            |

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions.

## License

MIT — see [LICENSE](LICENSE)
