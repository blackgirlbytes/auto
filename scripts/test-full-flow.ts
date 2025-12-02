/**
 * Test script for full email automation flow
 * 
 * This script will:
 * 1. Query Railway for new signups
 * 2. Update email-list.json with new signups
 * 3. Fetch challenge content from GitHub
 * 4. Send email ONLY to rizel@block.xyz for testing
 * 
 * Usage:
 *   npx tsx scripts/test-full-flow.ts --day=1
 */

import sgMail from '@sendgrid/mail';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
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

const TEST_EMAIL = 'rizel@block.xyz';

/**
 * Step 1: Query Railway for new signups
 */
function queryRailwaySignups(): Signup[] {
  try {
    console.log('\n📡 Step 1: Querying Railway for signups...');
    console.log('━'.repeat(50));
    
    // Build command with optional project/service/environment flags
    const projectId = process.env.RAILWAY_PROJECT_ID;
    const serviceId = process.env.RAILWAY_SERVICE_ID || process.env.RAILWAY_SERVICE;
    const environment = process.env.RAILWAY_ENVIRONMENT || 'production';
    const token = process.env.RAILWAY_TOKEN;
    
    console.log('🔍 Railway Configuration:');
    console.log(`   Token: ${token ? '✅ Set (' + token.length + ' chars)' : '❌ Not set'}`);
    console.log(`   Project ID: ${projectId || '⚠️  Not set'}`);
    console.log(`   Service ID: ${serviceId || '⚠️  Not set'}`);
    console.log(`   Environment: ${environment}`);
    console.log('━'.repeat(50));
    
    if (!token) {
      console.warn('⚠️  RAILWAY_TOKEN not set, skipping Railway query');
      return [];
    }
    
    if (!projectId) {
      console.warn('⚠️  WARNING: RAILWAY_PROJECT_ID not set. Railway CLI may fail to find your project.');
    }
    
    let railwayCmd = 'railway ssh';
    if (projectId) railwayCmd += ` --project ${projectId}`;
    if (serviceId) railwayCmd += ` --service ${serviceId}`;
    railwayCmd += ` --environment ${environment}`;
    
    const command = `${railwayCmd} "node -e \\"const db = require('better-sqlite3')('./data/signups.db'); const all = db.prepare('SELECT * FROM signups ORDER BY created_at DESC').all(); console.log(JSON.stringify(all)); db.close();\\""`;
    
    console.log('\n📡 Executing Railway SSH command...');
    console.log(`   Command: ${railwayCmd} "node -e ..."`);
    console.log('');
    
    const output = execSync(command, { 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Parse the output - Railway may include extra text, so find the JSON array
    const lines = output.trim().split('\n');
    let jsonOutput = '';
    
    // Look for the JSON array in the output
    for (const line of lines) {
      if (line.trim().startsWith('[')) {
        jsonOutput = line.trim();
        break;
      }
    }
    
    if (!jsonOutput) {
      throw new Error('Could not find JSON output from Railway');
    }
    
    const signups = JSON.parse(jsonOutput);
    console.log(`✅ Fetched ${signups.length} total signups from Railway`);
    
    return signups;
  } catch (error: any) {
    console.error('❌ Failed to fetch from Railway:', error.message);
    console.log('⚠️  Continuing with existing email list...');
    return [];
  }
}

/**
 * Step 2: Update email list with new signups
 */
function updateEmailList(railwaySignups: Signup[]): { updated: boolean; newCount: number; total: number } {
  try {
    console.log('\n📋 Step 2: Updating email list...');
    
    const jsonPath = join(process.cwd(), 'data', 'email-list.json');
    const existingSignups = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    
    console.log(`   Current list: ${existingSignups.length} signups`);
    
    if (railwaySignups.length === 0) {
      console.log('   No Railway data to merge');
      return { updated: false, newCount: 0, total: existingSignups.length };
    }
    
    // Find new signups
    const existingEmails = new Set(existingSignups.map((s: Signup) => s.email.toLowerCase()));
    const newSignups: Signup[] = [];
    
    for (const signup of railwaySignups) {
      if (!existingEmails.has(signup.email.toLowerCase())) {
        newSignups.push(signup);
      }
    }
    
    if (newSignups.length > 0) {
      console.log(`\n✨ Found ${newSignups.length} new signup(s):`);
      newSignups.forEach(s => {
        console.log(`   - ${s.email} (ID: ${s.id})`);
      });
      
      // Merge and sort
      const merged = [...existingSignups, ...newSignups].sort((a, b) => a.id - b.id);
      
      // Write updated list
      writeFileSync(jsonPath, JSON.stringify(merged, null, 2), 'utf-8');
      console.log('✅ Email list updated');
      
      return { updated: true, newCount: newSignups.length, total: merged.length };
    } else {
      console.log('✅ No new signups found');
      return { updated: false, newCount: 0, total: existingSignups.length };
    }
  } catch (error: any) {
    console.error('❌ Failed to update email list:', error.message);
    throw error;
  }
}

/**
 * Generate email template
 */
function generateEmailTemplate(day: number, title: string, greeting: string, description: string): EmailTemplate {
  const subject = `🧪 TEST - Day ${day} Challenge - Advent of AI`;

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
        .test-banner {
          background: #fef3c7;
          border: 2px solid #f59e0b;
          padding: 16px;
          text-align: center;
          font-weight: bold;
          color: #92400e;
          margin-bottom: 20px;
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
        <div class="test-banner">
          🧪 TEST EMAIL - This is a test of the email automation system
        </div>
        
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
            🧪 <strong>This is a test email sent only to rizel@block.xyz</strong><br>
            In production, this would be sent to all subscribed users.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

/**
 * Step 3: Fetch challenge and send test email
 */
async function sendTestEmail(day: number) {
  console.log('\n📧 Step 3: Preparing test email...');
  
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'noreply@adventofai.dev';

  if (!sendgridApiKey) {
    console.error('❌ SENDGRID_API_KEY not configured');
    process.exit(1);
  }

  sgMail.setApiKey(sendgridApiKey);

  try {
    // Fetch challenge content
    console.log('   Fetching challenge content from GitHub...');
    const markdown = await fetchChallengeFromGitHub(day);
    const { title, greeting, description } = parseChallengeMarkdown(markdown, day);
    console.log(`   ✅ Challenge loaded: "${title}"`);

    // Generate email
    const template = generateEmailTemplate(day, title, greeting, description);

    // Send to test email only
    console.log(`\n📤 Sending test email to ${TEST_EMAIL}...`);
    
    await sgMail.send({
      to: TEST_EMAIL,
      from: fromEmail,
      subject: template.subject,
      html: template.html,
    });
    
    console.log(`✅ Test email sent successfully!`);
    console.log(`\n📬 Check your inbox at ${TEST_EMAIL}`);
  } catch (error: any) {
    console.error('❌ Failed to send test email:', error.message);
    throw error;
  }
}

/**
 * Main test flow
 */
async function runTestFlow(day: number) {
  console.log('\n🎄 Advent of AI - Full Flow Test');
  console.log('═'.repeat(50));
  console.log(`📅 Testing Day ${day} automation`);
  console.log(`📧 Test email will be sent to: ${TEST_EMAIL}`);
  console.log('═'.repeat(50));

  try {
    // Step 1: Query Railway (optional, continues if fails)
    const railwaySignups = queryRailwaySignups();
    
    // Step 2: Update email list
    const { updated, newCount, total } = updateEmailList(railwaySignups);
    
    if (updated) {
      console.log(`\n📊 Email list updated:`);
      console.log(`   New signups: ${newCount}`);
      console.log(`   Total signups: ${total}`);
    } else {
      console.log(`\n📊 Email list status:`);
      console.log(`   Total signups: ${total}`);
    }
    
    // Step 3: Send test email
    await sendTestEmail(day);
    
    console.log('\n' + '═'.repeat(50));
    console.log('✅ TEST COMPLETE!');
    console.log('═'.repeat(50));
    console.log('\n📋 Summary:');
    console.log(`   ✅ Railway query: ${railwaySignups.length > 0 ? 'Success' : 'Skipped'}`);
    console.log(`   ✅ Email list: ${updated ? `Updated (+${newCount})` : 'No changes'}`);
    console.log(`   ✅ Test email: Sent to ${TEST_EMAIL}`);
    console.log(`   📧 Total subscribers: ${total}`);
    
    if (updated) {
      console.log('\n⚠️  Note: Email list was updated. You may want to commit these changes:');
      console.log('   git add data/email-list.json');
      console.log(`   git commit -m "Add ${newCount} new signup(s) from test run"`);
      console.log('   git push');
    }
    
    console.log('\n🎉 Check your email at rizel@block.xyz!\n');
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dayArg = args.find(arg => arg.startsWith('--day='));

if (!dayArg) {
  console.error('❌ Missing --day argument');
  console.log('Usage: npx tsx scripts/test-full-flow.ts --day=1');
  process.exit(1);
}

const day = parseInt(dayArg.split('=')[1]);

if (isNaN(day) || day < 1 || day > 17) {
  console.error('❌ Invalid day number. Must be between 1 and 17');
  process.exit(1);
}

// Run the test
runTestFlow(day)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
