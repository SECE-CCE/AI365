import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not defined.');
  process.exit(1);
}
const sql = neon(DATABASE_URL);

try {
  // Check existing tables first
  const tables = await sql`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema='public' ORDER BY table_name
  `;
  console.log('✅ Connected! Existing tables:', tables.map(t => t.table_name).join(', ') || 'NONE');

  // Create tables
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255),
      role VARCHAR(50) NOT NULL DEFAULT 'student',
      department VARCHAR(255) DEFAULT 'Computer & Communication Engineering',
      register_number VARCHAR(100),
      year VARCHAR(50),
      phone VARCHAR(50),
      profile_photo TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'pending_approval',
      mentor_id INTEGER,
      mentor_name VARCHAR(255),
      is_department_wide BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS mentor_name VARCHAR(255)`;
  console.log('✅ users table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS learning_hours (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL,
      activity_name VARCHAR(500) NOT NULL,
      platform VARCHAR(255),
      date DATE,
      hours NUMERIC(6,2) DEFAULT 0,
      description TEXT,
      certificate_url TEXT,
      status VARCHAR(50) DEFAULT 'Pending',
      faculty_id INTEGER,
      faculty_remarks TEXT,
      admin_marks NUMERIC(6,2),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE learning_hours ADD COLUMN IF NOT EXISTS admin_marks NUMERIC(6,2)`;
  console.log('✅ learning_hours table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS certificates (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL,
      title VARCHAR(500) NOT NULL,
      issuer VARCHAR(255),
      completion_date DATE,
      certificate_url TEXT,
      skills_learned TEXT,
      status VARCHAR(50) DEFAULT 'Pending',
      faculty_id INTEGER,
      faculty_remarks TEXT,
      admin_marks NUMERIC(6,2),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE certificates ADD COLUMN IF NOT EXISTS admin_marks NUMERIC(6,2)`;
  console.log('✅ certificates table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS research_papers (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL,
      title VARCHAR(500) NOT NULL,
      conference_journal VARCHAR(500),
      authors TEXT,
      total_hours NUMERIC(6,2) DEFAULT 80,
      abstract TEXT,
      pdf_url TEXT,
      status VARCHAR(50) DEFAULT 'Pending',
      faculty_id INTEGER,
      faculty_remarks TEXT,
      admin_marks NUMERIC(6,2),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE research_papers ADD COLUMN IF NOT EXISTS total_hours NUMERIC(6,2) DEFAULT 80`;
  await sql`ALTER TABLE research_papers ADD COLUMN IF NOT EXISTS admin_marks NUMERIC(6,2)`;
  console.log('✅ research_papers table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      github_link TEXT,
      demo_link TEXT,
      tech_stack TEXT,
      ai_contribution TEXT,
      image_url TEXT,
      status VARCHAR(50) DEFAULT 'Pending',
      faculty_id INTEGER,
      faculty_remarks TEXT,
      admin_marks NUMERIC(6,2),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS admin_marks NUMERIC(6,2)`;
  console.log('✅ projects table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      created_by INTEGER,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      venue VARCHAR(500),
      event_date DATE,
      event_time VARCHAR(50),
      max_participants INTEGER DEFAULT 100,
      poster_url TEXT,
      category VARCHAR(100),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('✅ events table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id SERIAL PRIMARY KEY,
      event_id INTEGER,
      student_id INTEGER,
      registered_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('✅ event_registrations table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title VARCHAR(500) NOT NULL,
      message TEXT,
      type VARCHAR(50) DEFAULT 'system',
      is_read BOOLEAN DEFAULT false,
      link TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('✅ notifications table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      action VARCHAR(255),
      details TEXT,
      target_student_id INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('✅ activity_logs table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS targets (
      id SERIAL PRIMARY KEY,
      year VARCHAR(10) UNIQUE NOT NULL,
      target_learning_hours INTEGER DEFAULT 5000,
      target_certifications INTEGER DEFAULT 300,
      target_research_papers INTEGER DEFAULT 50,
      target_projects INTEGER DEFAULT 150,
      target_startups INTEGER DEFAULT 10,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('✅ targets table ready');

  // Check user count
  const count = await sql`SELECT COUNT(*) as c FROM users`;
  console.log('\n🎯 Users in NeonDB:', count[0].c);
  console.log('\n✅ All tables created successfully! Your app now has full NeonDB persistence.');

} catch(e) {
  console.error('❌ Migration error:', e.message);
  console.error(e.stack);
}
