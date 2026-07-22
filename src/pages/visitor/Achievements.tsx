import React, { useState, useEffect } from 'react';
import { Trophy, Award, FileText, Code } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { apiFetch } from '../../services/api';

export const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const data = await apiFetch('/api/visitor/achievements');
        setAchievements(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  const topPapers = achievements?.topPapers || [
    {
      id: 1,
      title: 'Edge-AI Optimization for Low-Power IoT Communication Networks',
      conference_journal: 'IEEE ICCSP 2026',
      authors: 'Alex Mercer, Dr. Rajesh Sharma',
      student_name: 'Alex Mercer',
      year: '3rd Year CCE',
    },
    {
      id: 2,
      title: 'Transformer-Based EEG Signal Classification for Brain-Computer Interfaces',
      conference_journal: 'Springer Lecture Notes in CS',
      authors: 'Elena Rostova, Prof. Anita V',
      student_name: 'Elena Rostova',
      year: '4th Year CCE',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-['Poppins',sans-serif]">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-extrabold text-xs rounded-full uppercase tracking-wider">
          Student Hall of Fame
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          CCE Department AI Achievements
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          Celebrating top research paper publications, national hackathon podium finishes, and industry certifications achieved by CCE students.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900">Featured Conference Publications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topPapers.map((paper: any) => (
            <div key={paper.id} className="bg-white rounded-[24px] border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all space-y-3">
              <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-[10px] rounded-full uppercase">
                {paper.conference_journal}
              </span>
              <h3 className="text-base font-extrabold text-slate-900">{paper.title}</h3>
              <p className="text-xs text-slate-600 font-medium">Authors: {paper.authors}</p>
              <div className="pt-2 border-t border-slate-100 text-xs font-bold text-[#004990]">
                Lead Author: {paper.student_name} ({paper.year})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
