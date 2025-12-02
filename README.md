# Advent of AI - Email Automation System

Automated email delivery system for the Advent of AI daily challenges. This system fetches challenge content from the `frosty-agent-forge` repository and sends beautifully formatted emails to subscribers.

## 🎯 Features

- **Automated Daily Emails**: Sends challenge emails every day at 9:00 AM UTC during December 1-25
- **Database Integration**: Syncs new signups from Railway PostgreSQL database
- **Manual Triggers**: Send emails on-demand with test mode support
- **Beautiful Email Templates**: Responsive HTML emails with gradient styling
- **Challenge Content Fetching**: Automatically pulls markdown from GitHub repository
- **Subscriber Management**: JSON-based email list with metadata tracking

## 📁 Project Structure

```
advent-of-ai-emails/
├── .github/
│   └── workflows/
│       ├── daily-challenge-email.yml    # Automated daily sends
│       └── manual-send.yml              # Manual trigger workflow
├── data/
│   └── email-list.json                  # Subscriber email list
├── scripts/
│   ├── query-new-signups.ts             # Sync signups from Railway
│   ├── send-challenge-email.ts          # Email sending logic
│   └── fetch-challenge.ts               # Fetch challenge content
├── .env.example                         # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Setup

### Prerequisites

- Node.js 20+
- npm or yarn
- SendGrid account with API key
- Railway PostgreSQL database (for signup syncing)
- GitHub repository with challenge content

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd advent-of-ai-emails
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your actual values:
   ```env
   SENDGRID_API_KEY=your_sendgrid_api_key
   FROM_EMAIL=noreply@adventofai.com
   FROM_NAME=Advent of AI
   DATABASE_URL=postgresql://user:password@host:port/database
   GITHUB_REPO_OWNER=your-username
   GITHUB_REPO_NAME=frosty-agent-forge
   ```

4. **Set up GitHub Secrets**
   
   Go to your repository Settings → Secrets and variables → Actions, and add:
   - `SENDGRID_API_KEY`
   - `FROM_EMAIL`
   - `FROM_NAME`
   - `REPLY_TO_EMAIL`
   - `UNSUBSCRIBE_URL`
   - `DATABASE_URL`
   - `GITHUB_REPO_OWNER`
   - `GITHUB_REPO_NAME`
   - `GH_TOKEN` (optional, for private repos)

## 📧 Usage

### Local Testing

**Query new signups:**
```bash
npm run query-signups
```

**Fetch a specific challenge:**
```bash
npm run fetch-challenge -- 5  # Fetch day 5
```

**Send test email:**
```bash
npm run send-challenge -- --test --email=your@email.com --day=1
```

**Send to all subscribers:**
```bash
npm run send-challenge -- --day=1
```

### GitHub Actions

#### Automated Daily Emails

The workflow runs automatically at 9:00 AM UTC every day in December:
- Syncs new signups from database
- Fetches the current day's challenge
- Sends emails to all subscribers

#### Manual Email Send

Trigger manually from GitHub Actions tab:

1. Go to **Actions** → **Manual Email Send**
2. Click **Run workflow**
3. Configure options:
   - **day**: Challenge day (1-25)
   - **test_mode**: Enable to send to test email only
   - **test_email**: Email address for test mode
   - **sync_signups**: Sync new signups before sending

**Example Use Cases:**

- **Test a challenge email:**
  - day: `1`
  - test_mode: `true`
  - test_email: `your@email.com`

- **Send catch-up email:**
  - day: `3`
  - test_mode: `false`
  - sync_signups: `true`

- **Resend without syncing:**
  - day: `5`
  - test_mode: `false`
  - sync_signups: `false`

## 🗄️ Database Schema

The system expects a PostgreSQL table with at least:

```sql
CREATE TABLE signups (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Adjust the query in `scripts/query-new-signups.ts` if your schema differs.

## 📝 Challenge Content Format

Challenges should be stored in your `frosty-agent-forge` repository as:

```
challenges/
├── day-01.md
├── day-02.md
├── day-03.md
...
└── day-25.md
```

Each markdown file should start with a title:

```markdown
# Challenge Title

Challenge description and content here...

## Section 1

Content...
```

## 🎨 Email Template

The system generates responsive HTML emails with:
- Gradient header with day badge
- Formatted markdown content
- Code syntax highlighting
- Mobile-friendly design
- Unsubscribe and contact links

## 🔧 Customization

### Email Styling

Edit the HTML template in `scripts/send-challenge-email.ts` → `createEmailHTML()` function.

### Challenge Path

Update the file path pattern in `scripts/fetch-challenge.ts`:

```typescript
const filePath = `challenges/day-${day.toString().padStart(2, '0')}.md`;
```

### Schedule

Modify the cron expression in `.github/workflows/daily-challenge-email.yml`:

```yaml
schedule:
  - cron: '0 9 * 12 *'  # 9 AM UTC in December
```

## 🐛 Troubleshooting

### Emails not sending

1. Verify SendGrid API key is valid
2. Check sender email is verified in SendGrid
3. Review GitHub Actions logs for errors
4. Test locally with `--test` flag

### Database connection issues

1. Verify `DATABASE_URL` is correct
2. Check Railway database is accessible
3. Ensure SSL settings match your environment

### Challenge not found

1. Verify repository and file path are correct
2. Check GitHub token if using private repo
3. Ensure challenge file exists for the specified day

## 📊 Monitoring

- **GitHub Actions**: View workflow runs in the Actions tab
- **SendGrid Dashboard**: Track email delivery and opens
- **Email List**: Check `data/email-list.json` for subscriber count

## 🔐 Security Notes

- Never commit `.env` file
- Use GitHub Secrets for sensitive data
- Rotate API keys regularly
- Monitor SendGrid usage to prevent abuse

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Contact: support@adventofai.com

---

**Built with ❤️ for Advent of AI**
