# Quick Setup Guide

## ✅ What's Been Created

The repository is fully set up with:

1. **GitHub Actions Workflows**
   - `daily-challenge-email.yml` - Automated daily sends at 9 AM UTC
   - `manual-send.yml` - Manual trigger with test mode

2. **TypeScript Scripts**
   - `query-new-signups.ts` - Syncs emails from Railway PostgreSQL
   - `fetch-challenge.ts` - Fetches markdown from frosty-agent-forge repo
   - `send-challenge-email.ts` - Sends formatted emails via SendGrid

3. **Configuration Files**
   - `package.json` - Dependencies and scripts
   - `tsconfig.json` - TypeScript configuration
   - `.env.example` - Environment variables template
   - `.gitignore` - Git ignore rules

4. **Data Storage**
   - `data/email-list.json` - Subscriber list with metadata

## 🚀 Next Steps

### 1. Install Dependencies (On a Different Network)

```bash
npm install
```

This will install:
- `@sendgrid/mail` - Email sending
- `pg` - PostgreSQL client
- `axios` - HTTP requests
- `dotenv` - Environment variables
- `marked` - Markdown parsing
- TypeScript and type definitions

### 2. Configure Environment Variables

Create `.env` file:

```bash
cp .env.example .env
```

Fill in your actual values:

```env
# SendGrid (Get from https://app.sendgrid.com/settings/api_keys)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
FROM_EMAIL=noreply@adventofai.com
FROM_NAME=Advent of AI
REPLY_TO_EMAIL=support@adventofai.com

# Railway Database (Get from Railway dashboard)
DATABASE_URL=postgresql://postgres:password@hostname.railway.app:5432/railway

# GitHub
GITHUB_REPO_OWNER=your-username
GITHUB_REPO_NAME=frosty-agent-forge
GITHUB_TOKEN=ghp_xxxxxxxxxxxx  # Optional, for private repos

# Other
UNSUBSCRIBE_URL=https://adventofai.com/unsubscribe
NODE_ENV=development
```

### 3. Test Locally

**A. Test fetching a challenge:**
```bash
npm run fetch-challenge -- 1
```

**B. Test database connection:**
```bash
npm run query-signups
```

**C. Send a test email:**
```bash
npm run send-challenge -- --test --email=your@email.com --day=1
```

### 4. Push to GitHub

```bash
# Add remote (replace with your repo URL)
git remote add origin https://github.com/your-username/auto.git

# Rename branch to main (optional)
git branch -M main

# Push
git push -u origin main
```

### 5. Configure GitHub Secrets

Go to: **Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:
- `SENDGRID_API_KEY`
- `FROM_EMAIL`
- `FROM_NAME`
- `REPLY_TO_EMAIL`
- `UNSUBSCRIBE_URL`
- `DATABASE_URL`
- `GITHUB_REPO_OWNER`
- `GITHUB_REPO_NAME`
- `GH_TOKEN` (optional)

### 6. Test GitHub Actions

**Manual Send Workflow:**

1. Go to **Actions** tab
2. Click **Manual Email Send**
3. Click **Run workflow**
4. Fill in:
   - day: `1`
   - test_mode: `✓` (checked)
   - test_email: `your@email.com`
   - sync_signups: `✓` (checked)
5. Click **Run workflow**

### 7. Send Catch-Up Emails

If subscribers missed days 1-N, send catch-up emails:

```bash
# For each day that was missed
npm run send-challenge -- --day=1
npm run send-challenge -- --day=2
# etc.
```

Or use the GitHub Actions manual workflow for each day.

## 📋 Pre-Launch Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured with real values
- [ ] SendGrid API key verified (send test email)
- [ ] Railway database accessible (test query-signups)
- [ ] Challenge files exist in frosty-agent-forge repo
- [ ] Repository pushed to GitHub
- [ ] GitHub Secrets configured
- [ ] Test email sent successfully via GitHub Actions
- [ ] Email list populated with at least one email
- [ ] Daily workflow schedule verified (9 AM UTC)

## 🐛 Troubleshooting

### npm install fails
- Try on a different network (not Block network)
- Or use a VPN
- Or configure npm proxy if available

### SendGrid errors
- Verify API key is valid
- Check sender email is verified in SendGrid
- Ensure you're not in sandbox mode (or add test recipients)

### Database connection fails
- Verify DATABASE_URL is correct
- Check Railway database is running
- Test connection with a PostgreSQL client

### Challenge not found
- Verify file path in `fetch-challenge.ts` matches your repo structure
- Check repository name and owner are correct
- Ensure challenge markdown files exist

## 📊 Database Schema

Your Railway PostgreSQL should have:

```sql
CREATE TABLE signups (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

If your schema is different, update the query in `scripts/query-new-signups.ts`.

## 🎯 Challenge Repository Structure

Your `frosty-agent-forge` repo should have:

```
challenges/
├── day-01.md
├── day-02.md
├── day-03.md
...
└── day-25.md
```

Each file should start with a title:
```markdown
# Day 1: Challenge Title

Challenge content here...
```

## 📞 Need Help?

- Check the main README.md for detailed documentation
- Review GitHub Actions logs for error details
- Test each component individually before running the full workflow
