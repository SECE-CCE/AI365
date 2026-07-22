import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Clock, Award, Target, Check, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Table, Column } from '../../components/common/Table';
import { apiFetch } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const data = await apiFetch('/api/admin/dashboard');
      setDashboardData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleApproveRegistration = async (userId: number, action: 'approve' | 'reject') => {
    try {
      await apiFetch('/api/admin/users/approve', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          action,
        }),
      });
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#004990]" />
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalStudents: 0,
    totalFaculty: 0,
    pendingRegistrations: 0,
    totalDepartmentHours: 0,
    avgAiScore: 0,
  };
  const pendingUsers = dashboardData?.pendingUsers || [];

  const columns: Column<any>[] = [
    {
      header: 'Student Name',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.full_name}</p>
          <p className="text-[11px] text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Reg No.',
      accessorKey: 'register_number',
      className: 'font-semibold text-slate-700',
    },
    {
      header: 'Academic Year',
      accessorKey: 'year',
    },
    {
      header: 'Date Applied',
      cell: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      header: 'Action',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleApproveRegistration(row.id, 'approve')}
            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-emerald-200"
          >
            <Check className="w-3.5 h-3.5" /> Approve Account
          </button>
          <button
            onClick={() => handleApproveRegistration(row.id, 'reject')}
            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-rose-200"
          >
            <X className="w-3.5 h-3.5" /> Reject
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#001E42] via-[#002B5C] to-[#004990] text-white rounded-[24px] p-6 lg:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#F3B631] text-[#002B5C] text-[11px] font-extrabold uppercase tracking-wider mb-2">
            CCE Department Command Center
          </span>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight">
            Administrator System Console
          </h2>
          <p className="text-xs text-slate-200 mt-1 max-w-xl">
            Department-wide analytics, year target configuration, student account approvals, and faculty mentor mapping.
          </p>
        </div>

        <Link
          to="/admin/users"
          className="px-5 py-3 bg-[#F3B631] hover:bg-amber-400 text-[#002B5C] rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2 shrink-0"
        >
          <span>Manage All Users</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-slate-500">Students</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalStudents}</p>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-slate-500">Faculty Mentors</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalFaculty}</p>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-slate-500">Pending Registrations</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.pendingRegistrations}</p>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-slate-500">Total Dept Hours</p>
          <p className="text-2xl font-black text-[#004990] mt-1">{stats.totalDepartmentHours} hrs</p>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs col-span-2 lg:col-span-1">
          <p className="text-xs font-bold text-slate-500">Avg Dept AI Score</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.avgAiScore} pts</p>
        </div>
      </div>

      {/* Pending Student Account Registrations Queue */}
      <Card
        title="Pending Student Registrations"
        subtitle="Approve or reject new student account requests for CCE"
      >
        <Table columns={columns} data={pendingUsers} keyExtractor={(r) => r.id} />
      </Card>
    </div>
  );
};
