# 🤖 GitHub Actions Workflows Guide

## Overview

This repository has **two GitHub Actions workflows**:

1. **Test Email Flow** - For safe testing (sends only to rizel@block.xyz)
2. **Send Daily Challenge Email Notifications** - For production (sends to all subscribers)

---

## 🧪 Test Workflow: `test-email-flow.yml`

### Purpose
Safely test the complete email automation flow without spamming subscribers.

### What It Does
1. ✅ Queries Railway for new signups
2. ✅ Updates `email-list.json` with new signups
3. ✅ Fetches challenge content from GitHub
4. ✅ Sends email **ONLY to rizel@block.xyz**
5. ✅ Auto-commits email list updates
6. ✅ Creates summary report

### How to Run

1. Go to **Actions** tab in GitHub
2. Select **"Test Email Flow (Send to rizel@block.xyz only)"**
3. Click **"Run workflow"**
4. Enter inputs:
   - **day**: Challenge day number (1-17)
5. Click **"Run workflow"**

### When to Use
- ✅ Before going live
- ✅ Testing new challenge content
- ✅ Verifying email template changes
- ✅ Checking Railway integration
- ✅ Debugging issues

### Safety Features
- 🔒 **Hardcoded recipient**: Only sends to rizel@block.xyz
- 🧪 **Test banner**: Email clearly marked as test
- ✅ **No subscriber spam**: Real subscribers never receive test emails
- 🔄 **Repeatable**: Can run multiple times safely

### Example Run

```
Inputs:
  day: 1

Output:
  ✅ Railway query: Success
  ✅ Email list: Updated (+2 new signups)
  ✅ Challenge fetch: Success
  ✅ Test email: Sent to rizel@block.xyz
  📬 Check your inbox!
```

---

## 🚀 Production Workflow: `daily-challenge-email.yml`

### Purpose
Send daily challenge emails to all subscribers automatically.

### What It Does
1. ✅ Queries Railway for new signups
2. ✅ Updates `email-list.json` with new signups
3. ✅ Fetches challenge content from GitHub
4. ✅ Sends email to **ALL SUBSCRIBERS** (86+)
5. ✅ Creates success summary
6. ✅ Creates GitHub issue on failure

### Automatic Schedule

Runs at **12:30 PM ET (17:30 UTC)** on these dates:

| Week | Days | Dates | Challenge Days |
|------|------|-------|----------------|
| 1 | Mon-Fri | Dec 1-5 | Days 1-5 |
| 2 | Mon-Fri | Dec 8-12 | Days 6-10 |
| 3 | Mon-Fri | Dec 15-19 | Days 11-15 |
| 4 | Mon-Tue | Dec 22-23 | Days 16-17 |

### Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **"Send Daily Challenge Email Notifications"**
3. Click **"Run workflow"**
4. Enter inputs:
   - **day**: Challenge day number (1-17)
   - **dry_run**: ✅ (for testing) or ❌ (for real sending)
5. Click **"Run workflow"**

### When to Use Manual Trigger
- ✅ Testing with dry_run=true
- ✅ Resending if automated run failed
- ✅ Sending catch-up emails
- ✅ Testing before going live

### Dry Run Mode

**With dry_run=true:**
- ✅ Fetches challenge content
- ✅ Loads email list
- ✅ Generates email template
- ❌ **Does NOT send emails**
- ✅ Shows preview in logs

**With dry_run=false:**
- ✅ Sends to ALL subscribers
- ⚠️ **Use with caution!**

### Example Run (Dry Run)

```
Inputs:
  day: 1
  dry_run: true

Output:
  🧪 DRY RUN MODE - No emails will be sent
  ✅ Challenge loaded: "Day 1: Setting Up Your AI Workshop"
  ✅ Found 86 subscribed emails
  ✅ Email template generated
  ℹ️  No emails sent (dry run)
```

### Example Run (Production)

```
Inputs:
  day: 1
  dry_run: false

Output:
  ✅ Challenge loaded: "Day 1: Setting Up Your AI Workshop"
  ✅ Found 86 subscribed emails
  ✅ Sent to user1@example.com (1/86)
  ✅ Sent to user2@example.com (2/86)
  ...
  ✅ Sent to user86@example.com (86/86)
  
  📊 Summary:
     ✅ Successfully sent: 86
     ❌ Failed: 0
     📧 Total: 86
```

---

## 🔑 Required Secrets

Both workflows require these GitHub Secrets:

| Secret | Description | Where to Get |
|--------|-------------|--------------|
| `SENDGRID_API_KEY` | SendGrid API key | SendGrid Dashboard → Settings → API Keys |
| `FROM_EMAIL` | Sender email address | Your verified SendGrid sender |
| `RAILWAY_TOKEN` | Railway API token | Railway Dashboard → Account → Tokens |

### How to Add Secrets

1. Go to repository **Settings**
2. Click **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with name and value
5. Click **Add secret**

---

## 📊 Workflow Comparison

| Feature | Test Workflow | Production Workflow |
|---------|--------------|---------------------|
| **Recipients** | rizel@block.xyz only | All subscribers (86+) |
| **Trigger** | Manual only | Automatic + Manual |
| **Schedule** | None | 12:30 PM ET daily |
| **Dry Run** | N/A (always safe) | Optional parameter |
| **Test Banner** | ✅ Yes | ❌ No |
| **Auto-commit** | ✅ Yes | ✅ Yes |
| **Issue on Fail** | ❌ No | ✅ Yes |

---

## 🎯 Recommended Testing Flow

### Step 1: Test Workflow (Safe)
```
1. Run "Test Email Flow" workflow
2. Check email at rizel@block.xyz
3. Verify content and formatting
4. Repeat for different days if needed
```

### Step 2: Production Dry Run
```
1. Run "Send Daily Challenge Email Notifications"
2. Set dry_run=true
3. Check logs for any errors
4. Verify email list count
```

### Step 3: Production Test (Small Group)
```
Option A: Manually test with just your email
  - Temporarily modify email-list.json to only include rizel@block.xyz
  - Run production workflow with dry_run=false
  - Restore full email list

Option B: Use test workflow repeatedly
  - Keep testing until confident
```

### Step 4: Go Live!
```
1. Restore full email list (86+ subscribers)
2. Run production workflow with dry_run=false
3. Monitor SendGrid dashboard
4. Check for any issues
5. Let automated schedule take over
```

---

## 🐛 Troubleshooting

### Test Workflow Fails

**Check:**
- ✅ GitHub Secrets are configured
- ✅ SENDGRID_API_KEY is valid
- ✅ FROM_EMAIL is verified in SendGrid
- ✅ RAILWAY_TOKEN is correct
- ✅ Challenge file exists for the day

**View Logs:**
1. Go to Actions tab
2. Click on the failed run
3. Expand each step to see errors

### Production Workflow Fails

**Automatic Response:**
- ✅ GitHub issue is created automatically
- ✅ Issue includes error details and run link

**Manual Check:**
1. Check GitHub Actions logs
2. Check SendGrid dashboard → Activity Feed
3. Verify Railway database is accessible
4. Check email-list.json is valid JSON

### Email Not Received

**Check:**
- ✅ Spam/junk folder
- ✅ SendGrid Activity Feed for delivery status
- ✅ Email address is in email-list.json
- ✅ subscribed=1 in email-list.json
- ✅ Workflow completed successfully

---

## 📈 Monitoring

### GitHub Actions
- View all workflow runs in **Actions** tab
- Check success/failure status
- Review detailed logs
- Download logs for analysis

### SendGrid Dashboard
- Monitor email delivery rates
- Check bounce/spam reports
- View open/click rates (if tracking enabled)
- Review activity feed

### Repository
- Watch for auto-commits to email-list.json
- Check for auto-created issues on failures
- Monitor repository insights

---

## 🔒 Security Best Practices

1. **Never commit secrets** to the repository
2. **Use GitHub Secrets** for all credentials
3. **Rotate tokens** periodically
4. **Test before production** always
5. **Monitor logs** for suspicious activity
6. **Limit workflow permissions** to minimum needed

---

## 💡 Pro Tips

1. **Test multiple days** to ensure all challenges work
2. **Use dry run first** before sending to all subscribers
3. **Monitor SendGrid quota** to avoid hitting limits
4. **Check spam scores** in SendGrid
5. **Save successful runs** as reference
6. **Document any issues** for future debugging

---

## 🎉 Quick Reference

### Test a Single Day
```
Actions → Test Email Flow → Run workflow
  day: 1
Result: Email sent to rizel@block.xyz only
```

### Dry Run Production
```
Actions → Send Daily Challenge Email Notifications → Run workflow
  day: 1
  dry_run: true
Result: Preview only, no emails sent
```

### Send to All Subscribers
```
Actions → Send Daily Challenge Email Notifications → Run workflow
  day: 1
  dry_run: false
Result: Emails sent to all 86+ subscribers
```

### Let It Run Automatically
```
Do nothing! 
Workflow runs at 12:30 PM ET on challenge days
```

---

**Need help?** Check [TEST_GUIDE.md](TEST_GUIDE.md) for detailed testing instructions!
