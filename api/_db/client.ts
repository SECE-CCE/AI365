import bcrypt from 'bcryptjs';
import pg from 'pg';
import { neon } from '@neondatabase/serverless';

export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2tLrYAIG9SiQ@ep-rapid-dew-auq7msaw-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const sql = neon(DATABASE_URL);

// Seeded Hashed Password for default accounts ('admin123', 'faculty123', 'student123')
const HASHED_ADMIN_PASS = bcrypt.hashSync('admin123', 10);
const HASHED_FACULTY_PASS = bcrypt.hashSync('faculty123', 10);
const HASHED_STUDENT_PASS = bcrypt.hashSync('student123', 10);

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
  status: 'pending_approval' | 'approved' | 'rejected';
  mentor_id?: number | null;
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
  created_at: string;
}

export interface ResearchPaperRow {
  id: number;
  student_id: number;
  title: string;
  conference_journal: string;
  authors: string;
  abstract: string;
  pdf_url: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  faculty_id?: number | null;
  faculty_remarks?: string;
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

// Initial Memory Store Seed Data
const initialStore = {
  users: [
    {
      id: 1,
      full_name: 'Dr. Ananya Roy',
      email: 'admin@cce.edu',
      password: HASHED_ADMIN_PASS,
      role: 'admin',
      department: 'Computer & Communication Engineering',
      phone: '+91 98765 43210',
      profile_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      status: 'approved',
      mentor_id: null,
      is_department_wide: true,
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 2,
      full_name: 'Dr. Rajesh Sharma',
      email: 'dr.sharma@cce.edu',
      password: HASHED_FACULTY_PASS,
      role: 'faculty',
      department: 'Computer & Communication Engineering',
      phone: '+91 98765 12345',
      profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'approved',
      mentor_id: null,
      is_department_wide: true,
      created_at: '2026-01-02T00:00:00Z',
    },
    {
      id: 3,
      full_name: 'Prof. Vikram Kapoor',
      email: 'prof.kapoor@cce.edu',
      password: HASHED_FACULTY_PASS,
      role: 'faculty',
      department: 'Computer & Communication Engineering',
      phone: '+91 98765 67890',
      profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'approved',
      mentor_id: null,
      is_department_wide: false,
      created_at: '2026-01-03T00:00:00Z',
    },
    {
      id: 4,
      full_name: 'Alex Mercer',
      email: 'alex.student@cce.edu',
      password: HASHED_STUDENT_PASS,
      role: 'student',
      department: 'Computer & Communication Engineering',
      register_number: '21CCE042',
      year: '3rd Year',
      phone: '+91 99887 76655',
      profile_photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      status: 'approved',
      mentor_id: 2,
      is_department_wide: false,
      created_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 5,
      full_name: 'Priya Patel',
      email: 'priya.patel@cce.edu',
      password: HASHED_STUDENT_PASS,
      role: 'student',
      department: 'Computer & Communication Engineering',
      register_number: '21CCE088',
      year: '3rd Year',
      phone: '+91 99887 11223',
      profile_photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      status: 'approved',
      mentor_id: 2,
      is_department_wide: false,
      created_at: '2026-01-12T00:00:00Z',
    },
    {
      id: 6,
      full_name: 'Rahul Verma',
      email: 'rahul.verma@cce.edu',
      password: HASHED_STUDENT_PASS,
      role: 'student',
      department: 'Computer & Communication Engineering',
      register_number: '22CCE015',
      year: '2nd Year',
      phone: '+91 99887 33445',
      profile_photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      status: 'approved',
      mentor_id: 3,
      is_department_wide: false,
      created_at: '2026-01-15T00:00:00Z',
    },
    {
      id: 7,
      full_name: 'Sanya Singh',
      email: 'sanya.singh@cce.edu',
      password: HASHED_STUDENT_PASS,
      role: 'student',
      department: 'Computer & Communication Engineering',
      register_number: '23CCE091',
      year: '1st Year',
      phone: '+91 99887 99887',
      profile_photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      status: 'pending_approval',
      mentor_id: 2,
      is_department_wide: false,
      created_at: '2026-02-01T00:00:00Z',
    },
  ] as UserRow[],

  learning_hours: [
    {
      id: 1,
      student_id: 4,
      activity_name: 'Deep Learning Specialization - Neural Networks',
      platform: 'Coursera',
      date: '2026-02-10',
      hours: 28,
      description: 'Completed 4 modules covering backpropagation, hyperparameter tuning, and activation functions.',
      certificate_url: 'https://coursera.org/verify/dl-spec-123',
      status: 'Approved',
      faculty_id: 2,
      faculty_remarks: 'Excellent coverage of foundational neural network architectures.',
      created_at: '2026-02-11T10:00:00Z',
    },
    {
      id: 2,
      student_id: 4,
      activity_name: 'Transformer Architectures & Vision Models Workshop',
      platform: 'NVIDIA Deep Learning Institute',
      date: '2026-02-18',
      hours: 16,
      description: 'Hands-on training on Vision Transformers (ViT) and fine-tuning BERT for classification.',
      certificate_url: 'https://nvidia.dli.com/verify/vit-991',
      status: 'Approved',
      faculty_id: 2,
      faculty_remarks: 'Well documented practical implementation.',
      created_at: '2026-02-19T14:20:00Z',
    },
    {
      id: 3,
      student_id: 4,
      activity_name: 'LLM Fine-Tuning with LoRA & QLoRA',
      platform: 'Hugging Face Academy',
      date: '2026-03-01',
      hours: 24,
      description: 'Fine-tuned Llama-3-8B model on specialized CCE engineering datasets.',
      certificate_url: 'https://huggingface.co/certificates/hf-8812',
      status: 'Pending',
      faculty_id: 2,
      faculty_remarks: '',
      created_at: '2026-03-02T09:15:00Z',
    },
    {
      id: 4,
      student_id: 5,
      activity_name: 'Generative AI & Prompt Engineering Bootcamp',
      platform: 'Google Cloud Skills Boost',
      date: '2026-02-12',
      hours: 32,
      description: 'Learned Vertex AI, Gemini API integration, and structured output prompting.',
      certificate_url: 'https://cloud.google.com/skillsboost/verify/gcp-8821',
      status: 'Approved',
      faculty_id: 2,
      faculty_remarks: 'Good progress in GenAI stack.',
      created_at: '2026-02-13T11:00:00Z',
    },
    {
      id: 5,
      student_id: 6,
      activity_name: 'Computer Vision with OpenCV & PyTorch',
      platform: 'Udemy',
      date: '2026-02-20',
      hours: 20,
      description: 'Built real-time object detection models using YOLOv8.',
      certificate_url: 'https://udemy.com/certificate/UC-881293',
      status: 'Approved',
      faculty_id: 3,
      faculty_remarks: 'Great effort!',
      created_at: '2026-02-21T08:00:00Z',
    },
  ] as LearningHourRow[],

  certificates: [
    {
      id: 1,
      student_id: 4,
      title: 'AWS Certified Machine Learning - Specialty',
      issuer: 'Amazon Web Services',
      completion_date: '2026-01-25',
      certificate_url: 'https://aws.amazon.com/verification/aws-ml-spec-441',
      skills_learned: 'AWS SageMaker, Feature Engineering, Model Deployment, MLOps',
      status: 'Approved',
      faculty_id: 2,
      faculty_remarks: 'Prestigious industry certification achieved.',
      created_at: '2026-01-26T12:00:00Z',
    },
    {
      id: 2,
      student_id: 4,
      title: 'TensorFlow Developer Certificate',
      issuer: 'Google TensorFlow',
      completion_date: '2026-02-05',
      certificate_url: 'https://www.credential.net/tf-dev-9012',
      skills_learned: 'Deep Learning, Computer Vision, Time Series Forecasting, NLP',
      status: 'Approved',
      faculty_id: 2,
      faculty_remarks: 'Verified Google Certification.',
      created_at: '2026-02-06T15:30:00Z',
    },
    {
      id: 3,
      student_id: 5,
      title: 'Microsoft Certified: Azure AI Engineer Associate',
      issuer: 'Microsoft',
      completion_date: '2026-02-14',
      certificate_url: 'https://learn.microsoft.com/credentials/az-ai-301',
      skills_learned: 'Azure Cognitive Services, Azure Machine Learning, Bot Framework',
      status: 'Approved',
      faculty_id: 2,
      faculty_remarks: 'Approved.',
      created_at: '2026-02-15T09:00:00Z',
    },
    {
      id: 4,
      student_id: 6,
      title: 'Deep Learning for Autonomous Vehicles',
      issuer: 'Udacity Nanodegree',
      completion_date: '2026-02-28',
      certificate_url: 'https://confirm.udacity.com/e/ud-99812',
      skills_learned: 'Sensor Fusion, Lane Finding, Kalman Filters, PyTorch',
      status: 'Pending',
      faculty_id: 3,
      faculty_remarks: '',
      created_at: '2026-03-01T16:00:00Z',
    },
  ] as CertificateRow[],

  research_papers: [
    {
      id: 1,
      student_id: 4,
      title: 'Edge-AI Optimization for Low-Power IoT Communication Networks in CCE Labs',
      conference_journal: 'IEEE International Conference on Communications & Signal Processing (ICCSP 2026)',
      authors: 'Alex Mercer, Dr. Rajesh Sharma',
      abstract: 'We propose a novel quantized neural network framework deployed on microcontroller-based edge nodes to reduce network latency by 42% while retaining 96.4% classification accuracy.',
      pdf_url: 'https://ieee.org/papers/iccsp-2026-alex-mercer.pdf',
      status: 'Approved',
      faculty_id: 2,
      faculty_remarks: 'Accepted and presented at IEEE conference.',
      created_at: '2026-02-01T10:00:00Z',
    },
    {
      id: 2,
      student_id: 5,
      title: 'Hybrid Transformer-CNN Architectures for Automated Defect Detection in CCE Hardware',
      conference_journal: 'Journal of Intelligent Systems & Automation',
      authors: 'Priya Patel, Dr. Ananya Roy',
      abstract: 'A combined vision transformer and convolutional backbone designed to detect micro-cracks in PCB boards during automated assembly lines.',
      pdf_url: 'https://springer.com/articles/jisa-2026-priya-patel.pdf',
      status: 'Approved',
      faculty_id: 2,
      faculty_remarks: 'Published in Q2 Scopus Journal.',
      created_at: '2026-02-15T14:00:00Z',
    },
  ] as ResearchPaperRow[],

  projects: [
    {
      id: 1,
      student_id: 4,
      title: 'NeuralSight — Real-Time AI Traffic & Pedestrian Signal Synthesizer',
      description: 'An AI-driven smart traffic monitoring platform utilizing YOLOv8 and Jetson Nano edge boards for adaptive traffic light timing.',
      github_link: 'https://github.com/alexmercer/neuralsight-cce',
      demo_link: 'https://neuralsight-cce.app',
      tech_stack: 'PyTorch, OpenCV, FastAPI, React, Tailwind, MQTT',
      ai_contribution: 'Custom trained YOLOv8 model on localized campus traffic dataset with 94.2% mAP.',
      image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600',
      status: 'Approved',
      faculty_id: 2,
      faculty_remarks: 'Outstanding practical project with clear CCE application.',
      created_at: '2026-01-20T10:00:00Z',
    },
    {
      id: 2,
      student_id: 5,
      title: 'AuraVoice — AI Real-Time Sign Language Translator',
      description: 'Computer vision web application converting Indian Sign Language (ISL) gestures into audible speech in real time.',
      github_link: 'https://github.com/priyapatel/auravoice-isl',
      demo_link: 'https://auravoice.cce.edu',
      tech_stack: 'MediaPipe, TensorFlow.js, Web Speech API, React',
      ai_contribution: '3D hand landmark tracking coupled with an LSTM sequence classifier.',
      image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600',
      status: 'Approved',
      faculty_id: 2,
      faculty_remarks: 'High social impact project.',
      created_at: '2026-02-10T12:00:00Z',
    },
    {
      id: 3,
      student_id: 6,
      title: 'CCE-Genius — Campus AI Academic Advisor Assistant',
      description: 'A RAG-powered student advisor chatbot trained on CCE syllabus, timetables, and research publications.',
      github_link: 'https://github.com/rahulverma/cce-genius',
      demo_link: 'https://cce-genius.dev',
      tech_stack: 'LangChain, Gemini API, Pinecone, Express, React',
      ai_contribution: 'Retrieval-Augmented Generation system with custom vector database indexing CCE departmental PDFs.',
      image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      status: 'Pending',
      faculty_id: 3,
      faculty_remarks: '',
      created_at: '2026-03-02T11:00:00Z',
    },
  ] as ProjectRow[],

  events: [
    {
      id: 1,
      created_by: 2,
      title: 'CCE National AI & Robotics Hackathon 2026',
      description: 'A 36-hour continuous build hackathon focusing on Generative AI, Edge Computing, and Smart Communication Systems.',
      venue: 'CCE Central Innovation Lab, Main Academic Block',
      event_date: '2026-08-15',
      event_time: '09:00 AM',
      max_participants: 150,
      poster_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600',
      category: 'Hackathon',
      created_at: '2026-02-01T00:00:00Z',
    },
    {
      id: 2,
      created_by: 2,
      title: 'Hands-on Workshop: Building Agentic AI with Gemini & LangGraph',
      description: 'Learn to design multi-agent systems, tool-calling pipelines, and autonomous workflow orchestrators.',
      venue: 'CCE Seminar Hall 2',
      event_date: '2026-08-22',
      event_time: '10:00 AM',
      max_participants: 80,
      poster_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600',
      category: 'Workshop',
      created_at: '2026-02-10T00:00:00Z',
    },
    {
      id: 3,
      created_by: 3,
      title: 'Guest Lecture: AI in 6G Telecommunications & Quantum Networks',
      description: 'Distinguished lecture by IEEE Senior Member Dr. Suresh Nair on machine learning in next-gen wireless networks.',
      venue: 'Auditorium 1, CCE Department',
      event_date: '2026-09-05',
      event_time: '02:00 PM',
      max_participants: 200,
      poster_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600',
      category: 'Seminar',
      created_at: '2026-02-15T00:00:00Z',
    },
  ] as EventRow[],

  event_registrations: [
    { id: 1, event_id: 1, student_id: 4, registered_at: '2026-02-15T10:00:00Z' },
    { id: 2, event_id: 2, student_id: 4, registered_at: '2026-02-16T11:30:00Z' },
    { id: 3, event_id: 1, student_id: 5, registered_at: '2026-02-18T09:12:00Z' },
    { id: 4, event_id: 2, student_id: 6, registered_at: '2026-02-20T14:45:00Z' },
  ] as EventRegistrationRow[],

  notifications: [
    {
      id: 1,
      user_id: 4,
      title: 'Submission Approved!',
      message: 'Your Learning Hour submission "Deep Learning Specialization - Neural Networks" was approved by Dr. Rajesh Sharma.',
      type: 'approval',
      is_read: false,
      link: '/student/learning-hours',
      created_at: '2026-02-11T10:00:00Z',
    },
    {
      id: 2,
      user_id: 4,
      title: 'Certificate Verified',
      message: 'Your certificate "AWS Certified Machine Learning" has been verified and added to your AI Passport.',
      type: 'approval',
      is_read: true,
      link: '/student/passport',
      created_at: '2026-01-26T12:00:00Z',
    },
    {
      id: 3,
      user_id: 1,
      title: 'New Student Registration Pending',
      message: 'Sanya Singh (23CCE091, 1st Year) registered and requires admin approval.',
      type: 'registration',
      is_read: false,
      link: '/admin/users',
      created_at: '2026-02-01T00:00:00Z',
    },
    {
      id: 4,
      user_id: 2,
      title: 'New Submissions Pending Review',
      message: 'Alex Mercer submitted "LLM Fine-Tuning with LoRA" for approval.',
      type: 'approval',
      is_read: false,
      link: '/faculty/approvals',
      created_at: '2026-03-02T09:15:00Z',
    },
  ] as NotificationRow[],

  activity_logs: [
    {
      id: 1,
      user_id: 2,
      action: 'Approved Learning Hour',
      details: 'Approved 28 hours for Alex Mercer (Deep Learning Specialization)',
      target_student_id: 4,
      created_at: '2026-02-11T10:00:00Z',
    },
    {
      id: 2,
      user_id: 2,
      action: 'Approved Certificate',
      details: 'Approved AWS Certified Machine Learning for Alex Mercer',
      target_student_id: 4,
      created_at: '2026-01-26T12:00:00Z',
    },
    {
      id: 3,
      user_id: 1,
      action: 'Updated Yearly Targets',
      details: 'Updated CCE 2026 Target: 5,000 Hours, 300 Certificates, 50 Research Papers',
      target_student_id: null,
      created_at: '2026-01-05T09:00:00Z',
    },
  ] as ActivityLogRow[],

  targets: [
    {
      id: 1,
      year: '2026',
      target_learning_hours: 5000,
      target_certifications: 300,
      target_research_papers: 50,
      target_projects: 150,
      target_startups: 10,
      updated_at: '2026-01-05T09:00:00Z',
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

  gallery: [
    {
      id: 1,
      title: 'IEEE CCE Best Student Research Award 2026',
      category: 'Achievement',
      image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600',
      description: 'CCE students Alex Mercer and Priya Patel honored for Edge-AI paper.',
      is_public: true,
      created_at: '2026-02-05T00:00:00Z',
    },
    {
      id: 2,
      title: 'AI Innovation Lab Inauguration',
      category: 'Facility',
      image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600',
      description: 'State-of-the-art GPU server cluster installed for CCE students.',
      is_public: true,
      created_at: '2026-01-15T00:00:00Z',
    },
    {
      id: 3,
      title: 'Hands-on Vision Transformers Workshop',
      category: 'Event',
      image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600',
      description: 'Students working on NVIDIA Jetson Xavier development boards.',
      is_public: true,
      created_at: '2026-02-18T00:00:00Z',
    },
  ] as GalleryRow[],

  announcements: [
    {
      id: 1,
      title: 'Welcome to AI365 @ CCE Platform!',
      content: 'All CCE students are requested to complete their profiles, link their faculty mentors, and log ongoing learning hours.',
      author_id: 1,
      is_public: true,
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 2,
      title: 'Call for Submissions: CCE National AI Hackathon',
      content: 'Registrations are now open for the 2026 Hackathon. Form teams of 2-4 students.',
      author_id: 2,
      is_public: true,
      created_at: '2026-02-01T00:00:00Z',
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

  // Users
  async findUserByEmail(email: string): Promise<UserRow | undefined> {
    try {
      const rows = await sql.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
      if (rows && rows.length > 0) return rows[0] as UserRow;
    } catch (err) {
      console.warn('Neon DB findUserByEmail fallback:', (err as Error).message);
    }
    return this.store.users.find((u: UserRow) => u.email.toLowerCase() === email.toLowerCase());
  }

  async findUserById(id: number): Promise<UserRow | undefined> {
    try {
      const rows = await sql.query('SELECT * FROM users WHERE id = $1', [id]);
      if (rows && rows.length > 0) return rows[0] as UserRow;
    } catch (err) {
      console.warn('Neon DB findUserById fallback:', (err as Error).message);
    }
    return this.store.users.find((u: UserRow) => u.id === id);
  }

  async createUser(data: Omit<UserRow, 'id' | 'created_at'>): Promise<UserRow> {
    try {
      const rows = await sql.query(
        `INSERT INTO users (full_name, email, password, role, department, register_number, year, phone, profile_photo, status, mentor_id, is_department_wide)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
    const newUser: UserRow = {
      ...data,
      id: this.nextId('users'),
      created_at: new Date().toISOString(),
    };
    this.store.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, data: Partial<UserRow>): Promise<UserRow | undefined> {
    const idx = this.store.users.findIndex((u: UserRow) => u.id === id);
    if (idx === -1) return undefined;
    this.store.users[idx] = { ...this.store.users[idx], ...data };
    return this.store.users[idx];
  }

  async deleteUser(id: number): Promise<boolean> {
    const initialLen = this.store.users.length;
    this.store.users = this.store.users.filter((u: UserRow) => u.id !== id);
    return this.store.users.length < initialLen;
  }

  async getAllUsers(filters?: { role?: string; department?: string; year?: string; status?: string }): Promise<UserRow[]> {
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
    let rows = this.store.learning_hours;
    if (studentId) {
      rows = rows.filter((r: LearningHourRow) => r.student_id === studentId);
    }
    if (facultyIdScope) {
      const faculty = await this.findUserById(facultyIdScope);
      if (faculty && !faculty.is_department_wide) {
        // Only student mentees assigned to this faculty
        const menteeIds = this.store.users
          .filter((u: UserRow) => u.mentor_id === facultyIdScope)
          .map((u: UserRow) => u.id);
        rows = rows.filter((r: LearningHourRow) => menteeIds.includes(r.student_id));
      }
    }
    if (statusFilter) {
      rows = rows.filter((r: LearningHourRow) => r.status === statusFilter);
    }

    return rows.map((r: LearningHourRow) => {
      const student = this.store.users.find((u: UserRow) => u.id === r.student_id);
      return {
        ...r,
        student_name: student?.full_name || 'Unknown Student',
        register_number: student?.register_number || 'N/A',
        year: student?.year || 'N/A',
      };
    });
  }

  async createLearningHour(data: Omit<LearningHourRow, 'id' | 'created_at'>): Promise<LearningHourRow> {
    const newItem: LearningHourRow = {
      ...data,
      id: this.nextId('learning_hours'),
      created_at: new Date().toISOString(),
    };
    this.store.learning_hours.unshift(newItem);
    return newItem;
  }

  async updateLearningHourStatus(id: number, status: 'Approved' | 'Rejected', facultyId: number, remarks: string): Promise<LearningHourRow | undefined> {
    const item = this.store.learning_hours.find((lh: LearningHourRow) => lh.id === id);
    if (!item) return undefined;
    item.status = status;
    item.faculty_id = facultyId;
    item.faculty_remarks = remarks;
    item.updated_at = new Date().toISOString();
    return item;
  }

  // Certificates
  async getCertificates(studentId?: number, facultyIdScope?: number, statusFilter?: string): Promise<any[]> {
    let rows = this.store.certificates;
    if (studentId) {
      rows = rows.filter((r: CertificateRow) => r.student_id === studentId);
    }
    if (facultyIdScope) {
      const faculty = await this.findUserById(facultyIdScope);
      if (faculty && !faculty.is_department_wide) {
        const menteeIds = this.store.users
          .filter((u: UserRow) => u.mentor_id === facultyIdScope)
          .map((u: UserRow) => u.id);
        rows = rows.filter((r: CertificateRow) => menteeIds.includes(r.student_id));
      }
    }
    if (statusFilter) {
      rows = rows.filter((r: CertificateRow) => r.status === statusFilter);
    }

    return rows.map((r: CertificateRow) => {
      const student = this.store.users.find((u: UserRow) => u.id === r.student_id);
      return {
        ...r,
        student_name: student?.full_name || 'Unknown Student',
        register_number: student?.register_number || 'N/A',
        year: student?.year || 'N/A',
      };
    });
  }

  async createCertificate(data: Omit<CertificateRow, 'id' | 'created_at'>): Promise<CertificateRow> {
    const newItem: CertificateRow = {
      ...data,
      id: this.nextId('certificates'),
      created_at: new Date().toISOString(),
    };
    this.store.certificates.unshift(newItem);
    return newItem;
  }

  async updateCertificateStatus(id: number, status: 'Approved' | 'Rejected', facultyId: number, remarks: string): Promise<CertificateRow | undefined> {
    const item = this.store.certificates.find((c: CertificateRow) => c.id === id);
    if (!item) return undefined;
    item.status = status;
    item.faculty_id = facultyId;
    item.faculty_remarks = remarks;
    return item;
  }

  // Research Papers
  async getResearchPapers(studentId?: number, facultyIdScope?: number, statusFilter?: string): Promise<any[]> {
    let rows = this.store.research_papers;
    if (studentId) {
      rows = rows.filter((r: ResearchPaperRow) => r.student_id === studentId);
    }
    if (facultyIdScope) {
      const faculty = await this.findUserById(facultyIdScope);
      if (faculty && !faculty.is_department_wide) {
        const menteeIds = this.store.users
          .filter((u: UserRow) => u.mentor_id === facultyIdScope)
          .map((u: UserRow) => u.id);
        rows = rows.filter((r: ResearchPaperRow) => menteeIds.includes(r.student_id));
      }
    }
    if (statusFilter) {
      rows = rows.filter((r: ResearchPaperRow) => r.status === statusFilter);
    }

    return rows.map((r: ResearchPaperRow) => {
      const student = this.store.users.find((u: UserRow) => u.id === r.student_id);
      return {
        ...r,
        student_name: student?.full_name || 'Unknown Student',
        register_number: student?.register_number || 'N/A',
        year: student?.year || 'N/A',
      };
    });
  }

  async createResearchPaper(data: Omit<ResearchPaperRow, 'id' | 'created_at'>): Promise<ResearchPaperRow> {
    const newItem: ResearchPaperRow = {
      ...data,
      id: this.nextId('research_papers'),
      created_at: new Date().toISOString(),
    };
    this.store.research_papers.unshift(newItem);
    return newItem;
  }

  async updateResearchPaperStatus(id: number, status: 'Approved' | 'Rejected', facultyId: number, remarks: string): Promise<ResearchPaperRow | undefined> {
    const item = this.store.research_papers.find((p: ResearchPaperRow) => p.id === id);
    if (!item) return undefined;
    item.status = status;
    item.faculty_id = facultyId;
    item.faculty_remarks = remarks;
    return item;
  }

  // Projects
  async getProjects(studentId?: number, facultyIdScope?: number, statusFilter?: string): Promise<any[]> {
    let rows = this.store.projects;
    if (studentId) {
      rows = rows.filter((r: ProjectRow) => r.student_id === studentId);
    }
    if (facultyIdScope) {
      const faculty = await this.findUserById(facultyIdScope);
      if (faculty && !faculty.is_department_wide) {
        const menteeIds = this.store.users
          .filter((u: UserRow) => u.mentor_id === facultyIdScope)
          .map((u: UserRow) => u.id);
        rows = rows.filter((r: ProjectRow) => menteeIds.includes(r.student_id));
      }
    }
    if (statusFilter) {
      rows = rows.filter((r: ProjectRow) => r.status === statusFilter);
    }

    return rows.map((r: ProjectRow) => {
      const student = this.store.users.find((u: UserRow) => u.id === r.student_id);
      return {
        ...r,
        student_name: student?.full_name || 'Unknown Student',
        register_number: student?.register_number || 'N/A',
        year: student?.year || 'N/A',
      };
    });
  }

  async createProject(data: Omit<ProjectRow, 'id' | 'created_at'>): Promise<ProjectRow> {
    const newItem: ProjectRow = {
      ...data,
      id: this.nextId('projects'),
      created_at: new Date().toISOString(),
    };
    this.store.projects.unshift(newItem);
    return newItem;
  }

  async updateProjectStatus(id: number, status: 'Approved' | 'Rejected', facultyId: number, remarks: string): Promise<ProjectRow | undefined> {
    const item = this.store.projects.find((p: ProjectRow) => p.id === id);
    if (!item) return undefined;
    item.status = status;
    item.faculty_id = facultyId;
    item.faculty_remarks = remarks;
    return item;
  }

  // Leaderboard Calculation
  async getLeaderboard(yearFilter?: string): Promise<any[]> {
    const students = this.store.users.filter((u: UserRow) => u.role === 'student' && u.status === 'approved');

    const leaderboard = students.map((s: UserRow) => {
      if (yearFilter && s.year !== yearFilter) return null;

      const approvedHours = this.store.learning_hours
        .filter((lh: LearningHourRow) => lh.student_id === s.id && lh.status === 'Approved')
        .reduce((acc: number, curr: LearningHourRow) => acc + Number(curr.hours), 0);

      const approvedCerts = this.store.certificates
        .filter((c: CertificateRow) => c.student_id === s.id && c.status === 'Approved').length;

      const approvedPapers = this.store.research_papers
        .filter((p: ResearchPaperRow) => p.student_id === s.id && p.status === 'Approved').length;

      const approvedProjects = this.store.projects
        .filter((p: ProjectRow) => p.student_id === s.id && p.status === 'Approved').length;

      // AI Score Formula: Hours * 2 + Certs * 50 + Papers * 150 + Projects * 100
      const aiScore = Math.round(approvedHours * 2 + approvedCerts * 50 + approvedPapers * 150 + approvedProjects * 100);

      return {
        student_id: s.id,
        student_name: s.full_name,
        register_number: s.register_number,
        year: s.year,
        department: s.department,
        profile_photo: s.profile_photo,
        learning_hours: approvedHours,
        certificates: approvedCerts,
        research_papers: approvedPapers,
        projects: approvedProjects,
        ai_score: aiScore,
      };
    }).filter(Boolean);

    // Sort descending by AI Score
    leaderboard.sort((a, b) => b.ai_score - a.ai_score);

    // Assign rank
    return leaderboard.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));
  }

  // Student Passport Calculation
  async getStudentPassport(studentId: number) {
    const student = await this.findUserById(studentId);
    if (!student) return null;

    const approvedHours = this.store.learning_hours
      .filter((lh: LearningHourRow) => lh.student_id === studentId && lh.status === 'Approved')
      .reduce((acc: number, curr: LearningHourRow) => acc + Number(curr.hours), 0);

    const approvedCerts = this.store.certificates
      .filter((c: CertificateRow) => c.student_id === studentId && c.status === 'Approved').length;

    const approvedPapers = this.store.research_papers
      .filter((p: ResearchPaperRow) => p.student_id === studentId && p.status === 'Approved').length;

    const approvedProjects = this.store.projects
      .filter((p: ProjectRow) => p.student_id === studentId && p.status === 'Approved').length;

    const aiScore = Math.round(approvedHours * 2 + approvedCerts * 50 + approvedPapers * 150 + approvedProjects * 100);

    const badges = [
      {
        id: 'explorer',
        name: 'AI Explorer',
        level: 'Level 1',
        description: 'Complete 10+ AI Learning Hours',
        unlocked: approvedHours >= 10,
        progress: Math.min(100, Math.round((approvedHours / 10) * 100)),
        icon: 'Compass',
      },
      {
        id: 'certified',
        name: 'Certified AI Practitioner',
        level: 'Level 2',
        description: 'Earn at least 2 AI Certifications',
        unlocked: approvedCerts >= 2,
        progress: Math.min(100, Math.round((approvedCerts / 2) * 100)),
        icon: 'Award',
      },
      {
        id: 'builder',
        name: 'AI Solution Architect',
        level: 'Level 3',
        description: 'Build 2+ Approved AI Projects',
        unlocked: approvedProjects >= 2,
        progress: Math.min(100, Math.round((approvedProjects / 2) * 100)),
        icon: 'Code',
      },
      {
        id: 'researcher',
        name: 'AI Scholar & Researcher',
        level: 'Level 4',
        description: 'Publish 1+ AI Research Paper',
        unlocked: approvedPapers >= 1,
        progress: Math.min(100, Math.round((approvedPapers / 1) * 100)),
        icon: 'FileText',
      },
      {
        id: 'pioneer',
        name: 'CCE AI Pioneer',
        level: 'Level 5',
        description: 'Achieve 500+ AI Total Points',
        unlocked: aiScore >= 500,
        progress: Math.min(100, Math.round((aiScore / 500) * 100)),
        icon: 'Zap',
      },
      {
        id: 'entrepreneur',
        name: 'AI Innovator & Entrepreneur',
        level: 'Level 6',
        description: 'Achieve 100+ Hours & 3+ Projects & 1 Paper',
        unlocked: approvedHours >= 100 && approvedProjects >= 3 && approvedPapers >= 1,
        progress: Math.min(100, Math.round(((approvedHours / 100 + approvedProjects / 3 + approvedPapers / 1) / 3) * 100)),
        icon: 'Rocket',
      },
    ];

    return {
      student,
      stats: {
        aiScore,
        learningHours: approvedHours,
        certificates: approvedCerts,
        researchPapers: approvedPapers,
        projects: approvedProjects,
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
    const totalHours = this.store.learning_hours
      .filter((lh: LearningHourRow) => lh.status === 'Approved')
      .reduce((acc: number, curr: LearningHourRow) => acc + Number(curr.hours), 0);

    const totalCerts = this.store.certificates.filter((c: CertificateRow) => c.status === 'Approved').length;
    const totalPapers = this.store.research_papers.filter((p: ResearchPaperRow) => p.status === 'Approved').length;
    const totalProjects = this.store.projects.filter((p: ProjectRow) => p.status === 'Approved').length;
    const totalStartups = 3; // department startups metric

    const target = await this.getTargets('2026');

    return {
      totals: {
        learningHours: totalHours,
        certificates: totalCerts,
        researchPapers: totalPapers,
        projects: totalProjects,
        startups: totalStartups,
      },
      targets: target,
      roadmap: this.store.roadmap,
      gallery: this.store.gallery.filter((g: GalleryRow) => g.is_public),
      announcements: this.store.announcements.filter((a: AnnouncementRow) => a.is_public),
      testimonials: [
        {
          id: 1,
          name: 'Dr. Ananya Roy',
          role: 'Head of CCE Department',
          quote: 'AI365 @ CCE has revolutionized our student research tracking and AI certification pipeline across all four academic batches.',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        },
        {
          id: 2,
          name: 'Alex Mercer',
          role: 'CCE 3rd Year Student (Rank #1)',
          quote: 'Logging my AI learning hours and AWS certification on AI365 helped me land my research internship at NVIDIA!',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        },
      ],
    };
  }
}

export const db = new DbStore();
