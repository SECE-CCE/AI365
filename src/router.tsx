import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { VisitorLayout } from './layouts/VisitorLayout';
import { StudentLayout } from './layouts/StudentLayout';
import { FacultyLayout } from './layouts/FacultyLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Visitor / Public
import { Home } from './pages/visitor/Home';
import { About } from './pages/visitor/About';
import { Roadmap } from './pages/visitor/Roadmap';
import { Achievements } from './pages/visitor/Achievements';
import { Gallery } from './pages/visitor/Gallery';
import { Team } from './pages/visitor/Team';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Student
import { StudentDashboard } from './pages/student/StudentDashboard';
import { LearningHours } from './pages/student/LearningHours';
import { Certificates } from './pages/student/Certificates';
import { Research } from './pages/student/Research';
import { Projects } from './pages/student/Projects';
import { DigitalPassport } from './pages/student/DigitalPassport';
import { Leaderboard } from './pages/student/Leaderboard';
import { Events } from './pages/student/Events';
import { StudentSettings } from './pages/student/StudentSettings';

// Faculty
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { Approvals } from './pages/faculty/Approvals';
import { FacultyEvents } from './pages/faculty/FacultyEvents';
import { FacultyReports } from './pages/faculty/FacultyReports';
import { FacultySettings } from './pages/faculty/FacultySettings';

// Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { StudentManagement } from './pages/admin/StudentManagement';
import { TargetManagement } from './pages/admin/TargetManagement';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';

export const router = createBrowserRouter([
  // Visitor Public Routes
  {
    path: '/',
    element: <VisitorLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'roadmap', element: <Roadmap /> },
      { path: 'achievements', element: <Achievements /> },
      { path: 'gallery', element: <Gallery /> },
      { path: 'team', element: <Team /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },

  // Student Routes
  {
    path: '/student',
    element: <StudentLayout />,
    children: [
      { index: true, element: <StudentDashboard /> },
      { path: 'learning-hours', element: <LearningHours /> },
      { path: 'certificates', element: <Certificates /> },
      { path: 'research', element: <Research /> },
      { path: 'projects', element: <Projects /> },
      { path: 'passport', element: <DigitalPassport /> },
      { path: 'leaderboard', element: <Leaderboard /> },
      { path: 'events', element: <Events /> },
      { path: 'settings', element: <StudentSettings /> },
    ],
  },

  // Faculty Routes
  {
    path: '/faculty',
    element: <FacultyLayout />,
    children: [
      { index: true, element: <FacultyDashboard /> },
      { path: 'approvals', element: <Approvals /> },
      { path: 'events', element: <FacultyEvents /> },
      { path: 'reports', element: <FacultyReports /> },
      { path: 'settings', element: <FacultySettings /> },
    ],
  },

  // Admin Routes
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'students', element: <StudentManagement /> },
      { path: 'users', element: <UserManagement /> },
      { path: 'targets', element: <TargetManagement /> },
      { path: 'events', element: <FacultyEvents /> },
      { path: 'analytics', element: <AdminAnalytics /> },
      { path: 'reports', element: <AdminReports /> },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },

  // Catch-all
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

if (typeof window !== 'undefined') {
  let lastPath = '';
  router.subscribe((state) => {
    const currentPath = state.location.pathname + state.location.search;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'page_view', page_url: currentPath }),
      }).catch(() => { /* silent fail */ });
    }
  });
}
