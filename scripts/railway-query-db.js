#!/usr/bin/env node
/**
 * Simple script to query the Railway database
 * This runs ON the Railway server, avoiding shell escaping issues
 */

const db = require('better-sqlite3')('./data/signups.db');
const all = db.prepare('SELECT * FROM signups ORDER BY created_at DESC').all();
console.log(JSON.stringify(all));
db.close();
