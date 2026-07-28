import React, { useState, useEffect } from 'react';
import { Check, X, Search, Filter, FileText } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Table, Column } from '../../components/common/Table';
import { StatusPill } from '../../components/common/StatusPill';
import { Modal } from '../../components/common/Modal';
import { apiFetch } from '../../services/api';

export const Approvals: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [searchTerm, setSearchTerm] = useState('');

  const [activeItem, setActiveItem] = useState<{ id: number; type: string; action: 'approve' | 'reject' } | null>(null);
  const [remarks, setRemarks] = useState('');
  const [awardedHours, setAwardedHours] = useState(20);
  const [submitting, setSubmitting] = useState(false);

  const fetchApprovals = async () => {
    try {
      const data = await apiFetch<{ submissions: any[] }>('/api/faculty/approvals');
      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleActionClick = (id: number, type: string, action: 'approve' | 'reject') => {
    setActiveItem({ id, type, action });
    setRemarks(action === 'approve' ? 'Approved by faculty mentor.' : 'Needs revision.');
    setAwardedHours(20);
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
          awarded_hours: awardedHours,
        }),
      });
      setActiveItem(null);
      fetchApprovals();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSubmissions = submissions.filter((item) => {
    if (categoryFilter !== 'All' && item.type.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    if (statusFilter !== 'All' && item.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = item.student_name?.toLowerCase().includes(q);
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchReg = item.register_number?.toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchReg) return false;
    }
    return true;
  });

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
      header: 'Title / Activity',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.title}</p>
          <p className="text-[11px] text-slate-500 line-clamp-1">{row.description || row.skills || ''}</p>
        </div>
      ),
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
      header: 'Proof File',
      cell: (row) =>
        row.document_url ? (
          <a
            href={row.document_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-[#004990] hover:underline"
          >
            View Document
          </a>
        ) : (
          <span className="text-slate-400">N/A</span>
        ),
    },
    {
      header: 'Action',
      cell: (row) =>
        row.status === 'Pending' ? (
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
        ) : (
          <span className="text-[11px] text-slate-500 italic">{row.faculty_remarks || 'Evaluated'}</span>
        ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mentee Submissions Approvals</h2>
          <p className="text-xs text-slate-500 font-medium">Verify credentials and grant points for student portfolios</p>
        </div>
      </div>

      {/* Filters Bar */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student name, register number, activity title..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-700">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white outline-none"
              >
                <option value="All">All Categories</option>
                <option value="learning_hours">Learning Hours</option>
                <option value="certificate">Certificates</option>
                <option value="research">Research</option>
                <option value="project">Projects</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
              {['Pending', 'Approved', 'Rejected', 'All'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    statusFilter === st ? 'bg-[#004990] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Submissions Table */}
      <Card title="Approvals Queue" subtitle={`Showing ${filteredSubmissions.length} submissions`}>
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading submissions...</div>
        ) : (
          <Table columns={columns} data={filteredSubmissions} keyExtractor={(r) => `${r.type}-${r.id}`} />
        )}
      </Card>

      <Modal
        isOpen={!!activeItem}
        onClose={() => setActiveItem(null)}
        title={activeItem?.action === 'approve' ? 'Approve Submission' : 'Reject Submission'}
        subtitle="Provide faculty remarks"
      >
        <div className="space-y-4 text-xs">
          {activeItem?.action === 'approve' && activeItem?.type.toLowerCase().includes('certificate') && (
            <div className="p-3 bg-[#004990]/5 border border-blue-200 rounded-xl space-y-1">
              <label className="block font-bold text-slate-900">Assign Verified Learning Hours *</label>
              <p className="text-[11px] text-slate-500">How many learning hours should be awarded to the student for this certificate?</p>
              <input
                type="number"
                min={1}
                max={200}
                value={awardedHours}
                onChange={(e) => setAwardedHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 outline-none focus:border-[#004990]"
              />
            </div>
          )}

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
