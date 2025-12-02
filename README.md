# Advent of AI - Email Automation

Automated email system for sending daily Advent of AI challenges.

## Structure

```
advent-of-ai-emails/
├── .github/
│   └── workflows/
│       └── daily-challenge-email.yml    # Main daily automation
├── data/
│   └── email-list.json                  # Master email list
├── scripts/
│   ├── query-new-signups.ts             # Fetch new signups from Railway
│   ├── send-challenge-email.ts          # Send emails with challenge content
│   └── fetch-challenge.ts               # Fetch markdown from frosty-agent-forge
├── .env.example
├── package.json
└── README.md
```

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials
2. Install dependencies: `npm install`
3. Configure GitHub Actions secrets

## Features

- Queries Railway database for new signups
- Stores email list in JSON format
- Fetches challenge content from frosty-agent-forge repository
- Sends daily challenge emails automatically
