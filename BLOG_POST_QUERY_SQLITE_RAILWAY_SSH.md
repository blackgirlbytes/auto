# How to Query a SQLite Database on Railway with SSH

You've deployed your app to Railway. It's using SQLite for storage. Now you need to query that database—maybe to debug an issue, export data, or sync it somewhere else.

Here's how to do it using Railway's SSH feature.

## Why SSH?

Railway doesn't expose your SQLite database to the internet (and you don't want it to). There's no database URL or connection string like you'd get with Postgres or MySQL. Your SQLite file lives on disk inside your deployed container.

SSH lets you run commands directly inside that container. You can query the database, inspect files, or run any command—without opening ports or exposing anything publicly.

## Prerequisites

- [Railway CLI](https://docs.railway.app/develop/cli) installed (`npm install -g @railway/cli`)
- A Railway project with a deployed service
- A SQLite database in your deployed service (we'll use `better-sqlite3` in this example)

## The Command

```bash
railway ssh --service your-service-name --environment production \
  "node -e \"const db = require('better-sqlite3')('./data/signups.db'); const all = db.prepare('SELECT * FROM signups').all(); console.log(JSON.stringify(all)); db.close();\""
```

Let's break this down.

## Step 1: Get Your Project Token

You need a **project token**, not an account token. This scopes access to just one project.

1. Go to [railway.com/dashboard](https://railway.com/dashboard)
2. Click on your project
3. You'll be at `https://railway.com/project/[project-id]`
4. Add `/settings` to the URL: `https://railway.com/project/[project-id]/settings`
5. Scroll down to **Tokens**
6. Click **Generate Token**
7. Copy the token

Set it as an environment variable:

```bash
export RAILWAY_TOKEN=your_project_token_here
```

> **Why project token instead of account token?** The project token is scoped to just this project. It's more secure for CI/CD and automation—if it leaks, the blast radius is limited to one project.

## Step 2: Find Your Service Name

You need your **service name**, not the service ID. You can find it in the Railway dashboard—it's the name shown on your service card.

Or if you're in a directory linked to your Railway project:

```bash
railway status
```

Look for something like:
```
Service: frosty-agent-forge
```

## Step 3: SSH and Query

Now run the query:

```bash
railway ssh --service frosty-agent-forge --environment production \
  "node -e \"const db = require('better-sqlite3')('./data/signups.db'); const all = db.prepare('SELECT * FROM signups').all(); console.log(JSON.stringify(all)); db.close();\""
```

You'll get JSON output:

```json
[
  {"id": 1, "email": "user1@example.com", "created_at": "2025-12-01 10:00:00"},
  {"id": 2, "email": "user2@example.com", "created_at": "2025-12-01 11:30:00"}
]
```

## Understanding the Quote Escaping

The trickiest part is getting the quotes right. Here's the pattern:

```bash
railway ssh --service SERVICE --environment ENV "node -e \"YOUR_JS_CODE\""
```

- **Outer double quotes** wrap the entire command sent to the remote shell
- **Escaped double quotes** (`\"`) wrap the JavaScript code for `node -e`
- **Single quotes** inside the JavaScript for strings

```bash
"node -e \"const x = 'hello'; console.log(x);\""
#^      ^                                      ^
#|      |______ escaped for JS ________________|
#|_____________ outer quotes for SSH __________|
```

## Common Queries

### Count records

```bash
railway ssh --service frosty-agent-forge --environment production \
  "node -e \"const db = require('better-sqlite3')('./data/signups.db'); console.log(db.prepare('SELECT COUNT(*) as count FROM signups').get().count); db.close();\""
```

### Get recent entries

```bash
railway ssh --service frosty-agent-forge --environment production \
  "node -e \"const db = require('better-sqlite3')('./data/signups.db'); const recent = db.prepare('SELECT * FROM signups ORDER BY created_at DESC LIMIT 5').all(); console.log(JSON.stringify(recent, null, 2)); db.close();\""
```

### Search for a specific record

```bash
railway ssh --service frosty-agent-forge --environment production \
  "node -e \"const db = require('better-sqlite3')('./data/signups.db'); const user = db.prepare('SELECT * FROM signups WHERE email = ?').get('user@example.com'); console.log(JSON.stringify(user)); db.close();\""
```

## Using This in GitHub Actions

Here's a workflow that queries Railway and saves the results:

```yaml
name: Sync Database

on:
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Railway CLI
        run: npm install -g @railway/cli
      
      - name: Query Railway Database
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          OUTPUT=$(railway ssh --service frosty-agent-forge --environment production \
            "node -e \"const db = require('better-sqlite3')('./data/signups.db'); const all = db.prepare('SELECT * FROM signups').all(); console.log(JSON.stringify(all)); db.close();\"")
          
          echo "$OUTPUT" > data/backup.json
          echo "Fetched $(echo "$OUTPUT" | jq length) records"
```

## Gotcha: Use Project Token, Not Account Token

Railway has two types of tokens:

| Token Type | Where to Find | Scope |
|------------|---------------|-------|
| Account Token | railway.com/account/tokens | All projects in your account |
| Project Token | railway.com/project/[id]/settings → Tokens | Just one project |

**Use the project token.** It's more secure and works better with the CLI for SSH operations.

To get your project token:
1. `https://railway.com/project/[your-project-id]/settings`
2. Scroll to Tokens
3. Generate and copy

## Gotcha: Don't Use `--project` or Service IDs

This is the mistake that will waste your time:

```bash
# ❌ BROKEN - Railway ignores your token!
railway ssh --project abc123 --service def456 --environment production "..."

# ✅ WORKS - Use service NAME instead
railway ssh --service frosty-agent-forge --environment production "..."
```

When you pass `--project` or use service IDs, Railway CLI switches to a mode that ignores the `RAILWAY_TOKEN` environment variable. Use the **service name** instead, and Railway will infer the project from your token.

## Gotcha: Find Your Database Path First

Not sure where your SQLite database is? SSH in and look around:

```bash
# Check current directory
railway ssh --service frosty-agent-forge --environment production "pwd"

# List files
railway ssh --service frosty-agent-forge --environment production "ls -la"

# Find the database
railway ssh --service frosty-agent-forge --environment production "find . -name '*.db'"
```

## Gotcha: Make Sure Your Dependencies Are Installed

The `better-sqlite3` package needs to be installed in your deployed service. If you get a "module not found" error, check your `package.json`.

## Wrapping Up

The key points:

1. **Why SSH?** SQLite isn't exposed to the internet—SSH lets you run commands inside the container
2. **Use a project token** from `railway.com/project/[id]/settings` → Tokens
3. Use `railway ssh --service SERVICE_NAME --environment production "command"`
4. Use **service name**, not service ID
5. Don't use `--project` flag (it breaks token auth)
6. Get the quote escaping right: outer doubles, escaped inner doubles, single quotes for JS strings

Once you have this working, you can query your production database, export data, debug issues, or build sync workflows—all without exposing your database to the internet.
