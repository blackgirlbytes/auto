# Setup Instructions for Advent of AI Email Automation

## ✅ What's Been Completed

### 1. Repository Structure
- ✅ Created GitHub repository: `https://github.com/blackgirlbytes/auto`
- ✅ Set up directory structure with all necessary files
- ✅ Added 86 initial subscribers to `data/email-list.json`

### 2. Scripts Implemented
- ✅ **query-new-signups.ts** - Queries Railway DB and updates email list
- ✅ **fetch-challenge.ts** - Fetches markdown from frosty-agent-forge repo
- ✅ **send-challenge-email.ts** - Sends emails via SendGrid with beautiful HTML templates

### 3. GitHub Actions Workflow
- ✅ Automated workflow that runs daily at 12:30 PM ET
- ✅ Manual trigger support with dry-run option
- ✅ Automatic Railway query before sending emails
- ✅ Error handling and issue creation on failure

### 4. Documentation
- ✅ Comprehensive README with usage instructions
- ✅ Package.json with all dependencies and scripts
- ✅ Environment variable examples

## 🚀 Next Steps to Go Live

### Step 1: Install Dependencies

Run this on a machine without network restrictions:

```bash
cd /Users/rizel/Desktop/redesign-for-ridiculous/auto
npm install
```

This will install:
- `@sendgrid/mail` - For sending emails
- `dotenv` - For environment variables
- `tsx` - For running TypeScript files
- `@types/node` - TypeScript definitions
- `typescript` - TypeScript compiler

### Step 2: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_actual_sendgrid_api_key_here
FROM_EMAIL=noreply@adventofai.dev

# Railway Configuration
RAILWAY_TOKEN=your_railway_token_here
```

**How to get these:**

1. **SENDGRID_API_KEY**: 
   - Go to SendGrid dashboard
   - Navigate to Settings → API Keys
   - Create a new API key with "Mail Send" permissions
   - Copy the key (you'll only see it once!)

2. **FROM_EMAIL**:
   - Use an email address you've verified in SendGrid
   - Recommended: `noreply@adventofai.dev` or similar

3. **RAILWAY_TOKEN**:
   - Go to Railway dashboard
   - Navigate to Account Settings → Tokens
   - Create a new token
   - Copy the token

### Step 3: Test Locally

#### Test 1: Fetch Challenge Content

```bash
npx tsx scripts/fetch-challenge.ts --day=1
```

**Expected output:**
- ✅ Successfully fetched Day 1 challenge
- Shows title, greeting, and description preview

#### Test 2: Dry Run Email Send

```bash
npx tsx scripts/send-challenge-email.ts --day=1 --dry-run
```

**Expected output:**
- ✅ Fetches challenge from GitHub
- ✅ Loads 86 subscribers from email-list.json
- ✅ Shows email preview without sending
- Shows subject, from address, and recipient count

#### Test 3: Query Railway (Optional)

```bash
npx tsx scripts/query-new-signups.ts
```

**Expected output:**
- ✅ Fetches signups from Railway
- Shows any new signups found
- Updates email-list.json if new signups exist

### Step 4: Configure GitHub Actions Secrets

Go to your GitHub repository settings:

1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `SENDGRID_API_KEY` | Your SendGrid API key | For sending emails |
| `FROM_EMAIL` | noreply@adventofai.dev | Sender email address |
| `RAILWAY_TOKEN` | Your Railway token | For querying database |

### Step 5: Test GitHub Actions Workflow

1. Go to **Actions** tab in your GitHub repository
2. Click on **Send Daily Challenge Email Notifications**
3. Click **Run workflow**
4. Fill in:
   - **day**: 1
   - **dry_run**: ✅ (checked)
5. Click **Run workflow**

**Expected result:**
- Workflow runs successfully
- Shows dry run output in logs
- No actual emails sent

### Step 6: Send Real Test Email

Once dry run succeeds:

1. Go to **Actions** → **Send Daily Challenge Email Notifications**
2. Click **Run workflow**
3. Fill in:
   - **day**: 1
   - **dry_run**: ❌ (unchecked)
4. Click **Run workflow**

**Expected result:**
- Emails sent to all 86 subscribers
- Check your own email if you're on the list
- Review logs for success/failure stats

## 📅 Automated Schedule

Once everything is tested, the workflow will automatically run at:

**12:30 PM ET (17:30 UTC)** on these dates:

| Week | Days | Dates | Challenge Days |
|------|------|-------|----------------|
| 1 | Mon-Fri | Dec 1-5 | Days 1-5 |
| 2 | Mon-Fri | Dec 8-12 | Days 6-10 |
| 3 | Mon-Fri | Dec 15-19 | Days 11-15 |
| 4 | Mon-Tue | Dec 22-23 | Days 16-17 |

## 🔍 Monitoring

### Check Workflow Runs
- Go to **Actions** tab
- View recent workflow runs
- Check logs for any errors

### Check Email List Updates
- Monitor commits to `data/email-list.json`
- New signups will be automatically added

### Check for Issues
- If workflow fails, an issue will be automatically created
- Check **Issues** tab for notifications

## 🐛 Troubleshooting

### Issue: npm install fails
**Solution:** Run on a different machine or network without restrictions

### Issue: SendGrid API key invalid
**Solution:** 
- Verify key in SendGrid dashboard
- Ensure key has "Mail Send" permissions
- Check key is correctly copied (no extra spaces)

### Issue: Railway query fails
**Solution:**
- Verify RAILWAY_TOKEN is correct
- Check Railway CLI is installed: `npm install -g @railway/cli`
- Ensure you have access to the Railway project

### Issue: Challenge content not found
**Solution:**
- Verify day number is between 1-17
- Check frosty-agent-forge repo has the challenge file
- Ensure file is named correctly: `day1.md`, `day2.md`, etc.

### Issue: Emails not received
**Solution:**
- Check spam folder
- Verify FROM_EMAIL is authenticated in SendGrid
- Check SendGrid dashboard for delivery stats
- Review workflow logs for errors

## 📊 Current Status

- **Repository**: ✅ Created and pushed
- **Scripts**: ✅ All implemented
- **Workflow**: ✅ Configured
- **Email List**: ✅ 86 subscribers loaded
- **Dependencies**: ⏳ Need to install (blocked by network)
- **Testing**: ⏳ Pending dependency installation
- **Secrets**: ⏳ Need to configure in GitHub
- **Live**: ⏳ Ready to go live after testing

## 🎯 Quick Start Checklist

- [ ] Install npm dependencies
- [ ] Create `.env` file with credentials
- [ ] Test fetch-challenge script
- [ ] Test send-challenge script (dry run)
- [ ] Configure GitHub Actions secrets
- [ ] Test workflow with dry run
- [ ] Send test email to verify
- [ ] Monitor first automated run

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Check SendGrid dashboard for delivery issues
4. Verify Railway database is accessible
5. Review script output for error messages

## 🎉 Success Criteria

You'll know everything is working when:

- ✅ Dry run completes without errors
- ✅ Test email is received successfully
- ✅ Email has correct formatting and content
- ✅ Railway query finds and adds new signups
- ✅ Automated workflow runs on schedule
- ✅ Subscribers receive daily challenge emails

---

**Ready to launch!** 🚀 Just need to complete the testing steps above.
