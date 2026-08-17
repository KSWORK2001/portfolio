# Karan Shrivastava — portfolio

A static Next.js site, with an Electron shell for packaging it as a desktop app.

## The design, in one line

**The page is paper and ink, and colour only appears inside the machine.**

Nothing on the surface is tinted — no gradients, no glows, no accent headings.
The only saturated pixels on the site live inside the dark window chrome, where
they carry meaning: green passed, amber is waiting on a human, red failed, blue
is still running. So the only things that light up as you scroll are the systems
actually running.

Two consequences worth knowing before editing:

- **There are no screenshots.** Every visual — the run trace, the workflow
  graph, the Echo bar, the terminal — is DOM and CSS. If you need new artwork,
  build the interface rather than pasting a picture of one.
- **Colour is a state, not a decoration.** `--pass`, `--gate`, `--run`, `--fail`
  belong inside `.win` and the dark sections. Putting one on the paper surface
  is a bug, not a style choice.

## Tech

- **Next.js** `15` / **React** `19` / **TypeScript** `5.7` — static export
- **Bricolage Grotesque** (display), **Public Sans** (body), **JetBrains Mono**
  (eyebrows, chrome, metrics), all via `next/font/google`
- **Electron** `34` + **electron-builder** `25` for the desktop target

No animation libraries. Motion is a scroll observer and CSS.

## Running it

```bash
npm install
```

Web only:

```bash
npm run dev:web
```

Web plus the Electron shell:

```bash
npm run dev
```

Production build (static export to `out/`):

```bash
npm run build
```

Desktop installer into `release/`:

```bash
npm run build:desktop
```

## Deploying

GitHub Actions builds and publishes to Pages on every push to `main`, with
`NEXT_PUBLIC_BASE_PATH=/portfolio`. To reproduce that build locally:

```bash
NEXT_PUBLIC_BASE_PATH=/portfolio npm run build
```

Asset URLs go through the `asset()` helper in `data/profile-data.ts` so they
pick up the base path. Use it for anything you add under `public/`.

## Structure

```text
app/
  globals.css                 # Design system: tokens, primitives, .win chrome
  layout.tsx                  # Fonts (on <html>), bar, footer, scroll observer
  page.tsx                    # Section composition
  page.module.css             # Per-section layout
components/
  site/                       # Bar, Footer, ScrollFX
  work/                       # AgentRun, PullRequest, WorkflowMap, ProjectArt
  ui/                         # ConsoleEgg
data/
  profile-data.ts             # All copy and content
electron/
  main.cjs                    # Desktop window bootstrap
public/
  Karan_Shrivastava_resume.pdf
  images/karan-headshot.jpg   # The only photograph on the site
```

## Notes

- **The hero run is the point of the page.** It stops at a billing write
  and makes the reader approve or deny it — the site argues these systems
  halt before doing something expensive, so it halts on you. Both outcomes
  are real: approve commits, deny writes nothing. Keep it that way; a gate
  that always approves would be a worse lie than not having one.
- `AgentRun` owns its own entrance animation instead of using the shared
  `[data-reveal]` observer, because replaying has to restart it and a class
  applied from outside would not survive the reset. The hidden state is
  scoped to `html.js` so the run is visible with scripting off.
- The bar drops the clock when it tightens on scroll. There is not room for
  both it and the nav at the narrow width, and they collide otherwise. The
  clock has a fixed width so a two-digit hour cannot shove the nav either.
- Font variables are set on `<html>`, not `<body>`. `globals.css` composes them
  into `--display` / `--body` / `--mono` on `:root`, and a custom property set
  on `body` is not visible to `:root` — put them on `body` and the whole stack
  invalidates and silently falls back to Times.
- Scroll reveals are scoped to `html.js`, which is added by an inline script in
  `layout.tsx`. If scripting never runs the page is simply visible rather than
  blank. `<html>` carries `suppressHydrationWarning` for that reason.
- `WorkflowMap` positions HTML nodes in percentages over an SVG with a fixed
  `viewBox`. The canvas holds that aspect ratio exactly and scrolls on narrow
  screens — squashing it would letterbox the SVG and drift the nodes off their
  edges.
- The FAQ is native `<details>` / `<summary>`.

## Troubleshooting

**Everything renders in Times.** The `next/font` variable classes came off
`<html>`. See the note above.

**Electron opens a blank window.** Use `npm run dev`, not `npm run desktop`
alone, so Next starts first. Confirm `http://localhost:3000` is reachable.

**`next build` breaks a running dev server.** They share `.next`. Stop the dev
server first, or `rm -rf .next` afterwards.

## License

Private portfolio project.
