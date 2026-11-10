# Karan Shrivastava — portfolio

A static Next.js site. No server, no database, no build-time data fetching —
it exports to plain HTML, CSS, and JavaScript and is hostable anywhere.

## The design, in one line

**The machine runs at night, and the only lit thing is a window.**

One blue-black ground, Instrument Sans at 400 over Figtree, and one amber
accent for the primary action, the focus ring and the few things worth
reading first. The state colours (`--pass`, `--gate`, `--run`, `--fail`)
still only appear inside a panel, where they mean something.

The depth is the idea:

- **The world** (`components/site/world.ts`, mounted by `NightField.tsx`) is
  one three.js scene fixed behind the whole home page. Scrolling flies the
  camera along one path: a valley of points facing a lit portal (hero),
  through the portal, down a tunnel of gate rings (Work and the loop), and
  out to a planet of points (projects to contact). The tunnel shows only
  through the portal until you cross it (a stencil mask). Bloom, grain,
  vignette and chromatic aberration sit on top; fast scrolling widens the
  lens; points brighten under the cursor. Each section's scroll position
  picks a stop on the path, so the pacing follows the content. three.js loads
  lazily after first paint; without WebGL the CSS gradient on the canvas
  stays. Reduced motion draws one still frame.
- **Panels tilt.** Any wrapper with `data-tilt="<max degrees>"` makes its
  first child lean toward a fine pointer, with a glare on `.win` panels.
  `ScrollFX` writes `--rx/--ry/--mx/--my`. The hero run also sits at a
  resting lean (`--lean-x/--lean-y`) with the eval card 80px in front of it.
- **Reveals rise off the floor.** `[data-reveal]` comes up from a 16° tilt
  and settles flat.

The design system came from a Hallmark redesign (Ribbon theme,
two-in-the-morning colourway): `app/tokens.css` holds the tokens,
`app/base.css` the base rules, and the stamp at the top of `app/globals.css`
records the decisions. **There are still no screenshots.** Every visual is
DOM and CSS, apart from the WebGL world behind them.

## Tech

- **Next.js** `15` / **React** `19` / **TypeScript** `5.7` — static export
- **three.js** for the 3D world only, loaded as its own chunk
- **Instrument Sans** (display), **Figtree** (body), **JetBrains Mono**
  (traces inside the agent panels), all via `next/font/google`

Five devDependencies and four runtime ones. No animation libraries, no UI
kit, no chart library: apart from the 3D world, the motion is a scroll
observer and CSS, and every visual is hand-built DOM.

## Running it

```bash
npm install
```

Dev server on `http://localhost:3000`:

```bash
npm run dev
```

Production build (static export to `out/`):

```bash
npm run build
```

Serve that build locally to check it before shipping:

```bash
npm run preview
```

There is no `start` script: `next start` refuses to run against
`output: "export"` and tells you to serve the directory instead, which is
what `preview` does.

## Deploying

The site is fully static and hostable anywhere. Nothing hardcodes a path —
`basePath` is driven entirely by `NEXT_PUBLIC_BASE_PATH`, so the same commit
builds correctly for a subpath or for a domain root.

**Vercel** (primary). Import the repo at vercel.com; it auto-deploys on every
push to `main`. Zero configuration — Next.js is auto-detected, and with
`NEXT_PUBLIC_BASE_PATH` unset the site builds at the domain root, which is
what Vercel serves.

**GitHub Pages** (kept as a fallback). GitHub Actions builds and publishes on
every push to `main` with `NEXT_PUBLIC_BASE_PATH=/portfolio`. Reproduce that
build locally with:

```bash
NEXT_PUBLIC_BASE_PATH=/portfolio npm run build
```

Asset URLs go through the `asset()` helper in `data/profile-data.ts` so they
pick up the base path. Use it for anything you add under `public/`.

Note that `https://kswork2001.github.io/` (no path) is a 404 — there is no
user-site repo, only `/portfolio/`. The unused `website:` field in
`profile-data.ts` still points at that root.

## Structure

```text
app/
  globals.css                 # Design system: tokens, primitives, .win chrome
  layout.tsx                  # Fonts (on <html>), bar, footer, scroll observer
  page.tsx                    # Section composition
  page.module.css             # Per-section layout
components/
  site/                       # Bar, Footer, ScrollFX
  work/                       # All the artwork, plus useInView
                              #   AgentRun      hero, interactive
                              #   QuotaPanel    Home Depot — Galaxy
                              #   PullRequest   Capital One — agent-authored PR
                              #   GateCollapse  AT&T — intervention drop
                              #   WorkflowMap   the loop — agent graph
                              #   EvalMatrix    the loop — 420 golden workflows
                              #   ProjectArt    Echo, TokenLess, Market
  ui/                         # ConsoleEgg
data/
  profile-data.ts             # All copy and content
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
- **Animated artwork waits for the reader.** Charts that fill in before you
  scroll to them have not shown you anything, so `useInView` gates each one
  and they animate on arrival. It returns `true` immediately under reduced
  motion, and has a 3s failsafe — an artwork should never be stuck at zero.
- **The numbers inside the artwork are illustrative, the claims are not.**
  Run IDs, ticker prices, the 412/420 eval split and its named failures are
  invented to depict the kind of system being described. Anything stated as
  fact — 20×, 95%, mid-400s to under 20, 30+ merged PRs — comes from the
  résumé. `GateCollapse` shows only the two real numbers for that reason,
  rather than a smoother five-point curve.
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

**`next build` breaks a running dev server.** They share `.next`. Stop the dev
server first, or `rm -rf .next` afterwards.

## License

Private portfolio project.
