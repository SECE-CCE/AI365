# AI365 @ CCE — AI Activity Tracking Platform

**Department of Computer and Communication Engineering**

AI365 @ CCE is a production-grade AI Activity Tracking Platform designed for students, faculty mentors, and department administrators in Computer and Communication Engineering.

---

## 🌟 Key Features

- **Role-Based Portals**:
  - **Student Portal**: Log AI learning hours, submit industry certificates (NVIDIA, AWS, Google), record IEEE/Springer research manuscripts, upload GitHub AI projects, view real-time department leaderboards, and generate a certified CCE Digital AI Passport.
  - **Faculty Mentor Portal**: Review assigned mentee submissions with proof document inspection, one-click approvals or rejections with remarks, and department event publishing.
  - **Admin Command Center**: System-wide analytics, target denominator configuration per academic year (1st–4th year), student registration queue management, and faculty scope assignments.
  - **Public Visitor Portal**: Public hero landing page, 12-month AI roadmap, student achievements hall of fame, and department event gallery.
- **Vercel Serverless & Neon Postgres**: Fully compatible serverless API routes (`/api/*`) backed by Neon Postgres database with connection pooling.
- **Security**: JWT authentication in `httpOnly` cookies, bcrypt password hashing, and role-based access control.

---

## 🛠️ Local Development Setup

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd ai365-cce
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file based on `.env.example`:
   ```env
   DATABASE_URL="postgres://user:password@ep-sample-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
   JWT_SECRET="ai365_cce_super_secret_jwt_key_2026"
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   ```

4. **Run Local Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🔑 Default Seed Demo Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Student** | `student@cce.edu` | `student123` | Reg No: `21CCE042` (3rd Year) |
| **Faculty Mentor** | `faculty@cce.edu` | `faculty123` | Dept: Computer & Communication Eng. |
| **Admin** | `admin@cce.edu` | `admin123` | CCE Department Administrator |

---

## 🚀 Vercel Deployment Guide

1. Push code to GitHub repository.
2. Import project into **Vercel**.
3. Set the following Environment Variables in Vercel project settings:
   - `DATABASE_URL`: Your Neon Postgres pooled connection string.
   - `JWT_SECRET`: A secure random string for JWT signing.
4. Deploy! Vercel automatically detects Vite frontend and `/api` serverless function routes.
