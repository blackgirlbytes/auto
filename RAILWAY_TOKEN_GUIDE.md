# Railway Token Setup Guide

## The Error You're Seeing

```
Unauthorized. Please login with `railway login`
```

This means the Railway CLI isn't recognizing your token. Let's fix it!

## Step 1: Get Your Railway Token

### Option A: From Railway Dashboard (Recommended)

1. Go to: **https://railway.app/account/tokens**
2. Click **"Create New Token"**
3. Name it: `Advent of AI Automation`
4. Click **"Create"**
5. **Copy the token immediately** (you won't see it again!)
6. The token should look like: `railway_token_abc123def456...`

### Option B: From Railway CLI (Local)

```bash
# Login to Railway
railway login

# This will open a browser and authenticate you
# After authentication, your token is stored locally
```

## Step 2: Verify Your Token Works Locally

Test the token on your local machine first:

```bash
# Set the token
export RAILWAY_TOKEN="your_token_here"

# Test connection with your project
railway ssh --project 7f255a61-5c78-42cb-9cb8-0e3a91f8ad51 \
  --service 2301ef03-8fd7-40e0-b7ce-afcad7a9ee22 \
  --environment production \
  "echo 'Connection successful!'"
```

**Expected output:**
```
Connection successful!
```

**If you get "Unauthorized":**
- ❌ The token is invalid or expired
- ❌ The token doesn't have access to this project
- ❌ You copied the token incorrectly (extra spaces, missing characters)

## Step 3: Add Token to GitHub Secrets

Once you've verified the token works locally:

1. Go to: **https://github.com/blackgirlbytes/auto/settings/secrets/actions**
2. Click **"New repository secret"**
3. Name: `RAILWAY_TOKEN`
4. Value: Paste your token (the entire thing, no extra spaces)
5. Click **"Add secret"**

## Common Issues and Solutions

### Issue 1: Token Format

**Correct format:**
```
railway_token_abc123def456ghi789...
```

**Incorrect formats:**
- ❌ Has extra spaces before/after
- ❌ Missing the `railway_token_` prefix
- ❌ Truncated (not the full token)
- ❌ Has newlines or line breaks

### Issue 2: Token Permissions

Your token needs access to the `magnificent-cat` project. 

**To verify:**
1. Go to https://railway.app/account/tokens
2. Find your token
3. Check it has access to your projects
4. If it's a project-specific token, make sure it's for `magnificent-cat`

### Issue 3: Token Expiration

Railway tokens can expire. If your token is old:
1. Create a new token at https://railway.app/account/tokens
2. Update the GitHub Secret with the new token

## Step 4: Test in GitHub Actions

After adding the token to GitHub Secrets:

1. Go to: https://github.com/blackgirlbytes/auto/actions/workflows/test-email-flow.yml
2. Click **"Run workflow"**
3. Enter day: `1`
4. Click **"Run workflow"**

Watch the **"Test Railway Connection"** step. You should see:

```
🧪 Testing Railway SSH connection...
📡 Running: railway ssh --project *** --service *** --environment production "echo 'Connection test successful'"
   (Token length: 42 chars)
Connection test successful
✅ Railway connection successful!
```

## Debugging Token Issues

### Check Token Length

Railway tokens are typically **40-50 characters** long. In the GitHub Actions output, you'll see:

```
(Token length: 42 chars)
```

If you see:
- **0 chars** → Token not set in GitHub Secrets
- **< 30 chars** → Token is truncated or incomplete
- **> 100 chars** → You might have copied extra text

### Check Token in Local Environment

```bash
# Set your token
export RAILWAY_TOKEN="your_token_here"

# Check it's set
echo "Token length: ${#RAILWAY_TOKEN}"

# Should show something like: Token length: 42

# Test it works
railway whoami
```

**Expected output:**
```
Logged in as Your Name (your@email.com) 👋
```

## Alternative: Project-Specific Token

If you're having trouble with an account token, create a project-specific token:

1. Go to your Railway project: https://railway.app/project/7f255a61-5c78-42cb-9cb8-0e3a91f8ad51
2. Click **Settings** → **Tokens**
3. Click **"Create Token"**
4. Name it: `GitHub Actions Automation`
5. Copy the token
6. Use this as your `RAILWAY_TOKEN` in GitHub Secrets

**Advantage:** Project-specific tokens are scoped to just this project, which is more secure.

## Final Verification Script

Save this as `test-railway-token.sh` and run it locally:

```bash
#!/bin/bash

echo "🔍 Testing Railway Token"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -z "$RAILWAY_TOKEN" ]; then
  echo "❌ RAILWAY_TOKEN not set"
  echo "   Run: export RAILWAY_TOKEN='your_token'"
  exit 1
fi

echo "✅ RAILWAY_TOKEN is set (${#RAILWAY_TOKEN} chars)"
echo ""

echo "Testing whoami..."
if railway whoami; then
  echo "✅ Token authentication works!"
else
  echo "❌ Token authentication failed!"
  exit 1
fi

echo ""
echo "Testing SSH connection..."
if railway ssh --project 7f255a61-5c78-42cb-9cb8-0e3a91f8ad51 \
  --service 2301ef03-8fd7-40e0-b7ce-afcad7a9ee22 \
  --environment production \
  "echo 'SSH test successful'"; then
  echo "✅ SSH connection works!"
else
  echo "❌ SSH connection failed!"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All tests passed! Your token is working correctly."
echo "   You can now add it to GitHub Secrets."
```

Run it:
```bash
chmod +x test-railway-token.sh
export RAILWAY_TOKEN="your_token"
./test-railway-token.sh
```

## Summary Checklist

- [ ] Created a new Railway token at https://railway.app/account/tokens
- [ ] Token starts with `railway_token_` or similar
- [ ] Token is 40-50 characters long
- [ ] Tested token locally with `railway whoami`
- [ ] Tested SSH connection locally
- [ ] Added token to GitHub Secrets (no extra spaces)
- [ ] Secret name is exactly `RAILWAY_TOKEN` (case-sensitive)
- [ ] Re-ran the GitHub Actions workflow
- [ ] "Test Railway Connection" step now passes ✅

## Need Help?

If you're still getting "Unauthorized" after following these steps:

1. **Double-check the token** - Copy it again from Railway dashboard
2. **Check token permissions** - Make sure it has access to magnificent-cat project
3. **Try a project-specific token** - Instead of an account token
4. **Check Railway service status** - Make sure frosty-agent-forge is running
5. **Contact Railway support** - They can verify your token is valid

## Next Steps

Once the Railway token works:
- ✅ Add remaining secrets (SENDGRID_API_KEY, FROM_EMAIL)
- ✅ Run the full test workflow
- ✅ Check your email at rizel@block.xyz
- ✅ Go live! 🚀
