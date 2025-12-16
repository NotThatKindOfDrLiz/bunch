#!/bin/bash

# Quick push script for Bunch
# Usage: ./push.sh YOUR_GITHUB_USERNAME

if [ -z "$1" ]; then
    echo "Usage: ./push.sh YOUR_GITHUB_USERNAME"
    echo ""
    echo "Example: ./push.sh lizsw"
    echo ""
    echo "Make sure you've created the repository on GitHub first:"
    echo "https://github.com/new"
    exit 1
fi

USERNAME=$1
REPO_URL="https://github.com/$USERNAME/bunch.git"

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║              Pushing Bunch to GitHub                            ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "Repository: $REPO_URL"
echo ""

# Check if remote exists
if git remote | grep -q "^origin$"; then
    echo "⚠️  Remote 'origin' already exists"
    CURRENT_URL=$(git remote get-url origin)
    if [ "$CURRENT_URL" != "$REPO_URL" ]; then
        echo "   Current: $CURRENT_URL"
        echo "   New:     $REPO_URL"
        echo ""
        echo "Do you want to update it? (y/n)"
        read -r answer
        if [[ "$answer" =~ ^[Yy]$ ]]; then
            git remote set-url origin "$REPO_URL"
            echo "✅ Remote updated"
        fi
    else
        echo "✅ Remote already set correctly"
    fi
else
    echo "Adding remote..."
    git remote add origin "$REPO_URL"
    echo "✅ Remote added"
fi

echo ""
echo "Pushing to GitHub..."
echo ""

if git push -u origin main; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                    ✅ SUCCESS!                                   ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🌐 Your repository: https://github.com/$USERNAME/bunch"
    echo ""
    echo "📋 Next steps:"
    echo "   • Add topics (bitcoin, lightning-network, loyalty, react, typescript)"
    echo "   • Add a LICENSE file (MIT recommended)"
    echo "   • Update repository description if needed"
    echo ""
else
    echo ""
    echo "❌ Push failed!"
    echo ""
    echo "Possible solutions:"
    echo "1. Make sure the repository exists: https://github.com/$USERNAME/bunch"
    echo "2. Authenticate with GitHub:"
    echo "   - Use a Personal Access Token as password"
    echo "   - Or run: gh auth login"
    echo "3. Check your username is correct: $USERNAME"
    echo ""
    exit 1
fi
