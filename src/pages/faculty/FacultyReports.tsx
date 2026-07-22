import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Award, Download, Clock, FileText } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Table, Column } from '../../components/common/Table';
import { apiFetch } from '../../services/api';

export const FacultyReports: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const data = await apiFetch('/api/faculty/reports');
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#004990]" />
      </div>
    );
  }

  const mentees = reportData?.mentees || [];
  const totals = reportData?.totals || { totalMentees: 0, totalHours: 0, totalCerts: 0, totalPapers: 0, totalProjects: 0 };

  const columns: Column<any>[] = [
    {
      header: 'Mentee Student',
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
      header: 'Certifications',
      accessorKey: 'certificates',
    },
    {
      header: 'Research Papers',
      accessorKey: 'research_papers',
    },
    {
      header: 'AI Projects',
      accessorKey: 'projects',
    },
    {
      header: 'AI Score',
      cell: (row) => (
        <span className="font-bold text-[#004990] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 text-xs">
          {row.ai_score} pts
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mentee Performance Analytics</h2>
          <p className="text-xs text-slate-500 font-medium">Aggregated academic & industry readiness reports for assigned students</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-slate-500">Total Mentees</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{totals.totalMentees}</p>
        </div>
        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-slate-500">Total Learning Hours</p>
          <p className="text-3xl font-black text-[#004990] mt-1">{totals.totalHours} hrs</p>
        </div>
        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-slate-500">Verified Certs</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{totals.totalCerts}</p>
        </div>
        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-slate-500">Papers & Projects</p>
          <p className="text-3xl font-black text-indigo-600 mt-1">{totals.totalPapers + totals.totalProjects}</p>
        </div>
      </div>

      {/* Mentees Table */}
      <Card title="Assigned Mentees Summary" subtitle="Live performance breakdown per student">
        <Table columns={columns} data={mentees} keyExtractor={(r) => r.student_id} />
      </Card>
    </div>
  );
};
