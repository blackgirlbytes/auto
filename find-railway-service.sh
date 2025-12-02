#!/bin/bash
# Helper script to find your Railway service with the signups database

echo "🔍 Finding Railway Service with Signups Database"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if RAILWAY_TOKEN is set
if [ -z "$RAILWAY_TOKEN" ]; then
  echo "❌ RAILWAY_TOKEN not set"
  echo "   Set it with: export RAILWAY_TOKEN=your_token"
  exit 1
fi

echo "✅ RAILWAY_TOKEN is set"
echo ""

# Get list of projects
echo "📋 Your Railway Projects:"
railway list

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To find your service:"
echo "1. Identify which project has your signups database"
echo "2. Link to it: railway link"
echo "3. Get the IDs: railway status"
echo ""
echo "Or manually:"
echo "1. Go to https://railway.app"
echo "2. Click on your Advent of AI project"
echo "3. Copy Project ID from URL: railway.app/project/PROJECT_ID"
echo "4. Click on your service (the one with signups.db)"
echo "5. Go to Settings → copy Service ID"
echo ""
echo "Then add to GitHub Secrets:"
echo "  RAILWAY_PROJECT_ID = <project-id>"
echo "  RAILWAY_SERVICE_ID = <service-id>  (if you have multiple services)"
