import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';

export const VisitorLayout: React.FC = () => {
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Poppins',sans-serif]">
      {/* Visitor Public Navbar (Hidden on Login/Register for clean split page layout) */}
      {!isAuthPage && (
        <header className="sticky top-0 z-50 bg-[#002B5C] text-white border-b border-slate-700/60 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 sm:h-13 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-[#F3B631] text-[#002B5C] font-extrabold flex items-center justify-center text-xs shadow-md ring-2 ring-amber-300/30 group-hover:scale-105 transition-transform">
                CCE
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xs sm:text-sm text-white tracking-tight leading-tight flex items-center gap-1.5">
                  Department of Computer and Communication Engineering
                  <Sparkles className="w-3 h-3 text-[#F3B631]" />
                </span>
                <span className="text-[9px] text-amber-300 font-semibold tracking-wide leading-tight">
                  AI365 Activity Tracking Platform
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-5 text-xs font-semibold text-slate-200">
              <Link to="/" className="hover:text-[#F3B631] transition-colors">
                Home
              </Link>
              <Link to="/about" className="hover:text-[#F3B631] transition-colors">
                About
              </Link>
              <Link to="/roadmap" className="hover:text-[#F3B631] transition-colors">
                Roadmap
              </Link>
              <Link to="/achievements" className="hover:text-[#F3B631] transition-colors">
                Achievements
              </Link>
              <Link to="/gallery" className="hover:text-[#F3B631] transition-colors">
                Gallery
              </Link>
            </nav>

            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#004990] hover:bg-[#003870] text-white rounded-lg text-xs font-bold transition-all shadow-sm border border-blue-400/30"
              >
                <LogIn className="w-3 h-3 text-[#F3B631]" />
                <span>Portal Login</span>
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all border border-white/20"
              >
                <UserPlus className="w-3 h-3" />
                <span>Student Register</span>
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Main Content View */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Visitor Public Footer */}
      {!isAuthPage && (
        <footer className="bg-[#001E42] text-slate-300 text-xs border-t border-slate-800 py-10 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#F3B631] text-[#002B5C] font-bold flex items-center justify-center text-sm">
                  365
                </div>
                <span className="font-extrabold text-base text-white">AI365 @ CCE</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Building an AI-Ready Generation. Track learning hours, industry certifications, research publications, and AI solutions.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 text-sm">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Department Overview
                  </Link>
                </li>
                <li>
                  <Link to="/roadmap" className="hover:text-white transition-colors">
                    12-Month AI Roadmap
                  </Link>
                </li>
                <li>
                  <Link to="/achievements" className="hover:text-white transition-colors">
                    Student Publications
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" className="hover:text-white transition-colors">
                    CCE Innovation Labs
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 text-sm">Role Portals</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link to="/login" className="hover:text-[#F3B631] transition-colors">
                    Student Dashboard Login
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[#F3B631] transition-colors">
                    Faculty Mentors Portal
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[#F3B631] transition-colors">
                    CCE Admin Command Center
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 text-sm">Contact Department</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Department of Computer & Communication Engineering
                <br />
                Academic Block 4, Main Campus
                <br />
                Email: ai365cce@gmail.com
                <br />
                Phone: +91 (080) 2839-4000
              </p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-800/80 text-center text-slate-500 text-[11px]">
            © {new Date().getFullYear()} AI365 @ CCE — Department of Computer & Communication Engineering. All rights reserved.
          </div>
        </footer>
      )}
    </div>
  );
};
