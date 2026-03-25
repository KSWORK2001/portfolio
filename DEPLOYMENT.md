# Deploy Portfolio to GitHub Pages

This guide walks you through deploying your Next.js portfolio to GitHub Pages using automated GitHub Actions.

---

## Prerequisites

- A **GitHub account**
- Your code pushed to a **GitHub repository**
- Local git installed and configured

---

## 1. Prepare Your Repository

### Initialize git (if not already)

```bash
git init
git add .
git commit -m "Initial portfolio commit"
```

### Create a GitHub repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `portfolio` (or your preferred name)
3. Set to **Public** (required for free GitHub Pages)
4. Do NOT initialize with README/LICENSE (you already have files)

### Link local repo to GitHub

```bash
git remote add origin https://github.com/YourUsername/portfolio.git
git branch -M main
git push -u origin main
```

---

## 2. Configure Next.js for GitHub Pages

Your `next.config.mjs` is already set up for static export with GitHub Pages compatibility:

```js
output: "export",           // Generates static files
trailingSlash: true,        // Required for GitHub Pages
images: { unoptimized: true } // Disables Image Optimization (not supported on GH Pages)
basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
assetPrefix: basePath || undefined,
```

---

## 3. Enable GitHub Pages

1. In your GitHub repo, go to **Settings**
2. Scroll to **Pages** in the left sidebar
3. Under **Build and deployment**, set **Source** to **GitHub Actions**
4. Save

---

## 4. Create GitHub Actions Workflow

Create folder and file:

```
.github/workflows/deploy.yml
```

Add the following content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Build static site
        run: npm run build
        env:
          NEXT_PUBLIC_BASE_PATH: /portfolio

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Commit the workflow

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deployment workflow"
git push
```

---

## 5. Verify Deployment

1. In your repo, go to **Actions** tab
2. You should see the workflow running
3. Once complete, go to **Settings → Pages**
4. Your site URL will appear, e.g.:

```
https://YourUsername.github.io/portfolio
```

---

## 6. Troubleshooting

### 404 on subpages

- Ensure `trailingSlash: true` is set in `next.config.mjs`
- Verify `basePath` matches your repo name in the workflow (`/portfolio`)

### Images not loading

- Make sure images are in `public/images/`
- Paths must start with `/images/...` (leading slash)
- `unoptimized: true` is required for GitHub Pages

### Workflow fails on build

- Check Actions tab for error logs
- Ensure `npm ci` runs successfully locally
- Verify all dependencies are in `package.json`

### Blank page after deploy

- Check browser console for routing errors
- Ensure `NEXT_PUBLIC_BASE_PATH` matches repo name

---

## 7. Custom Domain (Optional)

If you want a custom domain:

1. In **Settings → Pages**, add your custom domain
2. Configure DNS records as instructed by GitHub
3. Update `basePath` in `next.config.mjs` to `""` (empty)
4. Re-run deployment

---

## 8. Updating Your Site

Any push to the `main` branch will automatically redeploy:

```bash
git add .
git commit -m "Update portfolio content"
git push
```

---

## 9. Local Testing with Base Path

To test locally with the same base path as GitHub Pages:

```bash
NEXT_PUBLIC_BASE_PATH=/portfolio npm run dev
```

Access at `http://localhost:3000/portfolio`

---

## 10. Important Notes

- **Electron is ignored** in this deployment (only Next.js web app is deployed)
- **GSAP and Three.js** work fine in static export
- **No server-side features** are used, so static export is safe
- **Future changes**: Just push to `main` to redeploy

---

## 11. File Structure After Deploy

```
out/
├── index.html
├── _next/
├── images/
├── ...other static assets
```

GitHub Pages serves from the `out/` folder automatically.

---

## 12. Quick Checklist

- [ ] Repo is public
- [ ] GitHub Pages enabled via Actions
- [ ] Workflow file added at `.github/workflows/deploy.yml`
- [ ] `next.config.mjs` has `output: "export"` and `trailingSlash: true`
- [ ] Images are in `public/images/`
- [ ] Push to main triggers deployment
- [ ] Site loads at `https://YourUsername.github.io/portfolio`

---

## 13. Need Help?

- Check the **Actions** tab for deployment logs
- Review **Settings → Pages** for deployment status
- Verify your repo name matches `basePath` in the workflow

That's it! Your portfolio will be live on GitHub Pages with automatic updates on every push.
