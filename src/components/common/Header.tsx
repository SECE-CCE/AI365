import React from 'react';
import { Sparkles, Calendar as CalendarIcon, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from './NotificationBell';
import { SearchBar } from './SearchBar';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  aiScore?: number;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, aiScore }) => {
  const { user } = useAuth();

  if (!user) return null;

  const firstName = user.full_name.split(' ')[0];
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 lg:px-8 py-3.5 transition-all">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title & Welcome Greeting */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {title || `Welcome back, ${firstName}!`}
            {user.role === 'student' && <Sparkles className="w-4 h-4 text-[#F3B631] animate-bounce" />}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {subtitle || `${user.department} • ${user.role.toUpperCase()} Portal`}
          </p>
        </div>

        {/* Search, Stats & Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <SearchBar />

          {/* AI Score Badge for Students */}
          {user.role === 'student' && aiScore !== undefined && (
            <div className="hidden sm:flex items-center space-x-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl shadow-2xs">
              <Award className="w-4 h-4 text-[#F3B631]" />
              <div>
                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">AI Score</p>
                <p className="text-sm font-extrabold text-amber-900 leading-none">{aiScore} pts</p>
              </div>
            </div>
          )}

          {/* Today Date */}
          <div className="hidden xl:flex items-center space-x-1.5 text-xs text-slate-500 font-medium bg-slate-100 px-3 py-2 rounded-xl">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>{todayDate}</span>
          </div>

          {/* Notification Bell */}
          <NotificationBell />

          {/* Profile Avatar */}
          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
            <img
              src={user.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user.full_name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#004990]"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
