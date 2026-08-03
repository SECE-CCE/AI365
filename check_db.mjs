import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not defined.');
  process.exit(1);
}
const sql = neon(DATABASE_URL);

const users = await sql`SELECT id, full_name, email, role, status, mentor_id FROM users ORDER BY id`;
console.log('Users in NeonDB:');
users.forEach(u => console.log(`  [${u.id}] ${u.full_name} (${u.role}) - ${u.status} - mentor: ${u.mentor_id}`));

const lh = await sql`SELECT COUNT(*) as c FROM learning_hours`;
const certs = await sql`SELECT COUNT(*) as c FROM certificates`;
const papers = await sql`SELECT COUNT(*) as c FROM research_papers`;
const projects = await sql`SELECT COUNT(*) as c FROM projects`;
console.log(`\nRecords: learning_hours=${lh[0].c}, certificates=${certs[0].c}, research_papers=${papers[0].c}, projects=${projects[0].c}`);
