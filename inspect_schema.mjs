import "dotenv/config";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name='activity_logs' ORDER BY ordinal_position`;
console.log("activity_logs:", cols.map(c=>c.column_name).join(", "));
const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`;
console.log("Tables:", tables.map(t=>t.table_name).join(", "));
const userCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position`;
console.log("users:", userCols.map(c=>c.column_name).join(", "));
