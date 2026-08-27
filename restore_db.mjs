import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DATABASE_URL = process.env.DATABASE_URL;

async function runRestore() {
  const backupsDir = path.join(process.cwd(), 'backups');
  let backupFilePath = process.argv[2];

  if (!backupFilePath) {
    if (!fs.existsSync(backupsDir)) {
      console.error('❌ Error: No backups directory found.');
      process.exit(1);
    }
    const files = fs.readdirSync(backupsDir)
      .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
      .map(f => {
        const fullPath = path.join(backupsDir, f);
        return {
          name: f,
          path: fullPath,
          mtime: fs.statSync(fullPath).mtime
        };
      })
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime()); // Newest first

    if (files.length === 0) {
      console.error('❌ Error: No backup files found in backups/ directory.');
      process.exit(1);
    }
    backupFilePath = files[0].path;
    console.log(`ℹ️ No file specified. Defaulting to the latest backup: ${files[0].name}`);
  }

  if (!fs.existsSync(backupFilePath)) {
    console.error(`❌ Error: Backup file not found at ${backupFilePath}`);
    process.exit(1);
  }

  if (!DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is not defined.');
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);
  const raw = fs.readFileSync(backupFilePath, 'utf-8');
  const backupData = JSON.parse(raw);

  if (backupData.version !== '1.0.0' || !backupData.tables) {
    throw new Error('Invalid backup file format.');
  }

  console.log('📦 Ensuring database schemas exist (running migrations)...');
  try {
    execSync('node migrate_db.mjs', { stdio: 'inherit' });
    console.log('✅ Database schemas verified.\n');
  } catch (err) {
    console.error('❌ Failed to run database migrations:', err.message);
    process.exit(1);
  }

  console.log(`🗑️  Wiping existing database data from Neon DB...`);
  
  // Wipe child tables first to avoid FK constraint failures
  await sql`DELETE FROM activity_logs`;
  await sql`DELETE FROM notifications`;
  await sql`DELETE FROM event_registrations`;
  await sql`DELETE FROM learning_hours`;
  await sql`DELETE FROM certificates`;
  await sql`DELETE FROM research_papers`;
  await sql`DELETE FROM projects`;
  await sql`DELETE FROM announcements`;
  await sql`DELETE FROM events`;
  await sql`DELETE FROM users`;
  await sql`DELETE FROM targets`;
  await sql`DELETE FROM roadmap`;
  await sql`DELETE FROM gallery`;
  console.log('✅ Database wiped successfully.\n');

  console.log('📥 Restoring tables from backup snapshot...');
  const tables = backupData.tables;

  // 1. Restoring independent tables
  await insertRows(sql, 'targets', tables['targets']);
  await insertRows(sql, 'roadmap', tables['roadmap']);
  await insertRows(sql, 'gallery', tables['gallery']);

  // 2. Restore users table (handle self-referential mentor_id by updating it in a second pass)
  const users = tables['users'] || [];
  const mentorUpdates = [];
  if (users.length > 0) {
    console.log(`📥 Restoring table "users": inserting ${users.length} users...`);
    for (const user of users) {
      if (user.mentor_id !== null && user.mentor_id !== undefined) {
        mentorUpdates.push({ id: user.id, mentor_id: user.mentor_id });
      }
      
      const tempUser = { ...user, mentor_id: null };
      const keys = Object.keys(tempUser);
      const values = Object.values(tempUser);
      
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const columns = keys.map(k => `"${k}"`).join(', ');
      const queryStr = `INSERT INTO users (${columns}) VALUES (${placeholders})`;
      
      await sql.query(queryStr, values);
    }

    // Second pass: update mentor relations
    if (mentorUpdates.length > 0) {
      console.log(`  🔄 Restoring user mentor relations (second pass)...`);
      for (const item of mentorUpdates) {
        await sql.query('UPDATE users SET mentor_id = $1 WHERE id = $2', [item.mentor_id, item.id]);
      }
    }
    await resetSequence(sql, 'users');
  }

  // 3. Restore remaining dependent tables in topological order
  await insertRows(sql, 'events', tables['events']);
  await insertRows(sql, 'event_registrations', tables['event_registrations']);
  await insertRows(sql, 'learning_hours', tables['learning_hours']);
  await insertRows(sql, 'certificates', tables['certificates']);
  await insertRows(sql, 'research_papers', tables['research_papers']);
  await insertRows(sql, 'projects', tables['projects']);
  await insertRows(sql, 'notifications', tables['notifications']);
  await insertRows(sql, 'activity_logs', tables['activity_logs']);
  await insertRows(sql, 'announcements', tables['announcements']);

  console.log('\n🎉 Database restoration completed successfully!');
}

async function insertRows(sql, tableName, rows) {
  if (!rows || rows.length === 0) {
    console.log(`ℹ️ Table "${tableName}": no records to restore.`);
    return;
  }

  console.log(`📥 Restoring table "${tableName}": inserting ${rows.length} rows...`);
  for (const row of rows) {
    const keys = Object.keys(row);
    const values = Object.values(row);

    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const columns = keys.map(k => `"${k}"`).join(', ');
    const queryStr = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

    await sql.query(queryStr, values);
  }
  await resetSequence(sql, tableName);
}

async function resetSequence(sql, tableName) {
  try {
    // Reset sequence generator to max current id in the restored table
    await sql.query(`SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), COALESCE((SELECT MAX(id) FROM ${tableName}), 1))`);
    console.log(`  🔄 Reset sequence for table "${tableName}"`);
  } catch (err) {
    console.log(`  ℹ️ No sequence reset needed for "${tableName}": ${err.message}`);
  }
}

runRestore().catch((err) => {
  console.error('\n❌ Restoration failed:', err.message);
  process.exit(1);
});

