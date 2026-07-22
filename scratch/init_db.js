const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATABASE_URL = "postgresql://neondb_owner:npg_2tLrYAIG9SiQ@ep-rapid-dew-auq7msaw-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function init() {
  try {
    console.log('Connecting to Neon PostgreSQL database...');
    const schemaSql = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');

    console.log('Applying database schema...');
    await pool.query(schemaSql);
    console.log('Schema created successfully!');

    // Check if default users exist
    const usersRes = await pool.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(usersRes.rows[0].count, 10);
    console.log(`Current user count in Neon DB: ${userCount}`);

    if (userCount === 0) {
      console.log('Seeding initial demo user accounts...');
      const adminPass = await bcrypt.hash('admin123', 10);
      const facultyPass = await bcrypt.hash('faculty123', 10);
      const studentPass = await bcrypt.hash('student123', 10);

      // Insert Admin
      await pool.query(`
        INSERT INTO users (full_name, email, password, role, department, status, is_department_wide)
        VALUES ('Dr. Ananya Roy', 'admin@cce.edu', $1, 'admin', 'Computer & Communication Engineering', 'approved', true)
      `, [adminPass]);

      // Insert Faculty
      await pool.query(`
        INSERT INTO users (full_name, email, password, role, department, status, is_department_wide)
        VALUES ('Dr. Rajesh Sharma', 'faculty@cce.edu', $1, 'faculty', 'Computer & Communication Engineering', 'approved', true)
      `, [facultyPass]);

      // Insert Student
      await pool.query(`
        INSERT INTO users (full_name, email, password, role, department, register_number, year, status)
        VALUES ('Alex Mercer', 'student@cce.edu', $1, 'student', 'Computer & Communication Engineering', '21CCE042', '3rd Year', 'approved')
      `, [studentPass]);

      console.log('Successfully seeded default demo accounts (admin@cce.edu, faculty@cce.edu, student@cce.edu)!');
    }

    // Insert default target row if missing
    const targetRes = await pool.query('SELECT COUNT(*) FROM targets');
    if (parseInt(targetRes.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO targets (year, target_learning_hours, target_certifications, target_research_papers, target_projects, target_startups)
        VALUES ('2026', 5000, 300, 50, 150, 10)
      `);
      console.log('Default targets seeded!');
    }

    console.log('Database initialization complete!');
  } catch (err) {
    console.error('Error during DB init:', err);
  } finally {
    await pool.end();
  }
}

init();
