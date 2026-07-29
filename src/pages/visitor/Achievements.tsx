import React from 'react';
import { Trophy, Rocket, Sparkles, Award, Star } from 'lucide-react';

export const Achievements: React.FC = () => {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-4 font-['Poppins',sans-serif] bg-[#F8FAFC]">
      <div className="max-w-2xl w-full text-center space-y-8">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-400/30 text-amber-600 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>Student Hall of Fame</span>
        </div>

        {/* Header Title */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            CCE AI Achievements & <br />
            <span className="bg-gradient-to-r from-[#002B5C] via-[#1A56C4] to-violet-600 bg-clip-text text-transparent">
              Publications
            </span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base font-medium max-w-lg mx-auto leading-relaxed">
            Celebrating top student research papers, national hackathon podium finishes, and industry certifications at CCE.
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-12 relative overflow-hidden group hover:border-amber-300 transition-all duration-300">
          
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6 flex flex-col items-center">
            
            {/* Icon Circle */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#001E42] via-[#002B5C] to-[#004990] flex items-center justify-center shadow-lg shadow-blue-950/20 group-hover:scale-105 transition-transform duration-300">
              <Trophy className="w-10 h-10 text-[#F3B631]" />
            </div>

            {/* Status Pill */}
            <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-black uppercase tracking-wider">
              <Rocket className="w-3.5 h-3.5 text-amber-600" />
              Coming Soon
            </span>

            {/* Main Message */}
            <div className="space-y-2 max-w-md">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Hall of Fame Under Preparation
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                We are compiling verified research paper publications, patents, and national competition awards from CCE students for the upcoming term.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="pt-4 border-t border-slate-100 w-full flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-600">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                <Star className="w-3.5 h-3.5 text-amber-500" /> Research Papers
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                <Award className="w-3.5 h-3.5 text-blue-500" /> Hackathon Wins
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                <Trophy className="w-3.5 h-3.5 text-emerald-500" /> Certifications
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
