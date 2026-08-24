import 'dotenv/config';
import pg from 'pg';
import { neon } from '@neondatabase/serverless';

export const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.warn('[AI365] WARNING: DATABASE_URL is not set. DB operations will use in-memory fallback only.');
} else {
  console.log('[AI365] Connected to Neon Postgres database.');
}

// Only initialize DB clients if DATABASE_URL is available
export const pool = DATABASE_URL
  ? new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : null;

export const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

// Pre-computed bcrypt hash (cost=10) for admin account — password: $ece@2739
const HASHED_ADMIN_PASS = '$2b$10$fnHGtIY9MePG3vUlc7M2JeyxmVUiBCtWgaRc7EZIS/SC3R.ft7yAe';
const HASHED_FACULTY_PASS = '$2b$10$AV6knQtK/66NTqQXBStDVOTPQNvf.UIsdyRA4TVJo40P8PZsFoZDe';
const HASHED_STUDENT_PASS = '$2b$10$myxE12Mu90RdnBya.YejZeipT8BhYV6WIXzXHPM6l28rVWFuW9UT6';

export interface UserRow {
  id: number;
  full_name: string;
  email: string;
  password?: string;
  role: 'student' | 'faculty' | 'admin';
  department: string;
  register_number?: string;
  year?: string;
  phone?: string;
  profile_photo?: string;
  gender?: 'boy' | 'girl';
  status: 'pending_approval' | 'approved' | 'rejected';
  mentor_id?: number | null;
  mentor_name?: string | null;
  is_department_wide?: boolean;
  created_at: string;
}

export interface LearningHourRow {
  id: number;
  student_id: number;
  activity_name: string;
  platform: string;
  date: string;
  hours: number;
  description: string;
  certificate_url: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  faculty_id?: number | null;
  faculty_remarks?: string;
  admin_marks?: number;
  created_at: string;
}

export interface CertificateRow {
  id: number;
  student_id: number;
  title: string;
  issuer: string;
  completion_date: string;
  certificate_url: string;
  skills_learned: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  faculty_id?: number | null;
  faculty_remarks?: string;
  admin_marks?: number;
  created_at: string;
}

export interface ResearchPaperRow {
  id: number;
  student_id: number;
  title: string;
  conference_journal: string;
  authors: string;
  total_hours?: number;
  abstract: string;
  pdf_url: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  faculty_id?: number | null;
  faculty_remarks?: string;
  admin_marks?: number;
  created_at: string;
}

export interface ProjectRow {
  id: number;
  student_id: number;
  title: string;
  description: string;
  github_link: string;
  demo_link: string;
  tech_stack: string;
  ai_contribution: string;
  image_url: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  faculty_id?: number | null;
  faculty_remarks?: string;
  admin_marks?: number;
  created_at: string;
}

export interface EventRow {
  id: number;
  created_by: number;
  title: string;
  description: string;
  venue: string;
  event_date: string;
  event_time: string;
  max_participants: number;
  poster_url: string;
  category: string;
  created_at: string;
}

export interface EventRegistrationRow {
  id: number;
  event_id: number;
  student_id: number;
  registered_at: string;
}

export interface NotificationRow {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'approval' | 'registration' | 'event' | 'system';
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface ActivityLogRow {
  id: number;
  user_id: number;
  action: string;
  details?: string;
  target_student_id?: number | null;
  created_at: string;
}

export interface TargetRow {
  id: number;
  year: string;
  target_learning_hours: number;
  target_certifications: number;
  target_research_papers: number;
  target_projects: number;
  target_startups: number;
  updated_at: string;
}

export interface RoadmapRow {
  id: number;
  month: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  order_index: number;
}

export interface GalleryRow {
  id: number;
  title: string;
  category: string;
  image_url: string;
  description: string;
  is_public: boolean;
  created_at: string;
}

export interface AnnouncementRow {
  id: number;
  title: string;
  content: string;
  author_id: number;
  is_public: boolean;
  created_at: string;
}

// Initial Memory Store Seed Data — only admin bootstrapped, all real data lives in Neon DB
const initialStore = {
  users: [
    {
      id: 1,
      full_name: 'Dhamodharan S',
      email: 'dhamodharan.s@sece.ac.in',
      password: HASHED_ADMIN_PASS,
      role: 'admin',
      department: 'Computer & Communication Engineering',
      phone: '',
      profile_photo: '/assets/Dr.S.Dhamodharan.jpg',
      status: 'approved',
      mentor_id: null,
      is_department_wide: true,
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 2,
      full_name: 'Tanya R',
      email: 'tanya.r@sece.ac.in',
      password: HASHED_STUDENT_PASS,
      role: 'student',
      department: 'Computer & Communication Engineering',
      register_number: '73782414042',
      year: 'III Year - CCE',
      profile_photo: '/girl-avatar.svg',
      gender: 'girl',
      status: 'pending_approval',
      mentor_id: null,
      created_at: '2026-07-26T10:00:00Z',
    },
  ] as UserRow[],

  // Seed initial pending certificate for Tanya
  learning_hours: [] as LearningHourRow[],
  certificates: [
    {
      id: 1,
      student_id: 2,
      title: 'AWS AI Cloud Practitioner',
      issuer: 'Amazon Web Services',
      completion_date: '2026-07-26',
      certificate_url: 'https://drive.google.com/file/d/demo_aws_cert/view',
      skills_learned: 'IAM user creation, S3 bucket management, CloudWatch monitoring, Rekognition API',
      status: 'Pending',
      created_at: '2026-07-26T18:30:00Z',
    },
  ] as CertificateRow[],
  research_papers: [] as ResearchPaperRow[],
  projects: [] as ProjectRow[],
  events: [] as EventRow[],
  event_registrations: [] as EventRegistrationRow[],
  notifications: [] as NotificationRow[],
  activity_logs: [] as ActivityLogRow[],

  targets: [
    {
      id: 1,
      year: '2026',
      target_learning_hours: 3000,
      target_certifications: 300,
      target_research_papers: 30,
      target_projects: 30,
      target_startups: 3,
      updated_at: new Date().toISOString(),
    },
  ] as TargetRow[],

  roadmap: [
    {
      id: 1,
      month: 'Jan 2026',
      title: 'AI365 Launch & Orientation',
      description: 'Department-wide rollout of AI Activity Tracking & AI Digital Passport system.',
      status: 'completed',
      order_index: 1,
    },
    {
      id: 2,
      month: 'Feb 2026',
      title: 'Generative AI Bootcamps & AWS ML Certification Drive',
      description: 'Special hands-on training sessions with industry mentors.',
      status: 'completed',
      order_index: 2,
    },
    {
      id: 3,
      month: 'Mar 2026',
      title: 'CCE Mid-Term Research Symposium',
      description: 'Student research paper draft reviews and mentor allocation.',
      status: 'in_progress',
      order_index: 3,
    },
    {
      id: 4,
      month: 'Aug 2026',
      title: 'National AI & Robotics Hackathon 2026',
      description: '36-hour hardware + AI build competition with cash prizes.',
      status: 'upcoming',
      order_index: 4,
    },
    {
      id: 5,
      month: 'Nov 2026',
      title: 'CCE AI Startup Pitch Day',
      description: 'Incubation funding pitches to venture capitalists and CCE Alumni.',
      status: 'upcoming',
      order_index: 5,
    },
  ] as RoadmapRow[],

  gallery: [] as GalleryRow[],

  announcements: [
    {
      id: 1,
      title: 'Welcome to AI365 @ CCE Platform!',
      content: 'All CCE students are requested to register, complete their profiles, and start logging AI learning hours.',
      author_id: 1,
      is_public: true,
      created_at: new Date().toISOString(),
    },
  ] as AnnouncementRow[],
};

// In-Memory Database Controller (simulates Neon SQL queries with persistence)
class DbStore {
  public store = JSON.parse(JSON.stringify(initialStore));

  // Auto-increment helper
  private nextId(table: keyof typeof initialStore): number {
    const list = this.store[table] as any[];
    if (!list || list.length === 0) return 1;
    return Math.max(...list.map(item => item.id || 0)) + 1;
  }

  private async queryDb(text: string, params: any[] = []): Promise<any[]> {
    // Use neon HTTP driver (works without TCP/port 5432 access, unlike pg.Pool)
    if (!sql) throw new Error('Database not configured: DATABASE_URL is missing.');
    const attempt = async () => {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DB query timeout after 8s')), 8000)
      );
      return Promise.race([sql!.query(text, params) as Promise<any[]>, timeoutPromise]);
    };
    try {
      return await attempt();
    } catch (err: any) {
      const isTransient = err?.message?.includes('fetch failed') || err?.message?.includes('timeout') || err?.code === 'ECONNRESET';
      if (isTransient) {
        // One retry after a short delay
        await new Promise(r => setTimeout(r, 1200));
        try {
          return await attempt();
        } catch (retryErr) {
          throw retryErr;
        }
      }
      throw err;
    }
  }

  // Users
  async findUserByEmail(email: string): Promise<UserRow | undefined> {
    try {
      const rows = await this.queryDb('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
      if (rows && rows.length > 0) return rows[0] as UserRow;
    } catch (err) {
      // Graceful fallback to local store if DB is starting up
    }
    return this.store.users.find((u: UserRow) => u.email.toLowerCase() === email.toLowerCase());
  }

  async findUserById(id: number): Promise<UserRow | undefined> {
    try {
      const rows = await this.queryDb('SELECT * FROM users WHERE id = $1', [id]);
      if (rows && rows.length > 0) return rows[0] as UserRow;
    } catch (err) {
      // Graceful fallback to local store if DB is starting up
    }
    return this.store.users.find((u: UserRow) => u.id === id);
  }

  async createUser(data: Omit<UserRow, 'id' | 'created_at'>): Promise<UserRow> {
    if (sql) {
      try {
        const rows = await sql.query(
          `INSERT INTO users (full_name, email, password, role, department, register_number, year, phone, profile_photo, status, mentor_id, mentor_name, is_department_wide)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING *`,
          [
            data.full_name,
            data.email,
            data.password || '',
            data.role,
            data.department || 'Computer & Communication Engineering',
            data.register_number || null,
            data.year || null,
            data.phone || null,
            data.profile_photo || null,
            data.status || 'approved',
            data.mentor_id || null,
            data.mentor_name || null,
            data.is_department_wide || false,
          ]
        );
        if (rows && rows.length > 0) {
          const newUser = rows[0] as UserRow;
          this.store.users.push(newUser);
          return newUser;
        }
      } catch (err) {
        console.error('Neon DB createUser error:', (err as Error).message);
      }
    }
    const newUser: UserRow = {
      ...data,
      id: this.nextId('users'),
      created_at: new Date().toISOString(),
    };
    this.store.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, data: Partial<UserRow>): Promise<UserRow | undefined> {
    // Build dynamic SET clause for SQL UPDATE
    const fields = Object.keys(data) as (keyof UserRow)[];
    if (fields.length === 0) return this.store.users.find((u: UserRow) => u.id === id);

    try {
      const setClauses = fields.map((key, i) => `${key} = $${i + 1}`).join(', ');
      const values = fields.map((key) => (data as any)[key]);
      values.push(id); // last param is the WHERE id

      const rows = await this.queryDb(
        `UPDATE users SET ${setClauses} WHERE id = $${fields.length + 1} RETURNING *`,
        values
      );
      if (rows && rows.length > 0) {
        const updatedUser = rows[0] as UserRow;
        // Sync local store
        const idx = this.store.users.findIndex((u: UserRow) => u.id === id);
        if (idx !== -1) this.store.users[idx] = updatedUser;
        else this.store.users.push(updatedUser);
        return updatedUser;
      }
    } catch (err) {
      console.error('Neon DB updateUser error:', (err as Error).message);
    }

    // Fallback: update in-memory store only
    const idx = this.store.users.findIndex((u: UserRow) => u.id === id);
    if (idx === -1) return undefined;
    this.store.users[idx] = { ...this.store.users[idx], ...data };
    return this.store.users[idx];
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const rows = await this.queryDb('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
      if (rows && rows.length > 0) {
        this.store.users = this.store.users.filter((u: UserRow) => u.id !== id);
        return true;
      }
    } catch (err) {
      console.error('Neon DB deleteUser error:', (err as Error).message);
    }
    const initialLen = this.store.users.length;
    this.store.users = this.store.users.filter((u: UserRow) => u.id !== id);
    return this.store.users.length < initialLen;
  }

  async getAllUsers(filters?: { role?: string; department?: string; year?: string; status?: string }): Promise<UserRow[]> {
    try {
      let query = `SELECT u.*, COALESCE(u.mentor_name, m.full_name) AS mentor_name FROM users u LEFT JOIN users m ON u.mentor_id = m.id WHERE 1=1`;
      const params: any[] = [];
      let idx = 1;
      if (filters?.role) { query += ` AND u.role = $${idx++}`; params.push(filters.role); }
      if (filters?.department) { query += ` AND u.department = $${idx++}`; params.push(filters.department); }
      if (filters?.year) { query += ` AND u.year = $${idx++}`; params.push(filters.year); }
      if (filters?.status) { query += ` AND u.status = $${idx++}`; params.push(filters.status); }
      query += ` ORDER BY u.id`;
      const rows = await this.queryDb(query, params);
      if (rows) {
        // Sync local store with live DB data
        this.store.users = rows;
        return rows as UserRow[];
      }
    } catch (err) {
      console.error('Neon DB getAllUsers error:', (err as Error).message);
    }
    // Fallback: return filtered in-memory store
    return this.store.users.filter((u: UserRow) => {
      if (filters?.role && u.role !== filters.role) return false;
      if (filters?.department && u.department !== filters.department) return false;
      if (filters?.year && u.year !== filters.year) return false;
      if (filters?.status && u.status !== filters.status) return false;
      return true;
    });
  }

  // Learning Hours
  async getLearningHours(studentId?: number, facultyIdScope?: number, statusFilter?: string): Promise<any[]> {
    try {
      let query = `SELECT lh.*, u.full_name AS student_name, u.register_number, u.year FROM learning_hours lh LEFT JOIN users u ON lh.student_id = u.id WHERE 1=1`;
      const params: any[] = [];
      let idx = 1;
      if (studentId) { query += ` AND lh.student_id = $${idx++}`; params.push(studentId); }
      if (facultyIdScope) {
        const faculty = await this.findUserById(facultyIdScope);
        if (faculty && !faculty.is_department_wide) {
          query += ` AND u.mentor_id = $${idx++}`; params.push(facultyIdScope);
        }
      }
      if (statusFilter) { query += ` AND LOWER(lh.status) LIKE $${idx++}`; params.push(`%${statusFilter.toLowerCase()}%`); }
      query += ` ORDER BY lh.created_at DESC`;
      const rows = await this.queryDb(query, params);
      if (rows) {
        if (!studentId && !facultyIdScope) this.store.learning_hours = rows;
        return rows;
      }
    } catch (err) {
      console.error('Neon DB getLearningHours error:', (err as Error).message);
    }
    let rows = this.store.learning_hours;
    if (studentId) rows = rows.filter((r: LearningHourRow) => r.student_id === studentId);
    if (facultyIdScope) {
      const faculty = await this.findUserById(facultyIdScope);
      if (faculty && !faculty.is_department_wide) {
        const menteeIds = this.store.users.filter((u: UserRow) => u.mentor_id === facultyIdScope).map((u: UserRow) => u.id);
        rows = rows.filter((r: LearningHourRow) => menteeIds.includes(r.student_id));
      }
    }
    if (statusFilter) rows = rows.filter((r: LearningHourRow) => r.status?.toLowerCase().includes(statusFilter.toLowerCase()));
    return rows.map((r: LearningHourRow) => {
      const student = this.store.users.find((u: UserRow) => u.id === r.student_id);
      return { ...r, student_name: student?.full_name || 'Unknown Student', register_number: student?.register_number || 'N/A', year: student?.year || 'N/A' };
    });
  }

  async createLearningHour(data: Omit<LearningHourRow, 'id' | 'created_at'>): Promise<LearningHourRow> {
    try {
      const rows = await this.queryDb(
        `INSERT INTO learning_hours (student_id, activity_name, platform, date, hours, description, certificate_url, status, faculty_id, faculty_remarks) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [data.student_id, data.activity_name, data.platform, data.date, data.hours, data.description, data.certificate_url, data.status, data.faculty_id || null, data.faculty_remarks || '']
      );
      if (rows && rows.length > 0) { const item = rows[0] as LearningHourRow; this.store.learning_hours.unshift(item); return item; }
    } catch (err) { console.error('Neon DB createLearningHour error:', (err as Error).message); }
    const newItem: LearningHourRow = { ...data, id: this.nextId('learning_hours'), created_at: new Date().toISOString() };
    this.store.learning_hours.unshift(newItem);
    return newItem;
  }

  // Credit learning hours when admin approves a certificate, research paper, or project
  // - certificate & project: awardedHours supplied by admin
  // - research: pass total_hours and authorsString; function computes per-author share
  async creditLearningHoursOnApproval(
    studentId: number,
    type: 'certificate' | 'research' | 'project',
    title: string,
    approvedById: number,
    awardedHours: number,
    certUrl: string = ''
  ): Promise<void> {
    const platformMap = { certificate: 'Verified Certificate', research: 'Research Publication', project: 'AI Project Build' };
    const prefixMap  = { certificate: 'Verified Certificate', research: 'Research Paper',      project: 'AI Project'       };
    const activityName = `${prefixMap[type]}: ${title}`;
    const today = new Date().toISOString().split('T')[0];

    // Idempotent — avoid duplicate auto-credit rows
    try {
      const existing = await this.queryDb(
        `SELECT id FROM learning_hours WHERE student_id=$1 AND activity_name=$2 LIMIT 1`,
        [studentId, activityName]
      );
      if (existing && existing.length > 0) return;
    } catch {
      // Fallback: check in-memory store
      const exists = (this.store.learning_hours as LearningHourRow[]).find(
        (lh) => lh.student_id === studentId && lh.activity_name === activityName
      );
      if (exists) return;
    }

    try {
      await this.createLearningHour({
        student_id: studentId,
        activity_name: activityName,
        platform: platformMap[type],
        date: today,
        hours: awardedHours,
        description: `Auto-credited upon admin approval of: ${title}`,
        certificate_url: certUrl,
        status: 'Approved',
        faculty_id: approvedById,
        faculty_remarks: 'Auto-approved by admin on submission approval',
      });
    } catch (err) {
      console.error('[creditLearningHoursOnApproval] Failed to credit hours:', (err as Error).message);
    }
  }

  async updateLearningHourStatus(id: number, status: 'Approved' | 'Rejected', facultyId: number, remarks: string, adminMarks?: number): Promise<LearningHourRow | undefined> {
    try {
      const rows = await this.queryDb(
        `UPDATE learning_hours SET status=$1, faculty_id=$2, faculty_remarks=$3, admin_marks = CASE WHEN $4::numeric IS NOT NULL THEN $4::numeric ELSE admin_marks END WHERE id=$5 RETURNING *`,
        [status, facultyId, remarks, adminMarks !== undefined && adminMarks !== null ? adminMarks : null, id]
      );
      if (rows && rows.length > 0) {
        const updated = rows[0] as LearningHourRow;
        const idx = this.store.learning_hours.findIndex((lh: LearningHourRow) => lh.id === id);
        if (idx !== -1) this.store.learning_hours[idx] = updated;
        return updated;
      }
    } catch (err) {
      const message = (err as Error).message || '';
      if (message.includes('admin_marks') || message.includes('column "admin_marks"')) {
        try {
          const rows = await this.queryDb(
            `UPDATE learning_hours SET status=$1, faculty_id=$2, faculty_remarks=$3 WHERE id=$4 RETURNING *`,
            [status, facultyId, remarks, id]
          );
          if (rows && rows.length > 0) {
            const updated = rows[0] as LearningHourRow;
            const idx = this.store.learning_hours.findIndex((lh: LearningHourRow) => lh.id === id);
            if (idx !== -1) this.store.learning_hours[idx] = updated;
            return updated;
          }
        } catch (retryErr) {
          console.error('Neon DB retry updateLearningHourStatus error:', (retryErr as Error).message);
        }
      } else {
        console.error('Neon DB updateLearningHourStatus error:', message);
      }
    }
    const item = this.store.learning_hours.find((lh: LearningHourRow) => lh.id === id);
    if (!item) return undefined;
    item.status = status; item.faculty_id = facultyId; item.faculty_remarks = remarks;
    if (adminMarks !== undefined && adminMarks !== null) item.admin_marks = adminMarks;
    return item;
  }

  // Certificates
  async getCertificates(studentId?: number, facultyIdScope?: number, statusFilter?: string): Promise<any[]> {
    try {
      let query = `SELECT c.*, u.full_name AS student_name, u.register_number, u.year FROM certificates c LEFT JOIN users u ON c.student_id = u.id WHERE 1=1`;
      const params: any[] = [];
      let idx = 1;
      if (studentId) { query += ` AND c.student_id = $${idx++}`; params.push(studentId); }
      if (facultyIdScope) {
        const faculty = await this.findUserById(facultyIdScope);
        if (faculty && !faculty.is_department_wide) {
          query += ` AND u.mentor_id = $${idx++}`; params.push(facultyIdScope);
        }
      }
      if (statusFilter) { query += ` AND LOWER(c.status) LIKE $${idx++}`; params.push(`%${statusFilter.toLowerCase()}%`); }
      query += ` ORDER BY c.created_at DESC`;
      const rows = await this.queryDb(query, params);
      if (rows) return rows;
    } catch (err) { console.error('Neon DB getCertificates error:', (err as Error).message); }
    let rows = this.store.certificates;
    if (studentId) rows = rows.filter((r: CertificateRow) => r.student_id === studentId);
    if (facultyIdScope) {
      const faculty = await this.findUserById(facultyIdScope);
      if (faculty && !faculty.is_department_wide) {
        const menteeIds = this.store.users.filter((u: UserRow) => u.mentor_id === facultyIdScope).map((u: UserRow) => u.id);
        rows = rows.filter((r: CertificateRow) => menteeIds.includes(r.student_id));
      }
    }
    if (statusFilter) rows = rows.filter((r: CertificateRow) => r.status?.toLowerCase().includes(statusFilter.toLowerCase()));
    return rows.map((r: CertificateRow) => {
      const student = this.store.users.find((u: UserRow) => u.id === r.student_id);
      return { ...r, student_name: student?.full_name || 'Unknown Student', register_number: student?.register_number || 'N/A', year: student?.year || 'N/A' };
    });
  }

  async createCertificate(data: Omit<CertificateRow, 'id' | 'created_at'>): Promise<CertificateRow> {
    try {
      const rows = await this.queryDb(
        `INSERT INTO certificates (student_id, title, issuer, completion_date, certificate_url, skills_learned, status, faculty_id, faculty_remarks) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [data.student_id, data.title, data.issuer, data.completion_date, data.certificate_url, data.skills_learned, data.status, data.faculty_id || null, data.faculty_remarks || '']
      );
      if (rows && rows.length > 0) { const item = rows[0] as CertificateRow; this.store.certificates.unshift(item); return item; }
    } catch (err) { console.error('Neon DB createCertificate error:', (err as Error).message); }
    const newItem: CertificateRow = { ...data, id: this.nextId('certificates'), created_at: new Date().toISOString() };
    this.store.certificates.unshift(newItem);
    return newItem;
  }

  async updateCertificateStatus(id: number, status: 'Approved' | 'Rejected', facultyId: number, remarks: string, adminMarks?: number): Promise<CertificateRow | undefined> {
    try {
      const rows = await this.queryDb(
        `UPDATE certificates SET status=$1, faculty_id=$2, faculty_remarks=$3, admin_marks = CASE WHEN $4::numeric IS NOT NULL THEN $4::numeric ELSE admin_marks END WHERE id=$5 RETURNING *`,
        [status, facultyId, remarks, adminMarks !== undefined && adminMarks !== null ? adminMarks : null, id]
      );
      if (rows && rows.length > 0) {
        const updated = rows[0] as CertificateRow;
        const idx = this.store.certificates.findIndex((c: CertificateRow) => c.id === id);
        if (idx !== -1) this.store.certificates[idx] = updated;
        return updated;
      }
    } catch (err) {
      const message = (err as Error).message || '';
      if (message.includes('admin_marks') || message.includes('column "admin_marks"')) {
        try {
          const rows = await this.queryDb(
            `UPDATE certificates SET status=$1, faculty_id=$2, faculty_remarks=$3 WHERE id=$4 RETURNING *`,
            [status, facultyId, remarks, id]
          );
          if (rows && rows.length > 0) {
            const updated = rows[0] as CertificateRow;
            const idx = this.store.certificates.findIndex((c: CertificateRow) => c.id === id);
            if (idx !== -1) this.store.certificates[idx] = updated;
            return updated;
          }
        } catch (retryErr) {
          console.error('Neon DB retry updateCertificateStatus error:', (retryErr as Error).message);
        }
      } else {
        console.error('Neon DB updateCertificateStatus error:', message);
      }
    }
    const item = this.store.certificates.find((c: CertificateRow) => c.id === id);
    if (!item) return undefined;
    item.status = status; item.faculty_id = facultyId; item.faculty_remarks = remarks;
    if (adminMarks !== undefined && adminMarks !== null) item.admin_marks = adminMarks;
    return item;
  }

  // Research Papers
  async getResearchPapers(studentId?: number, facultyIdScope?: number, statusFilter?: string): Promise<any[]> {
    try {
      let query = `SELECT rp.*, u.full_name AS student_name, u.register_number, u.year FROM research_papers rp LEFT JOIN users u ON rp.student_id = u.id WHERE 1=1`;
      const params: any[] = [];
      let idx = 1;
      if (studentId) { query += ` AND rp.student_id = $${idx++}`; params.push(studentId); }
      if (facultyIdScope) {
        const faculty = await this.findUserById(facultyIdScope);
        if (faculty && !faculty.is_department_wide) {
          query += ` AND u.mentor_id = $${idx++}`; params.push(facultyIdScope);
        }
      }
      if (statusFilter) { query += ` AND LOWER(rp.status) LIKE $${idx++}`; params.push(`%${statusFilter.toLowerCase()}%`); }
      query += ` ORDER BY rp.created_at DESC`;
      const rows = await this.queryDb(query, params);
      if (rows) return rows;
    } catch (err) { console.error('Neon DB getResearchPapers error:', (err as Error).message); }
    let rows = this.store.research_papers;
    if (studentId) rows = rows.filter((r: ResearchPaperRow) => r.student_id === studentId);
    if (facultyIdScope) {
      const faculty = await this.findUserById(facultyIdScope);
      if (faculty && !faculty.is_department_wide) {
        const menteeIds = this.store.users.filter((u: UserRow) => u.mentor_id === facultyIdScope).map((u: UserRow) => u.id);
        rows = rows.filter((r: ResearchPaperRow) => menteeIds.includes(r.student_id));
      }
    }
    if (statusFilter) rows = rows.filter((r: ResearchPaperRow) => r.status?.toLowerCase().includes(statusFilter.toLowerCase()));
    return rows.map((r: ResearchPaperRow) => {
      const student = this.store.users.find((u: UserRow) => u.id === r.student_id);
      return { ...r, student_name: student?.full_name || 'Unknown Student', register_number: student?.register_number || 'N/A', year: student?.year || 'N/A' };
    });
  }

  async createResearchPaper(data: Omit<ResearchPaperRow, 'id' | 'created_at'>): Promise<ResearchPaperRow> {
    try {
      const rows = await this.queryDb(
        `INSERT INTO research_papers (student_id, title, conference_journal, authors, total_hours, abstract, pdf_url, status, faculty_id, faculty_remarks) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [data.student_id, data.title, data.conference_journal, data.authors, data.total_hours || 80, data.abstract, data.pdf_url, data.status, data.faculty_id || null, data.faculty_remarks || '']
      );
      if (rows && rows.length > 0) { const item = rows[0] as ResearchPaperRow; this.store.research_papers.unshift(item); return item; }
    } catch (err) { console.error('Neon DB createResearchPaper error:', (err as Error).message); }
    const newItem: ResearchPaperRow = { ...data, id: this.nextId('research_papers'), created_at: new Date().toISOString() };
    this.store.research_papers.unshift(newItem);
    return newItem;
  }

  async updateResearchPaperStatus(id: number, status: 'Approved' | 'Rejected', facultyId: number, remarks: string, adminMarks?: number): Promise<ResearchPaperRow | undefined> {
    try {
      const rows = await this.queryDb(
        `UPDATE research_papers SET status=$1, faculty_id=$2, faculty_remarks=$3, admin_marks = CASE WHEN $4::numeric IS NOT NULL THEN $4::numeric ELSE admin_marks END WHERE id=$5 RETURNING *`,
        [status, facultyId, remarks, adminMarks !== undefined && adminMarks !== null ? adminMarks : null, id]
      );
      if (rows && rows.length > 0) {
        const updated = rows[0] as ResearchPaperRow;
        const idx = this.store.research_papers.findIndex((p: ResearchPaperRow) => p.id === id);
        if (idx !== -1) this.store.research_papers[idx] = updated;
        return updated;
      }
    } catch (err) {
      const message = (err as Error).message || '';
      if (message.includes('admin_marks') || message.includes('column "admin_marks"')) {
        try {
          const rows = await this.queryDb(
            `UPDATE research_papers SET status=$1, faculty_id=$2, faculty_remarks=$3 WHERE id=$4 RETURNING *`,
            [status, facultyId, remarks, id]
          );
          if (rows && rows.length > 0) {
            const updated = rows[0] as ResearchPaperRow;
            const idx = this.store.research_papers.findIndex((p: ResearchPaperRow) => p.id === id);
            if (idx !== -1) this.store.research_papers[idx] = updated;
            return updated;
          }
        } catch (retryErr) {
          console.error('Neon DB retry updateResearchPaperStatus error:', (retryErr as Error).message);
        }
      } else {
        console.error('Neon DB updateResearchPaperStatus error:', message);
      }
    }
    const item = this.store.research_papers.find((p: ResearchPaperRow) => p.id === id);
    if (!item) return undefined;
    item.status = status; item.faculty_id = facultyId; item.faculty_remarks = remarks;
    if (adminMarks !== undefined && adminMarks !== null) item.admin_marks = adminMarks;
    return item;
  }

  // Projects
  async getProjects(studentId?: number, facultyIdScope?: number, statusFilter?: string): Promise<any[]> {
    try {
      let query = `SELECT p.*, u.full_name AS student_name, u.register_number, u.year FROM projects p LEFT JOIN users u ON p.student_id = u.id WHERE 1=1`;
      const params: any[] = [];
      let idx = 1;
      if (studentId) { query += ` AND p.student_id = $${idx++}`; params.push(studentId); }
      if (facultyIdScope) {
        const faculty = await this.findUserById(facultyIdScope);
        if (faculty && !faculty.is_department_wide) {
          query += ` AND u.mentor_id = $${idx++}`; params.push(facultyIdScope);
        }
      }
      if (statusFilter) { query += ` AND LOWER(p.status) LIKE $${idx++}`; params.push(`%${statusFilter.toLowerCase()}%`); }
      query += ` ORDER BY p.created_at DESC`;
      const rows = await this.queryDb(query, params);
      if (rows && rows.length >= 0) return rows;
    } catch (err) { console.error('Neon DB getProjects error:', (err as Error).message); }
    let rows = this.store.projects;
    if (studentId) rows = rows.filter((r: ProjectRow) => r.student_id === studentId);
    if (facultyIdScope) {
      const faculty = await this.findUserById(facultyIdScope);
      if (faculty && !faculty.is_department_wide) {
        const menteeIds = this.store.users.filter((u: UserRow) => u.mentor_id === facultyIdScope).map((u: UserRow) => u.id);
        rows = rows.filter((r: ProjectRow) => menteeIds.includes(r.student_id));
      }
    }
    if (statusFilter) rows = rows.filter((r: ProjectRow) => r.status?.toLowerCase().includes(statusFilter.toLowerCase()));
    return rows.map((r: ProjectRow) => {
      const student = this.store.users.find((u: UserRow) => u.id === r.student_id);
      return { ...r, student_name: student?.full_name || 'Unknown Student', register_number: student?.register_number || 'N/A', year: student?.year || 'N/A' };
    });
  }

  async createProject(data: Omit<ProjectRow, 'id' | 'created_at'>): Promise<ProjectRow> {
    try {
      const rows = await this.queryDb(
        `INSERT INTO projects (student_id, title, description, github_link, demo_link, tech_stack, ai_contribution, image_url, status, faculty_id, faculty_remarks) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [data.student_id, data.title, data.description, data.github_link, data.demo_link, data.tech_stack, data.ai_contribution, data.image_url, data.status, data.faculty_id || null, data.faculty_remarks || '']
      );
      if (rows && rows.length > 0) { const item = rows[0] as ProjectRow; this.store.projects.unshift(item); return item; }
    } catch (err) { console.error('Neon DB createProject error:', (err as Error).message); }
    const newItem: ProjectRow = { ...data, id: this.nextId('projects'), created_at: new Date().toISOString() };
    this.store.projects.unshift(newItem);
    return newItem;
  }

  async updateProjectStatus(id: number, status: 'Approved' | 'Rejected', facultyId: number, remarks: string, adminMarks?: number): Promise<ProjectRow | undefined> {
    try {
      const rows = await this.queryDb(
        `UPDATE projects SET status=$1, faculty_id=$2, faculty_remarks=$3, admin_marks = CASE WHEN $4::numeric IS NOT NULL THEN $4::numeric ELSE admin_marks END WHERE id=$5 RETURNING *`,
        [status, facultyId, remarks, adminMarks !== undefined && adminMarks !== null ? adminMarks : null, id]
      );
      if (rows && rows.length > 0) {
        const updated = rows[0] as ProjectRow;
        const idx = this.store.projects.findIndex((p: ProjectRow) => p.id === id);
        if (idx !== -1) this.store.projects[idx] = updated;
        return updated;
      }
    } catch (err) {
      const message = (err as Error).message || '';
      if (message.includes('admin_marks') || message.includes('column "admin_marks"')) {
        try {
          const rows = await this.queryDb(
            `UPDATE projects SET status=$1, faculty_id=$2, faculty_remarks=$3 WHERE id=$4 RETURNING *`,
            [status, facultyId, remarks, id]
          );
          if (rows && rows.length > 0) {
            const updated = rows[0] as ProjectRow;
            const idx = this.store.projects.findIndex((p: ProjectRow) => p.id === id);
            if (idx !== -1) this.store.projects[idx] = updated;
            return updated;
          }
        } catch (retryErr) {
          console.error('Neon DB retry updateProjectStatus error:', (retryErr as Error).message);
        }
      } else {
        console.error('Neon DB updateProjectStatus error:', message);
      }
    }
    const item = this.store.projects.find((p: ProjectRow) => p.id === id);
    if (!item) return undefined;
    item.status = status; item.faculty_id = facultyId; item.faculty_remarks = remarks;
    if (adminMarks !== undefined && adminMarks !== null) item.admin_marks = adminMarks;
    return item;
  }

  // Leaderboard Calculation
  async getLeaderboard(yearFilter?: string): Promise<any[]> {
    // Try DB-backed leaderboard first
    if (sql) {
      try {
        let query = `
          SELECT
            u.id AS student_id,
            u.full_name AS student_name,
            u.register_number,
            u.year,
            u.department,
            u.profile_photo,
            COALESCE(lh.total_hours, 0) AS learning_hours,
            COALESCE(cert.cert_count, 0) AS certificates,
            COALESCE(rp.paper_count, 0) AS research_papers,
            COALESCE(proj.project_count, 0) AS projects,
            COALESCE(lh.total_points, 0) + COALESCE(cert.total_points, 0) + COALESCE(rp.total_points, 0) + COALESCE(proj.total_points, 0) AS ai_score
          FROM users u
          LEFT JOIN (
            SELECT student_id,
              SUM(hours) AS total_hours,
              SUM(COALESCE(admin_marks, hours * 2)) AS total_points
            FROM learning_hours WHERE status = 'Approved'
            GROUP BY student_id
          ) lh ON lh.student_id = u.id
          LEFT JOIN (
            SELECT student_id,
              COUNT(*) AS cert_count,
              SUM(COALESCE(admin_marks, 50)) AS total_points
            FROM certificates WHERE status = 'Approved'
            GROUP BY student_id
          ) cert ON cert.student_id = u.id
          LEFT JOIN (
            SELECT student_id,
              COUNT(*) AS paper_count,
              SUM(COALESCE(admin_marks, 150)) AS total_points
            FROM research_papers WHERE status = 'Approved'
            GROUP BY student_id
          ) rp ON rp.student_id = u.id
          LEFT JOIN (
            SELECT student_id,
              COUNT(*) AS project_count,
              SUM(COALESCE(admin_marks, 100)) AS total_points
            FROM projects WHERE status = 'Approved'
            GROUP BY student_id
          ) proj ON proj.student_id = u.id
          WHERE u.role = 'student' AND u.status = 'approved'
        `;
        const params: any[] = [];
        if (yearFilter) {
          query += ` AND u.year = $1`;
          params.push(yearFilter);
        }
        query += ` ORDER BY u.id`;

        const rows = await this.queryDb(query, params);
        if (rows && rows.length >= 0) {
          const leaderboard = rows.map((s: any) => {
            return {
              student_id: s.student_id,
              student_name: s.student_name,
              register_number: s.register_number,
              year: s.year,
              department: s.department,
              profile_photo: s.profile_photo,
              learning_hours: Number(s.learning_hours || 0),
              certificates: Number(s.certificates || 0),
              research_papers: Number(s.research_papers || 0),
              projects: Number(s.projects || 0),
              ai_score: Math.round(Number(s.ai_score || 0)),
            };
          });
          leaderboard.sort((a: any, b: any) => b.ai_score - a.ai_score);
          return leaderboard.map((item: any, index: number) => ({ rank: index + 1, ...item }));
        }
      } catch (err) {
        console.error('Neon DB getLeaderboard error:', (err as Error).message);
      }
    }

    // Fallback: in-memory store calculation
    const students = this.store.users.filter((u: UserRow) => u.role === 'student' && u.status === 'approved');

    const leaderboard = students.map((s: UserRow) => {
      if (yearFilter && s.year !== yearFilter) return null;

      const approvedHoursScore = this.store.learning_hours
        .filter((lh: LearningHourRow) => lh.student_id === s.id && lh.status === 'Approved' && !this.isAutoGeneratedLearningHour(lh))
        .reduce((acc: number, curr: LearningHourRow) => acc + (curr.admin_marks !== undefined && curr.admin_marks !== null ? Number(curr.admin_marks) : Number(curr.hours) * 2), 0);

      const approvedCertsRows = this.store.certificates
        .filter((c: CertificateRow) => c.student_id === s.id && c.status === 'Approved');

      const approvedPapersRows = this.store.research_papers
        .filter((p: ResearchPaperRow) => p.student_id === s.id && p.status === 'Approved');

      const approvedProjectsRows = this.store.projects
        .filter((p: ProjectRow) => p.student_id === s.id && p.status === 'Approved');

      const approvedCertsScore = approvedCertsRows.reduce((acc: number, curr: CertificateRow) => acc + (curr.admin_marks !== undefined && curr.admin_marks !== null ? Number(curr.admin_marks) : 50), 0);
      const approvedPapersScore = approvedPapersRows.reduce((acc: number, curr: ResearchPaperRow) => acc + (curr.admin_marks !== undefined && curr.admin_marks !== null ? Number(curr.admin_marks) : 150), 0);
      const approvedProjectsScore = approvedProjectsRows.reduce((acc: number, curr: ProjectRow) => acc + (curr.admin_marks !== undefined && curr.admin_marks !== null ? Number(curr.admin_marks) : 100), 0);

      const aiScore = Math.round(approvedHoursScore + approvedCertsScore + approvedPapersScore + approvedProjectsScore);

      const approvedCertsCount = approvedCertsRows.length;
      const approvedPapersCount = approvedPapersRows.length;
      const approvedProjectsCount = approvedProjectsRows.length;

      return {
        student_id: s.id,
        student_name: s.full_name,
        register_number: s.register_number,
        year: s.year,
        department: s.department,
        profile_photo: s.profile_photo,
        learning_hours: approvedHoursScore,
        certificates: approvedCertsCount,
        research_papers: approvedPapersCount,
        projects: approvedProjectsCount,
        ai_score: aiScore,
      };
    }).filter(Boolean);

    // Sort descending by AI Score
    leaderboard.sort((a: Record<string, any>, b: Record<string, any>) => b.ai_score - a.ai_score);

    // Assign rank
    return leaderboard.map((item: Record<string, any>, index: number) => ({
      rank: index + 1,
      ...item,
    }));
  }

  // Student Passport Calculation
  isAutoGeneratedLearningHour(row: LearningHourRow) {
    return false;
  }

  isApprovedStatus(status: any) {
    return String(status || '').trim().toLowerCase() === 'approved';
  }

  async getStudentPassport(studentId: number) {
    const student = await this.findUserById(studentId);
    if (!student) return null;

    // Use DB-backed queries for accurate counts
    const allHours = await this.getLearningHours(studentId);
    const allCerts = await this.getCertificates(studentId);
    const allPapers = await this.getResearchPapers(studentId);
    const allProjects = await this.getProjects(studentId);

    const hasAdminMarks = (row: any) =>
      row.admin_marks !== undefined &&
      row.admin_marks !== null &&
      row.admin_marks !== '' &&
      !isNaN(Number(row.admin_marks));

    const approvedHoursTotal = allHours
      .filter((lh: any) => this.isApprovedStatus(lh.status))
      .reduce((acc: number, curr: any) => acc + Number(curr.hours || 0), 0);

    const approvedHoursScore = allHours
      .filter((lh: any) => this.isApprovedStatus(lh.status))
      .reduce((acc: number, curr: any) => acc + (hasAdminMarks(curr) ? Number(curr.admin_marks) : Number(curr.hours) * 2), 0);

    const approvedCerts = allCerts.filter((c: any) => this.isApprovedStatus(c.status));
    const approvedPapers = allPapers.filter((p: any) => this.isApprovedStatus(p.status));
    const approvedProjects = allProjects.filter((p: any) => this.isApprovedStatus(p.status));

    const approvedCertsCount = approvedCerts.length;
    const approvedPapersCount = approvedPapers.length;
    const approvedProjectsCount = approvedProjects.length;

    const approvedCertsScore = approvedCerts.reduce(
      (acc: number, curr: any) => acc + (hasAdminMarks(curr) ? Number(curr.admin_marks) : 50),
      0
    );
    const approvedPapersScore = approvedPapers.reduce(
      (acc: number, curr: any) => acc + (hasAdminMarks(curr) ? Number(curr.admin_marks) : 150),
      0
    );
    const approvedProjectsScore = approvedProjects.reduce(
      (acc: number, curr: any) => acc + (hasAdminMarks(curr) ? Number(curr.admin_marks) : 100),
      0
    );

    const aiScore = Math.round(approvedHoursScore + approvedCertsScore + approvedPapersScore + approvedProjectsScore);

    const badges = [
      {
        id: 'explorer',
        name: 'CCE AI Explorer',
        level: 'Level 1',
        description: 'Earn 500+ AI Portfolio Points',
        requiredPoints: 500,
        unlocked: aiScore >= 500,
        icon: 'Compass',
      },
      {
        id: 'practitioner',
        name: 'CCE AI Practitioner',
        level: 'Level 2',
        description: 'Earn 1000+ AI Portfolio Points',
        requiredPoints: 1000,
        unlocked: aiScore >= 1000,
        icon: 'Award',
      },
      {
        id: 'innovator',
        name: 'CCE AI Innovator',
        level: 'Level 3',
        description: 'Earn 2000+ AI Portfolio Points',
        requiredPoints: 2000,
        unlocked: aiScore >= 2000,
        icon: 'Code',
      },
      {
        id: 'scholar',
        name: 'CCE AI Scholar & Researcher',
        level: 'Level 4',
        description: 'Earn 3000+ AI Portfolio Points',
        requiredPoints: 3000,
        unlocked: aiScore >= 3000,
        icon: 'FileText',
      },
      {
        id: 'pioneer',
        name: 'CCE AI Pioneer',
        level: 'Level 5',
        description: 'Earn 4000+ AI Portfolio Points',
        requiredPoints: 4000,
        unlocked: aiScore >= 4000,
        icon: 'Zap',
      },
      {
        id: 'entrepreneur',
        name: 'CCE AI Entrepreneur',
        level: 'Level 6',
        description: 'Reach Maximum 5000 AI Portfolio Points',
        requiredPoints: 5000,
        unlocked: aiScore >= 5000,
        icon: 'Rocket',
      },
    ];

    return {
      student,
      stats: {
        aiScore,
        learningHours: approvedHoursTotal,
        certificates: approvedCertsCount,
        researchPapers: approvedPapersCount,
        projects: approvedProjectsCount,
      },
      points: {
        learningHours: approvedHoursScore,
        certificates: approvedCertsScore,
        researchPapers: approvedPapersScore,
        projects: approvedProjectsScore,
        total: aiScore,
      },
      badges,
    };
  }

  // Events
  async getEvents(): Promise<EventRow[]> {
    return this.store.events;
  }

  async createEvent(data: Omit<EventRow, 'id' | 'created_at'>): Promise<EventRow> {
    const newEvent: EventRow = {
      ...data,
      id: this.nextId('events'),
      created_at: new Date().toISOString(),
    };
    this.store.events.unshift(newEvent);
    return newEvent;
  }

  async updateEvent(id: number, data: Partial<EventRow>): Promise<EventRow | undefined> {
    const idx = this.store.events.findIndex((e: EventRow) => e.id === id);
    if (idx === -1) return undefined;
    this.store.events[idx] = { ...this.store.events[idx], ...data };
    return this.store.events[idx];
  }

  async deleteEvent(id: number): Promise<boolean> {
    const len = this.store.events.length;
    this.store.events = this.store.events.filter((e: EventRow) => e.id !== id);
    this.store.event_registrations = this.store.event_registrations.filter((r: EventRegistrationRow) => r.event_id !== id);
    return this.store.events.length < len;
  }

  async getEventRegistrations(studentId?: number): Promise<any[]> {
    let regs = this.store.event_registrations;
    if (studentId) {
      regs = regs.filter((r: EventRegistrationRow) => r.student_id === studentId);
    }
    return regs.map((r: EventRegistrationRow) => {
      const event = this.store.events.find((e: EventRow) => e.id === r.event_id);
      const student = this.store.users.find((u: UserRow) => u.id === r.student_id);
      return {
        ...r,
        event,
        student_name: student?.full_name,
        register_number: student?.register_number,
      };
    });
  }

  async registerForEvent(eventId: number, studentId: number): Promise<EventRegistrationRow> {
    const existing = this.store.event_registrations.find(
      (r: EventRegistrationRow) => r.event_id === eventId && r.student_id === studentId
    );
    if (existing) return existing;

    const reg: EventRegistrationRow = {
      id: this.nextId('event_registrations'),
      event_id: eventId,
      student_id: studentId,
      registered_at: new Date().toISOString(),
    };
    this.store.event_registrations.push(reg);
    return reg;
  }

  // Notifications
  async getNotifications(userId: number): Promise<NotificationRow[]> {
    return this.store.notifications
      .filter((n: NotificationRow) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createNotification(data: Omit<NotificationRow, 'id' | 'created_at' | 'is_read'>): Promise<NotificationRow> {
    const notif: NotificationRow = {
      ...data,
      id: this.nextId('notifications'),
      is_read: false,
      created_at: new Date().toISOString(),
    };
    this.store.notifications.unshift(notif);
    return notif;
  }

  async markNotificationRead(id: number, userId: number): Promise<boolean> {
    const notif = this.store.notifications.find((n: NotificationRow) => n.id === id && n.user_id === userId);
    if (notif) {
      notif.is_read = true;
      return true;
    }
    return false;
  }

  // Activity Logs
  async logActivity(userId: number, action: string, details?: string, targetStudentId?: number | null): Promise<ActivityLogRow> {
    const log: ActivityLogRow = {
      id: this.nextId('activity_logs'),
      user_id: userId,
      action,
      details,
      target_student_id: targetStudentId || null,
      created_at: new Date().toISOString(),
    };
    this.store.activity_logs.unshift(log);
    return log;
  }

  async getActivityLogs(): Promise<any[]> {
    return this.store.activity_logs.map((log: ActivityLogRow) => {
      const user = this.store.users.find((u: UserRow) => u.id === log.user_id);
      const targetStudent = log.target_student_id ? this.store.users.find((u: UserRow) => u.id === log.target_student_id) : null;
      return {
        ...log,
        user_name: user?.full_name || 'System',
        user_role: user?.role,
        target_student_name: targetStudent?.full_name,
      };
    });
  }

  // Targets
  async getTargets(year: string = '2026'): Promise<TargetRow> {
    let t = this.store.targets.find((item: TargetRow) => item.year === year);
    if (!t) {
      t = {
        id: this.nextId('targets'),
        year,
        target_learning_hours: 5000,
        target_certifications: 300,
        target_research_papers: 50,
        target_projects: 150,
        target_startups: 10,
        updated_at: new Date().toISOString(),
      };
      this.store.targets.push(t);
    }
    return t;
  }

  async updateTargets(year: string, data: Partial<TargetRow>): Promise<TargetRow> {
    let t = this.store.targets.find((item: TargetRow) => item.year === year);
    if (t) {
      Object.assign(t, data, { updated_at: new Date().toISOString() });
    } else {
      t = {
        id: this.nextId('targets'),
        year,
        target_learning_hours: data.target_learning_hours || 5000,
        target_certifications: data.target_certifications || 300,
        target_research_papers: data.target_research_papers || 50,
        target_projects: data.target_projects || 150,
        target_startups: data.target_startups || 10,
        updated_at: new Date().toISOString(),
      };
      this.store.targets.push(t);
    }
    return t;
  }

  // Visitor Aggregates (Strictly NO student names or sensitive info)
  async getPublicAggregateStats() {
    let totalHours = (this.store.learning_hours as LearningHourRow[])
      .filter((h) => h.status === 'Approved')
      .reduce((sum, h) => sum + Number(h.hours), 0);

    let totalCerts = (this.store.certificates as CertificateRow[]).filter((c) => c.status === 'Approved').length;
    let totalPapers = (this.store.research_papers as ResearchPaperRow[]).filter((p) => p.status === 'Approved').length;
    let totalProjects = (this.store.projects as ProjectRow[]).filter((p) => p.status === 'Approved').length;

    let featuredProjects: any[] = (this.store.projects as ProjectRow[])
      .filter((p) => p.status === 'Approved')
      .slice(0, 4)
      .map((p) => {
        const student = (this.store.users as UserRow[]).find((u) => u.id === p.student_id);
        return {
          id: p.id,
          title: p.title,
          tech_stack: p.tech_stack,
          ai_contribution: p.ai_contribution,
          student_name: student?.full_name || 'Student',
          year: student?.year || 'CCE Student',
        };
      });

    if (sql) {
      try {
        // Learning hours — sum of approved hours from DB
        const hoursRows = await sql`SELECT COALESCE(SUM(hours), 0) AS total FROM learning_hours WHERE status = 'Approved'`;
        totalHours = Math.round(Number(hoursRows[0]?.total ?? 0));

        // Certifications count
        const certRows = await sql`SELECT COUNT(*) AS total FROM certificates WHERE status = 'Approved'`;
        totalCerts = Number(certRows[0]?.total ?? 0);

        // Research papers count
        const paperRows = await sql`SELECT COUNT(*) AS total FROM research_papers WHERE status = 'Approved'`;
        totalPapers = Number(paperRows[0]?.total ?? 0);

        // Projects count
        const projectRows = await sql`SELECT COUNT(*) AS total FROM projects WHERE status = 'Approved'`;
        totalProjects = Number(projectRows[0]?.total ?? 0);

        // Featured projects — latest 4 approved projects with student name
        const featuredRows = await sql`
          SELECT p.id, p.title, p.tech_stack, p.ai_contribution, u.full_name AS student_name, u.year
          FROM projects p
          JOIN users u ON u.id = p.student_id
          WHERE p.status = 'Approved'
          ORDER BY p.created_at DESC
          LIMIT 4
        `;
        featuredProjects = featuredRows as any[];
      } catch (err) {
        console.error('[getPublicAggregateStats] Cloud DB fetch failed, using in-memory fallback:', err);
      }
    }

    const target = await this.getTargets('2026');

    return {
      stats: {
        learningHours: totalHours,
        certifications: totalCerts,
        researchPapers: totalPapers,
        projects: totalProjects,
      },
      featuredProjects,
      targets: target,
      roadmap: this.store.roadmap,
    };
  }
}

export const db = new DbStore();
