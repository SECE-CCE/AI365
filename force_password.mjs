import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL);

async function forceUpdate() {
  const password = '$ece@2739';
  const hash = await bcrypt.hash(password, 10);
  
  await sql`UPDATE users SET password = ${hash} WHERE email = 'dhamodharan.s@sece.ac.in'`;
  
  const users = await sql`SELECT * FROM users WHERE email = 'dhamodharan.s@sece.ac.in'`;
  if (users.length > 0) {
    const valid = await bcrypt.compare(password, users[0].password);
    console.log('Update successful! bcrypt compare:', valid);
  } else {
    console.log('User not found.');
  }
}

forceUpdate().catch(console.error);
