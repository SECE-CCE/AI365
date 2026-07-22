import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Award,
  FileText,
  Code,
  Zap,
  ArrowRight,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Table, Column } from '../../components/common/Table';
import { StatusPill } from '../../components/common/StatusPill';
import { apiFetch } from '../../services/api';
import { PassportBadge } from '../../types';

export const StudentDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const data = await apiFetch('/api/students/dashboard');
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#004990]" />
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    aiScore: 0,
    learningHours: 0,
    certificates: 0,
    researchPapers: 0,
    projects: 0,
  };

  const activities = dashboardData?.recentActivities || [];
  const badges: PassportBadge[] = dashboardData?.badges || [];

  const activityColumns: Column<any>[] = [
    {
      header: 'Type',
      cell: (row) => (
        <span className="font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-[#004990] text-[11px] border border-blue-100">
          {row.type}
        </span>
      ),
    },
    {
      header: 'Activity Title',
      cell: (row) => <span className="font-bold text-slate-900">{row.activity}</span>,
    },
    {
      header: 'Hours',
      accessorKey: 'hours',
      className: 'font-semibold text-slate-700',
    },
    {
      header: 'Date',
      accessorKey: 'date',
    },
    {
      header: 'Status',
      cell: (row) => <StatusPill status={row.status} />,
    },
    {
      header: 'Faculty Remarks',
      cell: (row) => <span className="text-slate-500 italic">{row.remarks}</span>,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-[#002B5C] via-[#004990] to-slate-800 text-white rounded-[24px] p-6 lg:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-[#F3B631] text-[#002B5C] text-[11px] font-extrabold uppercase tracking-wider">
            AI Digital Passport Active
          </span>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Welcome to your CCE AI Portfolio
          </h2>
          <p className="text-xs lg:text-sm text-slate-200 leading-relaxed font-normal">
            Track learning hours, industry certifications, research publications, and AI solutions. Every verified submission automatically earns points towards your CCE Digital Passport.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center min-w-[200px] shrink-0">
          <p className="text-[10px] text-amber-300 uppercase font-bold tracking-widest">Total AI Score</p>
          <p className="text-4xl font-black text-white mt-1">{stats.aiScore}</p>
          <p className="text-[11px] text-slate-300 mt-1 font-medium">Department Rank #1</p>
        </div>
      </div>

      {/* Dynamic Live Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-amber-500 mb-3">
            <Zap className="w-5 h-5 fill-amber-400" />
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Points</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.aiScore}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">AI Score Points</p>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-blue-600 mb-3">
            <Clock className="w-5 h-5" />
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Logged</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.learningHours} <span className="text-xs font-semibold text-slate-500">hrs</span></p>
          <p className="text-xs text-slate-500 font-medium mt-1">Learning Hours</p>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-emerald-600 mb-3">
            <Award className="w-5 h-5" />
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Verified</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.certificates}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">AI Certifications</p>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-indigo-600 mb-3">
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Published</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.researchPapers}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Research Papers</p>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs hover:shadow-md transition-all col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-rose-600 mb-3">
            <Code className="w-5 h-5" />
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Built</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.projects}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">AI Projects</p>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <Card title="Quick Action Submissions" subtitle="Log new learning hours, upload industry certificates, or register papers">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <Link
            to="/student/learning-hours"
            className="p-4 bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-blue-100 text-[#004990] group-hover:scale-110 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800">Log Learning Hours</span>
          </Link>

          <Link
            to="/student/certificates"
            className="p-4 bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800">Add Certificate</span>
          </Link>

          <Link
            to="/student/research"
            className="p-4 bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800">Submit Paper</span>
          </Link>

          <Link
            to="/student/projects"
            className="p-4 bg-slate-50 hover:bg-rose-50/80 border border-slate-200 hover:border-rose-300 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 group-hover:scale-110 transition-transform">
              <Code className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800">Submit AI Project</span>
          </Link>
        </div>
      </Card>

      {/* Digital AI Passport Badges Preview */}
      <Card
        title={
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#004990]" /> Digital AI Passport Badges
          </span>
        }
        subtitle="Computed live from your verified submission history"
        action={
          <Link to="/student/passport" className="text-xs font-bold text-[#004990] hover:underline flex items-center gap-1">
            View Passport <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                b.unlocked
                  ? 'bg-gradient-to-b from-amber-50/80 to-amber-100/40 border-amber-300 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-sm ${
                  b.unlocked ? 'bg-[#F3B631] text-[#002B5C] ring-4 ring-amber-200' : 'bg-slate-200 text-slate-400'
                }`}
              >
                {b.unlocked ? <Award className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
              </div>
              <p className="font-extrabold text-xs text-slate-900 leading-tight">{b.name}</p>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">{b.level}</p>
              <span
                className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full mt-2 ${
                  b.unlocked ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {b.unlocked ? 'Unlocked' : `${b.progress}%`}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Submissions Table */}
      <Card
        title="My Recent Submissions & Activity"
        subtitle="Live status updates from your assigned CCE Faculty Mentors"
      >
        <Table columns={activityColumns} data={activities} keyExtractor={(r) => r.id} />
      </Card>
    </div>
  );
};
