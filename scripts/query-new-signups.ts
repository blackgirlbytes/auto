/**
 * Script to query Railway database for new signups and update email-list.json
 * 
 * Usage:
 *   npm run query-signups
 *   or
 *   npx tsx scripts/query-new-signups.ts
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface Signup {
  email: string;
  subscribed: number;
  created_at: string;
  id: number;
}

/**
 * Fetch all signups from Railway database
 */
function fetchSignupsFromRailway(): Signup[] {
  try {
    console.log('📡 Fetching signups from Railway database...');
    
    const command = `railway run node -e "const db = require('better-sqlite3')('./data/signups.db'); const all = db.prepare('SELECT * FROM signups ORDER BY created_at DESC').all(); console.log(JSON.stringify(all)); db.close();"`;
    
    const output = execSync(command, { 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Parse the JSON output
    const signups = JSON.parse(output.trim());
    console.log(`✅ Fetched ${signups.length} total signups from Railway`);
    
    return signups;
  } catch (error: any) {
    console.error('❌ Failed to fetch signups from Railway:', error.message);
    throw error;
  }
}

/**
 * Read existing email list from JSON file
 */
function readEmailList(): Signup[] {
  try {
    const jsonPath = join(process.cwd(), 'data', 'email-list.json');
    const content = readFileSync(jsonPath, 'utf-8');
    return JSON.parse(content);
  } catch (error: any) {
    console.error('❌ Failed to read email-list.json:', error.message);
    return [];
  }
}

/**
 * Write updated email list to JSON file
 */
function writeEmailList(signups: Signup[]): void {
  try {
    const jsonPath = join(process.cwd(), 'data', 'email-list.json');
    const content = JSON.stringify(signups, null, 2);
    writeFileSync(jsonPath, content, 'utf-8');
    console.log('✅ Updated email-list.json');
  } catch (error: any) {
    console.error('❌ Failed to write email-list.json:', error.message);
    throw error;
  }
}

/**
 * Compare and merge signups
 */
function mergeSignups(existing: Signup[], railway: Signup[]): { merged: Signup[]; newCount: number } {
  const existingEmails = new Set(existing.map(s => s.email.toLowerCase()));
  const newSignups: Signup[] = [];
  
  // Find new signups from Railway that aren't in existing list
  for (const signup of railway) {
    if (!existingEmails.has(signup.email.toLowerCase())) {
      newSignups.push(signup);
    }
  }
  
  // Merge: existing + new signups, sorted by ID
  const merged = [...existing, ...newSignups].sort((a, b) => a.id - b.id);
  
  return { merged, newCount: newSignups.length };
}

/**
 * Commit and push changes to GitHub
 */
function commitAndPush(newCount: number): void {
  try {
    if (newCount === 0) {
      console.log('ℹ️  No changes to commit');
      return;
    }
    
    console.log('📝 Committing changes to git...');
    execSync('git add data/email-list.json', { stdio: 'inherit' });
    execSync(`git commit -m "Add ${newCount} new signup(s) to email list"`, { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
    console.log('✅ Changes pushed to GitHub');
  } catch (error: any) {
    console.error('⚠️  Failed to commit/push changes:', error.message);
    console.log('ℹ️  You may need to commit and push manually');
  }
}

/**
 * Main function
 */
async function main() {
  console.log('\n🎄 Advent of AI - Signup Query Tool\n');
  
  // Check if RAILWAY_TOKEN is set
  if (!process.env.RAILWAY_TOKEN) {
    console.error('❌ RAILWAY_TOKEN environment variable not set');
    console.log('ℹ️  Set it with: export RAILWAY_TOKEN=your_token');
    process.exit(1);
  }
  
  try {
    // Fetch from Railway
    const railwaySignups = fetchSignupsFromRailway();
    
    // Read existing list
    console.log('\n📋 Reading existing email list...');
    const existingSignups = readEmailList();
    console.log(`   Found ${existingSignups.length} existing signups`);
    
    // Merge and find new signups
    console.log('\n🔄 Comparing and merging...');
    const { merged, newCount } = mergeSignups(existingSignups, railwaySignups);
    
    if (newCount > 0) {
      console.log(`\n✨ Found ${newCount} new signup(s)!`);
      
      // Show new signups
      const newSignups = merged.slice(existingSignups.length);
      console.log('\nNew signups:');
      newSignups.forEach(s => {
        console.log(`   - ${s.email} (ID: ${s.id}, ${s.subscribed ? 'subscribed' : 'unsubscribed'})`);
      });
      
      // Write updated list
      console.log('\n💾 Saving updated email list...');
      writeEmailList(merged);
      
      // Commit and push
      const shouldCommit = process.argv.includes('--commit');
      if (shouldCommit) {
        console.log('\n📤 Pushing to GitHub...');
        commitAndPush(newCount);
      } else {
        console.log('\nℹ️  Run with --commit flag to automatically commit and push changes');
      }
    } else {
      console.log('\n✅ No new signups found. Email list is up to date!');
    }
    
    // Show statistics
    console.log('\n📊 Statistics:');
    console.log(`   Total signups: ${merged.length}`);
    console.log(`   Subscribed: ${merged.filter(s => s.subscribed === 1).length}`);
    console.log(`   Unsubscribed: ${merged.filter(s => s.subscribed === 0).length}`);
    
    console.log('\n✅ Done!\n');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
