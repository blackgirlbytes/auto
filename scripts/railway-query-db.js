#!/usr/bin/env node
/**
 * Simple script to query the Railway database
 * This runs ON the Railway server, avoiding shell escaping issues
 */

// Debug: Log to stderr so it doesn't interfere with JSON output
console.error('🔍 Script starting...');

try {
  console.error('📂 Opening database: ./data/signups.db');
  const db = require('better-sqlite3')('./data/signups.db');
  
  console.error('🔎 Executing query...');
  const all = db.prepare('SELECT * FROM signups ORDER BY created_at DESC').all();
  
  console.error(`✅ Query returned ${all.length} records`);
  
  // Output JSON to stdout (this is what gets parsed)
  console.log(JSON.stringify(all));
  
  db.close();
  console.error('✅ Database closed');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
