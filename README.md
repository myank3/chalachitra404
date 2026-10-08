# Aether Cinema — iOS 27 Spatial Streaming & Discovery

A cinematic, futuristic movie and TV show discovery and streaming platform built with React 19, Vite, Tailwind CSS v4, and TanStack Query, crafted to feel like a native **iOS 27 Spatial Vision** application.

---

## ✨ Features

- **iOS 27 Liquid Glass Design**: Layered translucent panels with `backdrop-filter: blur(40px) saturate(190%)`, specular light refraction, subtle noise texture (`feTurbulence`), and continuous 28px squircles.
- **Instant Spatial Playback**: Embedded high-speed cinema player supporting `https://embed.su/embed/movie/{imdbId}` and TV episodic streams (`/embed/tv/{imdbId}/{season}/{episode}`) with server-switching (Embed.su, VidSrc, SuperEmbed, MultiEmbed).
- **Dual-Mode Navigation**:
  - **Mobile**: Floating bottom tab bar with safe-area inset padding and haptic tap feedback.
  - **Desktop / iPad**: Translucent sidebar with quick metrics, search trigger, and active stream status.
- **Spotlight Search (⌘K)**: Global command palette with live fuzzy search, recent search persistence, and instant playback triggers.
- **Detail Sheets**: Drag-to-dismiss presentation sheets with 4K backdrops, synopsis, cast circles, streaming provider badges, and interactive trailer previews.
- **Zustand State Persistence**:
  - Real-time **My List** bookmarking.
  - **Continue Watching** progress bar tracking.
  - Theme (Dark Liquid Obsidian, Light Frost, System Auto) and streaming server preferences.
- **Offline & Fallback Resilience**: 40+ pre-seeded realistic 2026 and iconic titles guaranteed to render even if offline or rate-limited.
- **TMDB v3 Integration**: Live client-side metadata, search, and categorization using TMDB API.

---

## 🛠️ Tech Stack

- **React 19**
- **Vite 8**
- **Tailwind CSS v4** (CSS-first `@theme` configuration in `src/index.css`)
- **TanStack Query v5** (Client caching & request deduplication)
- **Zustand** (Watchlist & UI state persistence)
- **Lucide React** (Icons)
- **Sonner** (iOS notification toast banners)
- **TypeScript** (Strict mode)

---

## 🚀 Getting Started

### 1. Installation
Clone repository and install dependencies:
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the project root:
```env
VITE_TMDB_API_KEY="4885ba83e8fcc37c495a2e71ece8366d"
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```
The output will be placed in `dist/`, ready for static deployment on Vercel, Netlify, Cloudflare Pages, or GitHub Pages with zero backend required.
