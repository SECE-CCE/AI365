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

const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

// Remove old mock admin and upsert real admin
await sql`DELETE FROM users WHERE email IN ('admin@cce.edu', 'dr.sharma@cce.edu', 'prof.kapoor@cce.edu', 'alex.student@cce.edu', 'priya.patel@cce.edu', 'rahul.verma@cce.edu', 'sanya.singh@cce.edu')`;
console.log('✅ Removed mock accounts from Neon DB');

await sql`
  INSERT INTO users (full_name, email, password, role, department, phone, profile_photo, status, mentor_id, is_department_wide)
  VALUES (
    ${ADMIN_NAME},
    ${ADMIN_EMAIL},
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
console.log(`✅ Admin user upserted: ${ADMIN_EMAIL}`);

const users = await sql`SELECT id, full_name, email, role, status FROM users ORDER BY id`;
console.log('\n📋 Current users in Neon DB:');
users.forEach(u => console.log(`  [${u.id}] ${u.full_name} <${u.email}> — ${u.role} (${u.status})`));
