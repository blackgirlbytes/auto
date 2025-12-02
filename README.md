# Advent of AI - Email Automation System

Automated email delivery system for the Advent of AI daily challenges. This system fetches challenge content from the `frosty-agent-forge` repository and sends beautifully formatted emails to subscribers.

## 🎯 Features

- **Automated Daily Emails**: Sends challenge emails every day at 9:00 AM UTC during December 1-25
- **Simple Email Management**: JSON-based email list - no database required!
- **Manual Triggers**: Send emails on-demand with test mode support
- **Beautiful Email Templates**: Responsive HTML emails with gradient styling
- **Challenge Content Fetching**: Automatically pulls markdown from GitHub repository
- **Easy Subscriber Management**: Add/remove emails with simple CLI commands

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
│   ├── add-email.ts                     # Add/remove/list emails
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
   REPLY_TO_EMAIL=support@adventofai.com
   UNSUBSCRIBE_URL=https://adventofai.com/unsubscribe
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
   - `GITHUB_REPO_OWNER`
   - `GITHUB_REPO_NAME`
   - `GH_TOKEN` (optional, for private repos)

## 📧 Usage

### Local Testing

**Add emails to subscriber list:**
```bash
# Add single email
npm run add-email -- user@example.com

# Add multiple emails
npm run add-email -- user1@example.com user2@example.com user3@example.com

# List all emails
npm run add-email -- --list

# Remove an email
npm run add-email -- --remove user@example.com
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
- Fetches the current day's challenge from GitHub
- Sends emails to all subscribers in the email list

#### Manual Email Send

Trigger manually from GitHub Actions tab:

1. Go to **Actions** → **Manual Email Send**
2. Click **Run workflow**
3. Configure options:
   - **day**: Challenge day (1-25)
   - **test_mode**: Enable to send to test email only
   - **test_email**: Email address for test mode

**Example Use Cases:**

- **Test a challenge email:**
  - day: `1`
  - test_mode: `true`
  - test_email: `your@email.com`

- **Send catch-up email:**
  - day: `3`
  - test_mode: `false`

## 📋 Email List Management

The email list is stored in `data/email-list.json` with this structure:

```json
{
  "emails": [
    "user1@example.com",
    "user2@example.com"
  ],
  "lastUpdated": "2024-12-02T12:00:00.000Z",
  "metadata": {
    "totalSubscribers": 2,
    "lastSyncDate": "2024-12-02T12:00:00.000Z"
  }
}
```

### Managing Subscribers

**Add emails:**
```bash
npm run add-email -- new@example.com
```

**Remove emails:**
```bash
npm run add-email -- --remove old@example.com
```

**List all subscribers:**
```bash
npm run add-email -- --list
```

**Bulk import from CSV:**
You can also manually edit `data/email-list.json` to add multiple emails at once.

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
