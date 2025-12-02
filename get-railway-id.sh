#!/bin/bash

echo "🚂 Railway Project ID Finder"
echo "=============================="
echo ""

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

echo "📋 Your Railway Info:"
echo "   Project: magnificent-cat"
echo "   Environment: production"
echo "   Service: frosty-agent-forge"
echo ""

echo "🔍 Getting Project ID..."
echo ""

# Method 1: Try railway status with JSON
echo "Method 1: Using railway status --json"
PROJECT_ID=$(railway status --json 2>/dev/null | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)

if [ -n "$PROJECT_ID" ]; then
    echo "✅ Found Project ID: $PROJECT_ID"
    echo ""
    echo "📋 Add this to GitHub Secrets:"
    echo "   Name: RAILWAY_PROJECT_ID"
    echo "   Value: $PROJECT_ID"
    echo ""
    echo "🔗 Go to: https://github.com/blackgirlbytes/auto/settings/secrets/actions"
    exit 0
fi

# Method 2: Check railway.json
echo "Method 2: Checking railway.json..."
if [ -f "railway.json" ]; then
    PROJECT_ID=$(cat railway.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$PROJECT_ID" ]; then
        echo "✅ Found Project ID: $PROJECT_ID"
        echo ""
        echo "📋 Add this to GitHub Secrets:"
        echo "   Name: RAILWAY_PROJECT_ID"
        echo "   Value: $PROJECT_ID"
        echo ""
        echo "🔗 Go to: https://github.com/blackgirlbytes/auto/settings/secrets/actions"
        exit 0
    fi
fi

# Method 3: Manual instructions
echo ""
echo "⚠️  Could not auto-detect Project ID"
echo ""
echo "📝 Get it manually:"
echo ""
echo "Option A: From Railway Dashboard"
echo "   1. Go to https://railway.app/"
echo "   2. Click on 'magnificent-cat' project"
echo "   3. Look at the URL: https://railway.app/project/YOUR_ID_HERE"
echo "   4. Copy the UUID after /project/"
echo ""
echo "Option B: Link project first, then run this script again"
echo "   railway link"
echo "   ./get-railway-id.sh"
echo ""
echo "Option C: Use railway status"
echo "   railway link  # Link to your project first"
echo "   railway status  # Look for 'Project ID: ...'"
echo ""
