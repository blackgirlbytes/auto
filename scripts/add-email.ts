import * as fs from 'fs';
import * as path from 'path';

interface EmailListData {
  emails: string[];
  lastUpdated: string | null;
  metadata: {
    totalSubscribers: number;
    lastSyncDate: string | null;
  };
}

/**
 * Add one or more emails to the email list
 * Usage: npm run add-email -- email1@example.com email2@example.com
 */
function addEmails(newEmails: string[]): void {
  const emailListPath = path.join(__dirname, '../data/email-list.json');
  
  // Load existing email list
  let emailListData: EmailListData = {
    emails: [],
    lastUpdated: null,
    metadata: {
      totalSubscribers: 0,
      lastSyncDate: null,
    },
  };

  if (fs.existsSync(emailListPath)) {
    const fileContent = fs.readFileSync(emailListPath, 'utf-8');
    emailListData = JSON.parse(fileContent);
  }

  // Validate and normalize emails
  const existingEmails = new Set(emailListData.emails.map(e => e.toLowerCase()));
  const addedEmails: string[] = [];
  const skippedEmails: string[] = [];
  const invalidEmails: string[] = [];

  for (const email of newEmails) {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      invalidEmails.push(email);
      continue;
    }

    if (existingEmails.has(normalizedEmail)) {
      skippedEmails.push(normalizedEmail);
    } else {
      emailListData.emails.push(normalizedEmail);
      existingEmails.add(normalizedEmail);
      addedEmails.push(normalizedEmail);
    }
  }

  // Update metadata
  emailListData.lastUpdated = new Date().toISOString();
  emailListData.metadata.totalSubscribers = emailListData.emails.length;
  emailListData.metadata.lastSyncDate = new Date().toISOString();

  // Save updated list
  fs.writeFileSync(
    emailListPath,
    JSON.stringify(emailListData, null, 2),
    'utf-8'
  );

  // Print summary
  console.log('\n📧 Email List Update Summary');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Added: ${addedEmails.length} email(s)`);
  if (addedEmails.length > 0) {
    addedEmails.forEach(email => console.log(`   - ${email}`));
  }
  
  if (skippedEmails.length > 0) {
    console.log(`\n⏭️  Skipped (already exists): ${skippedEmails.length}`);
    skippedEmails.forEach(email => console.log(`   - ${email}`));
  }
  
  if (invalidEmails.length > 0) {
    console.log(`\n❌ Invalid: ${invalidEmails.length}`);
    invalidEmails.forEach(email => console.log(`   - ${email}`));
  }
  
  console.log(`\n📊 Total Subscribers: ${emailListData.metadata.totalSubscribers}`);
  console.log('═══════════════════════════════════════\n');
}

/**
 * Remove one or more emails from the email list
 */
function removeEmails(emailsToRemove: string[]): void {
  const emailListPath = path.join(__dirname, '../data/email-list.json');
  
  if (!fs.existsSync(emailListPath)) {
    console.error('❌ Email list not found');
    return;
  }

  const fileContent = fs.readFileSync(emailListPath, 'utf-8');
  const emailListData: EmailListData = JSON.parse(fileContent);

  const normalizedToRemove = emailsToRemove.map(e => e.trim().toLowerCase());
  const originalCount = emailListData.emails.length;
  
  emailListData.emails = emailListData.emails.filter(
    email => !normalizedToRemove.includes(email.toLowerCase())
  );

  const removedCount = originalCount - emailListData.emails.length;

  // Update metadata
  emailListData.lastUpdated = new Date().toISOString();
  emailListData.metadata.totalSubscribers = emailListData.emails.length;
  emailListData.metadata.lastSyncDate = new Date().toISOString();

  // Save updated list
  fs.writeFileSync(
    emailListPath,
    JSON.stringify(emailListData, null, 2),
    'utf-8'
  );

  console.log(`\n✅ Removed ${removedCount} email(s)`);
  console.log(`📊 Total Subscribers: ${emailListData.metadata.totalSubscribers}\n`);
}

/**
 * List all emails in the email list
 */
function listEmails(): void {
  const emailListPath = path.join(__dirname, '../data/email-list.json');
  
  if (!fs.existsSync(emailListPath)) {
    console.error('❌ Email list not found');
    return;
  }

  const fileContent = fs.readFileSync(emailListPath, 'utf-8');
  const emailListData: EmailListData = JSON.parse(fileContent);

  console.log('\n📧 Email List');
  console.log('═══════════════════════════════════════');
  console.log(`Total Subscribers: ${emailListData.metadata.totalSubscribers}`);
  console.log(`Last Updated: ${emailListData.lastUpdated || 'Never'}`);
  console.log('\nEmails:');
  emailListData.emails.forEach((email, index) => {
    console.log(`${(index + 1).toString().padStart(3)}. ${email}`);
  });
  console.log('═══════════════════════════════════════\n');
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
📧 Email List Management Tool

Usage:
  npm run add-email -- email1@example.com email2@example.com
  npm run add-email -- --list
  npm run add-email -- --remove email@example.com

Options:
  --list, -l        List all emails
  --remove, -r      Remove emails
  --help, -h        Show this help message

Examples:
  # Add single email
  npm run add-email -- user@example.com

  # Add multiple emails
  npm run add-email -- user1@example.com user2@example.com

  # List all emails
  npm run add-email -- --list

  # Remove email
  npm run add-email -- --remove user@example.com
    `);
    process.exit(0);
  }

  if (args.includes('--list') || args.includes('-l')) {
    listEmails();
  } else if (args.includes('--remove') || args.includes('-r')) {
    const removeIndex = args.findIndex(arg => arg === '--remove' || arg === '-r');
    const emailsToRemove = args.slice(removeIndex + 1);
    
    if (emailsToRemove.length === 0) {
      console.error('❌ Please specify emails to remove');
      process.exit(1);
    }
    
    removeEmails(emailsToRemove);
  } else {
    // Add emails
    addEmails(args);
  }
}

export { addEmails, removeEmails, listEmails };
