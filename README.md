# Karan Portfolio (Next.js + Electron)

Modern portfolio app built with **Next.js** for the UI and **Electron** for desktop packaging.

## Tech Stack

### Core
- **Next.js** `15.1.7`
- **React** `19.0.0`
- **TypeScript** `5.7.3`
- **Electron** `34.0.0`

### Animation / Visual Libraries
- **GSAP** `3.12.5` (Flowing menu and motion)
- **Three.js** `0.173.0` (LightPillar background shader)

### Tooling
- **concurrently** `9.1.2` (run web + Electron together in dev)
- **wait-on** `8.0.1` (wait for localhost before launching Electron)
- **electron-builder** `25.1.8` (desktop packaging)
- `@types/node`, `@types/react`, `@types/react-dom`

---

## Prerequisites

Install these first:
1. **Node.js 20+** (LTS recommended)
2. **npm 10+**
3. **Windows** (for the packaged desktop target in this repo)

Check versions:

```bash
node -v
npm -v
```

---

## Project Setup

From the project root (`c:/Users/Karan/Documents/Git/Portfolio`):

```bash
npm install
```

This installs all dependencies listed in `package.json`.

---

## Run the App

### 1) Web only (Next.js dev server)

```bash
npm run dev:web
```

- Starts Next.js at `http://localhost:3000`

### 2) Web + Electron desktop together (recommended for local desktop dev)

```bash
npm run dev
```

- Starts Next.js
- Waits for port 3000
- Launches Electron shell with the portfolio loaded

---

## Production Build

### Build web app

```bash
npm run build
```

### Run production web server locally

```bash
npm run start
```

---

## Desktop Build (Electron Installer)

```bash
npm run build:desktop
```

This will:
1. Build the Next.js app
2. Package Electron using `electron-builder`
3. Output installer artifacts to the `release/` directory

---

## Static Assets (Images)

Place your custom images in:

```text
public/images/
```

Examples used by the app:
- `public/images/karan-headshot.jpg`
- `public/images/agentic.png`
- `public/images/VoiceFlow.png`
- `public/images/spotme.png`
- `public/images/lang-english-placeholder.jpg`
- `public/images/lang-hindi-placeholder.jpg`
- `public/images/lang-punjabi-placeholder.jpg`
- `public/images/lang-spanish-placeholder.jpg`

---

## Main Project Structure

```text
app/
  page.tsx                    # Main landing page and section composition
  page.module.css             # Page-specific styling (hero, FAQ, sections)
components/
  animations/                 # DecryptedText, TrueFocus, CountUp, CardSwap, FlowingMenu, LogoLoop
  backgrounds/                # LightPillar (Three.js shader)
  sections/                   # StickyScrollReveal
data/
  profile-data.ts             # Portfolio content model (skills, projects, FAQ contact, etc.)
electron/
  main.cjs                    # Electron main process / desktop window bootstrap
public/
  images/                     # Static image assets
```

---

## Useful Notes

- FAQ uses native `<details>`/`<summary>` with smooth CSS expansion.
- Flowing Languages section uses GSAP and profile-driven phrase/image content.
- LightPillar uses Three.js and can be tuned via props in `app/page.tsx`.

---

## Troubleshooting

### `Cannot find module 'gsap'`
Run:

```bash
npm install
```

### Electron opens blank window in dev
- Ensure `npm run dev` is used (not `npm run desktop` alone), so Next starts first.
- Confirm `http://localhost:3000` is reachable.

### Images not showing
- Verify files exist under `public/images/`
- Ensure paths start with `/images/...` (leading slash)

---

## License

Private portfolio project.
