# 🚀 AI365 @ CCE — Production Infrastructure & Technical Guide

**Department of Computer and Communication Engineering (CCE)**  
*AI Activity Tracking, Skill Passport, & Mentorship Governance Platform*

---

## 📋 Executive Overview

**AI365 @ CCE** is a enterprise-ready full-stack academic governance platform built for the Department of Computer and Communication Engineering. It tracks, verifies, and certifies AI learning hours, industry certifications, research publications, and hardware/software projects across all student batches (1st Year to 4th Year).

The system features:
- **Role-Based Portals**: Public Visitor, Student Workspace, Faculty Mentor Verification, and Department Admin Command Center.
- **Digital Skill Passport**: Automated generation of verifiable academic achievements and skill credit metrics.
- **Hybrid Infrastructure**: Deployable on Cloud (Vercel Serverless + Neon Postgres) or On-Premises Local Host PC with custom network access.

---

## 🛠️ Full Technical Stack

### **Frontend Framework & Libraries**
- **Core**: React 19, TypeScript (`~5.8`), Vite (`^6.2`)
- **Routing**: React Router v7 (`react-router-dom ^7.18`)
- **Styling & UI**: Tailwind CSS v4 (`@tailwindcss/vite ^4.1`), Motion (`motion ^12.23`), Lucide Icons (`lucide-react`)
- **Utilities**: `canvas-confetti`, `clsx`, `tailwind-merge`

### **Backend Framework & Serverless API**
- **Server Runtime**: Node.js ESM / Express.js (`^4.21`), `tsx` runner
- **API Architecture**: Modular Express routes under `/api/*`, natively compatible with Vercel Serverless Functions (`@vercel/node`)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `httpOnly` secure cookies (`cookie-parser`), `bcryptjs` password hashing, fallback `localStorage` Bearer token header
- **AI Engine**: Google Gen AI SDK (`@google/genai ^2.4`) for intelligent summary generation and insights

### **Database Infrastructure**
- **Database**: PostgreSQL (Serverless Neon DB / Railway Postgres / On-Premises Postgres)
- **Database Drivers**: `@neondatabase/serverless ^1.1` (HTTP fetch connection pooler for serverless environments) and `pg ^8.22` (TCP connection pool for traditional Node servers)

---

## 🔑 Environment Variables & API Key Registry

For DevOps and Cloud Engineers deploying this project, the table below lists all required environment variables:

| Variable Name | Required? | Description & Purpose | Example Value |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string (Neon DB pooled HTTP URL or local Postgres URL) | `postgresql://user:pass@ep-xyz.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | **Yes** | 64-character secret key used to sign and verify authentication JWT cookies/tokens | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `GEMINI_API_KEY` | *Optional* | Google Gemini AI API key for AI feature integrations (insights & summaries) | `AIzaSyB...your_gemini_key` |
| `APP_URL` | **Yes** | Base URL of the deployed application (used for CORS and redirect URLs) | `https://ai365-cce.vercel.app` or `http://192.168.1.50:3000` |
| `PORT` | *Optional* | HTTP server port for local or PC host deployments (Defaults to `3000`) | `3000` |
| `NODE_ENV` | *Optional* | Execution environment (`development` or `production`) | `production` |

> 💡 **Generating a Secure JWT Secret**: Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` in your terminal.

---

## 📁 Workspace Directory Architecture

```
AI365/
├── api/                       # Express Backend API & Serverless Handlers
│   ├── _db/                   # Database client (pg Pool & Neon HTTP client)
│   │   └── client.ts          # Unified database queries & fallback handling
│   ├── _middleware/           # Authentication & RBAC role guards
│   │   ├── auth.ts            # JWT cookie & Bearer token verifier
│   │   └── roleGuard.ts       # Role authorization middleware
│   ├── _services/             # External services (Drive URL handling, etc.)
│   │   └── drive.ts           # Google Drive shareable link validator
│   ├── admin/                 # Admin routes (users, targets, reports)
│   ├── auth/                  # Authentication routes (login, register, me, logout)
│   ├── events/                # Department event routes & student registration
│   ├── faculty/               # Faculty mentee verification & approvals
│   ├── leaderboard/           # Department ranking queries
│   ├── notifications/         # Real-time user notifications
│   ├── search/                # Universal search queries
│   ├── students/              # Student logging (hours, certs, research, projects)
│   ├── upload/                # Proof document upload helpers
│   ├── visitor/               # Public gallery, roadmap, announcements
│   └── index.ts               # Primary Express app entry point
├── db/                        # Database DDL Schemas
│   └── schema.sql             # PostgreSQL schema definition
├── src/                       # Vite React 19 Frontend Application
│   ├── components/            # Reusable UI components & modals
│   │   ├── common/            # Navbar, Footer, EventRoadmap, ProofModal
│   │   └── forms/             # Student submission forms (Cert, Hours, Research, Project)
│   ├── context/               # Global React Context
│   │   └── AuthContext.tsx    # User session, login, logout, and token state
│   ├── layouts/               # Portal layouts (Visitor, Student, Faculty, Admin)
│   ├── pages/                 # Full application pages (22 Pages)
│   │   ├── admin/             # Admin portal pages
│   │   ├── auth/              # Login & Register pages
│   │   ├── faculty/           # Faculty portal pages
│   │   ├── student/           # Student portal pages
│   │   └── visitor/           # Visitor public pages
│   ├── services/              # Frontend API client
│   │   └── api.ts             # apiFetch utility with automatic auth & event dispatching
│   ├── App.tsx                # App root wrapper
│   ├── main.tsx               # DOM entry point
│   ├── router.tsx             # React Router v7 route registry
│   └── types.ts               # TypeScript data models and interfaces
├── server.ts                  # Local Express server & Vite dev middleware runner
├── vercel.json                # Vercel deployment configuration
└── package.json               # Project manifest and scripts
```

---

## 🗺️ Page-by-Page Technical Breakdown

The platform comprises **22 distinct pages** categorized into 4 distinct portals.

### **1. Public Visitor Portal** (`/`)
- **Home Page** (`src/pages/visitor/Home.tsx`):
  - *Purpose*: Main portal landing page. Displays active department statistics, public announcements, and AI initiative vision.
  - *Data Loading*: Fetches `/api/visitor/announcements` and system counters.
  - *State*: React state for hero sliders and counters.
- **About Page** (`src/pages/visitor/About.tsx`):
  - *Purpose*: Overview of the Computer & Communication Engineering department and AI365 vision.
  - *Data Loading*: Static metadata combined with dynamic department target metrics.
- **Roadmap Page** (`src/pages/visitor/Roadmap.tsx`):
  - *Purpose*: 12-Month Department AI Milestone Roadmap.
  - *Data Loading*: Fetches `/api/visitor/roadmap` (monthly targets, completion status).
  - *State*: Interactive filter by quarter/status (`completed`, `in_progress`, `upcoming`).
- **Achievements Page** (`src/pages/visitor/Achievements.tsx`):
  - *Purpose*: Wall of Fame celebrating top-performing students and research publications.
  - *Data Loading*: Fetches `/api/visitor/achievements` and top student stats.
- **Gallery Page** (`src/pages/visitor/Gallery.tsx`):
  - *Purpose*: Photo gallery of department workshops, hackathons, and guest lectures.
  - *Data Loading*: Fetches `/api/visitor/gallery`.
  - *State*: Lightbox image viewer state.
- **Team Page** (`src/pages/visitor/Team.tsx`):
  - *Purpose*: Leadership directory listing HOD, faculty mentors, and student coordinators.
  - *Data Loading*: Static configuration with dynamic faculty counts.

### **2. Authentication Pages** (`/login`, `/register`)
- **Login Page** (`src/pages/auth/Login.tsx`):
  - *Purpose*: Authenticate Students, Faculty, and Admins.
  - *Data Flow*: Calls `login(email, password, role)` via `AuthContext`, issuing `/api/auth/login`. Sets `httpOnly` cookie and `localStorage` token, then redirects to role portal.
- **Register Page** (`src/pages/auth/Register.tsx`):
  - *Purpose*: Self-registration for new students and faculty members.
  - *Data Flow*: Submits `/api/auth/register`. Students select their assigned Faculty Mentor from dynamically loaded mentor lists (`/api/visitor/mentors`).

### **3. Student Portal** (`/student/*`)
- **Student Dashboard** (`src/pages/student/StudentDashboard.tsx`):
  - *Purpose*: Personalized student cockpit showing target progress bars, total approved learning hours, pending submissions, and assigned mentor details.
  - *Data Loading*: Calls `/api/students/dashboard`.
  - *State*: Re-syncs automatically when `ai365_data_updated` window event fires.
- **Learning Hours** (`src/pages/student/LearningHours.tsx`):
  - *Purpose*: Log self-learning hours (Coursera, NPTEL, YouTube, Udemy).
  - *Data Loading*: Fetches `/api/students/learning-hours`. Submits POST `/api/students/learning-hours`.
- **Certificates** (`src/pages/student/Certificates.tsx`):
  - *Purpose*: Upload and view professional certificates with Google Drive proof URLs.
  - *Data Loading*: Fetches `/api/students/certificates`. Submits POST `/api/students/certificates`.
- **Research Papers** (`src/pages/student/Research.tsx`):
  - *Purpose*: Log IEEE / Springer / Scopus research papers. Automatically credits 80 learning hours upon faculty approval.
  - *Data Loading*: Fetches `/api/students/research`. Submits POST `/api/students/research`.
- **Projects** (`src/pages/student/Projects.tsx`):
  - *Purpose*: Showcase AI projects (GitHub repo, Live Demo, AI tools used).
  - *Data Loading*: Fetches `/api/students/projects`. Submits POST `/api/students/projects`.
- **Digital Passport** (`src/pages/student/DigitalPassport.tsx`):
  - *Purpose*: Generates an official printable and downloadable CCE Digital AI Passport with QR code verification data.
  - *Data Loading*: Fetches complete student portfolio from `/api/students/passport`.
- **Leaderboard** (`src/pages/student/Leaderboard.tsx`):
  - *Purpose*: Real-time student ranking board based on validated learning hours.
  - *Data Loading*: Fetches `/api/leaderboard?year=all`.
  - *State*: Filter by academic year (1st, 2nd, 3rd, 4th Year).
- **Events** (`src/pages/student/Events.tsx`):
  - *Purpose*: Explore department hackathons/workshops and register in one click.
  - *Data Loading*: Fetches `/api/events`. Submits POST `/api/events/:id/register`.
- **Student Settings** (`src/pages/student/StudentSettings.tsx`):
  - *Purpose*: Update profile photo, contact details, and account password.

### **4. Faculty Mentor Portal** (`/faculty/*`)
- **Faculty Dashboard** (`src/pages/faculty/FacultyDashboard.tsx`):
  - *Purpose*: Cockpit displaying assigned mentees, total pending approvals queue, and mentee statistics.
  - *Data Loading*: Fetches `/api/faculty/dashboard`.
- **Approvals Workspace** (`src/pages/faculty/Approvals.tsx`):
  - *Purpose*: Main verification desk. Faculty inspect proof links (certificates, PDFs, GitHub links) and Approve or Reject submissions with remarks.
  - *Data Loading*: Fetches `/api/faculty/pending`. Submits POST `/api/faculty/approve` or `/api/faculty/reject`.
- **Faculty Events** (`src/pages/faculty/FacultyEvents.tsx`):
  - *Purpose*: Create and publish department events, view registered attendees.
  - *Data Loading*: Fetches `/api/events`. Submits POST `/api/events`.
- **Faculty Reports** (`src/pages/faculty/FacultyReports.tsx`):
  - *Purpose*: Generate mentee performance summaries and export CSV report data.
- **Faculty Settings** (`src/pages/faculty/FacultySettings.tsx`):
  - *Purpose*: Profile management for faculty members.

### **5. Admin Command Center** (`/admin/*`)
- **Admin Dashboard** (`src/pages/admin/AdminDashboard.tsx`):
  - *Purpose*: Overall department governance, aggregate learning hours, total certificates, global progress vs department target.
  - *Data Loading*: Fetches `/api/admin/dashboard`.
- **User Management** (`src/pages/admin/UserManagement.tsx`):
  - *Purpose*: User governance workspace. Approve pending student/faculty registrations, assign student mentees to faculty mentors, or adjust roles.
  - *Data Loading*: Fetches `/api/admin/users`. Submits POST `/api/admin/users/status` and `/api/admin/users/assign-mentor`.
- **Target Management** (`src/pages/admin/TargetManagement.tsx`):
  - *Purpose*: Configure annual department benchmarks (Target Learning Hours, Target Certifications, Target Research Papers) for each year batch.
  - *Data Loading*: Fetches `/api/admin/targets`. Submits POST `/api/admin/targets`.
- **Admin Reports** (`src/pages/admin/AdminReports.tsx`):
  - *Purpose*: System activity logs, audit trail, and raw CSV data export.
- **Admin Settings** (`src/pages/admin/AdminSettings.tsx`):
  - *Purpose*: System health monitoring and database connection status.

---

## ⚡ How Frontend Communicates with Backend

1. **Unified API Gateway**:  
   All frontend HTTP requests route through `src/services/api.ts` (`apiFetch<T>`).
2. **Authentication Flow**:
   - `apiFetch` attaches `credentials: 'include'` (sending the `httpOnly` JWT cookie automatically).
   - As a fallback for cross-domain environments, it also attaches `Authorization: Bearer <token>` from `localStorage`.
3. **Reactive Global Re-sync**:
   - Whenever any `POST`, `PUT`, `DELETE`, or `PATCH` request succeeds, `apiFetch` dispatches a custom browser window event `ai365_data_updated`.
   - Active dashboard components listen for this event and immediately refresh state without requiring a full page reload.

---

## 📊 Database Capacity Analysis: 300+ Users on Free Tier

### **Is Neon / PostgreSQL Free Tier capable of handling 300+ active users?**
**YES, ABSOLUTELY.** Here is the technical breakdown proving why:

1. **Storage Consumption Calculation**:
   - Neon DB Free Tier provides **512 MB (0.5 GB)** of PostgreSQL storage.
   - 300 students + 20 faculty + 5 admins = **325 Users total**.
   - Average database footprint per active student (20 learning logs + 5 certificates + 2 papers + 3 projects + notifications): **~50 KB**.
   - Total expected storage for 300+ users: `325 users * 50 KB = 16.25 MB`.
   - **Storage Usage**: `16.25 MB / 512 MB` = **~3.1% of Free Tier Limit**.

2. **Connection Pooling & Concurrent Users**:
   - The backend uses `@neondatabase/serverless` which executes SQL queries over stateless HTTP fetch requests.
   - Connection limits do NOT get exhausted during peak usage because HTTP-based queries do not maintain persistent TCP socket locks.
   - Neon's HTTP Proxy handles hundreds of rapid queries per second effortlessly.

3. **Conclusion**:
   The free tier of Neon DB or Railway Postgres can easily serve 300+ active users without any performance degradation or hosting costs.

---

## 🚀 Deployment Options

### **Option 1: Cloud Deployment (Vercel + Neon DB)** *(Recommended for 24/7 Online Access)*

#### **Step 1: Set Up Neon Postgres Database**
1. Sign up at [neon.tech](https://neon.tech).
2. Create a project named `ai365-cce`.
3. Copy the **Pooled Connection String** from the Neon dashboard.
4. Run the migration script locally to initialize the schema:
   ```bash
   DATABASE_URL="your_neon_connection_string" npm run db:reset
   ```

#### **Step 2: Deploy to Vercel**
1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) -> **Add New Project** -> Select your repo.
3. Add Environment Variables under **Settings -> Environment Variables**:
   - `DATABASE_URL`: `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require`
   - `JWT_SECRET`: `your_random_64_char_secret`
   - `APP_URL`: `https://your-app.vercel.app`
4. Click **Deploy**. Vercel will automatically build the React Vite frontend and serverless API endpoints.

---

### **Option 2: Local Host PC / Server Deployment** *(On-Premises / Turns off when PC is powered down)*

If you want to host the application on a dedicated computer or lab server inside your college building:

#### **How It Works**:
- The computer runs the server application on port `3000` listening on `0.0.0.0`.
- Any user on the same Wi-Fi / Local Area Network (LAN) can open the app in their browser.
- **Power State Behavior**: When the host computer is turned OFF, the server stops, and the application immediately shuts down/becomes unreachable (as required).

#### **Step 1: Configure & Start Server on Host Computer**
1. Install Node.js on the host PC.
2. Open terminal in project root and create `.env`:
   ```env
   DATABASE_URL="postgresql://user:pass@localhost:5432/ai365"
   JWT_SECRET="local_server_jwt_secret_key"
   PORT=3000
   ```
3. Run database initialization & start server:
   ```bash
   npm run build
   npm start
   ```
   *Output*: `AI365 @ CCE server running on http://localhost:3000`

#### **Step 2: Connect Users on the Local Network (LAN / Wi-Fi)**
1. Find the host computer's IPv4 address:
   - On Windows Command Prompt: `ipconfig` (e.g. `192.168.1.50`)
   - On Linux/Mac: `ifconfig` or `ip a`
2. Share the IP link with users on the network:  
   `http://192.168.1.50:3000`

#### **Step 3: Custom Domain Name Setup on Local Network**
To allow users to type a custom domain like `http://ai365.cce.local:3000` instead of an IP address:

##### **Method A: Router Hostname DNS (Easiest for whole building)**
Add a local DNS entry in the college Wi-Fi Router settings mapping `ai365.cce.local` -> `192.168.1.50`.

##### **Method B: Cloudflare Tunnel (Free Custom Public URL with PC Shut down sync)**
To make it accessible over the internet with a custom domain while keeping the "Shut down when PC is OFF" behavior:
1. Install `cloudflared` on the host PC.
2. Run command:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
3. Cloudflare gives a free secure URL (e.g., `https://ai365-cce.trycloudflare.com`).
4. You can map a custom domain (e.g., `ai365.cce.edu`) in your Cloudflare dashboard to this tunnel.
5. **When the PC is powered off**, the Cloudflare tunnel disconnects automatically, and the site goes offline.

---

## 🧹 Codebase Sanitation & Security Verification

All temporary test strings, hardcoded secrets, and dummy database URLs have been removed from source scripts (`migrate_db.mjs`, `seed_admin.mjs`, `check_db.mjs`, `reset_db.mjs`).

To verify codebase integrity before deployment, run:
```bash
npm run lint
```
*Result*: Clean compilation with 0 errors.

---

## 📞 Default Administrator Credentials

| Role | Initial Email | Default Password | Notes |
| :--- | :--- | :--- | :--- |
| **Department Admin** | `dhamodharan.s@sece.ac.in` | `$ece@2739` | Full administrative control |

*(Admin password can be updated anytime under `/admin/settings`)*

---
*Maintained by Department of Computer and Communication Engineering*
