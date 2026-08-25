import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Lock, Mail, UserCheck, AlertCircle, Loader2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('session_expired') === 'true' || searchParams.get('expired') === 'true') {
      setSessionExpiredNotice(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSessionExpiredNotice(false);

    if (!email.trim() || !password) {
      return setError('Please provide both email and password.');
    }

    setLoading(true);
    try {
      const user = await login(email, password, role);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'faculty') navigate('/faculty');
      else navigate('/student');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-['Poppins',sans-serif]">
      {/* Left Blue Gradient Panel */}
      <div className="lg:w-1/2 bg-gradient-to-br from-[#001E42] via-[#002B5C] to-[#004990] text-white p-6 sm:p-10 lg:p-16 flex flex-col justify-between relative overflow-hidden min-h-[200px] lg:min-h-screen">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#F3B631]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center space-x-3 group mb-12">
            <div className="w-12 h-12 rounded-2xl bg-[#F3B631] text-[#002B5C] font-extrabold flex items-center justify-center text-2xl shadow-xl ring-4 ring-amber-300/30">
              365
            </div>
            <div>
              <span className="font-extrabold text-2xl text-white tracking-tight flex items-center gap-2">
                AI365 @ CCE
                <Sparkles className="w-5 h-5 text-[#F3B631]" />
              </span>
              <span className="text-xs text-slate-300 block -mt-1 font-medium">
                Dept. of Computer & Communication Engineering
              </span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 my-auto text-center lg:text-left py-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-[#F3B631] text-xs font-bold tracking-wider uppercase mb-4 border border-white/10">
            Official AI Activity Tracking Platform
          </span>
          <h2 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight text-white mb-6">
            Building an <span className="text-[#F3B631]">AI-Ready</span> Generation
          </h2>
          <p className="hidden sm:block text-sm lg:text-base text-slate-300 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8">
            Empowering students and faculty in Computer & Communication Engineering to track learning hours, industry certifications, research publications, and AI solutions.
          </p>

          <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs font-bold text-slate-200 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
            <span>Learn</span> • <span>Certify</span> • <span>Research</span> • <span>Build</span> • <span>Innovate</span> • <span className="text-[#F3B631]">Impact</span>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          © {new Date().getFullYear()} CCE Department • All rights reserved.
        </div>
      </div>

      {/* Right Login Form Card */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-[#F8FAFC]">
        <div className="w-full max-w-md bg-white rounded-[24px] shadow-xl border border-slate-200/80 p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Portal Login</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Select your role and enter your CCE credentials.</p>
          </div>

          {sessionExpiredNotice && (
            <div className="mb-4 p-3.5 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200 font-medium flex items-start gap-2 animate-in fade-in duration-200">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>Your session has expired due to inactivity or timeout. Please sign in again to continue.</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Role Selection Dropdown */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Portal Role *</label>
              <div className="relative">
                <UserCheck className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:bg-white focus:border-[#004990] outline-none transition-all"
                >
                  <option value="student">Student Portal</option>
                  <option value="faculty">Faculty Mentor Portal</option>
                  <option value="admin">CCE Admin Command Center</option>
                </select>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">College Email / Username *</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex.student@cce.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-[#004990] outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-[#004990] outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In to Portal'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>New to CCE Portal?</span>
            <Link to="/register" className="text-[#004990] hover:underline font-bold">
              Register Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
