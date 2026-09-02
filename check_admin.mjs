import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL);

async function check() {
  const users = await sql`SELECT * FROM users WHERE email = 'dhamodharan.s@sece.ac.in'`;
  console.log(users);

  if (users.length > 0) {
    const valid = await bcrypt.compare('$ece@2739', users[0].password);
    console.log('bcrypt compare ($ece@2739):', valid);
  }
}

check().catch(console.error);
