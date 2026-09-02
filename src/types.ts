export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  department: string;
  register_number?: string;
  year?: string;
  phone?: string;
  profile_photo?: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  mentor_id?: number | null;
  mentor_name?: string | null;
  is_department_wide?: boolean;
  created_at: string;
}

export interface LearningHour {
  id: number;
  student_id: number;
  student_name?: string;
  register_number?: string;
  year?: string;
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

export interface Certificate {
  id: number;
  student_id: number;
  student_name?: string;
  register_number?: string;
  year?: string;
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

export interface ResearchPaper {
  id: number;
  student_id: number;
  student_name?: string;
  register_number?: string;
  year?: string;
  title: string;
  conference_journal: string;
  authors: string;
  abstract: string;
  pdf_url: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  faculty_id?: number | null;
  faculty_remarks?: string;
  admin_marks?: number;
  created_at: string;
}

export interface Project {
  id: number;
  student_id: number;
  student_name?: string;
  register_number?: string;
  year?: string;
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

export interface EventItem {
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

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'approval' | 'registration' | 'event' | 'system';
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface LeaderboardItem {
  rank: number;
  student_id: number;
  student_name: string;
  register_number: string;
  year: string;
  department: string;
  profile_photo: string;
  learning_hours: number;
  certificates: number;
  research_papers: number;
  projects: number;
  ai_score: number;
}

export interface PassportBadge {
  id: string;
  name: string;
  level: string;
  description: string;
  unlocked: boolean;
  progress: number;
  icon: string;
}

export interface Target {
  id: number;
  year: string;
  target_learning_hours: number;
  target_certifications: number;
  target_research_papers: number;
  target_projects: number;
  target_startups: number;
  updated_at: string;
}

/**
 * Helper to normalize certificate_url and document paths.
 * Converts local Windows paths like "F:\AI_365\AI365\assets\Documents\Dinesh_S\certificates\Dinesh_S_Solo_Learn"
 * into clean intranet HTTP URLs (e.g. "/assets/Documents/Dinesh_S/certificates/Dinesh_S_Solo_Learn").
 */
export function getDocumentUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Normalize backslashes to forward slashes
  const normalized = trimmed.replace(/\\/g, '/');

  // Match full Windows/absolute paths containing assets/Documents/
  const assetsDocsMatch = normalized.match(/assets\/Documents\/(.+)$/i);
  if (assetsDocsMatch && assetsDocsMatch[1]) {
    return `/assets/Documents/${assetsDocsMatch[1]}`;
  }

  // Match old-style /documents/ paths and convert to /assets/Documents/
  const oldDocsMatch = normalized.match(/^\/?documents\/(.+)$/i);
  if (oldDocsMatch && oldDocsMatch[1]) {
    return `/assets/Documents/${oldDocsMatch[1]}`;
  }

  // Match paths starting with Documents/ (no leading slash)
  const docsMatch = normalized.match(/^Documents\/(.+)$/i);
  if (docsMatch && docsMatch[1]) {
    return `/assets/Documents/${docsMatch[1]}`;
  }

  const assetsMatch = normalized.match(/assets\/(.+)$/i);
  if (assetsMatch && assetsMatch[1]) {
    return `/assets/${assetsMatch[1]}`;
  }

  if (normalized.startsWith('/assets/')) {
    return normalized;
  }

  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

