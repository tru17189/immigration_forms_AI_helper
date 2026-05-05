# Immigration Form Helper

An AI-powered tool that explains confusing U.S. immigration form questions in plain language — in English, Spanish, or Portuguese.

## Local setup

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Add your Anthropic API key
cp .env.example .env.local
# then edit .env.local and paste your key

# 3. Run the dev server
npm run dev
\`\`\`

## Deploy to Vercel (free, ~2 minutes)

### Option A — GitHub + Vercel dashboard (recommended)

1. Push this project to a GitHub repository:
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   \`\`\`

2. Go to vercel.com → **Add New Project** → import your GitHub repo.

3. Vercel auto-detects Vite. Before clicking **Deploy**, open **Environment Variables** and add:
   - Name: \`VITE_ANTHROPIC_API_KEY\`
   - Value: your Anthropic API key

4. Click **Deploy**. You'll get a URL like \`https://immigration-helper.vercel.app\`.

Every future \`git push\` to main will automatically redeploy.

### Option B — Vercel CLI (no GitHub needed)

\`\`\`bash
npm install -g vercel
vercel
\`\`\`

When prompted for environment variables, add \`VITE_ANTHROPIC_API_KEY\`.

## API key security note

\`.env.local\` is gitignored and will never be committed. On Vercel, set the key in Project Settings → Environment Variables. Because this is a browser app the key is visible in the built JS bundle — for a production app you would want a small backend proxy to keep the key server-side.
