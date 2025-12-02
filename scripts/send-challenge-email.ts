/**
 * Script to send challenge notification emails to all subscribed users
 * 
 * Usage:
 *   npm run send -- --day=1
 *   npm run send:dry-run -- --day=1
 *   npx tsx scripts/send-challenge-email.ts --day=1
 *   npx tsx scripts/send-challenge-email.ts --day=1 --dry-run
 */

import sgMail from '@sendgrid/mail';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { fetchChallengeFromGitHub, parseChallengeMarkdown } from './fetch-challenge';

// Load environment variables
dotenv.config();

interface Signup {
  email: string;
  subscribed: number;
  created_at: string;
  id: number;
}

interface EmailTemplate {
  subject: string;
  html: string;
}

/**
 * Read email list from JSON file
 */
function readEmailList(): Signup[] {
  try {
    const jsonPath = join(process.cwd(), 'data', 'email-list.json');
    const content = readFileSync(jsonPath, 'utf-8');
    return JSON.parse(content);
  } catch (error: any) {
    console.error('❌ Failed to read email-list.json:', error.message);
    throw error;
  }
}

/**
 * Get subscribed emails from the list
 */
function getSubscribedEmails(signups: Signup[]): string[] {
  return signups
    .filter(s => s.subscribed === 1)
    .map(s => s.email);
}

/**
 * Get email statistics
 */
function getEmailStats(signups: Signup[]): { total: number; subscribed: number; unsubscribed: number } {
  const total = signups.length;
  const subscribed = signups.filter(s => s.subscribed === 1).length;
  return {
    total,
    subscribed,
    unsubscribed: total - subscribed
  };
}

/**
 * Generate email template from challenge content
 */
function generateEmailTemplate(day: number, title: string, greeting: string, description: string): EmailTemplate {
  const subject = day === 1 
    ? '🎄 Day 1 Challenge is Live - Advent of AI!' 
    : `🎄 Day ${day} Challenge Unlocked - Advent of AI!`;

  // Convert description paragraphs to HTML paragraphs
  const descriptionHtml = description
    .split('\n\n')
    .map(p => `<p style="margin: 12px 0; line-height: 1.6;">${p}</p>`)
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          line-height: 1.6; 
          color: #1f2937;
          background: #ffffff;
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 40px 20px; 
        }
        .header { 
          text-align: center; 
          margin-bottom: 40px; 
        }
        .snowflake {
          font-size: 24px;
          display: inline-block;
          margin: 0 4px;
        }
        .title {
          font-size: 42px;
          font-weight: bold;
          margin: 20px 0;
          background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .day-badge {
          display: inline-block;
          background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 24px;
          font-weight: bold;
          margin: 20px 0;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
        }
        .content { 
          background: #ffffff;
          padding: 40px; 
          border-radius: 16px; 
          border: 2px solid #e5e7eb;
        }
        .challenge-title {
          color: #06b6d4;
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }
        .greeting {
          color: #6b7280;
          font-size: 16px;
          margin: 0 0 24px 0;
          font-style: italic;
        }
        .section-header {
          color: #374151;
          font-size: 18px;
          font-weight: 600;
          margin: 24px 0 12px 0;
        }
        .challenge-description {
          color: #4b5563;
          font-size: 15px;
          line-height: 1.7;
          margin: 16px 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
          color: white !important;
          padding: 16px 40px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 18px;
          margin: 30px 0;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
        }
        .footer { 
          text-align: center; 
          margin-top: 40px; 
          color: #6b7280; 
          font-size: 14px; 
        }
        a {
          color: #06b6d4;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="snowflake">❄️ ❄️ ❄️</div>
          <h1 class="title">Advent of AI</h1>
          <div class="day-badge">Day ${day}</div>
        </div>
        
        <div class="content">
          <h2 class="challenge-title">${title}</h2>
          <p class="greeting">${greeting}</p>
          
          <h3 class="section-header">Today's Challenge:</h3>
          <div class="challenge-description">
            ${descriptionHtml}
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="https://adventofai.dev/challenges/${day}" class="cta-button">
              View Full Challenge →
            </a>
          </div>

          <p style="font-size: 15px; margin: 24px 0; color: #4b5563; line-height: 1.7;">
            Remember: Each challenge is designed to build your skills with goose and agentic workflows. Take your time, experiment, and learn!
          </p>

          <div style="background: #f0f9ff; border-left: 4px solid #06b6d4; padding: 20px; margin: 24px 0; border-radius: 8px;">
            <strong style="color: #06b6d4; font-size: 16px;">💡 Tips for Success:</strong>
            <ul style="margin: 12px 0; padding-left: 24px;">
              <li style="margin: 8px 0; color: #4b5563;">Read the challenge carefully before starting</li>
              <li style="margin: 8px 0; color: #4b5563;">Use the goose documentation when you get stuck</li>
              <li style="margin: 8px 0; color: #4b5563;">Share your progress in the Discord community</li>
              <li style="margin: 8px 0; color: #4b5563;">Have fun and experiment!</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>Happy coding! See you tomorrow for the next challenge! ❄️</p>
          <p style="margin-top: 20px; font-size: 12px;">
            You're receiving this because you signed up for <a href="https://adventofai.dev" style="color: #6b7280; text-decoration: none;">Advent of AI</a> challenge notifications.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

/**
 * Send notification emails
 */
async function sendNotifications(day: number, dryRun: boolean = false) {
  console.log(`\n🎄 Advent of AI - Email Sender`);
  console.log(`📅 Sending Day ${day} notifications...`);
  if (dryRun) {
    console.log(`🧪 DRY RUN MODE - No emails will be sent\n`);
  } else {
    console.log('');
  }

  // Check environment variables
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'noreply@adventofai.dev';

  if (!sendgridApiKey && !dryRun) {
    console.error('❌ SENDGRID_API_KEY not configured');
    process.exit(1);
  }

  if (!dryRun) {
    sgMail.setApiKey(sendgridApiKey!);
  }

  try {
    // Fetch challenge content from GitHub
    console.log('📡 Fetching challenge content from GitHub...');
    const markdown = await fetchChallengeFromGitHub(day);
    const { title, greeting, description } = parseChallengeMarkdown(markdown, day);
    console.log(`✅ Challenge content loaded: "${title}"`);

    // Read email list
    console.log('\n📋 Reading email list...');
    const signups = readEmailList();
    const emails = getSubscribedEmails(signups);
    const stats = getEmailStats(signups);

    console.log(`\n📊 Signup Statistics:`);
    console.log(`   Total signups: ${stats.total}`);
    console.log(`   Subscribed: ${stats.subscribed}`);
    console.log(`   Unsubscribed: ${stats.unsubscribed}`);
    console.log(`\n📤 Preparing to send to ${emails.length} recipients...\n`);

    if (emails.length === 0) {
      console.log('⚠️  No subscribed emails found. Exiting.');
      return;
    }

    // Generate email template
    const template = generateEmailTemplate(day, title, greeting, description);

    if (dryRun) {
      console.log('🧪 DRY RUN - Email preview:');
      console.log(`\n📧 Subject: ${template.subject}`);
      console.log(`📨 From: ${fromEmail}`);
      console.log(`👥 To: ${emails.length} recipients`);
      console.log(`\n✅ Dry run complete - no emails sent\n`);
      return;
    }

    // Send emails with rate limiting
    let sent = 0;
    let failed = 0;

    for (const email of emails) {
      try {
        await sgMail.send({
          to: email,
          from: fromEmail,
          subject: template.subject,
          html: template.html,
        });
        
        sent++;
        console.log(`✅ Sent to ${email} (${sent}/${emails.length})`);

        // Rate limiting: wait 100ms between emails
        if (sent < emails.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error: any) {
        failed++;
        console.error(`❌ Failed to send to ${email}:`, error.message);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successfully sent: ${sent}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📧 Total: ${emails.length}`);
    console.log('\n✅ Done!\n');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dayArg = args.find(arg => arg.startsWith('--day='));
const dryRun = args.includes('--dry-run');

if (!dayArg) {
  console.error('❌ Missing --day argument');
  console.log('Usage: npx tsx scripts/send-challenge-email.ts --day=1 [--dry-run]');
  process.exit(1);
}

const day = parseInt(dayArg.split('=')[1]);

if (isNaN(day) || day < 1 || day > 17) {
  console.error('❌ Invalid day number. Must be between 1 and 17');
  process.exit(1);
}

// Run the script
sendNotifications(day, dryRun)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
