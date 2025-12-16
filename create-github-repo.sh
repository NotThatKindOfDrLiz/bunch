#!/bin/bash

# Bunch - GitHub Repository Setup Script
# This script helps you create and push to a new GitHub repository

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║         Bunch - GitHub Repository Setup                         ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository. Run 'git init' first."
    exit 1
fi

# Check if already has commits
if ! git log -1 > /dev/null 2>&1; then
    echo "❌ Error: No commits yet. The initial commit has already been made."
    echo "   If you see this, something went wrong. Check 'git log'"
    exit 1
fi

echo "✅ Git repository initialized with initial commit"
echo ""

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo "✨ GitHub CLI detected!"
    echo ""
    echo "Would you like to create the repository using GitHub CLI? (y/n)"
    read -r use_gh_cli
    
    if [[ "$use_gh_cli" =~ ^[Yy]$ ]]; then
        echo ""
        echo "Creating repository 'bunch' on GitHub..."
        echo ""
        
        gh repo create bunch \
            --public \
            --source=. \
            --remote=origin \
            --description="Drop-in Bitcoin loyalty punch cards for merchants" \
            --push
        
        echo ""
        echo "✅ Repository created and pushed to GitHub!"
        echo ""
        echo "🌐 View your repository:"
        gh repo view --web
        exit 0
    fi
fi

# Manual setup instructions
echo "================================================"
echo "Manual GitHub Repository Setup"
echo "================================================"
echo ""
echo "Please follow these steps:"
echo ""
echo "1️⃣  Create a new repository on GitHub:"
echo "   Go to: https://github.com/new"
echo ""
echo "   Settings:"
echo "   - Repository name: bunch"
echo "   - Description: Drop-in Bitcoin loyalty punch cards for merchants"
echo "   - Visibility: Public (or Private)"
echo "   - ⚠️  DO NOT initialize with README, .gitignore, or license"
echo ""
echo "2️⃣  After creating, GitHub will show you commands. OR use these:"
echo ""
echo "   Enter your GitHub username:"
read -r github_username

if [ -z "$github_username" ]; then
    echo "❌ Error: Username cannot be empty"
    exit 1
fi

REPO_URL="https://github.com/$github_username/bunch.git"

echo ""
echo "3️⃣  Running git commands..."
echo ""

# Check if remote already exists
if git remote | grep -q "^origin$"; then
    echo "⚠️  Remote 'origin' already exists. Removing it..."
    git remote remove origin
fi

# Add remote
echo "Adding remote: $REPO_URL"
git remote add origin "$REPO_URL"

# Ensure we're on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "Renaming branch to 'main'..."
    git branch -M main
fi

# Push to GitHub
echo ""
echo "Pushing to GitHub..."
echo ""

if git push -u origin main; then
    echo ""
    echo "✅ SUCCESS! Code pushed to GitHub!"
    echo ""
    echo "🌐 Your repository:"
    echo "   https://github.com/$github_username/bunch"
    echo ""
    echo "📋 Next steps:"
    echo "   - Add topics: bitcoin, lightning-network, loyalty, react, typescript"
    echo "   - Add a license (recommended: MIT)"
    echo "   - Enable GitHub Pages (optional)"
    echo ""
    echo "🔗 Clone command for others:"
    echo "   git clone https://github.com/$github_username/bunch.git"
    echo ""
else
    echo ""
    echo "❌ Push failed. Possible reasons:"
    echo "   1. Repository doesn't exist on GitHub yet"
    echo "   2. Wrong username/password"
    echo "   3. Need to authenticate (use 'gh auth login' or create personal access token)"
    echo ""
    echo "Try again after creating the repository on GitHub:"
    echo "   https://github.com/new"
    exit 1
fi
