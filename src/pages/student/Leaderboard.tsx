import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Flame } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Table, Column } from '../../components/common/Table';
import { apiFetch } from '../../services/api';
import { LeaderboardItem } from '../../types';

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('All');

  const fetchLeaderboard = async () => {
    try {
      const url = selectedYear === 'All' ? '/api/leaderboard' : `/api/leaderboard?year=${encodeURIComponent(selectedYear)}`;
      const data = await apiFetch<{ leaderboard: LeaderboardItem[] }>(url);
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedYear]);

  const topThree = leaderboard.slice(0, 3);

  const columns: Column<LeaderboardItem>[] = [
    {
      header: 'Rank',
      cell: (row) => {
        if (row.rank === 1)
          return (
            <span className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center text-xs shadow-sm">
              1
            </span>
          );
        if (row.rank === 2)
          return (
            <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black flex items-center justify-center text-xs shadow-sm">
              2
            </span>
          );
        if (row.rank === 3)
          return (
            <span className="w-7 h-7 rounded-full bg-amber-700 text-amber-100 font-black flex items-center justify-center text-xs shadow-sm">
              3
            </span>
          );
        return <span className="font-bold text-slate-500 pl-2">#{row.rank}</span>;
      },
    },
    {
      header: 'Student Name',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <img
            src={row.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={row.student_name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
          />
          <div>
            <p className="font-bold text-slate-900">{row.student_name}</p>
            <p className="text-[11px] text-slate-500">{row.register_number} • {row.year}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Learning Hours',
      cell: (row) => <span className="font-semibold text-slate-700">{row.learning_hours} hrs</span>,
    },
    {
      header: 'Certs',
      accessorKey: 'certificates',
    },
    {
      header: 'Papers',
      accessorKey: 'research_papers',
    },
    {
      header: 'Projects',
      accessorKey: 'projects',
    },
    {
      header: 'AI Score Points',
      cell: (row) => (
        <span className="font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 text-xs">
          {row.ai_score} pts
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002B5C] via-[#004990] to-slate-900 text-white rounded-[24px] p-6 lg:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#F3B631] text-[#002B5C] text-[11px] font-extrabold uppercase tracking-wider mb-2">
            CCE Department Rankings
          </span>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-2">
            CCE AI Leaderboard <Trophy className="w-6 h-6 text-[#F3B631]" />
          </h2>
          <p className="text-xs text-slate-200 mt-1">
            Real-time standings based on verified learning hours, certificates, research publications, and AI solutions.
          </p>
        </div>

        {/* Year Filter */}
        <div className="flex items-center space-x-2 bg-white/10 p-1.5 rounded-2xl border border-white/20 shrink-0">
          {['All', '1st Year', '2nd Year', '3rd Year', '4th Year'].map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedYear === yr
                  ? 'bg-[#F3B631] text-[#002B5C] shadow-sm'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Visual Cards */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* 2nd Place Silver */}
          <div className="bg-white rounded-[24px] border-2 border-slate-300 p-6 shadow-md text-center flex flex-col items-center justify-between relative order-2 md:order-1 mt-0 md:mt-6">
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-slate-300 text-slate-900 font-extrabold flex items-center justify-center text-sm shadow">
              2
            </div>
            <img
              src={topThree[1].profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={topThree[1].student_name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-300 shadow-md mb-3 mt-2"
            />
            <h3 className="font-extrabold text-slate-900 text-base">{topThree[1].student_name}</h3>
            <p className="text-xs text-slate-500 font-semibold">{topThree[1].register_number} • {topThree[1].year}</p>
            <div className="mt-4 px-4 py-2 bg-slate-100 rounded-xl font-black text-slate-800 text-lg">
              {topThree[1].ai_score} <span className="text-xs font-semibold text-slate-500">pts</span>
            </div>
          </div>

          {/* 1st Place Gold Champion */}
          <div className="bg-gradient-to-b from-amber-50 to-white rounded-[28px] border-4 border-[#F3B631] p-6 shadow-xl text-center flex flex-col items-center justify-between relative order-1 md:order-2 ring-4 ring-amber-200/50">
            <div className="absolute -top-5 px-3 py-1 rounded-full bg-[#F3B631] text-[#002B5C] font-black flex items-center gap-1 text-xs shadow-md">
              <Trophy className="w-3.5 h-3.5" /> 1st Place Gold
            </div>
            <img
              src={topThree[0].profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={topThree[0].student_name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-[#F3B631] shadow-lg mb-3 mt-2"
            />
            <h3 className="font-black text-slate-900 text-lg">{topThree[0].student_name}</h3>
            <p className="text-xs text-amber-800 font-bold">{topThree[0].register_number} • {topThree[0].year}</p>
            <div className="mt-4 px-6 py-2.5 bg-[#002B5C] text-[#F3B631] rounded-2xl font-black text-2xl shadow-md">
              {topThree[0].ai_score} <span className="text-xs text-white font-medium">pts</span>
            </div>
          </div>

          {/* 3rd Place Bronze */}
          <div className="bg-white rounded-[24px] border-2 border-amber-700/40 p-6 shadow-md text-center flex flex-col items-center justify-between relative order-3 mt-0 md:mt-10">
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-amber-700 text-amber-100 font-extrabold flex items-center justify-center text-sm shadow">
              3
            </div>
            <img
              src={topThree[2].profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={topThree[2].student_name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-amber-700/40 shadow-md mb-3 mt-2"
            />
            <h3 className="font-extrabold text-slate-900 text-base">{topThree[2].student_name}</h3>
            <p className="text-xs text-slate-500 font-semibold">{topThree[2].register_number} • {topThree[2].year}</p>
            <div className="mt-4 px-4 py-2 bg-amber-50 rounded-xl font-black text-amber-900 text-lg">
              {topThree[2].ai_score} <span className="text-xs font-semibold text-slate-500">pts</span>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <Card title="Department Standings Table" subtitle="Verified point rankings for CCE students">
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading standings...</div>
        ) : (
          <Table columns={columns} data={leaderboard} keyExtractor={(r) => r.student_id} />
        )}
      </Card>
    </div>
  );
};
