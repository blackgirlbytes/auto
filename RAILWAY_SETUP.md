# Railway Setup Guide

## Required GitHub Secrets

You need **TWO** Railway-related secrets for the workflows to work:

### 1. RAILWAY_TOKEN (Required)
Your Railway API token for authentication.

**How to get it:**
1. Go to [Railway Dashboard](https://railway.app/)
2. Click on your profile (bottom left)
3. Click **Account Settings**
4. Click **Tokens** tab
5. Click **Create Token**
6. Give it a name (e.g., "GitHub Actions")
7. Copy the token (you'll only see it once!)

**Add to GitHub:**
- Name: `RAILWAY_TOKEN`
- Value: `your_token_here`

---

### 2. RAILWAY_PROJECT_ID (Optional but Recommended)
Your specific Railway project ID.

**How to get it:**

#### Method 1: From Railway Dashboard URL
1. Go to your Railway project
2. Look at the URL: `https://railway.app/project/YOUR_PROJECT_ID`
3. Copy the `YOUR_PROJECT_ID` part

#### Method 2: Using Railway CLI
```bash
# Login to Railway
railway login

# Link to your project (if not already linked)
railway link

# Get project ID
railway status
# Look for "Project ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

#### Method 3: From railway.json (if you have one)
```bash
cat railway.json
# Look for "projectId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Add to GitHub:**
- Name: `RAILWAY_PROJECT_ID`
- Value: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

---

## Why Do We Need Both?

### RAILWAY_TOKEN
- Authenticates you with Railway
- Required for `railway login --browserless`
- Allows access to your Railway account

### RAILWAY_PROJECT_ID
- Specifies which project to connect to
- Required for `railway link`
- Ensures commands run against the correct database

---

## Testing Railway Connection

### Local Test
```bash
# Set your token
export RAILWAY_TOKEN=your_token_here

# Login
railway login --browserless

# Link to project (if you have the ID)
railway link your_project_id

# Test the query
railway ssh "node -e \"const db = require('better-sqlite3')('./data/signups.db'); const all = db.prepare('SELECT * FROM signups ORDER BY created_at DESC').all(); console.log(JSON.stringify(all)); db.close();\""
```

### Expected Output
```json
[
  {
    "email": "user@example.com",
    "subscribed": 1,
    "created_at": "2025-12-01 21:11:17",
    "id": 1
  },
  ...
]
```

---

## Troubleshooting

### Error: "Project Token not found"
**Cause:** Railway CLI not authenticated or project not linked

**Solution:**
1. Verify `RAILWAY_TOKEN` is set in GitHub Secrets
2. Add `RAILWAY_PROJECT_ID` to GitHub Secrets
3. Check token hasn't expired
4. Ensure you have access to the project

### Error: "Authentication failed"
**Cause:** Invalid or expired token

**Solution:**
1. Generate a new token in Railway Dashboard
2. Update `RAILWAY_TOKEN` in GitHub Secrets
3. Try again

### Error: "Project not found"
**Cause:** Incorrect project ID or no access

**Solution:**
1. Verify project ID is correct
2. Ensure your Railway account has access to the project
3. Check project hasn't been deleted

### Railway Query Works Locally But Not in GitHub Actions
**Cause:** Missing environment variables or project context

**Solution:**
1. Ensure both secrets are added to GitHub
2. Check workflow has `continue-on-error: true` for Railway steps
3. Verify Railway project is active (not paused)

---

## Alternative: Skip Railway Query

If Railway integration is problematic, you can:

### Option 1: Manual Email List Updates
Just update `data/email-list.json` manually when you get new signups.

### Option 2: Remove Railway Steps
Comment out or remove the Railway query steps from workflows:

```yaml
# - name: Install Railway CLI
#   run: npm install -g @railway/cli
# 
# - name: Authenticate Railway CLI
#   ...
# 
# - name: Query new signups from Railway
#   ...
```

The email sending will still work perfectly - it just won't auto-sync new signups.

---

## Summary

**Minimum Required:**
- ✅ `RAILWAY_TOKEN` - For authentication

**Recommended:**
- ✅ `RAILWAY_TOKEN` - For authentication
- ✅ `RAILWAY_PROJECT_ID` - For project linking

**Both secrets go in:**
`https://github.com/blackgirlbytes/auto/settings/secrets/actions`

---

## Quick Setup Checklist

- [ ] Get Railway token from dashboard
- [ ] Get Railway project ID from URL or CLI
- [ ] Add `RAILWAY_TOKEN` to GitHub Secrets
- [ ] Add `RAILWAY_PROJECT_ID` to GitHub Secrets
- [ ] Test workflow
- [ ] Verify Railway query succeeds in logs

---

**Need help?** Check the [Railway CLI docs](https://docs.railway.app/develop/cli) or skip Railway integration entirely!
