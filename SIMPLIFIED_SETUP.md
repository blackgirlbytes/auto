# Simplified Setup Guide - Railway CLI Fix Applied! 🎉

## 🚨 Railway CLI Quirk Fixed!

We discovered a critical Railway CLI behavior:

### The Problem
```bash
# This IGNORES your RAILWAY_TOKEN:
railway ssh --project <ID> --service <ID> "command"
# Result: "Unauthorized. Please login"
```

### The Solution
```bash
# This WORKS with RAILWAY_TOKEN:
railway ssh --service frosty-agent-forge --environment production -- "command"
# Result: ✅ Authentication works!
```

**Key insight:** Railway CLI ignores `RAILWAY_TOKEN` when you use `--project` or `--service` with IDs. Use service **name** instead!

## Simplified GitHub Secrets (Only 3 Required!)

Go to: **https://github.com/blackgirlbytes/auto/settings/secrets/actions**

### Required Secrets (3):

#### 1. RAILWAY_TOKEN
- **Value:** Your Railway account token
- **Get it:** https://railway.app/account/tokens
- **Format:** `railway_token_abc123...` (40-50 chars)

#### 2. SENDGRID_API_KEY
- **Value:** Your SendGrid API key
- **Get it:** https://app.sendgrid.com/settings/api_keys
- **Format:** `SG.abc123...`

#### 3. FROM_EMAIL
- **Value:** Your verified sender email
- **Example:** `noreply@adventofai.dev`
- **Note:** Must be verified in SendGrid

### Optional Secrets (Have Defaults):

#### 4. RAILWAY_SERVICE_NAME (optional)
- **Default:** `frosty-agent-forge`
- **Only set if:** Your service has a different name

#### 5. RAILWAY_ENVIRONMENT (optional)
- **Default:** `production`
- **Only set if:** You use a different environment

## What You DON'T Need Anymore

❌ ~~RAILWAY_PROJECT_ID~~ - Railway infers this from your token  
❌ ~~RAILWAY_SERVICE_ID~~ - We use service name instead

**This simplifies setup from 5-6 secrets down to just 3!** 🎉

## Quick Test

Once you add the 3 required secrets:

1. Go to: https://github.com/blackgirlbytes/auto/actions/workflows/test-email-flow.yml
2. Click **"Run workflow"**
3. Enter day: **1**
4. Click **"Run workflow"**

### Expected Output

**Test Railway Connection step:**
```
🧪 Testing Railway SSH connection...
   Service: frosty-agent-forge
   Environment: production
   Token length: 42 chars

📡 Running: railway ssh --service frosty-agent-forge --environment production -- echo 'Connection test successful'
Connection test successful
✅ Railway connection successful!
```

**Run full test flow step:**
```
📡 Step 1: Querying Railway for signups...
🔍 Railway Configuration:
   Token: ✅ Set (42 chars)
   Service Name: frosty-agent-forge
   Environment: production

📡 Executing Railway SSH command...
✅ Fetched 8 total signups from Railway

📋 Step 2: Updating email list...
✨ Found 8 new signup(s)!

📧 Step 3: Preparing test email...
✅ Test email sent successfully!
📬 Check your inbox at rizel@block.xyz
```

## Troubleshooting

### Still Getting "Unauthorized"?

1. **Check token format:**
   ```bash
   # Should be 40-50 characters
   echo ${#RAILWAY_TOKEN}
   ```

2. **Test token locally:**
   ```bash
   export RAILWAY_TOKEN="your_token"
   railway whoami
   # Should show: Logged in as Your Name (email) 👋
   ```

3. **Test service connection:**
   ```bash
   railway ssh --service frosty-agent-forge --environment production -- echo "test"
   # Should output: test
   ```

### Service Name Wrong?

If your service isn't named `frosty-agent-forge`:

1. Check your Railway dashboard
2. Add `RAILWAY_SERVICE_NAME` secret with your actual service name

### Token Invalid?

Create a new token:
1. Go to https://railway.app/account/tokens
2. Click "Create New Token"
3. Name it: "Advent of AI Automation"
4. Copy the token
5. Update `RAILWAY_TOKEN` in GitHub Secrets

## How It Works Now

### Railway Authentication Flow

1. **GitHub Actions sets `RAILWAY_TOKEN` env var**
2. **Railway CLI automatically uses token from environment**
3. **Service name tells Railway which service to SSH into**
4. **Railway infers project from the token itself**

No IDs needed! 🎉

### Command Structure

```bash
railway ssh \
  --service <SERVICE_NAME> \      # Use name, not ID
  --environment <ENV> \            # production, staging, etc.
  -- <command>                     # Note the -- separator
```

The `--` separator is important - it tells Railway CLI where the SSH command begins.

## Summary

### Before the Fix:
- ❌ Needed 5-6 GitHub Secrets
- ❌ Had to find Project ID and Service ID
- ❌ Railway CLI ignored RAILWAY_TOKEN
- ❌ Got "Unauthorized" errors

### After the Fix:
- ✅ Only need 3 GitHub Secrets
- ✅ Use simple service name
- ✅ Railway CLI uses RAILWAY_TOKEN
- ✅ Authentication works!

## Next Steps

1. **Add 3 secrets** to GitHub (5 minutes)
2. **Run test workflow** (2 minutes)
3. **Check email** at rizel@block.xyz (1 minute)
4. **Go live!** 🚀

The system will:
- ✅ Query Railway for new signups
- ✅ Update email list automatically
- ✅ Send beautiful challenge emails
- ✅ Run on schedule (12:30 PM ET)

## Credits

Thanks to the user who discovered this Railway CLI quirk! This was NOT documented in Railway's official docs and would have been nearly impossible to debug without this insight.

## Additional Resources

- `RAILWAY_TOKEN_GUIDE.md` - Detailed token setup
- `DEBUGGING_GUIDE.md` - Troubleshooting help
- `FINAL_SETUP.md` - Original setup (now outdated)
- `QUICK_START.md` - Step-by-step guide

**Use this guide (SIMPLIFIED_SETUP.md) as your primary reference!** ✅
