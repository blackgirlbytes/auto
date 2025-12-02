# 🚀 Quick Start - 15 Minutes to Live!

## Step 1: Get Your Credentials (10 minutes)

### SendGrid (2 minutes)
1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Settings → API Keys → Create API Key
3. Name: "Advent of AI"
4. Permissions: "Mail Send" (Full Access)
5. Copy the key (shown only once!)

### Railway (5 minutes)
1. Go to [Railway Dashboard](https://railway.app/)
2. **Get Token:**
   - Profile → Account Settings → Tokens
   - Create Token → Name: "GitHub Actions"
   - Copy the token
3. **Get Project ID:**
   - Go to your project
   - Look at URL: `railway.app/project/YOUR_PROJECT_ID`
   - Copy the ID part

### Verify FROM_EMAIL (3 minutes)
1. In SendGrid: Settings → Sender Authentication
2. Verify your sender email (e.g., noreply@adventofai.dev)
3. Or use: Single Sender Verification for quick setup

---

## Step 2: Add GitHub Secrets (5 minutes)

Go to: `https://github.com/blackgirlbytes/auto/settings/secrets/actions`

Click "New repository secret" for each:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `SENDGRID_API_KEY` | Your SendGrid API key | `SG.abc123...` |
| `FROM_EMAIL` | Your verified sender email | `noreply@adventofai.dev` |
| `RAILWAY_TOKEN` | Your Railway token | `abc123...` |
| `RAILWAY_PROJECT_ID` | Your Railway project ID | `xxxxxxxx-xxxx-xxxx...` |

---

## Step 3: Run Test (5 minutes)

### Start the Test
1. Go to: `https://github.com/blackgirlbytes/auto/actions`
2. Click: **"Test Email Flow (Send to rizel@block.xyz only)"**
3. Click: **"Run workflow"**
4. Enter: `day=1`
5. Click: **"Run workflow"**

### Watch the Logs
- Wait 2-3 minutes for workflow to complete
- Check each step turns green ✅
- Look for: "✅ Test email sent successfully!"

### Check Your Email
1. Open: rizel@block.xyz inbox
2. Look for: "🧪 TEST - Day 1 Challenge - Advent of AI"
3. Verify:
   - ✅ Yellow test banner at top
   - ✅ Beautiful gradient design
   - ✅ Correct challenge content
   - ✅ "View Full Challenge" button works
   - ✅ Footer says "sent only to rizel@block.xyz"

---

## ✅ Success Checklist

- [ ] All 4 secrets added to GitHub
- [ ] Test workflow completed successfully
- [ ] Email received at rizel@block.xyz
- [ ] Email looks beautiful
- [ ] Challenge content is correct
- [ ] No errors in workflow logs

---

## 🎉 You're Live!

Once the test passes, you have two options:

### Option A: Manual Send to All Subscribers
```
1. Actions → "Send Daily Challenge Email Notifications"
2. day=1, dry_run=false
3. Monitor SendGrid dashboard
4. Verify emails sent to all 86+ subscribers
```

### Option B: Let It Run Automatically
```
Do nothing! The system will automatically send emails at:
- 12:30 PM ET on challenge days
- Dec 1-5, 8-12, 15-19, 22-23
```

---

## 🐛 Troubleshooting

### Test Email Not Received
- Check spam/junk folder
- Wait 3-5 minutes (SendGrid can be slow)
- Check SendGrid Activity Feed
- Verify FROM_EMAIL is verified in SendGrid

### Railway Query Failed
- Check RAILWAY_TOKEN is correct
- Check RAILWAY_PROJECT_ID is correct
- See RAILWAY_SETUP.md for detailed help
- Note: Email sending still works without Railway!

### Workflow Failed
- Check all 4 secrets are added
- Verify secret names are exact (case-sensitive)
- Check workflow logs for specific error
- See TEST_GUIDE.md for detailed troubleshooting

---

## 📚 Need More Help?

- **RAILWAY_SETUP.md** - Railway credentials guide
- **TEST_GUIDE.md** - Comprehensive testing instructions
- **WORKFLOWS.md** - Workflow documentation
- **FINAL_SUMMARY.md** - Complete overview

---

## 🎯 What Happens Next?

After successful test:

1. **New signups automatically added** - Railway query runs before each send
2. **Emails sent on schedule** - 12:30 PM ET on challenge days
3. **You get notified** - GitHub issue created if anything fails
4. **Monitor SendGrid** - Track delivery, opens, clicks

---

## ⏱️ Time Breakdown

- **Get credentials**: 10 minutes
- **Add secrets**: 5 minutes
- **Run test**: 3 minutes
- **Verify email**: 2 minutes

**Total: ~20 minutes to fully operational! 🚀**

---

## 🔐 Security Notes

- Never commit secrets to the repository
- Rotate tokens periodically
- Use GitHub Secrets for all credentials
- Test workflow only sends to rizel@block.xyz
- Production workflow sends to all subscribers

---

**Ready?** Start with Step 1 and you'll be live in 15 minutes! ⏰
