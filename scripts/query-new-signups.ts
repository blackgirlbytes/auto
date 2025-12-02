import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

interface EmailListData {
  emails: string[];
  lastUpdated: string | null;
  metadata: {
    totalSubscribers: number;
    lastSyncDate: string | null;
  };
}

interface Signup {
  email: string;
  created_at: Date;
}

/**
 * Query new signups from Railway PostgreSQL database
 * and update the local email list
 */
async function queryNewSignups(): Promise<void> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('Connecting to database...');
    
    // Load existing email list
    const emailListPath = path.join(__dirname, '../data/email-list.json');
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

    // Query for new signups
    // Adjust table and column names based on your actual schema
    const query = `
      SELECT email, created_at 
      FROM signups 
      WHERE email IS NOT NULL 
      AND email != ''
      ORDER BY created_at DESC
    `;

    console.log('Fetching signups from database...');
    const result = await pool.query<Signup>(query);
    
    console.log(`Found ${result.rows.length} total signups in database`);

    // Get unique emails
    const existingEmails = new Set(emailListData.emails);
    const newEmails: string[] = [];

    for (const row of result.rows) {
      const email = row.email.trim().toLowerCase();
      if (email && !existingEmails.has(email)) {
        newEmails.push(email);
        existingEmails.add(email);
      }
    }

    console.log(`Found ${newEmails.length} new email(s)`);

    if (newEmails.length > 0) {
      // Update email list
      emailListData.emails = Array.from(existingEmails);
      emailListData.lastUpdated = new Date().toISOString();
      emailListData.metadata.totalSubscribers = emailListData.emails.length;
      emailListData.metadata.lastSyncDate = new Date().toISOString();

      // Save updated list
      fs.writeFileSync(
        emailListPath,
        JSON.stringify(emailListData, null, 2),
        'utf-8'
      );

      console.log('✅ Email list updated successfully');
      console.log(`Total subscribers: ${emailListData.metadata.totalSubscribers}`);
      console.log('New emails:', newEmails);
    } else {
      console.log('No new emails to add');
    }

  } catch (error) {
    console.error('Error querying signups:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  queryNewSignups()
    .then(() => {
      console.log('Signup query completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to query signups:', error);
      process.exit(1);
    });
}

export { queryNewSignups };
