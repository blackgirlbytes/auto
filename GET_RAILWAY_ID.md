# Get Your Railway Project ID

## You have this info:
```
Project: magnificent-cat
Environment: production
Service: frosty-agent-forge
```

## Get the Project ID:

### Method 1: Railway CLI (Easiest)
```bash
railway status
```

Look for a line like:
```
Project ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Method 2: Railway Dashboard URL
1. Go to https://railway.app/
2. Click on your "magnificent-cat" project
3. Look at the URL in your browser:
   ```
   https://railway.app/project/YOUR_PROJECT_ID_HERE
   ```
4. Copy the UUID after `/project/`

### Method 3: Railway CLI JSON
```bash
railway status --json
```

Look for `"projectId"` in the output.

### Method 4: Check railway.json
```bash
# If you have a railway.json file in your project
cat railway.json | grep projectId
```

## Example Project ID Format:
```
a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

## Once You Have It:

Add to GitHub Secrets as:
- **Name**: `RAILWAY_PROJECT_ID`
- **Value**: `your-project-id-here`

Go to: https://github.com/blackgirlbytes/auto/settings/secrets/actions
