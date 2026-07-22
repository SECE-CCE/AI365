const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATABASE_URL = "postgresql://neondb_owner:npg_2tLrYAIG9SiQ@ep-rapid-dew-auq7msaw-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

async function init() {
  try {
    console.log('Connecting to Neon Serverless PostgreSQL database over HTTP...');
    const schemaSql = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');

    // Split DDL statements and execute each statement
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Applying ${statements.length} schema DDL statements...`);
    for (const stmt of statements) {
      await sql.query(stmt);
    }
    console.log('Schema created successfully on Neon DB!');

    // Check existing users count
    const usersRes = await sql.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(usersRes[0].count, 10);
    console.log(`Current user count in Neon DB: ${userCount}`);

    if (userCount === 0) {
      console.log('Seeding demo user accounts in Neon DB...');
      const adminPass = bcrypt.hashSync('admin123', 10);
      const facultyPass = bcrypt.hashSync('faculty123', 10);
      const studentPass = bcrypt.hashSync('student123', 10);

      await sql.query(
        `INSERT INTO users (full_name, email, password, role, department, status, is_department_wide)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['Dr. Ananya Roy', 'admin@cce.edu', adminPass, 'admin', 'Computer & Communication Engineering', 'approved', true]
      );

      await sql.query(
        `INSERT INTO users (full_name, email, password, role, department, status, is_department_wide)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['Dr. Rajesh Sharma', 'faculty@cce.edu', facultyPass, 'faculty', 'Computer & Communication Engineering', 'approved', true]
      );

      await sql.query(
        `INSERT INTO users (full_name, email, password, role, department, register_number, year, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        ['Alex Mercer', 'student@cce.edu', studentPass, 'student', 'Computer & Communication Engineering', '21CCE042', '3rd Year', 'approved']
      );

      console.log('Successfully seeded default demo accounts (admin@cce.edu, faculty@cce.edu, student@cce.edu) into Neon DB!');
    }

    const targetRes = await sql.query('SELECT COUNT(*) FROM targets');
    if (parseInt(targetRes[0].count, 10) === 0) {
      await sql.query(
        `INSERT INTO targets (year, target_learning_hours, target_certifications, target_research_papers, target_projects, target_startups)
         VALUES ('2026', 5000, 300, 50, 150, 10)`
      );
      console.log('Default targets seeded in Neon DB!');
    }

    console.log('Neon PostgreSQL Initialization Complete!');
  } catch (err) {
    console.error('Error during Neon DB init:', err);
  }
}

init();
