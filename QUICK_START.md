# Quick Start - Get Railway IDs and Test

## Step 1: Get Your Railway IDs

### Option A: Using the Script (Easiest)

```bash
cd /Users/rizel/Desktop/redesign-for-ridiculous/auto

# Set your Railway token
export RAILWAY_TOKEN="your_railway_token_here"

# Run the script
./get-railway-ids.sh
```

This will show you all your projects and their IDs. Look for:
- **Project:** magnificent-cat → Copy the **Project ID**
- **Service:** frosty-agent-forge → Copy the **Service ID**

### Option B: From Railway Dashboard

1. Go to https://railway.app
2. Click on your **magnificent-cat** project
3. **Project ID** is in the URL: `railway.app/project/PROJECT_ID_HERE`
4. Click on **frosty-agent-forge** service
5. Go to **Settings** → **Service ID** is shown there

### Option C: From Railway CLI

```bash
cd /Users/rizel/Desktop/redesign-for-ridiculous/frosty-agent-forge

# This shows project/service names but not always IDs
railway status

# To get IDs, you may need to check the Railway dashboard
```

## Step 2: Add Secrets to GitHub

Go to: **https://github.com/blackgirlbytes/auto/settings/secrets/actions**

Click **"New repository secret"** for each:

### Required Secrets (5 total):

1. **RAILWAY_TOKEN**
   - Value: Your Railway account token from https://railway.app/account/tokens
   
2. **RAILWAY_PROJECT_ID**
   - Value: The Project ID for "magnificent-cat" (from Step 1)
   
3. **RAILWAY_SERVICE_ID**
   - Value: The Service ID for "frosty-agent-forge" (from Step 1)
   
4. **SENDGRID_API_KEY**
   - Value: Your SendGrid API key
   
5. **FROM_EMAIL**
   - Value: Your sender email (e.g., noreply@adventofai.dev)

### Optional Secret:

6. **RAILWAY_ENVIRONMENT** (optional, defaults to "production")
   - Value: `production`

## Step 3: Test Locally (Optional but Recommended)

Before running the GitHub workflow, test locally:

```bash
cd /Users/rizel/Desktop/redesign-for-ridiculous/auto

# Set all environment variables
export RAILWAY_TOKEN="your_token"
export RAILWAY_PROJECT_ID="your_project_id"
export RAILWAY_SERVICE_ID="your_service_id"
export RAILWAY_ENVIRONMENT="production"
export SENDGRID_API_KEY="your_sendgrid_key"
export FROM_EMAIL="your_from_email"

# Test Railway connection
railway ssh --project $RAILWAY_PROJECT_ID --service $RAILWAY_SERVICE_ID --environment production "echo 'Connection successful!'"

# Test database query
railway ssh --project $RAILWAY_PROJECT_ID --service $RAILWAY_SERVICE_ID --environment production "node -e \"const db = require('better-sqlite3')('./data/signups.db'); console.log('Signups:', db.prepare('SELECT COUNT(*) as count FROM signups').get()); db.close();\""

# Run the full test
npx tsx scripts/test-full-flow.ts --day=1
```

## Step 4: Run GitHub Actions Test Workflow

1. Go to: **https://github.com/blackgirlbytes/auto/actions/workflows/test-email-flow.yml**
2. Click **"Run workflow"** button (top right)
3. Enter day: **1**
4. Click **"Run workflow"**

## Step 5: Check the Results

### In GitHub Actions:

1. **Debug Railway Configuration** step will show:
   ```
   RAILWAY_TOKEN: ✅ Set (42 chars)
   RAILWAY_PROJECT_ID: abc123-def456-ghi789
   RAILWAY_SERVICE_ID: xyz789-abc123-def456
   RAILWAY_ENVIRONMENT: production
   ```

2. **Test Railway Connection** step will show:
   ```
   ✅ Railway connection successful!
   ```

3. **Run full test flow** will:
   - Query Railway for signups
   - Update email list
   - Send test email to rizel@block.xyz

### In Your Email:

Check **rizel@block.xyz** for the test email! 📬

## Troubleshooting

### If "Debug Railway Configuration" shows missing values:
- ❌ Double-check you added all secrets to GitHub
- ❌ Make sure secret names are EXACTLY as shown (case-sensitive)

### If "Test Railway Connection" fails:
- ❌ Verify the Project ID is correct (from magnificent-cat)
- ❌ Verify the Service ID is correct (from frosty-agent-forge)
- ❌ Check that frosty-agent-forge service is running in Railway
- ❌ Verify your token has access to this project

### If Railway query works but no email arrives:
- ❌ Check SENDGRID_API_KEY is correct
- ❌ Check FROM_EMAIL is a verified sender in SendGrid
- ❌ Check spam folder

## What Each Secret Does

| Secret | Purpose | Example |
|--------|---------|---------|
| `RAILWAY_TOKEN` | Authenticates with Railway | `railway_token_abc123...` |
| `RAILWAY_PROJECT_ID` | Identifies "magnificent-cat" project | `abc123-def456-ghi789` |
| `RAILWAY_SERVICE_ID` | Identifies "frosty-agent-forge" service | `xyz789-abc123-def456` |
| `SENDGRID_API_KEY` | Sends emails via SendGrid | `SG.abc123...` |
| `FROM_EMAIL` | Email sender address | `noreply@adventofai.dev` |

## Success Checklist

- [ ] Got Railway Project ID for "magnificent-cat"
- [ ] Got Railway Service ID for "frosty-agent-forge"
- [ ] Added all 5 required secrets to GitHub
- [ ] Ran test workflow
- [ ] "Debug Railway Configuration" shows all values ✅
- [ ] "Test Railway Connection" passes ✅
- [ ] Received test email at rizel@block.xyz ✅

## Next Steps After Success

Once the test workflow succeeds:

1. ✅ Verify email content and formatting
2. ✅ Test with different days (day=2, day=3, etc.)
3. ✅ Run production workflow with `dry_run=true`
4. ✅ Go live! Let the automated schedule run

## Need Help?

Check these files:
- `DEBUGGING_GUIDE.md` - Detailed troubleshooting
- `RAILWAY_CONFIG.md` - Railway-specific configuration
- `RAILWAY_SETUP.md` - General Railway setup info

Or check the GitHub Actions logs - they now show detailed debug info! 🔍
