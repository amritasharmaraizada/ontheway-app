# OnTheWay 🗺️

> Errands that fit your day, not the other way around.

OnTheWay clusters your pending errands around the routes you already drive — school run, commute, gym — and surfaces the ones you can knock out with zero detour.

---

## Deploy in 3 minutes

### Option A: Vercel (recommended)

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Vercel auto-detects Vite. Click **Deploy**. Done.

### Option B: Manual

```bash
npm install
npm run build
# Upload /dist folder to any static host (Netlify, GitHub Pages, Cloudflare Pages)
```

### Option C: Local dev

```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

---

## Install on Android (PWA)

1. Open your deployed URL in Chrome on Android
2. Tap the **⋮ menu** → "Add to Home screen"
3. Tap "Add" — OnTheWay appears as an app icon
4. Opens full-screen, no browser chrome

## Install on iPhone

1. Open your deployed URL in Safari
2. Tap the **Share button** (box with arrow)
3. Tap "Add to Home Screen" → "Add"

---

## Features

- **Today tab** — shows which of your routes have errand clusters along them
- **Errands tab** — add/manage errands with urgency, category, time estimate
- **Routes tab** — add your regular trips (school run, commute, gym loop)
- **Smart matching** — errands within your set radius of each route surface automatically
- **Urgency aging** — errands pending 7+ days get flagged in red
- **100% local** — all data in localStorage, nothing sent anywhere

---

## Tech stack

- React 18 + Vite
- Zero external dependencies beyond React + lucide-react
- PWA-ready (manifest + mobile meta tags)
- ~50kb gzipped

---

## Privacy

All data lives in your browser's localStorage. No accounts, no servers, no tracking. Clear it anytime in Settings.
