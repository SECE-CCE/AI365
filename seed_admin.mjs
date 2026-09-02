import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not defined.');
  process.exit(1);
}
const sql = neon(DATABASE_URL);

const adminEmail = process.env.ADMIN_EMAIL || 'dhamodharan.s@sece.ac.in';
const adminEmail = 'dhamodharan.s@sece.ac.in';
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminPassword) {
  console.error('❌ Error: ADMIN_PASSWORD environment variable is not defined in .env');
  console.error('Please set ADMIN_PASSWORD in your .env file before running seed_admin.');
  process.exit(1);
}

const hash = await bcrypt.hash(adminPassword, 10);

// Remove old mock accounts
await sql`DELETE FROM users WHERE email IN ('admin@cce.edu', 'dr.sharma@cce.edu', 'prof.kapoor@cce.edu', 'alex.student@cce.edu', 'priya.patel@cce.edu', 'rahul.verma@cce.edu', 'sanya.singh@cce.edu')`;
console.log('✅ Removed mock accounts from Neon DB');

await sql`
  INSERT INTO users (full_name, email, password, role, department, phone, profile_photo, status, mentor_id, is_department_wide)
  VALUES (
    'Dhamodharan S',
    ${adminEmail},
    ${hash},
    'admin',
    'Computer & Communication Engineering',
    '',
    '/assets/Dr.S.Dhamodharan.jpg',
    'approved',
    NULL,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    password  = EXCLUDED.password,
    role      = EXCLUDED.role,
    profile_photo = EXCLUDED.profile_photo,
    status    = EXCLUDED.status,
    is_department_wide = EXCLUDED.is_department_wide
`;
console.log(`✅ Admin user upserted securely: ${adminEmail}`);

const users = await sql`SELECT id, full_name, email, role, status FROM users ORDER BY id`;
console.log('\n📋 Current users in Neon DB:');
users.forEach(u => console.log(`  [${u.id}] ${u.full_name} <${u.email}> — ${u.role} (${u.status})`));
