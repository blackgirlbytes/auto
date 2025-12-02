# Changelog

## [Latest] - 2024-12-02

### Fixed
- **Railway Command**: Changed from `railway run` to `railway ssh` for database queries
  - Updated `test-full-flow.ts` with correct command
  - Updated `query-new-signups.ts` with correct command
  - Added JSON parsing logic to handle Railway output
  - Fixes: "Command failed: railway run..." error

### Added
- **Test Workflow**: New GitHub Actions workflow for safe testing
  - Sends email ONLY to rizel@block.xyz
  - Queries Railway and updates email list
  - Auto-commits changes
  - File: `.github/workflows/test-email-flow.yml`

- **Test Script**: Complete end-to-end test script
  - File: `scripts/test-full-flow.ts`
  - Queries Railway database
  - Updates email-list.json
  - Fetches challenge from GitHub
  - Sends test email to rizel@block.xyz only

- **Documentation**: Comprehensive guides
  - `TEST_GUIDE.md` - Testing instructions
  - `WORKFLOWS.md` - Workflow comparison
  - `FINAL_SUMMARY.md` - Quick reference

### Changed
- **README.md**: Added test workflow documentation
- **package.json**: Added `test-flow` script

## [Initial Release] - 2024-12-02

### Added
- **Production Workflow**: Automated daily email sending
  - File: `.github/workflows/daily-challenge-email.yml`
  - Scheduled for 12:30 PM ET on challenge days
  - Manual trigger with dry-run option
  - Auto-commits email list updates

- **Core Scripts**:
  - `query-new-signups.ts` - Railway database sync
  - `fetch-challenge.ts` - GitHub markdown fetcher
  - `send-challenge-email.ts` - Email sender

- **Documentation**:
  - `README.md` - Complete project documentation
  - `SETUP_INSTRUCTIONS.md` - Setup guide
  - `SUMMARY.md` - Project overview

- **Data**:
  - `email-list.json` - 86 initial subscribers

### Features
- Beautiful HTML email templates
- Rate limiting (100ms between emails)
- Error handling with issue creation
- Dry-run mode for testing
- Automatic Railway sync
- Challenge content from frosty-agent-forge repo

---

## Railway Command Reference

### Correct Command (Current)
```bash
railway ssh "node -e \"const db = require('better-sqlite3')('./data/signups.db'); const all = db.prepare('SELECT * FROM signups ORDER BY created_at DESC').all(); console.log(JSON.stringify(all)); db.close();\""
```

### Old Command (Deprecated)
```bash
railway run node -e "const db = require('better-sqlite3')('./data/signups.db'); const all = db.prepare('SELECT * FROM signups ORDER BY created_at DESC').all(); console.log(JSON.stringify(all)); db.close();"
```

**Why the change?**
- `railway ssh` executes commands in the deployed environment
- `railway run` is for running services, not one-off commands
- SSH approach is more reliable for database queries

---

## Testing Status

- ✅ Railway command fixed
- ✅ Test workflow created
- ✅ Documentation complete
- ⏳ Awaiting GitHub Secrets configuration
- ⏳ Awaiting first test run

## Next Steps

1. Configure GitHub Secrets:
   - `SENDGRID_API_KEY`
   - `FROM_EMAIL`
   - `RAILWAY_TOKEN`

2. Run test workflow:
   - Actions → "Test Email Flow"
   - day=1
   - Check rizel@block.xyz inbox

3. Verify and go live!
