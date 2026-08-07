import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, CheckCircle2, XCircle, ArrowRight, Shield, Check, X } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Table, Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { apiFetch } from '../../services/api';
import { getDocumentUrl } from '../../types';

export const FacultyDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal remark state
  const [activeItem, setActiveItem] = useState<{ id: number; type: string; action: 'approve' | 'reject' } | null>(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboard = async () => {
    try {
      const data = await apiFetch('/api/faculty/dashboard');
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load faculty dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    const handleVisibility = () => { if (document.visibilityState === 'visible') fetchDashboard(); };
    const handleFocus = () => fetchDashboard();
    const handleUpdated = () => fetchDashboard();
    const handleStorage = (e: StorageEvent) => { if (e.key === 'ai365_last_update') fetchDashboard(); };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('ai365_data_updated', handleUpdated);
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('ai365_data_updated', handleUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleActionClick = (id: number, type: string, action: 'approve' | 'reject') => {
    setActiveItem({ id, type, action });
    setRemarks(action === 'approve' ? 'Approved by faculty mentor.' : 'Needs revision.');
  };

  const handleConfirmAction = async () => {
    if (!activeItem) return;
    setSubmitting(true);
    try {
      await apiFetch('/api/faculty/approvals', {
        method: 'POST',
        body: JSON.stringify({
          submission_id: activeItem.id,
          submission_type: activeItem.type,
          status: activeItem.action === 'approve' ? 'Approved' : 'Rejected',
          faculty_remarks: remarks,
        }),
      });
      setActiveItem(null);
      fetchDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#004990]" />
      </div>
    );
  }

  const stats = dashboardData?.stats || { assignedMentees: 0, pendingCount: 0, approvedToday: 0, rejectedCount: 0 };
  const pendingQueue = dashboardData?.pendingQueue || [];

  const columns: Column<any>[] = [
    {
      header: 'Student',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.student_name}</p>
          <p className="text-[11px] text-slate-500">{row.register_number} • {row.year}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (row) => (
        <span className="font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-[#004990] text-[11px] border border-blue-100 uppercase tracking-wider">
          {row.type}
        </span>
      ),
    },
    {
      header: 'Activity Title',
      cell: (row) => <span className="font-bold text-slate-800">{row.title}</span>,
    },
    {
      header: 'Submitted Date',
      accessorKey: 'date',
    },
    {
      header: 'Proof Link',
      cell: (row) =>
        row.document_url ? (
          <a
            href={getDocumentUrl(row.document_url)}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-[#004990] hover:underline"
          >
            Inspect Document
          </a>
        ) : (
          <span className="text-slate-400">N/A</span>
        ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleActionClick(row.id, row.type, 'approve')}
            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-emerald-200"
          >
            <Check className="w-3.5 h-3.5" /> Approve
          </button>
          <button
            onClick={() => handleActionClick(row.id, row.type, 'reject')}
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
      <div className="bg-gradient-to-r from-[#002B5C] via-[#004990] to-slate-900 text-white rounded-[24px] p-6 lg:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#F3B631] text-[#002B5C] text-[11px] font-extrabold uppercase tracking-wider mb-2">
            CCE Faculty Mentor Command
          </span>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight">
            Mentorship & Verification Portal
          </h2>
          <p className="text-xs text-slate-200 mt-1 max-w-xl">
            Review student submissions for learning hours, certificates, research manuscripts, and AI project code.
          </p>
        </div>

        <Link
          to="/faculty/approvals"
          className="px-5 py-3 bg-[#F3B631] hover:bg-amber-400 text-[#002B5C] rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2 shrink-0"
        >
          <span>Open Full Approvals Queue</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Scoped</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.assignedMentees}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Assigned Mentees</p>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Action Required</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.pendingCount}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Pending Submissions</p>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Verified</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.approvedToday}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Approved Today</p>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <XCircle className="w-5 h-5" />
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Returned</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.rejectedCount}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Rejected Entries</p>
        </div>
      </div>

      {/* Pending Queue Table */}
      <Card
        title="Pending Mentee Submissions Queue"
        subtitle="Review proof documents and grant verified AI Score points"
      >
        <Table columns={columns} data={pendingQueue} keyExtractor={(r) => `${r.type}-${r.id}`} />
      </Card>

      {/* Action Modal */}
      <Modal
        isOpen={!!activeItem}
        onClose={() => setActiveItem(null)}
        title={activeItem?.action === 'approve' ? 'Approve Mentee Submission' : 'Reject Submission'}
        subtitle="Add faculty remarks before persisting decision to database"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Faculty Remarks / Feedback *</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              onClick={() => setActiveItem(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAction}
              disabled={submitting}
              className={`px-5 py-2.5 rounded-xl font-bold text-white transition-all shadow-md ${
                activeItem?.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {submitting ? 'Saving...' : activeItem?.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
