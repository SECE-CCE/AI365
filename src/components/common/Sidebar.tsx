import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  Award,
  FileText,
  Code,
  ShieldCheck,
  Trophy,
  Calendar,
  Settings,
  Users,
  GraduationCap,
  Target,
  BarChart3,
  LogOut,
  Menu,
  X,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDocumentUrl } from '../../types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const studentNav: NavItem[] = [
    { label: 'Dashboard', path: '/student', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Certificates & Hours', path: '/student/certificates', icon: <Award className="w-5 h-5" /> },
    { label: 'Research Papers', path: '/student/research', icon: <FileText className="w-5 h-5" /> },
    { label: 'AI Projects', path: '/student/projects', icon: <Code className="w-5 h-5" /> },
    { label: 'AI Digital Passport', path: '/student/passport', icon: <ShieldCheck className="w-5 h-5" /> },
    { label: 'Leaderboard', path: '/student/leaderboard', icon: <Trophy className="w-5 h-5" /> },
    { label: 'CCE Events', path: '/student/events', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Settings', path: '/student/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const facultyNav: NavItem[] = [
    { label: 'Dashboard', path: '/faculty', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Pending Approvals', path: '/faculty/approvals', icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Manage Events', path: '/faculty/events', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Mentee Reports', path: '/faculty/reports', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Settings', path: '/faculty/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const adminNav: NavItem[] = [
    { label: 'Command Center', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Student Management', path: '/admin/students', icon: <GraduationCap className="w-5 h-5" /> },
    { label: 'User Directory', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { label: 'Target Management', path: '/admin/targets', icon: <Target className="w-5 h-5" /> },
    { label: 'Manage Events', path: '/admin/events', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Website Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Dept Reports', path: '/admin/reports', icon: <FileText className="w-5 h-5" /> },
    { label: 'Dept Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const navItems = user.role === 'admin' ? adminNav : user.role === 'faculty' ? facultyNav : studentNav;

  return (
    <>
      {/* Mobile Hamburger Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#002B5C] text-white flex items-center justify-between px-4 z-40 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#F3B631] text-[#002B5C] font-bold flex items-center justify-center text-lg shadow">
            365
          </div>
          <span className="font-bold text-lg tracking-wide">AI365 @ CCE</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-[#002B5C] text-slate-100 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-xl border-r border-slate-700/50`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-700/60 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F3B631] text-[#002B5C] font-extrabold flex items-center justify-center text-xl shadow-lg ring-2 ring-amber-300/30">
            365
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
              AI365 @ CCE
              <Sparkles className="w-4 h-4 text-[#F3B631]" />
            </h1>
            <p className="text-xs text-slate-300 font-medium capitalize">{user.role} Portal</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/student' || item.path === '/faculty' || item.path === '/admin'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#004990] text-white font-semibold shadow-md border-l-4 border-[#F3B631]'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-700/60 bg-[#001E42]">
          <div className="flex items-center space-x-3 mb-3 p-2 rounded-xl bg-slate-800/40">
            <img
              src={getDocumentUrl(user.profile_photo) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user.full_name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#F3B631]"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 rounded-xl font-medium text-xs transition-colors border border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
