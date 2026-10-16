import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

console.log('🔄 Running uploaded_files migration on Neon DB...');

// 1. Create uploaded_files table
await sql`
  CREATE TABLE IF NOT EXISTS uploaded_files (
    id SERIAL PRIMARY KEY,
    file_url TEXT UNIQUE NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    file_data TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(50) DEFAULT 'document',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`;
console.log('✅ Table uploaded_files created/verified.');

// 2. Add index on file_url
await sql`
  CREATE INDEX IF NOT EXISTS idx_uploaded_files_file_url ON uploaded_files(file_url);
`;
console.log('✅ Index idx_uploaded_files_file_url created/verified.');

// 3. Add file_data column to certificates and research_papers if not present
await sql`ALTER TABLE certificates ADD COLUMN IF NOT EXISTS file_data TEXT;`;
await sql`ALTER TABLE research_papers ADD COLUMN IF NOT EXISTS file_data TEXT;`;
console.log('✅ Columns file_data added to certificates & research_papers.');

// 4. Store Dhamodharan sir's photo into uploaded_files
const photoPath = path.join(process.cwd(), 'assets', 'Dr.S.Dhamodharan.jpg');
if (fs.existsSync(photoPath)) {
  const photoBuffer = fs.readFileSync(photoPath);
  const photoBase64 = photoBuffer.toString('base64');
  const photoSize = photoBuffer.length;

  // Insert for /assets/Dr.S.Dhamodharan.jpg
  await sql`
    INSERT INTO uploaded_files (file_url, file_name, mime_type, file_size, file_data, user_id, category, created_at)
    VALUES (
      '/assets/Dr.S.Dhamodharan.jpg',
      'Dr.S.Dhamodharan.jpg',
      'image/jpeg',
      ${photoSize},
      ${photoBase64},
      15,
      'photo',
      NOW()
    )
    ON CONFLICT (file_url) DO UPDATE SET
      file_name = EXCLUDED.file_name,
      mime_type = EXCLUDED.mime_type,
      file_size = EXCLUDED.file_size,
      file_data = EXCLUDED.file_data,
      category = EXCLUDED.category,
      created_at = NOW();
  `;

  // Also insert for /Dr.S.Dhamodharan.jpg
  await sql`
    INSERT INTO uploaded_files (file_url, file_name, mime_type, file_size, file_data, user_id, category, created_at)
    VALUES (
      '/Dr.S.Dhamodharan.jpg',
      'Dr.S.Dhamodharan.jpg',
      'image/jpeg',
      ${photoSize},
      ${photoBase64},
      15,
      'photo',
      NOW()
    )
    ON CONFLICT (file_url) DO UPDATE SET
      file_name = EXCLUDED.file_name,
      mime_type = EXCLUDED.mime_type,
      file_size = EXCLUDED.file_size,
      file_data = EXCLUDED.file_data,
      category = EXCLUDED.category,
      created_at = NOW();
  `;

  // Ensure Dhamodharan S in users table has profile_photo = '/assets/Dr.S.Dhamodharan.jpg'
  await sql`
    UPDATE users 
    SET profile_photo = '/assets/Dr.S.Dhamodharan.jpg'
    WHERE email = 'dhamodharan.s@sece.ac.in';
  `;

  console.log(`✅ Dr. S. Dhamodharan photo stored in database successfully (${photoSize} bytes).`);
} else {
  console.warn('⚠️ Photo file not found at:', photoPath);
}

// 5. Query back to verify
const res = await sql`
  SELECT id, file_url, file_name, mime_type, file_size, category, created_at 
  FROM uploaded_files 
  WHERE file_url LIKE '%Dhamodharan%'
`;
console.log('📋 Verified files in DB:', res);

process.exit(0);
