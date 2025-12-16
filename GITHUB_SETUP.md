# GitHub Repository Setup for Bunch

## Step-by-Step Instructions

### Step 1: Initialize Git Locally (Already Done)
```bash
cd /Users/lizsw/bunch
git init
git add .
git commit -m "Initial commit - Bunch Bitcoin Loyalty Punch Cards"
```

### Step 2: Create GitHub Repository

**Option A: Via GitHub Website (Recommended)**

1. Go to: https://github.com/new
2. Fill in:
   - **Repository name:** `bunch`
   - **Description:** `Drop-in Bitcoin loyalty punch cards for merchants`
   - **Visibility:** Public (or Private if you prefer)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
3. Click **"Create repository"**

**Option B: Via GitHub CLI (if installed)**
```bash
gh repo create bunch --public --source=. --remote=origin --push
```

### Step 3: Connect Local Repo to GitHub

After creating the repo on GitHub, you'll see instructions. Use these commands:

```bash
cd /Users/lizsw/bunch

# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/bunch.git

# Rename branch to main (if not already)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 4: Verify

Visit: `https://github.com/YOUR_USERNAME/bunch`

You should see all your files!

---

## Quick Reference Commands

### Check Status
```bash
git status
```

### Add Files
```bash
git add .                    # Add all files
git add SPECIFIC_FILE.md     # Add specific file
```

### Commit Changes
```bash
git commit -m "Your message here"
```

### Push to GitHub
```bash
git push                     # After initial setup
git push -u origin main      # First time only
```

### Pull Latest Changes
```bash
git pull
```

---

## Future Updates

### Make Changes & Push
```bash
# 1. Make your changes to files

# 2. Check what changed
git status

# 3. Add changes
git add .

# 4. Commit with message
git commit -m "Description of changes"

# 5. Push to GitHub
git push
```

---

## Recommended Repository Settings

### Topics to Add (on GitHub)
- `bitcoin`
- `lightning-network`
- `loyalty`
- `merchant-tools`
- `react`
- `typescript`
- `hackathon`
- `btcpay`
- `nostr`

### Add a License (Suggested: MIT)

Create `LICENSE` file or use GitHub's license selector.

### Repository Description
```
Drop-in Bitcoin loyalty punch cards - Track rewards after payment without touching invoices or custody
```

### Website URL
If you deploy (e.g., Netlify/Vercel):
```
https://bunch.yourdomain.com
```

---

## .gitignore Already Configured

The following are excluded from the repo:
- `node_modules/` - Dependencies
- `dist/` - Build output
- `*.tgz` - Package files
- `.DS_Store` - OS files
- `*.log` - Log files
- `.env` - Environment variables

---

## What Gets Pushed

✅ **Included:**
- All source code (`src/`)
- Configuration files (`package.json`, `tsconfig.json`, etc.)
- Documentation (README.md, DEMO_*.md, etc.)
- Public assets (`public/`)

❌ **Excluded:**
- Dependencies (`node_modules/`)
- Build output (`dist/`)
- Package tarball (`bunch-0.0.0.tgz`)
- OS files (`.DS_Store`)

---

## Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/bunch.git
```

### Error: "failed to push"
```bash
# Pull first, then push
git pull origin main --rebase
git push -u origin main
```

### Want to change remote URL?
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/bunch.git
```

### See current remote?
```bash
git remote -v
```

---

## Optional: Add Repository Badges

Add to top of README.md:

```markdown
# Bunch – Bitcoin Loyalty Punch Cards

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React](https://img.shields.io/badge/React-19-blue)
![Bitcoin](https://img.shields.io/badge/Bitcoin-Lightning-orange)

> Drop-in loyalty rewards for Bitcoin merchants
```

---

## GitHub Repository URL

After setup, your repo will be at:
```
https://github.com/YOUR_USERNAME/bunch
```

Clone command for others:
```bash
git clone https://github.com/YOUR_USERNAME/bunch.git
cd bunch
pnpm install
pnpm dev
```

---

**Ready? Follow Step 2 to create the GitHub repo, then run Step 3 commands!**
