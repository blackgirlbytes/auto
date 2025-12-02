#!/bin/bash
# Script to get Railway Project ID and Service ID using the Railway API

echo "🔍 Getting Railway Project and Service IDs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -z "$RAILWAY_TOKEN" ]; then
  echo "❌ RAILWAY_TOKEN not set"
  echo "   Set it with: export RAILWAY_TOKEN=your_token"
  exit 1
fi

echo "✅ RAILWAY_TOKEN is set"
echo ""

# Query Railway GraphQL API for projects
echo "📡 Querying Railway API for projects..."
echo ""

RESPONSE=$(curl -s -X POST https://backboard.railway.app/graphql \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ me { projects { edges { node { id name services { edges { node { id name } } } } } } } }"
  }')

# Check if we got an error
if echo "$RESPONSE" | grep -q "error"; then
  echo "❌ API Error:"
  echo "$RESPONSE" | jq '.'
  exit 1
fi

# Pretty print the response
echo "📋 Your Railway Projects and Services:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Parse and display in a readable format
echo "$RESPONSE" | jq -r '.data.me.projects.edges[] | .node | "Project: \(.name)\nProject ID: \(.id)\nServices:\n" + (.services.edges | map("  - \(.node.name) (ID: \(.node.id))") | join("\n")) + "\n"'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 For your Advent of AI project (magnificent-cat / frosty-agent-forge):"
echo ""
echo "1. Find 'magnificent-cat' in the list above"
echo "2. Copy its Project ID"
echo "3. Find 'frosty-agent-forge' service under that project"
echo "4. Copy its Service ID"
echo ""
echo "Then add to GitHub Secrets:"
echo "  RAILWAY_PROJECT_ID = <project-id>"
echo "  RAILWAY_SERVICE_ID = <service-id>"
