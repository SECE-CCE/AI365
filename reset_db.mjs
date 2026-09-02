import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not defined.');
  process.exit(1);
}
const sql = neon(DATABASE_URL);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_NAME = process.env.ADMIN_NAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_NAME || !ADMIN_PASSWORD) {
  console.error('❌ Error: ADMIN_EMAIL, ADMIN_NAME, or ADMIN_PASSWORD is not defined in .env.');
  process.exit(1);
}

const wipeAll = process.argv.includes('--all');

console.log('🗑️  Wiping database data from Neon DB...\n');

try {
  await sql`DELETE FROM auth_logs`;
  console.log('  [x] Cleared: auth_logs');

  await sql`DELETE FROM activity_logs`;
  console.log('  [x] Cleared: activity_logs');

  await sql`DELETE FROM notifications`;
  console.log('  [x] Cleared: notifications');

  await sql`DELETE FROM event_registrations`;
  console.log('  [x] Cleared: event_registrations');

  await sql`DELETE FROM learning_hours`;
  console.log('  [x] Cleared: learning_hours');

  await sql`DELETE FROM certificates`;
  console.log('  [x] Cleared: certificates');

  await sql`DELETE FROM research_papers`;
  console.log('  [x] Cleared: research_papers');

  await sql`DELETE FROM projects`;
  console.log('  [x] Cleared: projects');

  await sql`DELETE FROM events`;
  console.log('  [x] Cleared: events');

  const adminEmail = process.env.ADMIN_EMAIL || 'dhamodharan.s@sece.ac.in';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMeSecurely123!';

  if (wipeAll) {
    await sql`DELETE FROM users`;
    console.log('  [x] Cleared: ALL users (including admin)');
  } else {
    // Delete all users except admin
    await sql`DELETE FROM users WHERE email != ${adminEmail}`;
    console.log('  [x] Cleared: all student & faculty users (kept admin)');

    // Ensure Admin account exists with bcrypt hash from environment variable
    const adminPassHash = await bcrypt.hash(adminPassword, 10);
    await sql`
      INSERT INTO users (full_name, email, password, role, department, status, is_department_wide)
      VALUES ('Dhamodharan S', ${adminEmail}, ${adminPassHash}, 'admin', 'Computer & Communication Engineering', 'approved', true)
      ON CONFLICT (email) DO UPDATE SET status = 'approved', role = 'admin', password = ${adminPassHash}
    `;
    console.log(`  [+] Verified Admin account: ${adminEmail} (Bcrypt hashed from environment)`);
    await sql`DELETE FROM users WHERE email != ${ADMIN_EMAIL}`;
    console.log('  [x] Cleared: all student & faculty users (kept admin)');

    // Ensure Admin account exists with standard password
    const adminPassHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await sql`
      INSERT INTO users (full_name, email, password, role, department, status, is_department_wide)
      VALUES (${ADMIN_NAME}, ${ADMIN_EMAIL}, ${adminPassHash}, 'admin', 'Computer & Communication Engineering', 'approved', true)
      ON CONFLICT (email) DO UPDATE SET status = 'approved', role = 'admin', password = ${adminPassHash}
    `;
    console.log(`  [+] Verified Admin account: ${ADMIN_EMAIL}`);
  }

  // Reset Targets
  await sql`DELETE FROM targets`;
  await sql`
    INSERT INTO targets (year, target_learning_hours, target_certifications, target_research_papers, target_projects, target_startups)
    VALUES ('2026', 3000, 300, 30, 30, 3)
    ON CONFLICT (year) DO NOTHING
  `;
  console.log('  [+] Reset 2026 department targets to default values');

  const users = await sql`SELECT id, full_name, email, role, status FROM users ORDER BY id`;
  console.log('\n📋 Remaining users in Neon DB:');
  if (users.length === 0) {
    console.log('  (No users — DB is completely empty)');
  } else {
    users.forEach(u => console.log(`  [${u.id}] ${u.full_name} <${u.email}> — ${u.role} (${u.status})`));
  }

  console.log('\n🎉 Database reset complete! System is reset to zero for new testing.');
} catch (err) {
  console.error('❌ Error resetting database:', err);
  process.exit(1);
}
