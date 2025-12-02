# Debugging Guide for Railway Connection Issues

## Overview

The test workflow now includes **comprehensive debugging** to help you identify and fix Railway connection issues quickly.

## New Debugging Steps

### Step 1: Debug Railway Configuration
This step shows you exactly what environment variables are set:

```
🔍 Railway Configuration Debug:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RAILWAY_TOKEN: ✅ Set (42 chars)
RAILWAY_PROJECT_ID: abc123-def456-ghi789
RAILWAY_SERVICE_ID: ⚠️  Not set (optional)
RAILWAY_ENVIRONMENT: production
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**What to check:**
- ✅ `RAILWAY_TOKEN` should show as "Set" with character count
- ✅ `RAILWAY_PROJECT_ID` should show your actual project ID
- ⚠️  `RAILWAY_SERVICE_ID` is optional (only needed if you have multiple services)
- ✅ `RAILWAY_ENVIRONMENT` defaults to `production`

### Step 2: Test Railway Connection
This step attempts a simple Railway SSH connection to verify everything works:

```bash
railway ssh --project abc123 --environment production "echo 'Connection test successful'"
```

**If this fails**, you'll see:
```
❌ Railway connection failed!

Troubleshooting steps:
1. Verify RAILWAY_TOKEN is correct
2. Verify RAILWAY_PROJECT_ID matches your project
3. Check that the service is running
4. Ensure your token has access to this project
```

## Common Errors and Solutions

### Error: "Project Token not found"

**Cause:** Railway CLI can't find your project because `RAILWAY_PROJECT_ID` is not set.

**Solution:**
1. Go to your Railway project dashboard
2. Copy your Project ID from the URL or settings
3. Add it as a GitHub Secret: `RAILWAY_PROJECT_ID`

**How to get your Project ID:**
```bash
# Option 1: From Railway Dashboard URL
# https://railway.app/project/abc123-def456-ghi789
# The Project ID is: abc123-def456-ghi789

# Option 2: Using Railway CLI locally
railway status
# Look for "Project ID: abc123-def456-ghi789"
```

### Error: "RAILWAY_TOKEN environment variable not set"

**Cause:** The `RAILWAY_TOKEN` secret is not configured in GitHub.

**Solution:**
1. Go to https://railway.app/account/tokens
2. Create a new token (or copy existing one)
3. Add it to GitHub Secrets as `RAILWAY_TOKEN`

### Error: "Could not find JSON output from Railway"

**Cause:** The database query succeeded, but the output format is unexpected.

**Possible reasons:**
- The database path is wrong (should be `./data/signups.db`)
- The `signups` table doesn't exist
- `better-sqlite3` is not installed in your Railway service

**Solution:**
1. SSH into your Railway service manually: `railway ssh`
2. Check if the database exists: `ls -la data/signups.db`
3. Check if better-sqlite3 is installed: `node -e "require('better-sqlite3')"`
4. Test the query manually:
   ```bash
   node -e "const db = require('better-sqlite3')('./data/signups.db'); console.log(db.prepare('SELECT * FROM signups').all()); db.close();"
   ```

### Error: "Failed to fetch signups from Railway: Command failed"

**Cause:** The Railway SSH command itself failed.

**Check:**
1. Is your Railway service running? (Check dashboard)
2. Is the service in the correct environment? (production/staging)
3. Does your token have access to this project?
4. If you have multiple services, do you need to specify `RAILWAY_SERVICE_ID`?

## How to Test Locally

Before running the GitHub Actions workflow, test locally:

```bash
# 1. Set your Railway token
export RAILWAY_TOKEN="your_token_here"

# 2. Set your project ID (recommended)
export RAILWAY_PROJECT_ID="your_project_id"

# 3. Test the connection
railway ssh --project $RAILWAY_PROJECT_ID "echo 'Test successful'"

# 4. Test the database query
railway ssh --project $RAILWAY_PROJECT_ID "node -e \"const db = require('better-sqlite3')('./data/signups.db'); console.log(db.prepare('SELECT * FROM signups').all()); db.close();\""

# 5. Run the test script
npx tsx scripts/test-full-flow.ts --day=1
```

## Reading the Debug Output

### Good Output ✅
```
🔍 Railway Configuration:
   Token: ✅ Set (42 chars)
   Project ID: abc123-def456-ghi789
   Service ID: ⚠️  Not set
   Environment: production
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📡 Executing Railway SSH command...
   Command: railway ssh --project abc123-def456-ghi789 --environment production "node -e ..."

✅ Fetched 86 total signups from Railway
```

### Bad Output ❌
```
🔍 Railway Configuration:
   Token: ✅ Set (42 chars)
   Project ID: ⚠️  Not set          ← PROBLEM!
   Service ID: ⚠️  Not set
   Environment: production
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  WARNING: RAILWAY_PROJECT_ID not set. Railway CLI may fail to find your project.

📡 Executing Railway SSH command...
   Command: railway ssh --environment production "node -e ..."

❌ Failed to fetch from Railway: Command failed: railway ssh ...
Project Token not found
```

## Workflow Behavior

### With Debugging Steps
1. **Debug Railway Configuration** - Shows all env vars
   - ✅ Passes: Shows configuration
   - ❌ Fails: If `RAILWAY_TOKEN` is missing

2. **Test Railway Connection** - Tests actual connection
   - ✅ Passes: Railway SSH works
   - ❌ Fails: Connection problem (workflow stops here)

3. **Run full test flow** - Only runs if connection test passed
   - Queries Railway database
   - Updates email list
   - Sends test email

### What Gets Logged
- Token length (not the actual token, for security)
- Project ID (if set)
- Service ID (if set)
- Environment name
- Exact Railway SSH command being executed
- Connection test results
- Database query results

## Next Steps After Debugging

Once you see the debug output:

1. **If "Debug Railway Configuration" shows missing values:**
   - Add the missing GitHub Secrets
   - Re-run the workflow

2. **If "Test Railway Connection" fails:**
   - Check the error message
   - Follow the troubleshooting steps shown
   - Verify your Railway project is running
   - Re-run the workflow

3. **If everything passes:**
   - Check your email at rizel@block.xyz
   - Verify the email content and formatting
   - Run the production workflow when ready

## Getting Help

If you're still stuck after checking the debug output:

1. Copy the output from the "Debug Railway Configuration" step
2. Copy the error from the "Test Railway Connection" step
3. Check that:
   - Your Railway service is running
   - The database file exists at `./data/signups.db`
   - The `signups` table has data
   - Your token has the correct permissions

## Security Note

The debug output shows:
- ✅ Token length (safe to show)
- ✅ Project/Service IDs (safe to show)
- ❌ Never shows the actual token value

This is intentional for security - your token never appears in logs!
