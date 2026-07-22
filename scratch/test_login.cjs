const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

const DATABASE_URL = "postgresql://neondb_owner:npg_2tLrYAIG9SiQ@ep-rapid-dew-auq7msaw-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

async function testAuth() {
  try {
    console.log('Testing authentication against Neon Postgres users table...');

    const users = await sql.query('SELECT id, full_name, email, role, password FROM users');
    console.log(`Found ${users.length} registered accounts in Neon DB:`);
    
    for (const u of users) {
      const passTest = bcrypt.compareSync(u.role + '123', u.password);
      console.log(` - [${u.role.toUpperCase()}] ${u.email} | Name: ${u.full_name} | Pass Match (${u.role}123): ${passTest}`);
    }
  } catch (err) {
    console.error('Auth test failed:', err);
  }
}

testAuth();
