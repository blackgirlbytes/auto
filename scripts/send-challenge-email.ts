import sgMail from '@sendgrid/mail';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fetchChallenge, getCurrentAdventDay } from './fetch-challenge';

dotenv.config();

interface EmailListData {
  emails: string[];
  lastUpdated: string | null;
  metadata: {
    totalSubscribers: number;
    lastSyncDate: string | null;
  };
}

/**
 * Initialize SendGrid with API key
 */
function initializeSendGrid(): void {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY environment variable is required');
  }
  sgMail.setApiKey(apiKey);
}

/**
 * Load email list from JSON file
 */
function loadEmailList(): string[] {
  const emailListPath = path.join(__dirname, '../data/email-list.json');
  
  if (!fs.existsSync(emailListPath)) {
    throw new Error(`Email list not found at ${emailListPath}`);
  }

  const fileContent = fs.readFileSync(emailListPath, 'utf-8');
  const emailListData: EmailListData = JSON.parse(fileContent);

  if (!emailListData.emails || emailListData.emails.length === 0) {
    throw new Error('No emails found in email list');
  }

  return emailListData.emails;
}

/**
 * Create HTML email template
 */
function createEmailHTML(title: string, content: string, day: number): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
    }
    .day-badge {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    h1 {
      color: #2c3e50;
      margin: 10px 0;
      font-size: 28px;
    }
    h2 {
      color: #34495e;
      margin-top: 25px;
      font-size: 22px;
    }
    h3 {
      color: #546e7a;
      margin-top: 20px;
      font-size: 18px;
    }
    p {
      margin: 15px 0;
    }
    code {
      background-color: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
    }
    pre {
      background-color: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      border-left: 4px solid #667eea;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    a {
      color: #667eea;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      font-size: 12px;
      color: #777;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      padding: 12px 30px;
      border-radius: 25px;
      text-decoration: none;
      font-weight: bold;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="day-badge">Day ${day}</div>
      <h1>${title}</h1>
    </div>
    
    <div class="content">
      ${content}
    </div>
    
    <div class="footer">
      <p>You're receiving this email because you signed up for Advent of AI.</p>
      <p>
        <a href="${process.env.UNSUBSCRIBE_URL || '#'}">Unsubscribe</a> | 
        <a href="${process.env.REPLY_TO_EMAIL || 'support@adventofai.com'}">Contact Us</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send challenge email to all subscribers
 */
async function sendChallengeEmail(day?: number, testEmail?: string): Promise<void> {
  console.log('🚀 Starting email send process...');

  // Initialize SendGrid
  initializeSendGrid();

  // Determine which day to send
  const challengeDay = day || getCurrentAdventDay();
  console.log(`Sending challenge for day ${challengeDay}`);

  // Fetch challenge content
  console.log('Fetching challenge content...');
  const challenge = await fetchChallenge(challengeDay);

  // Load email list or use test email
  let recipients: string[];
  if (testEmail) {
    recipients = [testEmail];
    console.log(`📧 Test mode: Sending to ${testEmail}`);
  } else {
    recipients = loadEmailList();
    console.log(`📧 Loaded ${recipients.length} recipients`);
  }

  // Create email content
  const htmlContent = createEmailHTML(challenge.title, challenge.htmlContent, challenge.day);
  const subject = `Day ${challengeDay}: ${challenge.title} - Advent of AI`;

  // Prepare email
  const msg = {
    to: recipients,
    from: {
      email: process.env.FROM_EMAIL || 'noreply@adventofai.com',
      name: process.env.FROM_NAME || 'Advent of AI',
    },
    replyTo: process.env.REPLY_TO_EMAIL || 'support@adventofai.com',
    subject: subject,
    html: htmlContent,
    text: challenge.markdown, // Plain text fallback
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
    },
  };

  try {
    console.log('Sending emails...');
    await sgMail.send(msg);
    console.log(`✅ Successfully sent ${recipients.length} email(s)`);
    console.log(`Subject: ${subject}`);
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const testMode = args.includes('--test');
  const dayArg = args.find(arg => arg.startsWith('--day='));
  const emailArg = args.find(arg => arg.startsWith('--email='));

  const day = dayArg ? parseInt(dayArg.split('=')[1], 10) : undefined;
  const testEmail = emailArg ? emailArg.split('=')[1] : 
                    (testMode ? process.env.TEST_EMAIL : undefined);

  if (testMode && !testEmail) {
    console.error('Test mode requires --email=your@email.com or TEST_EMAIL env variable');
    process.exit(1);
  }

  sendChallengeEmail(day, testEmail)
    .then(() => {
      console.log('✨ Email send completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to send emails:', error.message);
      process.exit(1);
    });
}

export { sendChallengeEmail };
