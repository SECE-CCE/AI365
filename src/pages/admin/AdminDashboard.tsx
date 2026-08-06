import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Clock, Award, Target, Check, X, ShieldAlert, ArrowRight, FileText, ExternalLink, Calendar } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Table, Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { apiFetch } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Approval modal for student submissions
  const [activeItem, setActiveItem] = useState<{ id: number; type: string; action: 'approve' | 'reject'; title: string; row?: any } | null>(null);
  const [remarks, setRemarks] = useState('');
  const [awardedHours, setAwardedHours] = useState(20);
  const [awardedLearningHours, setAwardedLearningHours] = useState<number | ''>('');
  const [adminMarks, setAdminMarks] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

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

  const getMaxMark = (type: string) => {
    const t = String(type || '').toLowerCase();
    if (t === 'certificate') return 50;
    if (t === 'research') return 150;
    if (t === 'project') return 100;
    return 200;
  };

  const handleOpenSubmissionAction = (item: any, action: 'approve' | 'reject') => {
    setActiveItem({ id: item.id, type: item.type, action, title: item.title, row: item });
    setRemarks(action === 'approve' ? 'Approved by Admin.' : 'Needs revision.');
    setAwardedHours(20);
    // Pre-fill awarded learning hours based on type
    const t = String(item.type || '').toLowerCase();
    if (t === 'certificate') {
      setAwardedLearningHours(20);
    } else if (t === 'project') {
      setAwardedLearningHours(40);
    } else {
      setAwardedLearningHours('');
    }
    const maxMark = getMaxMark(item.type);
    if (item.admin_marks !== undefined && item.admin_marks !== null && item.admin_marks !== '') {
      setAdminMarks(Math.min(maxMark, Number(item.admin_marks)));
    } else {
      setAdminMarks(maxMark);
    }
  };

  const handleConfirmSubmissionAction = async () => {
    if (!activeItem) return;
    const maxAllowed = getMaxMark(activeItem.type);
    const marksValue = Number(adminMarks);
    if (activeItem.action === 'approve') {
      if (!adminMarks && adminMarks !== 0) {
        alert('Please enter admin evaluation marks before approving the submission.');
        return;
      }
      if (Number.isNaN(marksValue) || marksValue <= 0) {
        alert('Admin marks must be a positive number.');
        return;
      }
      if (marksValue > maxAllowed) {
        alert(`Maximum allowed mark for ${activeItem.type} approval is ${maxAllowed}. Please enter a mark up to ${maxAllowed}.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload: any = {
        submission_id: activeItem.id,
        submission_type: activeItem.type,
        status: activeItem.action === 'approve' ? 'Approved' : 'Rejected',
        faculty_remarks: remarks,
        awarded_hours: awardedHours,
      };
      if (activeItem.action === 'approve') {
        payload.admin_marks = marksValue;
        const t = String(activeItem.type || '').toLowerCase();
        if ((t === 'certificate' || t === 'project') && awardedLearningHours !== '') {
          payload.awarded_learning_hours = Number(awardedLearningHours);
        }
        // research: auto-computed on backend — no need to send
      }

      await apiFetch('/api/admin/approvals', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setActiveItem(null);
      fetchDashboard();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Unable to approve submission. Please check console for details.');
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

  const stats = dashboardData?.stats || {
    totalStudents: 0,
    totalFaculty: 0,
    pendingRegistrations: 0,
    pendingFacultyRegistrations: 0,
    pendingSubmissionsCount: 0,
    totalDepartmentHours: 0,
    avgAiScore: 0,
  };
  const pendingUsers = dashboardData?.pendingUsers || [];
  const pendingFaculty = dashboardData?.pendingFaculty || [];
  const pendingSubmissions = dashboardData?.pendingSubmissions || [];

  const registrationColumns: Column<any>[] = [
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
      header: 'Chosen Mentor',
      cell: (row) => (
        <span className="font-bold text-[#004990] text-xs">
          {row.mentor_name || 'Not Selected'}
        </span>
      ),
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

  const submissionColumns: Column<any>[] = [
    {
      header: 'Student',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.student_name}</p>
          <p className="text-[11px] text-slate-500">{row.register_number || row.year || 'CCE Student'}</p>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (row) => (
        <span className="font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#004990] text-[10px] uppercase tracking-wider">
          {row.type}
        </span>
      ),
    },
    {
      header: 'Admin Marks',
      cell: (row) => (
        <span className="text-slate-700 font-semibold">{row.admin_marks !== undefined && row.admin_marks !== null ? row.admin_marks : '-'}</span>
      ),
    },
    {
      header: 'Submission Title / Authors',
      cell: (row) => {
        if (row.type === 'research' && row.authors) {
          // Calculate per-author hour share
          const coAuthorsList = String(row.authors).split(/,| and /i).map((a: string) => a.trim()).filter((a: string) => a.length > 0);
          const totalAuthors = 1 + coAuthorsList.length;
          const totalHours = Number(row.total_hours || 80);
          const sharePerPerson = Math.max(1, Math.round(totalHours / totalAuthors));
          return (
            <div>
              <p className="font-bold text-slate-800">{row.title}</p>
              <p className="text-[11px] text-slate-500 line-clamp-1">{row.conference_journal || ''}</p>
              <div className="mt-1.5 p-2 bg-indigo-50 rounded-lg border border-indigo-200/70">
                <p className="text-[10px] font-black text-indigo-800 mb-1">
                  📚 {totalAuthors} Authors · {totalHours} hrs total · {sharePerPerson} hrs/person
                </p>
                <p className="text-[10px] text-indigo-700 font-semibold">
                  <span className="text-emerald-700">[Submitter]</span> {row.student_name}
                  {coAuthorsList.length > 0 && (
                    <>, {coAuthorsList.join(', ')}</>
                  )}
                </p>
              </div>
            </div>
          );
        }
        return (
          <div>
            <p className="font-bold text-slate-800">{row.title}</p>
            <p className="text-[11px] text-slate-500 line-clamp-1">{row.issuer || row.conference_journal || row.tech_stack || ''}</p>
          </div>
        );
      },
    },
    {
      header: 'Document Proof',
      cell: (row) => (
        row.document_url ? (
          <a href={row.document_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#004990] hover:underline flex items-center gap-1">
            View File <ExternalLink className="w-3 h-3" />
          </a>
        ) : <span className="text-slate-400">N/A</span>
      ),
    },
    {
      header: 'Action',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenSubmissionAction(row, 'approve')}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" /> Approve &amp; Award Hours
          </button>
          <button
            onClick={() => handleOpenSubmissionAction(row, 'reject')}
            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 flex items-center gap-1"
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

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/admin/events"
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-all border border-white/20 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-[#F3B631]" />
            <span>Publish CCE Events</span>
          </Link>
          <Link
            to="/admin/users"
            className="px-5 py-3 bg-[#F3B631] hover:bg-amber-400 text-[#002B5C] rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2"
          >
            <span>Manage All Users</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-slate-500">Students</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalStudents}</p>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-slate-500">Faculty Mentors</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalFaculty}</p>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-slate-500">Pending Activity Submissions</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.pendingSubmissionsCount || pendingSubmissions.length}</p>
          {stats.pendingRegistrations > 0 && (
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">{stats.pendingRegistrations} accounts pending</p>
          )}
        </div>


      </div>

      {/* Pending Student Activity Submissions (Certificates, Research Papers, Projects) */}
      <Card
        title={`Pending Activity Submissions (${pendingSubmissions.length})`}
        subtitle="Certificates, Research Papers & Projects submitted by students waiting for Admin / Faculty approval"
      >
        <Table columns={submissionColumns} data={pendingSubmissions} keyExtractor={(r) => `${r.type}-${r.id}`} />
      </Card>

      {/* Pending Student Account Registrations Queue */}
      <Card
        title={`Pending Student Account Registrations (${pendingUsers.length})`}
        subtitle="Approve or reject new student account requests for CCE"
      >
        <Table columns={registrationColumns} data={pendingUsers} keyExtractor={(r) => r.id} />
      </Card>

      {/* Pending Faculty Registrations Queue */}
      {pendingFaculty.length > 0 && (
        <Card
          title={`Pending Faculty Registrations (${pendingFaculty.length})`}
          subtitle="Approve or reject faculty mentor account requests"
        >
          <Table
            columns={[
              {
                header: 'Faculty Name',
                cell: (row: any) => (
                  <div>
                    <p className="font-bold text-slate-900">{row.full_name}</p>
                    <p className="text-[11px] text-slate-500">{row.email}</p>
                  </div>
                ),
              },
              { header: 'Designation', cell: (row: any) => <span className="font-medium text-slate-700">{row.year}</span> },
              { header: 'Applied On', cell: (row: any) => new Date(row.created_at).toLocaleDateString() },
              {
                header: 'Action',
                cell: (row: any) => (
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleApproveRegistration(row.id, 'approve')}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => handleApproveRegistration(row.id, 'reject')}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 flex items-center gap-1">
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                ),
              },
            ]}
            data={pendingFaculty}
            keyExtractor={(r: any) => r.id}
          />
        </Card>
      )}

      {/* Admin Approval Modal for Submissions */}
      <Modal
        isOpen={!!activeItem}
        onClose={() => setActiveItem(null)}
        title={activeItem?.action === 'approve' ? `Approve: ${activeItem?.title}` : `Reject: ${activeItem?.title}`}
        subtitle="Review submission and set evaluation marks / remarks"
      >
        <div className="space-y-4 text-xs">
          {activeItem?.action === 'approve' && (
            <div className="p-3 bg-[#004990]/5 border border-blue-200 rounded-xl space-y-1">
              <label className="block font-bold text-slate-900">
                Admin Evaluation Marks * (Maximum Limit: {getMaxMark(activeItem.type)} marks)
              </label>
              <p className="text-[11px] text-slate-500">
                Enter score to assign (Maximum limit: <span className="font-bold text-[#004990]">{getMaxMark(activeItem.type)} marks</span>).
              </p>
              <input
                type="number"
                min={1}
                max={getMaxMark(activeItem.type)}
                value={adminMarks}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Number(e.target.value);
                  const maxAllowed = getMaxMark(activeItem.type);
                  if (val !== '' && typeof val === 'number' && val > maxAllowed) {
                    setAdminMarks(maxAllowed);
                  } else {
                    setAdminMarks(val);
                  }
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 outline-none focus:border-[#004990]"
              />
            </div>
          )}

          {/* Awarded Learning Hours — Certificate & Project: admin enters; Research: auto-computed info */}
          {activeItem?.action === 'approve' && (() => {
            const t = String(activeItem.type || '').toLowerCase();
            if (t === 'certificate' || t === 'project') {
              return (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <label className="block font-bold text-slate-900">
                    Awarded Learning Hours * <span className="text-emerald-700">(credited to student)</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    {t === 'certificate'
                      ? 'Enter the number of learning hours to credit for this certificate (e.g. 20 hrs).'
                      : 'Enter the number of learning hours to credit for this AI project build.'}
                  </p>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={awardedLearningHours}
                    onChange={(e) => setAwardedLearningHours(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg font-bold text-slate-900 outline-none focus:border-emerald-600"
                    placeholder="e.g. 20"
                  />
                </div>
              );
            }
            if (t === 'research') {
              const row = activeItem.row || {};
              const totalHours = Number(row.total_hours || 80);
              const authorsStr = String(row.authors || '');
              const authorList = authorsStr.split(',').map((a: string) => a.trim()).filter((a: string) => a.length > 0);
              const authorCount = Math.max(1, authorList.length);
              const perAuthorHours = Math.floor(totalHours / authorCount);
              return (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
                  <label className="block font-bold text-indigo-900">Auto-Computed Learning Hours (Research Paper)</label>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="text-center">
                      <p className="text-2xl font-black text-indigo-700">{perAuthorHours}</p>
                      <p className="text-[10px] font-bold text-indigo-500">hrs / author</p>
                    </div>
                    <div className="text-[11px] text-indigo-700 leading-relaxed">
                      <p><span className="font-bold">{totalHours} total hrs</span> ÷ <span className="font-bold">{authorCount} authors</span> = <span className="font-black text-indigo-900">{perAuthorHours} hrs</span> each</p>
                      <p className="text-indigo-500 mt-0.5">Co-authors will receive their share when they submit separately.</p>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Admin Remarks / Feedback *</label>
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
              onClick={handleConfirmSubmissionAction}
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
