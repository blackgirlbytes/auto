# Railway Setup Guide

## Why No `railway link`?

The `railway ssh` command can work **directly** with command-line flags, so we don't need to run `railway link` in CI/CD environments!

## How It Works

### Authentication
The Railway CLI automatically uses the `RAILWAY_TOKEN` environment variable for authentication. No login command needed!

### Connecting to Your Service
Instead of linking, we pass flags directly to `railway ssh`:

```bash
railway ssh --project <PROJECT_ID> --service <SERVICE_ID> --environment <ENV> "command"
```

## GitHub Secrets Setup

### Required Secrets (3)
These are **mandatory** for the system to work:

1. **`SENDGRID_API_KEY`** - Your SendGrid API key for sending emails
2. **`FROM_EMAIL`** - The email address to send from (e.g., `noreply@yourdomain.com`)
3. **`RAILWAY_TOKEN`** - Your Railway API token for database access

### Optional Secrets (3)
These help Railway identify your specific project/service:

4. **`RAILWAY_PROJECT_ID`** - Your Railway project ID (recommended)
5. **`RAILWAY_SERVICE_ID`** - Your Railway service ID (only needed if you have multiple services)
6. **`RAILWAY_ENVIRONMENT`** - Railway environment name (defaults to `production` if not set)

## How to Get Railway IDs

### Option 1: Railway Dashboard
1. Go to your Railway project dashboard
2. Click on your service
3. Go to Settings
4. Copy the Project ID and Service ID

### Option 2: Railway CLI (Local)
```bash
# Login locally
railway login

# Link to your project
railway link

# Get project info
railway status

# The IDs will be shown in the output
```

### Option 3: Railway API
```bash
# Get your token from: https://railway.app/account/tokens
export RAILWAY_TOKEN="your_token_here"

# List projects
curl -H "Authorization: Bearer $RAILWAY_TOKEN" \
  https://backboard.railway.app/graphql \
  -d '{"query":"{ projects { edges { node { id name } } } }"}'
```

## How the Scripts Use Railway

### In `query-new-signups.ts`
```typescript
// Builds command like:
// railway ssh --project abc123 --service xyz789 --environment production "node -e ..."

const railwayCmd = 'railway ssh';
if (projectId) railwayCmd += ` --project ${projectId}`;
if (serviceId) railwayCmd += ` --service ${serviceId}`;
railwayCmd += ` --environment ${environment}`;
```

### Environment Variables Read
- `RAILWAY_TOKEN` - Required for authentication
- `RAILWAY_PROJECT_ID` - Optional, helps identify project
- `RAILWAY_SERVICE_ID` - Optional, helps identify service
- `RAILWAY_ENVIRONMENT` - Optional, defaults to `production`

## Testing Locally

```bash
# Set your Railway token
export RAILWAY_TOKEN="your_token_here"

# Optional: Set project/service IDs
export RAILWAY_PROJECT_ID="abc123"
export RAILWAY_SERVICE_ID="xyz789"
export RAILWAY_ENVIRONMENT="production"

# Test the query script
npm run query-signups
```

## Troubleshooting

### Error: "Could not find JSON output from Railway"
- Check that your Railway service has `better-sqlite3` installed
- Verify the database path: `./data/signups.db`
- Check that the `signups` table exists

### Error: "RAILWAY_TOKEN environment variable not set"
- Make sure you've added `RAILWAY_TOKEN` to GitHub Secrets
- For local testing, export it: `export RAILWAY_TOKEN="..."`

### Error: "Failed to fetch from Railway"
- Verify your Railway token is valid
- Check that the project/service IDs are correct
- Ensure the service is running

## Benefits of This Approach

✅ **No interactive login** - Works perfectly in CI/CD  
✅ **No state files** - No `.railway` directory needed  
✅ **Explicit configuration** - Clear which project/service we're using  
✅ **Portable** - Works the same locally and in GitHub Actions  
✅ **Secure** - Token stored as GitHub Secret, never in code  

## Next Steps

1. Add the required secrets to GitHub: https://github.com/blackgirlbytes/auto/settings/secrets/actions
2. Run the test workflow to verify everything works
3. Check your email at rizel@block.xyz
4. Go live! 🚀
