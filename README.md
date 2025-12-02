# Advent of AI - Email Automation 🎄

Automated email system for sending daily Advent of AI challenge notifications to subscribers.

## 📋 Overview

This system automates the process of:
1. Querying Railway database for new signups
2. Updating the email list stored in JSON format
3. Fetching challenge content from the [frosty-agent-forge](https://github.com/blackgirlbytes/frosty-agent-forge) repository
4. Sending beautiful HTML emails to all subscribed users

## 🏗️ Structure

```
advent-of-ai-emails/
├── .github/
│   └── workflows/
│       └── daily-challenge-email.yml    # Main daily automation workflow
├── data/
│   └── email-list.json                  # Master email list (86+ subscribers)
├── scripts/
│   ├── query-new-signups.ts             # Fetch new signups from Railway DB
│   ├── send-challenge-email.ts          # Send emails with challenge content
│   └── fetch-challenge.ts               # Fetch markdown from frosty-agent-forge
├── .env.example                         # Environment variables template
├── package.json                         # Node.js dependencies and scripts
├── .gitignore                          # Git ignore rules
└── README.md                           # This file
```

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@adventofai.dev

# Railway Configuration (for querying database)
RAILWAY_TOKEN=your_railway_token_here
```

### 3. GitHub Actions Secrets

Configure these secrets in your GitHub repository settings:

- `SENDGRID_API_KEY` - Your SendGrid API key
- `FROM_EMAIL` - The email address to send from
- `RAILWAY_TOKEN` - Your Railway API token

## 📝 Scripts

### 🧪 Test Full Flow (Recommended First!)

Test the complete automation flow safely - sends email **ONLY to rizel@block.xyz**:

```bash
# Test Day 1 challenge (queries Railway, updates list, sends test email)
npm run test-flow -- --day=1
```

**What it does:**
1. Queries Railway for new signups
2. Updates email-list.json
3. Fetches challenge from GitHub
4. Sends test email ONLY to rizel@block.xyz

See [TEST_GUIDE.md](TEST_GUIDE.md) for detailed testing instructions.

### Query New Signups

Fetch new signups from Railway database and update `email-list.json`:

```bash
# Query and display new signups
npm run query-signups

# Query and automatically commit/push changes
npx tsx scripts/query-new-signups.ts --commit
```

### Fetch Challenge Content

Fetch and preview challenge content from GitHub:

```bash
npm run fetch-challenge -- --day=1
```

### Send Emails

Send challenge notification emails to all subscribers:

```bash
# Dry run (preview without sending)
npm run send:dry-run -- --day=1

# Send emails for a specific day
npm run send -- --day=1
```

## 🤖 GitHub Actions Workflow

The workflow runs automatically at **12:30 PM ET (17:30 UTC)** on challenge days:

- **Days 1-5**: Dec 1-5 (Mon-Fri)
- **Days 6-10**: Dec 8-12 (Mon-Fri)
- **Days 11-17**: Dec 15-19, 22-23 (Mon-Fri)

### Manual Trigger

You can manually trigger the workflow from the GitHub Actions tab:

1. Go to **Actions** → **Send Daily Challenge Email Notifications**
2. Click **Run workflow**
3. Enter the day number (1-17)
4. Optionally enable dry run mode
5. Click **Run workflow**

### Workflow Steps

1. **Checkout repository** - Gets the latest code
2. **Setup Node.js** - Installs Node.js 20
3. **Install dependencies** - Runs `npm ci`
4. **Determine challenge day** - Maps date to challenge day
5. **Install Railway CLI** - For querying the database
6. **Query new signups** - Fetches and commits new signups
7. **Send email notifications** - Sends emails to all subscribers
8. **Create success summary** - Shows results in GitHub Actions
9. **Notify on failure** - Creates an issue if something fails

## 📧 Email Template

The emails include:

- **Beautiful HTML design** with gradient styling
- **Challenge title** extracted from markdown
- **Greeting message** personalized for AI engineers
- **Challenge description** (first 4 paragraphs)
- **Call-to-action button** linking to the full challenge
- **Tips for success** to help participants
- **Responsive design** that works on all devices

## 🗄️ Data Management

### Email List Structure

`data/email-list.json` contains an array of signup objects:

```json
[
  {
    "email": "user@example.com",
    "subscribed": 1,
    "created_at": "2025-12-01 21:11:17",
    "id": 1
  }
]
```

- `email` - User's email address
- `subscribed` - 1 for subscribed, 0 for unsubscribed
- `created_at` - Timestamp of signup
- `id` - Unique identifier

### Railway Database Query

The system queries Railway using SSH:

```bash
railway run node -e "const db = require('better-sqlite3')('./data/signups.db'); const all = db.prepare('SELECT * FROM signups ORDER BY created_at DESC').all(); console.log(JSON.stringify(all)); db.close();"
```

## 🧪 Testing

### Test Challenge Fetching

```bash
npx tsx scripts/fetch-challenge.ts --day=1
```

### Test Email Sending (Dry Run)

```bash
npx tsx scripts/send-challenge-email.ts --day=1 --dry-run
```

This will:
- Fetch the challenge content
- Load the email list
- Generate the email template
- Show preview without sending

### Test Railway Query

```bash
RAILWAY_TOKEN=your_token npx tsx scripts/query-new-signups.ts
```

## 📊 Statistics

Current email list:
- **Total signups**: 86
- **Subscribed**: 86
- **Unsubscribed**: 0

## 🔧 Troubleshooting

### Emails Not Sending

1. Check SendGrid API key is valid
2. Verify FROM_EMAIL is authenticated in SendGrid
3. Check GitHub Actions logs for errors
4. Ensure email list has subscribed users

### Railway Query Failing

1. Verify RAILWAY_TOKEN is set
2. Check Railway CLI is installed
3. Ensure database path is correct
4. Verify Railway project is accessible

### Challenge Content Not Loading

1. Check GitHub repository is public
2. Verify challenge file exists for the day
3. Check network connectivity
4. Review error logs for details

## 📅 Schedule

Emails are sent 30 minutes after challenges unlock at **12:00 PM ET**.

| Week | Days | Dates |
|------|------|-------|
| 1 | 1-5 | Dec 1-5 |
| 2 | 6-10 | Dec 8-12 |
| 3 | 11-15 | Dec 15-19 |
| 4 | 16-17 | Dec 22-23 |

## 🤝 Contributing

To add features or fix bugs:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC

## 🎯 Related Projects

- [Advent of AI Website](https://adventofai.dev)
- [Frosty Agent Forge](https://github.com/blackgirlbytes/frosty-agent-forge) - Challenge content repository
- [Goose](https://github.com/block/goose) - AI agent framework

---

Made with ❄️ for the Advent of AI community
