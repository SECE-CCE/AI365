// Upsert real admin user into Neon DB with correct credentials
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const DATABASE_URL = 'postgresql://neondb_owner:npg_2tLrYAIG9SiQ@ep-rapid-dew-auq7msaw-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

const password = '$ece@2739';
const hash = await bcrypt.hash(password, 10);

// Remove old mock admin and upsert real admin
await sql`DELETE FROM users WHERE email IN ('admin@cce.edu', 'dr.sharma@cce.edu', 'prof.kapoor@cce.edu', 'alex.student@cce.edu', 'priya.patel@cce.edu', 'rahul.verma@cce.edu', 'sanya.singh@cce.edu')`;
console.log('✅ Removed mock accounts from Neon DB');

await sql`
  INSERT INTO users (full_name, email, password, role, department, phone, profile_photo, status, mentor_id, is_department_wide)
  VALUES (
    'Dhamodharan S',
    'dhamodharan.s@sece.ac.in',
    ${hash},
    'admin',
    'Computer & Communication Engineering',
    '',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    'approved',
    NULL,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    password  = EXCLUDED.password,
    role      = EXCLUDED.role,
    status    = EXCLUDED.status,
    is_department_wide = EXCLUDED.is_department_wide
`;
console.log('✅ Admin user upserted: dhamodharan.s@sece.ac.in');

const users = await sql`SELECT id, full_name, email, role, status FROM users ORDER BY id`;
console.log('\n📋 Current users in Neon DB:');
users.forEach(u => console.log(`  [${u.id}] ${u.full_name} <${u.email}> — ${u.role} (${u.status})`));
