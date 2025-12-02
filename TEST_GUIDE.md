# 🧪 Test Guide - Advent of AI Email Automation

## Overview

This guide will help you test the complete email automation system safely before going live.

## 🎯 Test Script: `test-full-flow.ts`

A special test script that:
1. ✅ Queries Railway for new signups
2. ✅ Updates `email-list.json` with any new signups
3. ✅ Fetches challenge content from GitHub
4. ✅ Sends email **ONLY to rizel@block.xyz** (not all subscribers!)

This is perfect for testing the entire flow without spamming all 86+ subscribers.

## 🚀 Quick Start

You can test in two ways:

### Option 1: Test via GitHub Actions (Recommended!)

This tests the full production environment:

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. Select **"Test Email Flow (Send to rizel@block.xyz only)"**
4. Click **"Run workflow"**
5. Enter the day number (e.g., `1`)
6. Click **"Run workflow"**
7. Wait for the workflow to complete
8. Check your email at rizel@block.xyz!

**Benefits:**
- ✅ Tests in production environment
- ✅ Uses GitHub Secrets (no local .env needed)
- ✅ Tests Railway integration
- ✅ Auto-commits email list updates
- ✅ Creates summary report

### Option 2: Test Locally

Make sure you have:
- ✅ Node.js installed
- ✅ Dependencies installed (`npm install`)
- ✅ `.env` file configured with your credentials

```bash
# Test Day 1 challenge
npm run test-flow -- --day=1

# Or use npx directly
npx tsx scripts/test-full-flow.ts --day=1
```

## 📋 What the Test Does

### Step 1: Query Railway Database
```
📡 Step 1: Querying Railway for signups...
✅ Fetched 86 total signups from Railway
```

**What's happening:**
- Connects to Railway database via SSH
- Fetches all signups
- Parses the JSON response

**If it fails:**
- Test continues with existing email list
- You'll see: `⚠️ Continuing with existing email list...`

### Step 2: Update Email List
```
📋 Step 2: Updating email list...
   Current list: 86 signups
✨ Found 2 new signup(s):
   - newuser@example.com (ID: 87)
   - another@example.com (ID: 88)
✅ Email list updated
```

**What's happening:**
- Compares Railway data with `data/email-list.json`
- Finds any new signups
- Adds them to the JSON file
- Sorts by ID

**If no new signups:**
```
✅ No new signups found
```

### Step 3: Fetch Challenge & Send Test Email
```
📧 Step 3: Preparing test email...
   Fetching challenge content from GitHub...
   ✅ Challenge loaded: "Day 1: Setting Up Your AI Workshop"

📤 Sending test email to rizel@block.xyz...
✅ Test email sent successfully!

📬 Check your inbox at rizel@block.xyz
```

**What's happening:**
- Fetches markdown from frosty-agent-forge repo
- Parses title, greeting, and description
- Generates beautiful HTML email
- Sends ONLY to rizel@block.xyz via SendGrid

## ✅ Expected Output

```
🎄 Advent of AI - Full Flow Test
══════════════════════════════════════════════════
📅 Testing Day 1 automation
📧 Test email will be sent to: rizel@block.xyz
══════════════════════════════════════════════════

📡 Step 1: Querying Railway for signups...
✅ Fetched 86 total signups from Railway

📋 Step 2: Updating email list...
   Current list: 86 signups
✅ No new signups found

📊 Email list status:
   Total signups: 86

📧 Step 3: Preparing test email...
   Fetching challenge content from GitHub...
   ✅ Challenge loaded: "Day 1: Setting Up Your AI Workshop"

📤 Sending test email to rizel@block.xyz...
✅ Test email sent successfully!

📬 Check your inbox at rizel@block.xyz

══════════════════════════════════════════════════
✅ TEST COMPLETE!
══════════════════════════════════════════════════

📋 Summary:
   ✅ Railway query: Success
   ✅ Email list: No changes
   ✅ Test email: Sent to rizel@block.xyz
   📧 Total subscribers: 86

🎉 Check your email at rizel@block.xyz!
```

## 📧 Test Email Features

The test email includes a special banner at the top:

```
🧪 TEST EMAIL - This is a test of the email automation system
```

And a footer note:

```
🧪 This is a test email sent only to rizel@block.xyz
In production, this would be sent to all subscribed users.
```

This makes it clear it's a test and not a production email.

## 🧪 Testing Different Scenarios

### Test Day 1
```bash
npm run test-flow -- --day=1
```

### Test Day 5
```bash
npm run test-flow -- --day=5
```

### Test Day 17 (last day)
```bash
npm run test-flow -- --day=17
```

## 🔍 What to Check

### 1. In Your Terminal
- ✅ All three steps complete successfully
- ✅ No error messages
- ✅ Shows correct subscriber count
- ✅ Confirms email sent to rizel@block.xyz

### 2. In Your Email Inbox (rizel@block.xyz)
- ✅ Email arrives within 1-2 minutes
- ✅ Subject line: "🧪 TEST - Day X Challenge - Advent of AI"
- ✅ Yellow test banner at top
- ✅ Beautiful gradient design
- ✅ Correct challenge title and content
- ✅ "View Full Challenge" button works
- ✅ Footer shows test notice
- ✅ No formatting issues

### 3. In Your Repository
If new signups were found:
- ✅ `data/email-list.json` is updated
- ✅ New emails are added with correct format
- ✅ List is sorted by ID

## 🐛 Troubleshooting

### Issue: Railway query fails
```
❌ Failed to fetch from Railway: ...
⚠️ Continuing with existing email list...
```

**Solution:**
- Check `RAILWAY_TOKEN` is set in `.env`
- Verify Railway CLI is installed: `npm install -g @railway/cli`
- Test Railway connection: `railway whoami`
- **Note:** Test will continue without Railway data

### Issue: Challenge not found
```
❌ Failed to fetch challenge from GitHub: 404
```

**Solution:**
- Verify day number is between 1-17
- Check challenge exists at: `https://github.com/blackgirlbytes/frosty-agent-forge/tree/main/challenges`
- Ensure file is named `dayX.md` (e.g., `day1.md`)

### Issue: SendGrid error
```
❌ Failed to send test email: Unauthorized
```

**Solution:**
- Verify `SENDGRID_API_KEY` in `.env` is correct
- Check API key has "Mail Send" permissions
- Verify `FROM_EMAIL` is authenticated in SendGrid
- Check SendGrid dashboard for account status

### Issue: Email not received
**Solution:**
- Check spam/junk folder
- Wait 2-3 minutes (SendGrid can be slow)
- Verify rizel@block.xyz is correct
- Check SendGrid dashboard → Activity Feed
- Look for delivery errors in SendGrid logs

## 📊 After Testing

### If New Signups Were Added

The test will show:
```
⚠️ Note: Email list was updated. You may want to commit these changes:
   git add data/email-list.json
   git commit -m "Add 2 new signup(s) from test run"
   git push
```

**Decision:**
- ✅ **Commit changes** if you want to keep the new signups
- ❌ **Discard changes** if this was just a test: `git checkout data/email-list.json`

### If Test Passed

You're ready to:
1. ✅ Configure GitHub Actions secrets
2. ✅ Test the workflow with dry-run
3. ✅ Send to all subscribers (or wait for automated schedule)

## 🎯 Next Steps After Successful Test

### 1. Configure GitHub Secrets
Go to repository Settings → Secrets → Actions:
- Add `SENDGRID_API_KEY`
- Add `FROM_EMAIL`
- Add `RAILWAY_TOKEN`

### 2. Test GitHub Actions Workflow
```
1. Go to Actions tab
2. Click "Send Daily Challenge Email Notifications"
3. Click "Run workflow"
4. Set day=1, dry_run=true
5. Click "Run workflow"
6. Check logs for success
```

### 3. Send Real Email to All Subscribers
```
1. Go to Actions tab
2. Click "Send Daily Challenge Email Notifications"
3. Click "Run workflow"
4. Set day=1, dry_run=false
5. Click "Run workflow"
6. Monitor logs
7. Check SendGrid dashboard
```

### 4. Wait for Automated Schedule
The workflow will automatically run at 12:30 PM ET on challenge days!

## 📝 Test Checklist

Before going live, verify:

- [ ] Test script runs without errors
- [ ] Railway query works (or gracefully fails)
- [ ] Email list updates correctly
- [ ] Challenge content fetches successfully
- [ ] Test email arrives at rizel@block.xyz
- [ ] Email looks beautiful and professional
- [ ] All links work correctly
- [ ] Content is accurate and complete
- [ ] No formatting issues
- [ ] Test banner is visible

## 🎉 Success!

If all checks pass, your system is ready for production! 🚀

The test proves:
- ✅ Railway integration works
- ✅ Email list management works
- ✅ Challenge fetching works
- ✅ SendGrid integration works
- ✅ Email template renders correctly
- ✅ End-to-end flow is functional

## 💡 Pro Tips

1. **Test multiple days** to ensure different challenge content works
2. **Test with and without Railway** to verify fallback behavior
3. **Check spam folder** if email doesn't arrive immediately
4. **Save a test email** as a reference for the production version
5. **Test on mobile** by forwarding to your phone

## 🔒 Safety Features

The test script is safe because:
- ✅ Only sends to rizel@block.xyz (hardcoded)
- ✅ Clearly marked as TEST in subject and body
- ✅ Won't spam subscribers
- ✅ Can run multiple times safely
- ✅ Doesn't affect production workflow

---

**Ready to test?** Run `npm run test-flow -- --day=1` and check your email! 📧
