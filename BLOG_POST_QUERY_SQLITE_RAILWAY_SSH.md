# How to Query a SQLite Database on Railway from GitHub Actions

You've deployed your app to Railway. It's using SQLite for storage. Now you need to query that database from a GitHub Actions workflow—maybe to sync data, run backups, or automate some process.

This should be simple. It's not.

Here's what I learned after spending way too long on this.

## Why SSH?

Railway doesn't expose your SQLite database to the internet (and you don't want it to). There's no database URL or connection string like you'd get with Postgres or MySQL. Your SQLite file lives on disk inside your deployed container.

SSH lets you run commands directly inside that container. You can query the database, inspect files, or run any command—without opening ports or exposing anything publicly.

## The Problem

This command works perfectly on my local machine:

```bash
railway ssh "node -e \"const db = require('better-sqlite3')('./data/signups.db'); const all = db.prepare('SELECT * FROM signups ORDER BY created_at DESC').all(); console.log(JSON.stringify(all)); db.close();\""
```

But in GitHub Actions? It fails. Authentication errors. Quote escaping issues. Silent failures with no output.

The journey to make this work taught me a few things about Railway's CLI that aren't obvious from the docs.

## Prerequisites

- [Railway CLI](https://docs.railway.app/develop/cli) installed
- A Railway project with a deployed service
- A SQLite database in your deployed service (this example uses `better-sqlite3`)

## Step 1: Get Your Project Token

You need a **project token**, not an account token. This is important.

1. Go to [railway.com/dashboard](https://railway.com/dashboard)
2. Click on your project
3. You'll be at `https://railway.com/project/[project-id]`
4. Add `/settings` to the URL: `https://railway.com/project/[project-id]/settings`
5. Scroll down to **Tokens**
6. Click **Generate Token**
7. Copy the token

Add this as a secret in your GitHub repository: `RAILWAY_TOKEN`

> **Why project token instead of account token?** The project token is scoped to just this project. It's more secure for CI/CD—if it leaks, the blast radius is limited to one project.

## Step 2: Find Your Service Name

You need your **service name**, not the service ID. This matters (more on why later).

Find it in the Railway dashboard—it's the name shown on your service card. Something like `my-app` or `frosty-agent-forge`.

## Step 3: The Working Command

Here's the command pattern that works in GitHub Actions:

```bash
railway ssh --service your-service-name --environment production \
  "node -e \"const db = require('better-sqlite3')('./path/to/database.db'); const rows = db.prepare('SELECT * FROM your_table').all(); console.log(JSON.stringify(rows)); db.close();\""
```

The quote escaping is critical:
- **Outer double quotes** wrap the entire command
- **Escaped double quotes** (`\"`) wrap the JavaScript code
- **Single quotes** for strings inside the JavaScript

## Step 4: Put the Query in a Script

Embedding complex queries directly in your workflow YAML gets messy. Instead, put the Railway SSH logic in a separate script.

Create a file like `scripts/sync-database.ts`:

```typescript
import { execSync } from 'child_process';

interface Record {
  id: number;
  email: string;
  created_at: string;
}

function queryRailway(): Record[] {
  const serviceName = process.env.RAILWAY_SERVICE_NAME || 'your-service-name';
  const environment = process.env.RAILWAY_ENVIRONMENT || 'production';
  const token = process.env.RAILWAY_TOKEN;

  if (!token) {
    console.error('RAILWAY_TOKEN not set');
    process.exit(1);
  }

  // Build the command with proper escaping
  const command = `railway ssh --service ${serviceName} --environment ${environment} "node -e \\"const db = require('better-sqlite3')('./data/database.db'); const rows = db.prepare('SELECT * FROM users').all(); console.log(JSON.stringify(rows)); db.close();\\""`;

  const output = execSync(command, { encoding: 'utf-8' });

  // Railway may include extra output, so find the JSON
  const lines = output.trim().split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('[')) {
      return JSON.parse(line.trim());
    }
  }

  throw new Error('Could not find JSON output from Railway');
}

// Run the query
const records = queryRailway();
console.log(`Fetched ${records.length} records`);
```

Then your workflow just calls the script:

```yaml
- name: Sync from Railway
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
  run: npx tsx scripts/sync-database.ts
```

This keeps your workflow clean and makes the script easier to test locally.

## The GitHub Actions Workflow

Here's a complete workflow:

```yaml
name: Sync Database

on:
  workflow_dispatch:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Railway CLI
        run: npm install -g @railway/cli
      
      - name: Sync from Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
          RAILWAY_SERVICE_NAME: your-service-name
          RAILWAY_ENVIRONMENT: production
        run: npx tsx scripts/sync-database.ts
```

## Gotcha #1: Use Project Token, Not Account Token

Railway has two types of tokens:

| Token Type | Where to Find | Scope |
|------------|---------------|-------|
| Account Token | railway.com/account/tokens | All projects |
| Project Token | railway.com/project/[id]/settings → Tokens | One project |

**Use the project token.** It works more reliably with the CLI for SSH operations.

## Gotcha #2: Use Service Name, Not Service ID

This one wasted hours of my time:

```bash
# ❌ BROKEN - Railway ignores your token!
railway ssh --project abc123 --service def456 "..."

# ✅ WORKS
railway ssh --service my-service-name --environment production "..."
```

When you pass `--project` or use service IDs, Railway CLI switches to a mode that ignores the `RAILWAY_TOKEN` environment variable. It expects interactive login instead.

Use the **service name** and let Railway infer the project from your token.

## Gotcha #3: Find Your Database Path

Not sure where your SQLite file is? SSH in and explore:

```bash
railway ssh --service your-service --environment production "pwd"
railway ssh --service your-service --environment production "find . -name '*.db'"
```

## Gotcha #4: Parse the Output Carefully

Railway SSH might include extra text before your JSON output. Don't assume the entire output is valid JSON. Look for the line that starts with `[` or `{`:

```typescript
const lines = output.trim().split('\n');
for (const line of lines) {
  if (line.trim().startsWith('[')) {
    return JSON.parse(line.trim());
  }
}
```

## Wrapping Up

The key points:

1. **Use SSH** because SQLite isn't exposed to the internet
2. **Use a project token** from `railway.com/project/[id]/settings`
3. **Use service name**, not service ID or `--project` flag
4. **Put the query in a script** to keep your workflow clean
5. **Get the quote escaping right**: outer doubles, escaped inner doubles, single quotes for JS strings
6. **Parse the output carefully**—look for the JSON in the response

What works locally doesn't always work in CI. The Railway CLI behaves differently depending on how you authenticate and which flags you use. Hopefully this saves you the debugging time I spent figuring it out.
