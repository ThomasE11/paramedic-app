#!/usr/bin/env node

/**
 * Reset Practice Times Script
 * 
 * This script resets all student practice times to zero in the database.
 * Run this script to give students a fresh start with their practice tracking.
 * 
 * Usage: node reset-practice-times.js
 */

const sqlite3 = require('sqlite3').verbose();

const dbPath = './prisma/dev.db';

console.log('🔄 Resetting student practice times...\n');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

// Reset all time-related fields in student_progress table
const resetQuery = `
  UPDATE student_progress 
  SET 
    time_spent_minutes = 0,
    current_session_time = 0,
    total_time_spent = 0,
    reflection_time = 0,
    updated_at = CURRENT_TIMESTAMP
  WHERE 1=1;
`;

db.run(resetQuery, function(err) {
  if (err) {
    console.error('❌ Error resetting practice times:', err.message);
    process.exit(1);
  }
  
  console.log(`✅ Reset practice times for ${this.changes} student progress records`);
  
  // Get count of records that were updated
  db.get("SELECT COUNT(*) as count FROM student_progress", (err, row) => {
    if (err) {
      console.error('❌ Error counting records:', err.message);
    } else {
      console.log(`📊 Total student progress records in database: ${row.count}`);
    }
    
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('✅ Database connection closed');
        console.log('\n🎉 Practice time reset complete! Students now have a fresh start.');
        console.log('\n📝 Note: Mock API data has also been updated to show 0 minutes.');
      }
    });
  });
});