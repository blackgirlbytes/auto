# Analysis: SSH into Railway from GitHub Actions - The Problem, Journey, and Solution

## Executive Summary

You were building an email automation system for "Advent of AI" that needed to:
1. **Query a SQLite database** on Railway (via SSH) to get new signups
2. **Sync those signups** to a local `email-list.json` file in GitHub
3. **Send challenge emails** to subscribers using SendGrid

The core challenge was getting GitHub Actions to successfully SSH into Railway and execute a Node.js command to query the database.

---

## The System Architecture

### How the Test Email Flow Works

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        GitHub Actions Workflow                          │
│                     (test-email-flow.yml)                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 1: Query Railway Database via SSH                                 │
│  ─────────────────────────────────────                                  │
│  • Connects to Railway service "frosty-agent-forge"                     │
│  • Executes: node -e "require('better-sqlite3')..."                     │
│  • Returns JSON array of all signups from signups.db                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 2: Compare & Update Email List                                    │
│  ───────────────────────────────────                                    │
│  • Loads existing data/email-list.json (86 subscribers)                 │
│  • Compares Railway signups against existing emails                     │
│  • Finds NEW signups not already in the list                            │
│  • Merges and saves to email-list.json                                  │
│  • Auto-commits changes to GitHub                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 3: Fetch Challenge from GitHub                                    │
│  ─────────────────────────────────────                                  │
│  • Fetches from: frosty-agent-forge/challenges/day{N}.md                │
│  • Parses markdown to extract: title, greeting, description             │
│  • Example: "Day 1: The Fortune Teller's Tent ⛄️"                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 4: Send Email via SendGrid                                        │
│  ─────────────────────────────────                                      │
│  • TEST MODE: Only sends to rizel@block.xyz                             │
│  • PRODUCTION: Would send to all subscribers                            │
│  • Beautiful HTML template with challenge content                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Where Do Queried Users Go?

**Answer:** The queried users go into `data/email-list.json` in your GitHub repository!

```javascript
// The comparison logic:
const existingEmails = new Set(existingSignups.map(s => s.email.toLowerCase()));
const newSignups = [];

for (const signup of railwaySignups) {
  if (!existingEmails.has(signup.email.toLowerCase())) {
    newSignups.push(signup);  // ← New signups found!
  }
}

// Merge and save
const merged = [...existingSignups, ...newSignups].sort((a, b) => a.id - b.id);
writeFileSync('data/email-list.json', JSON.stringify(merged, null, 2));
```

Then GitHub Actions auto-commits:
```yaml
- name: Commit email list updates
  run: |
    git add data/email-list.json
    git commit -m "Update email list from test flow (Day ${{ github.event.inputs.day }})"
    git push
```

---

## The Problems We Encountered (In Order)

### Problem 1: `railway login --browserless` Doesn't Work in CI

**Error:**
```
Cannot login in non-interactive mode
```

**Why:** The `railway login --browserless` command requires interactive input (pasting a token), which doesn't work in GitHub Actions' non-interactive environment.

**Solution:** Remove the login command entirely! Railway CLI automatically uses the `RAILWAY_TOKEN` environment variable when it's set.

```yaml
# ❌ WRONG - Don't do this
- name: Login to Railway
  run: railway login --browserless

# ✅ CORRECT - Just set the env var
env:
  RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

### Problem 2: `railway link` Not Needed in CI

**What we tried:**
```yaml
- name: Link Railway project
  run: railway link $RAILWAY_PROJECT_ID
```

**Why it's unnecessary:** `railway ssh` can use `--service` and `--environment` flags directly. No need to create a `.railway` directory with project config.

**Solution:** Remove `railway link` and use flags instead.

---

### Problem 3: "Project Token not found" Error

**Error:**
```
Unauthorized. Please login with railway login
```

**Root Cause:** This was the BIG discovery! 🚨

**Railway CLI has an undocumented quirk:**
> When you use `--project` or `--service` with **IDs**, Railway CLI **ignores** the `RAILWAY_TOKEN` environment variable and demands an interactive login.

**What was happening:**
```bash
# ❌ This IGNORES RAILWAY_TOKEN (broken!)
railway ssh --project 7f255a61-5c78-42cb-9cb8-0e3a91f8ad51 \
            --service 2301ef03-8fd7-40e0-b7ce-afcad7a9ee22 \
            --environment production \
            -- "echo test"
# Result: "Unauthorized. Please login with railway login"

# ✅ This USES RAILWAY_TOKEN (works!)
railway ssh --service frosty-agent-forge \
            --environment production \
            -- "echo test"
# Result: "test" ✅
```

**Solution:** Use **service NAME** instead of service ID, and **remove** the `--project` flag entirely (Railway infers the project from the token).

---

### Problem 4: Shell Quote Escaping in GitHub Actions

**The command that works locally:**
```bash
railway ssh "node -e "const db = require('better-sqlite3')('./data/signups.db'); const all = db.prepare('SELECT * FROM signups ORDER BY created_at DESC').all(); console.log(JSON.stringify(all)); db.close();""
```

**The problem in GitHub Actions:**
- YAML has its own quoting rules
- Bash has its own quoting rules
- The combination mangles the quotes

**What we tried (all failed):**
1. Single quotes outside, double inside → `sh: 1: Syntax error: "(" unexpected`
2. Double quotes with escaped singles → Empty output
3. Base64 encoding → Silently failed (no output at all)

**The winning solution:**
```yaml
# In GitHub Actions YAML:
run: |
  railway ssh --service ${RAILWAY_SERVICE_NAME} --environment ${RAILWAY_ENVIRONMENT} \
    "node -e \"const db = require('better-sqlite3')('./data/signups.db'); const all = db.prepare('SELECT * FROM signups ORDER BY created_at DESC').all(); console.log(JSON.stringify(all)); db.close();\""
```

**In TypeScript (execSync):**
```typescript
const command = `railway ssh --service ${serviceName} --environment ${environment} "node -e \\"const db = require('better-sqlite3')('./data/signups.db'); const all = db.prepare('SELECT * FROM signups ORDER BY created_at DESC').all(); console.log(JSON.stringify(all)); db.close();\\""`;
```

**Key insight:** Use double quotes on the outside with escaped inner double quotes (`\"`), and single quotes for JavaScript strings inside.

---

### Problem 5: Base64 Encoding Failed Silently

**What we tried:**
```bash
# Encode script to base64
QUERY_SCRIPT_B64=$(cat scripts/railway-query-db.js | base64 -w 0)

# Decode and execute on Railway
railway ssh -- bash -c "echo $QUERY_SCRIPT_B64 | base64 -d | node"
```

**Result:** Completely empty output. Not even errors.

**Why it failed:** The Railway SSH environment handles piped commands differently. The base64 decode + pipe to node was silently failing.

**Lesson:** Sometimes the simplest approach (inline command with proper escaping) is better than clever workarounds.

---

## The Final Working Solution

### GitHub Secrets Required (Only 3!)

| Secret | Description |
|--------|-------------|
| `RAILWAY_TOKEN` | Your Railway account token (from railway.app/account/tokens) |
| `SENDGRID_API_KEY` | SendGrid API key for sending emails |
| `FROM_EMAIL` | Verified sender email address |

### Optional Secrets (with defaults)

| Secret | Default | Description |
|--------|---------|-------------|
| `RAILWAY_SERVICE_NAME` | `frosty-agent-forge` | Railway service name |
| `RAILWAY_ENVIRONMENT` | `production` | Railway environment |

### The Working Command Pattern

```bash
# In shell/YAML:
railway ssh --service frosty-agent-forge --environment production \
  "node -e \"const db = require('better-sqlite3')('./data/signups.db'); const all = db.prepare('SELECT * FROM signups ORDER BY created_at DESC').all(); console.log(JSON.stringify(all)); db.close();\""
```

### The Working TypeScript Code

```typescript
function queryRailwaySignups(): Signup[] {
  const serviceName = process.env.RAILWAY_SERVICE_NAME || 'frosty-agent-forge';
  const environment = process.env.RAILWAY_ENVIRONMENT || 'production';
  
  // Use the same escaping pattern that works locally
  // Outer double quotes, escaped inner double quotes, single quotes for JS strings
  const command = `railway ssh --service ${serviceName} --environment ${environment} "node -e \\"const db = require('better-sqlite3')('./data/signups.db'); const all = db.prepare('SELECT * FROM signups ORDER BY created_at DESC').all(); console.log(JSON.stringify(all)); db.close();\\""`;
  
  const output = execSync(command, { encoding: 'utf-8' });
  
  // Parse JSON from output (Railway may include extra text)
  const lines = output.trim().split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('[')) {
      return JSON.parse(line.trim());
    }
  }
  
  throw new Error('Could not find JSON output from Railway');
}
```

---

## Key Takeaways for a Blog Post

### 1. Railway CLI Quirk: IDs vs Names
> **Headline:** "Railway CLI ignores your token when you use --project or --service IDs"

The Railway CLI has two modes:
- **Simple mode** (token works): Use service NAME
- **Advanced mode** (token ignored): Use service/project IDs

This is NOT documented and causes confusing "Unauthorized" errors.

### 2. Shell Escaping in CI is Different
> **Headline:** "What works locally may not work in GitHub Actions"

The same command with the same quotes can behave differently because:
- YAML parsing happens first
- Then bash parsing
- Then the remote shell parsing

### 3. Debug Progressively
> **Headline:** "Add debug steps that fail fast"

We added separate steps for:
1. Debug configuration (show env vars)
2. Test connection (simple echo)
3. Test filesystem (find the database)
4. Test database query (the actual command)

This let us isolate exactly where things failed.

### 4. Sometimes Simple Beats Clever
> **Headline:** "Base64 encoding seemed smart but failed silently"

We tried base64 encoding to avoid quote escaping. It failed silently with no output. The simple approach (proper escaping) worked.

---

## The Success Output

When everything finally worked:

```
✅ Fetched 18 total signups from Railway
   First signup: edmund.miller@seqera.io (ID: 18)
   Last signup: kerline.moncy@gmail.com (ID: 1)

✨ Found 15 new signup(s):
   - edmund.miller@seqera.io (ID: 18)
   - viki.harrod@testdouble.com (ID: 12)
   - aubrey@squareup.com (ID: 8)
   ...

✅ Email list updated
📊 Email list updated:
   New signups: 15
   Total signups: 101

✅ Test email sent successfully!
```

---

## Blog Post Title Ideas

1. "The Railway CLI Quirk That Wasted 3 Hours: Why Your Token Gets Ignored"
2. "SSH into Railway from GitHub Actions: A Tale of Quote Escaping Hell"
3. "Why `railway ssh --project` Ignores Your Token (And How to Fix It)"
4. "Debugging CI/CD: When Your Command Works Locally But Fails in GitHub Actions"
5. "From 'Unauthorized' to 'Success': SSH-ing into Railway from GitHub Actions"

---

## Appendix: The Final Working Workflow (Key Parts)

```yaml
- name: Test Railway Connection
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
    RAILWAY_SERVICE_NAME: ${{ secrets.RAILWAY_SERVICE_NAME || 'frosty-agent-forge' }}
    RAILWAY_ENVIRONMENT: ${{ secrets.RAILWAY_ENVIRONMENT || 'production' }}
  run: |
    # Use service NAME, not ID!
    railway ssh --service ${RAILWAY_SERVICE_NAME} --environment ${RAILWAY_ENVIRONMENT} \
      -- echo 'Connection test successful'

- name: Query Database
  run: |
    railway ssh --service ${RAILWAY_SERVICE_NAME} --environment ${RAILWAY_ENVIRONMENT} \
      "node -e \"const db = require('better-sqlite3')('./data/signups.db'); const all = db.prepare('SELECT * FROM signups ORDER BY created_at DESC').all(); console.log(JSON.stringify(all)); db.close();\""
```

---

## One More Issue: Git Push Permissions

At the very end, there was one more error:
```
remote: Permission to blackgirlbytes/auto.git denied to github-actions[bot].
fatal: unable to access 'https://github.com/blackgirlbytes/auto/': The requested URL returned error: 403
```

**Solution:** The workflow needs `contents: write` permission AND you may need to use a Personal Access Token instead of `GITHUB_TOKEN` for pushing, OR enable "Allow GitHub Actions to create and approve pull requests" in repo settings.

```yaml
permissions:
  contents: write  # Required for pushing commits
```
