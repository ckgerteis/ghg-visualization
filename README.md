# The Other Greenhouse Gases

An interactive visualization exploring methane (CH₄) and nitrous oxide (N₂O) — the accelerating crisis beyond CO₂.

## Live Demo

Once deployed, your site will be available at: `https://[your-username].github.io/ghg-visualization/`

## Features

- **The Three Gases**: Compare percentage increases of CO₂, CH₄, and N₂O since pre-industrial times
- **Methane Crisis**: Deep dive into the post-2007 methane surge
- **N₂O Problem**: The fertilizer-driven nitrous oxide rise
- **Warming Power**: Global Warming Potential comparisons (20-year vs 100-year)
- **Emission Sources**: Where methane and N₂O come from
- **Agriculture Link**: How food production drives these emissions
- **Climate Impact**: Radiative forcing breakdown

## Data Sources

All data is sourced from peer-reviewed scientific literature and authoritative institutions:

- **NOAA Global Monitoring Laboratory** — Atmospheric concentration measurements
- **IPCC AR6** — Global Warming Potential values
- **Global Carbon Project** — Emission budgets
- **FAO/FAOSTAT** — Agricultural data
- **Climate & Clean Air Coalition / UNEP** — Source breakdowns

See the full reference list in the accompanying documentation.

---

## Deployment to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon → **New repository**
3. Name it `ghg-visualization`
4. Keep it **Public** (required for free GitHub Pages)
5. **Do not** initialize with README (we already have one)
6. Click **Create repository**

### Step 2: Upload the Files

**Option A: Using the GitHub Web Interface (easiest)**

1. On your new repository page, click **"uploading an existing file"**
2. Drag and drop all the files from this project folder
3. Click **Commit changes**

**Option B: Using Git Command Line**

```bash
cd ghg-visualization
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/ghg-visualization.git
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Build and deployment**:
   - Source: Select **GitHub Actions**
4. GitHub will automatically detect the Vite project

### Step 4: Add the GitHub Actions Workflow

Create a file at `.github/workflows/deploy.yml` with this content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

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

### Step 5: Wait for Deployment

1. Go to **Actions** tab in your repository
2. Watch the workflow run (takes ~1-2 minutes)
3. Once complete, your site is live!

Your visualization will be at: `https://[your-username].github.io/ghg-visualization/`

---

## Local Development

If you want to run it locally first:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## License

Data visualizations created for educational purposes. All underlying data is from public sources cited in the reference list.

## Credits

Built with React, Recharts, and Tailwind CSS.
