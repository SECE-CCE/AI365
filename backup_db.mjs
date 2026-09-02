import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL;
const RETENTION_COUNT = 7;

async function runBackup() {
  const backupsDir = path.join(process.cwd(), 'backups');
  const logPath = path.join(backupsDir, 'backup_status.log');

  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined.');
  }

  const sql = neon(DATABASE_URL);
  const tables = [
    'users',
    'targets',
    'roadmap',
    'gallery',
    'events',
    'event_registrations',
    'learning_hours',
    'certificates',
    'research_papers',
    'projects',
    'notifications',
    'activity_logs',
    'announcements'
  ];

  console.log('🔄 Initiating Database Backup...');
  const backupData = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    tables: {}
  };

  for (const table of tables) {
    try {
      // Query all columns and rows from the table
      const rows = await sql.query(`SELECT * FROM ${table}`);
      backupData.tables[table] = rows;
      console.log(`  📁 Table "${table}": backed up ${rows.length} rows`);
    } catch (err) {
      console.error(`  ❌ Failed to backup table "${table}":`, err.message);
      // Fail fast to ensure partial backups are not considered successful
      throw new Error(`Table backup failure: ${table} - ${err.message}`);
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `backup_${timestamp}.json`;
  const filePath = path.join(backupsDir, fileName);

  fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`\n✅ Backup successfully saved to ${filePath}`);

  // Prune old backups (Retention Policy)
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

  if (files.length > RETENTION_COUNT) {
    const toDelete = files.slice(RETENTION_COUNT);
    for (const file of toDelete) {
      fs.unlinkSync(file.path);
      console.log(`🧹 Pruned old backup file: ${file.name}`);
    }
  }

  // Write success status
  const statusEntry = `[${new Date().toISOString()}] SUCCESS - Created backup: ${fileName} (Retention size: ${Math.min(files.length, RETENTION_COUNT)})\n`;
  fs.appendFileSync(logPath, statusEntry);
}

runBackup().catch((err) => {
  const backupsDir = path.join(process.cwd(), 'backups');
  const logPath = path.join(backupsDir, 'backup_status.log');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const statusEntry = `[${new Date().toISOString()}] FAILURE - ${err.message}\n`;
  fs.appendFileSync(logPath, statusEntry);
  console.error('\n❌ Backup process aborted due to error:', err.message);
  process.exit(1);
});
