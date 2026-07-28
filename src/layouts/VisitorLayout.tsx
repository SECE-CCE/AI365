import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sparkles, LogIn, UserPlus, Menu, X } from 'lucide-react';
import seceLogo from '../../assets/sece_logo.png';

export const VisitorLayout: React.FC = () => {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/roadmap', label: 'Roadmap' },
    { to: '/achievements', label: 'Achievements' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/team', label: 'The Team' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Poppins',sans-serif]">
      {!isAuthPage && (
        <header className="sticky top-0 z-50 bg-[#002B5C] text-white border-b border-slate-700/60 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            {/* Brand */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <img
                src={seceLogo}
                alt="Sri Eshwar College of Engineering Logo"
                className="h-9 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-md"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-xs sm:text-sm text-white tracking-tight leading-tight flex items-center gap-1.5">
                  <span className="hidden sm:inline">Sri Eshwar College of Engineering</span>
                  <span className="sm:hidden">SECE</span>
                  <Sparkles className="w-3 h-3 text-[#F3B631]" />
                </span>
                <span className="text-[9px] text-amber-300 font-semibold tracking-wide leading-tight">
                  Department of Computer and Communication Engineering
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-5 text-xs font-semibold text-slate-200">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} className="hover:text-[#F3B631] transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#004990] hover:bg-[#003870] text-white rounded-lg text-xs font-bold transition-all shadow-sm border border-blue-400/30"
              >
                <LogIn className="w-3 h-3 text-[#F3B631]" />
                <span>Portal Login</span>
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all border border-white/20"
              >
                <UserPlus className="w-3 h-3" />
                <span>Register</span>
              </Link>
            </div>

            {/* Mobile: Login + Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#004990] text-white rounded-lg text-xs font-bold border border-blue-400/30"
              >
                <LogIn className="w-3 h-3 text-[#F3B631]" />
                Login
              </Link>
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none"
                aria-label="Toggle navigation"
              >
                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Nav */}
          {mobileNavOpen && (
            <div className="md:hidden bg-[#001E42] border-t border-slate-700/60 px-4 py-3 space-y-1">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileNavOpen(false)}
                  className="block py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-[#F3B631] transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/register"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold text-amber-300 hover:bg-white/10 transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Register Account
              </Link>
            </div>
          )}
        </header>
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      {!isAuthPage && (
        <footer className="bg-[#001E42] text-slate-300 text-xs border-t border-slate-800 py-10 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <img
                  src={seceLogo}
                  alt="Sri Eshwar College of Engineering Logo"
                  className="h-9 w-auto object-contain drop-shadow-md"
                />
                <span className="font-extrabold text-base text-white">AI365 @ CCE</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Building an AI-Ready Generation. Track learning hours, industry certifications, research publications, and AI solutions.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 text-sm">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/" className="hover:text-white transition-colors">Department Overview</Link></li>
                <li><Link to="/roadmap" className="hover:text-white transition-colors">12-Month AI Roadmap</Link></li>
                <li><Link to="/achievements" className="hover:text-white transition-colors">Student Publications</Link></li>
                <li><Link to="/gallery" className="hover:text-white transition-colors">CCE Innovation Labs</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 text-sm">Role Portals</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/login" className="hover:text-[#F3B631] transition-colors">Student Dashboard Login</Link></li>
                <li><Link to="/login" className="hover:text-[#F3B631] transition-colors">Faculty Mentors Portal</Link></li>
                <li><Link to="/login" className="hover:text-[#F3B631] transition-colors">CCE Admin Command Center</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 text-sm">Contact</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                <span className="text-white font-semibold">Sri Eshwar College of Engineering</span><br />
                <br />
                <span className="text-slate-300 font-medium">Department</span><br />
                Department of Computer &amp; Communication Engineering<br />
                <br />
                Email: ai365cce@gmail.com
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
