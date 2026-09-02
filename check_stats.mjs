import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function check() {
  console.log('--- Student Usage Sessions ---');
  const sessions = await sql`SELECT id, student_id, login_time, duration_minutes FROM student_usage_sessions ORDER BY id DESC LIMIT 5`;
  console.table(sessions);

  console.log('\n--- Analytics Events ---');
  const events = await sql`SELECT id, event_type, page_url FROM analytics_events ORDER BY id DESC LIMIT 5`;
  console.table(events);
}

check().catch(console.error);
