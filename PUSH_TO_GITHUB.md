# Push Bunch to GitHub - Simple Guide

## ✅ Already Done
- ✅ Git initialized
- ✅ All files staged
- ✅ Initial commit created (42 files, 6036 lines)

## 🚀 Next Steps

### Method 1: Automatic (If you have GitHub CLI)

```bash
./create-github-repo.sh
```

Just follow the prompts!

---

### Method 2: Manual (3 Easy Steps)

#### Step 1: Create Repository on GitHub

1. Open: **https://github.com/new**
2. Fill in:
   - **Repository name:** `bunch`
   - **Description:** `Drop-in Bitcoin loyalty punch cards for merchants`
   - **Public** or Private (your choice)
   - **⚠️ IMPORTANT:** Do NOT check any boxes (no README, .gitignore, or license)
3. Click **"Create repository"**

#### Step 2: Get Your GitHub Username

What's your GitHub username? Let's call it `YOUR_USERNAME`

#### Step 3: Push the Code

```bash
cd /Users/lizsw/bunch

# Add GitHub as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/bunch.git

# Push to GitHub
git push -u origin main
```

**That's it!** 🎉

---

## 🌐 After Pushing

Your repository will be at:
```
https://github.com/YOUR_USERNAME/bunch
```

### Recommended: Add Topics

On your GitHub repo page, click "⚙️ Settings" or the gear icon next to "About", then add:
- `bitcoin`
- `lightning-network`
- `loyalty`
- `merchant-tools`
- `react`
- `typescript`
- `hackathon`

### Recommended: Add License

1. On your repo page, click "Add file" → "Create new file"
2. Name it: `LICENSE`
3. Click "Choose a license template"
4. Select: **MIT License**
5. Commit

---

## 📋 What's Being Pushed

```
✅ Source code (src/)
✅ Components, hooks, state management
✅ All documentation (README, demos, etc.)
✅ Configuration files
✅ Package.json & dependencies list

❌ node_modules/ (excluded)
❌ dist/ (excluded)
❌ .DS_Store (excluded)
❌ *.tgz files (excluded)
```

**Total:** 42 files, ~6000 lines of code

---

## 🔐 Authentication

If GitHub asks for credentials:

### Option A: Personal Access Token (Recommended)
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "Bunch Repo"
4. Check: `repo` (Full control of private repositories)
5. Click "Generate token"
6. Copy the token
7. Use it as your password when pushing

### Option B: GitHub CLI
```bash
gh auth login
```
Follow the prompts

### Option C: SSH (Advanced)
Set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

---

## 🆘 Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/bunch.git
git push -u origin main
```

### Error: "repository not found"
- Make sure you created the repo on GitHub first
- Double-check the username in the URL

### Error: "authentication failed"
- Use a Personal Access Token instead of password
- Or run: `gh auth login`

### Want to check remote URL?
```bash
git remote -v
```

---

## ✨ Future Updates

When you make changes:

```bash
# 1. Make your edits

# 2. Stage changes
git add .

# 3. Commit
git commit -m "Description of changes"

# 4. Push
git push
```

---

## 🎯 Quick Command Summary

```bash
# First time (right now):
git remote add origin https://github.com/YOUR_USERNAME/bunch.git
git push -u origin main

# Future updates:
git add .
git commit -m "Your changes"
git push
```

---

**Ready? Go create that repo! 🚀**

**→ https://github.com/new**
