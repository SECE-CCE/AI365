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
