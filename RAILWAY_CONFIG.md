# Railway Configuration for Advent of AI

## Your Railway Setup

Based on your Railway status output:

```
Project: magnificent-cat
Environment: production
Service: frosty-agent-forge
```

## GitHub Secrets to Add

Go to: https://github.com/blackgirlbytes/auto/settings/secrets/actions

Add these secrets:

### 1. RAILWAY_TOKEN
- **Value:** Your Railway account token
- **Where to get it:** https://railway.app/account/tokens
- **Status:** ✅ You already have this

### 2. RAILWAY_PROJECT_ID
- **Value:** Get this from Railway CLI or dashboard
- **How to get it:**
  ```bash
  cd /path/to/frosty-agent-forge
  railway status
  # Look for "Project ID: ..." in the output
  ```
  Or from the URL when viewing your project:
  ```
  https://railway.app/project/YOUR_PROJECT_ID_HERE
  ```

### 3. RAILWAY_SERVICE_ID (Important!)
- **Value:** Get this from Railway CLI or dashboard
- **How to get it:**
  ```bash
  cd /path/to/frosty-agent-forge
  railway status
  # Look for "Service ID: ..." in the output
  ```
  Or from your service settings page

### 4. RAILWAY_ENVIRONMENT
- **Value:** `production`
- **Note:** This is optional since it defaults to `production` anyway

## Quick Command to Get IDs

Run this in your `frosty-agent-forge` directory:

```bash
railway status
```

You should see output like:
```
Project: magnificent-cat
Project ID: abc123-def456-ghi789    ← Copy this for RAILWAY_PROJECT_ID
Environment: production
Service: frosty-agent-forge
Service ID: xyz789-abc123-def456    ← Copy this for RAILWAY_SERVICE_ID
```

## Testing Locally

Once you have the IDs, test locally before running the GitHub workflow:

```bash
# Set your environment variables
export RAILWAY_TOKEN="your_token_here"
export RAILWAY_PROJECT_ID="your_project_id"
export RAILWAY_SERVICE_ID="your_service_id"
export RAILWAY_ENVIRONMENT="production"

# Test the connection
railway ssh --project $RAILWAY_PROJECT_ID --service $RAILWAY_SERVICE_ID --environment production "echo 'Connection successful!'"

# Test the database query
railway ssh --project $RAILWAY_PROJECT_ID --service $RAILWAY_SERVICE_ID --environment production "node -e \"const db = require('better-sqlite3')('./data/signups.db'); console.log('Signups:', db.prepare('SELECT COUNT(*) as count FROM signups').get()); db.close();\""

# Run the test script
npx tsx scripts/test-full-flow.ts --day=1
```

## Why Service ID Matters

Since you have a specific service named `frosty-agent-forge`, Railway CLI needs to know to SSH into **that service** specifically. Without `RAILWAY_SERVICE_ID`, it might:
- Try to guess which service to use
- Fail if there are multiple services
- Connect to the wrong service

By specifying `--service frosty-agent-forge` (via the SERVICE_ID), we ensure it connects to the right place where your `signups.db` file lives.

## Summary

**Minimum Required Secrets (4):**
1. ✅ `RAILWAY_TOKEN` - Your account token
2. ⚠️  `RAILWAY_PROJECT_ID` - Points to "magnificent-cat" project
3. ⚠️  `RAILWAY_SERVICE_ID` - Points to "frosty-agent-forge" service
4. ✅ `SENDGRID_API_KEY` - For sending emails
5. ✅ `FROM_EMAIL` - Your sender email

**Optional:**
6. `RAILWAY_ENVIRONMENT` - Defaults to `production` (which is what you're using)

## Next Steps

1. Run `railway status` in your frosty-agent-forge directory
2. Copy the Project ID and Service ID
3. Add them as GitHub Secrets
4. Run the test workflow
5. Check the debug output - it should now show all IDs properly
6. The connection test should pass! ✅
