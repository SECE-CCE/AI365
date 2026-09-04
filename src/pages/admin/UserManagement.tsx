import React, { useState, useEffect } from 'react';
import { Users, Search, Edit, Plus, Check, X, UserCheck, ShieldCheck, Key, Clock, ShieldAlert, RefreshCw } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Table, Column } from '../../components/common/Table';
import { StatusPill } from '../../components/common/StatusPill';
import { Modal } from '../../components/common/Modal';
import { apiFetch } from '../../services/api';
import { getDocumentUrl } from '../../types';

const MENTORS_LIST = [
  'Dr. S. Dhamodharan',
  'Ms. G. G. Sreeja',
  'Ms. R. Preethi',
  'Ms. R. Megala',
];

export const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'auth_logs'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Auth Logs state
  const [authLogs, setAuthLogs] = useState<any[]>([]);
  const [authLogsLoading, setAuthLogsLoading] = useState(false);
  const [authEventFilter, setAuthEventFilter] = useState<string>('All');
  const [authSearchTerm, setAuthSearchTerm] = useState('');

  // Edit user modal
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [assignMentorId, setAssignMentorId] = useState('');
  const [editMentorName, setEditMentorName] = useState(MENTORS_LIST[0]);
  const [isDeptWide, setIsDeptWide] = useState(false);
  const [resetPass, setResetPass] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  // Add Faculty modal
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [newFaculty, setNewFaculty] = useState({ full_name: '', email: '', phone: '', password: '', designation: '', is_department_wide: false });
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  // Add/Provision Student modal
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    full_name: '',
    email: '',
    register_number: '',
    year: '1st Year',
    mentor_name: MENTORS_LIST[0],
    password: '',
    phone: '',
  });
  const [addStudentError, setAddStudentError] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await apiFetch<{ users: any[]; faculty: any[] }>('/api/admin/users');
      setUsers(data.users || []);
      setFacultyList((data.faculty || []).filter((f: any) => f.status === 'approved'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthLogs = async (eventType?: string) => {
    setAuthLogsLoading(true);
    try {
      const query = eventType && eventType !== 'All' ? `?event_type=${eventType}&limit=100` : '?limit=100';
      const data = await apiFetch<{ logs: any[]; total: number }>(`/api/admin/auth-logs${query}`);
      setAuthLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to load auth logs:', err);
    } finally {
      setAuthLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'auth_logs') {
      fetchAuthLogs(authEventFilter);
    }
  }, [activeTab, authEventFilter]);

  const handleApproveStatus = async (userId: number, action: 'approve' | 'reject') => {
    try {
      await apiFetch('/api/admin/users/approve', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, action }),
      });
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    setAssignMentorId(user.mentor_id ? String(user.mentor_id) : '');
    setEditMentorName(user.mentor_name || MENTORS_LIST[0]);
    setIsDeptWide(!!user.is_department_wide);
    setResetPass('');
    setEditError('');
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    setEditError('');
    setSubmitting(true);
    try {
      await apiFetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          mentor_id: assignMentorId ? Number(assignMentorId) : null,
          mentor_name: editMentorName,
          is_department_wide: isDeptWide,
          password: resetPass || undefined,
        }),
      });
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      setEditError(err.message || 'Failed to save changes.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddFaculty = async () => {
    setAddError('');
    if (!newFaculty.full_name.trim() || !newFaculty.email.trim() || !newFaculty.password || !newFaculty.designation.trim()) {
      return setAddError('Full Name, Email, Password, and Designation are required.');
    }
    setAdding(true);
    try {
      await apiFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          full_name: newFaculty.full_name,
          email: newFaculty.email,
          phone: newFaculty.phone,
          password: newFaculty.password,
          role: 'faculty',
          department: 'Computer & Communication Engineering',
          year: newFaculty.designation,
          is_department_wide: newFaculty.is_department_wide,
        }),
      });
      setShowAddFaculty(false);
      setNewFaculty({ full_name: '', email: '', phone: '', password: '', designation: '', is_department_wide: false });
      fetchUsers();
    } catch (err: any) {
      setAddError(err.message || 'Failed to add faculty.');
    } finally {
      setAdding(false);
    }
  };

  const handleAddStudent = async () => {
    setAddStudentError('');
    if (!newStudent.full_name.trim() || !newStudent.email.trim() || !newStudent.register_number.trim() || !newStudent.password) {
      return setAddStudentError('Full Name, Official Email, Roll Number, and Password are required.');
    }
    if (!newStudent.email.toLowerCase().endsWith('@sece.ac.in')) {
      return setAddStudentError('Official email must end with @sece.ac.in');
    }

    setAddingStudent(true);
    try {
      await apiFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          full_name: newStudent.full_name,
          email: newStudent.email,
          register_number: newStudent.register_number.toUpperCase(),
          year: newStudent.year,
          mentor_name: newStudent.mentor_name,
          password: newStudent.password,
          phone: newStudent.phone,
          role: 'student',
          department: 'Computer & Communication Engineering',
        }),
      });
      setShowAddStudent(false);
      setNewStudent({
        full_name: '',
        email: '',
        register_number: '',
        year: '1st Year',
        mentor_name: MENTORS_LIST[0],
        password: '',
        phone: '',
      });
      fetchUsers();
    } catch (err: any) {
      setAddStudentError(err.message || 'Failed to provision student account.');
    } finally {
      setAddingStudent(false);
    }
  };

  const pendingUsers = users.filter(u => u.status === 'pending_approval');
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'All' && u.role.toLowerCase() !== roleFilter.toLowerCase()) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.register_number?.toLowerCase().includes(q) || u.mentor_name?.toLowerCase().includes(q);
    }
    return true;
  });

  const pendingColumns: Column<any>[] = [
    {
      header: 'Name & Email',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.full_name}</p>
          <p className="text-[11px] text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (row) => (
        <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${row.role === 'faculty' ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'}`}>
          {row.role}
        </span>
      ),
    },
    {
      header: 'Details',
      cell: (row) => (
        <span className="text-slate-700 font-medium text-xs">
          {row.role === 'student' ? `${row.register_number} • ${row.year}` : row.year}
        </span>
      ),
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
      header: 'Applied On',
      cell: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleApproveStatus(row.id, 'approve')}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
            <Check className="w-3 h-3" /> Approve
          </button>
          <button onClick={() => handleApproveStatus(row.id, 'reject')}
            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold border border-rose-200 flex items-center gap-1">
            <X className="w-3 h-3" /> Reject
          </button>
        </div>
      ),
    },
  ];

  const allUsersColumns: Column<any>[] = [
    {
      header: 'User',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <img src={getDocumentUrl(row.profile_photo) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={row.full_name} className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200" />
          <div>
            <p className="font-bold text-slate-900">{row.full_name}</p>
            <p className="text-[11px] text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (row) => (
        <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${row.role === 'admin' ? 'bg-purple-100 text-purple-800' : row.role === 'faculty' ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'}`}>
          {row.role}
        </span>
      ),
    },
    {
      header: 'Reg No / Year',
      cell: (row) => (
        <span className="font-semibold text-slate-700 text-xs">
          {row.role === 'student' ? `${row.register_number} (${row.year})` : row.year || row.department}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusPill status={row.status} />,
    },
    {
      header: 'Chosen Faculty Mentor',
      cell: (row) => {
        if (row.role === 'student') return <span className="text-[#004990] font-bold text-xs">{row.mentor_name || <span className="text-amber-600 font-normal">Unassigned</span>}</span>;
        return <span className="text-slate-400 text-xs">N/A</span>;
      },
    },
    {
      header: 'Usage Hrs',
      cell: (row) => {
        if (row.role === 'student') return <span className="text-indigo-600 font-bold text-xs">{row.usage_hours || 0} hrs</span>;
        return <span className="text-slate-400 text-xs">-</span>;
      },
    },
    {
      header: 'Actions',
      cell: (row) => (
        <button onClick={() => handleOpenEdit(row)}
          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1">
          <Edit className="w-3.5 h-3.5" /> Edit
        </button>
      ),
    },
  ];

  const formatDuration = (seconds?: number | null) => {
    if (!seconds && seconds !== 0) return '—';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const filteredAuthLogs = authLogs.filter((log) => {
    if (!authSearchTerm) return true;
    const q = authSearchTerm.toLowerCase();
    return (
      log.email?.toLowerCase().includes(q) ||
      log.user_name?.toLowerCase().includes(q) ||
      log.ip_address?.toLowerCase().includes(q) ||
      log.reason?.toLowerCase().includes(q)
    );
  });

  const authLogsColumns: Column<any>[] = [
    {
      header: 'Timestamp',
      cell: (row) => (
        <div className="text-xs">
          <p className="font-bold text-slate-800">{new Date(row.created_at).toLocaleDateString()}</p>
          <p className="text-[11px] text-slate-500 font-medium">{new Date(row.created_at).toLocaleTimeString()}</p>
        </div>
      ),
    },
    {
      header: 'User Account',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.user_name || 'Anonymous'}</p>
          <p className="text-[11px] text-slate-500 font-medium">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (row) => (
        <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider ${
          row.role === 'admin'
            ? 'bg-purple-100 text-purple-800'
            : row.role === 'faculty'
            ? 'bg-indigo-100 text-indigo-800'
            : row.role === 'student'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {row.role || 'Visitor'}
        </span>
      ),
    },
    {
      header: 'Event',
      cell: (row) => {
        const isSuccess = row.status === 'SUCCESS';
        return (
          <span className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg text-xs ${
            row.event_type === 'LOGIN_SUCCESS'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : row.event_type === 'LOGIN_FAILED'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : row.event_type === 'LOGOUT'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {row.event_type}
          </span>
        );
      },
    },
    {
      header: 'Status & Reason',
      cell: (row) => (
        <div className="max-w-xs text-xs">
          <span className={`font-bold text-[11px] uppercase tracking-wider ${
            row.status === 'SUCCESS' ? 'text-emerald-700' : 'text-rose-600'
          }`}>
            [{row.status}]
          </span>{' '}
          <span className="text-slate-600 font-medium">{row.reason || 'N/A'}</span>
          {row.session_duration_seconds !== null && row.session_duration_seconds !== undefined && (
            <p className="text-[11px] text-blue-600 font-bold mt-0.5">
              Duration: {formatDuration(row.session_duration_seconds)}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Client IP & Device',
      cell: (row) => (
        <div className="text-xs">
          <span className="font-mono text-slate-800 font-semibold">{row.ip_address || '127.0.0.1'}</span>
          <p className="text-[10px] text-slate-400 truncate max-w-[180px]" title={row.user_agent}>
            {row.user_agent ? row.user_agent.split(' ')[0] : 'Browser'}
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">CCE User & Security Management</h2>
          <p className="text-xs text-slate-500 font-medium">Manage student registrations, approvals, and monitor authentication security logs</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'users' ? 'bg-white text-[#004990] shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Accounts</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('auth_logs')}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'auth_logs' ? 'bg-white text-[#004990] shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Authentication Logs</span>
          </button>
        </div>
      </div>

      {activeTab === 'auth_logs' ? (
        /* Authentication Logs View */
        <Card title="Security & Authentication Audit Trail" subtitle="Persistent logs of user sign-in events, session timeouts, and failed login attempts">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={authSearchTerm}
                onChange={(e) => setAuthSearchTerm(e.target.value)}
                placeholder="Filter by email, user, IP address, or reason..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {['All', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT'].map((evt) => (
                  <button
                    key={evt}
                    onClick={() => setAuthEventFilter(evt)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${
                      authEventFilter === evt ? 'bg-[#004990] text-white shadow' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {evt === 'LOGIN_SUCCESS' ? 'Logins' : evt === 'LOGIN_FAILED' ? 'Failed' : evt === 'LOGOUT' ? 'Logouts' : 'All Events'}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => fetchAuthLogs(authEventFilter)}
                disabled={authLogsLoading}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all font-bold flex items-center gap-1 text-xs"
                title="Refresh logs"
              >
                <RefreshCw className={`w-4 h-4 ${authLogsLoading ? 'animate-spin text-[#004990]' : ''}`} />
              </button>
            </div>
          </div>

          {authLogsLoading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004990]" />
              <span className="text-xs font-semibold">Loading security logs...</span>
            </div>
          ) : filteredAuthLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              No authentication events match your filter criteria.
            </div>
          ) : (
            <Table columns={authLogsColumns} data={filteredAuthLogs} keyExtractor={(r) => r.id} />
          )}
        </Card>
      ) : (
        /* User Directory View */
        <>
          {/* Pending Approvals Queue */}
          {pendingUsers.length > 0 && (
            <Card
              title={`Pending Approvals (${pendingUsers.length})`}
              subtitle="Students waiting for account activation"
            >
              <Table columns={pendingColumns} data={pendingUsers} keyExtractor={(r) => r.id} />
            </Card>
          )}

      {/* Filter + All Users Table */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, email, register number, mentor..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {['All', 'Student', 'Admin'].map((rl) => (
                <button key={rl} onClick={() => setRoleFilter(rl)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${roleFilter === rl ? 'bg-[#004990] text-white shadow' : 'text-slate-600 hover:bg-slate-200'}`}>
                  {rl}s
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddStudent(true)}
              className="px-3.5 py-2 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" /> Provision Student Account
            </button>
          </div>
        </div>
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading directory...</div>
        ) : (
          <Table columns={allUsersColumns} data={filteredUsers} keyExtractor={(r) => r.id} />
        )}
      </Card>

      {/* Edit User Modal */}
      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)}
        title={`Edit: ${selectedUser?.full_name}`}
        subtitle="Update mentor choice or reset password">
        {selectedUser && (
          <div className="space-y-4 text-xs">
            {editError && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-medium">{editError}</div>}

            {/* Student: select mentor */}
            {selectedUser.role === 'student' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chosen Faculty Mentor *</label>
                <select value={editMentorName} onChange={(e) => setEditMentorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white outline-none">
                  {MENTORS_LIST.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reset Password (leave blank to keep current)</label>
              <input type="password" value={resetPass} onChange={(e) => setResetPass(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none" />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button onClick={() => setSelectedUser(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
              <button onClick={handleSaveUser} disabled={submitting}
                className="px-5 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Faculty Modal */}
      <Modal isOpen={showAddFaculty} onClose={() => setShowAddFaculty(false)}
        title="Add Faculty Member"
        subtitle="Create a faculty account directly — account is immediately active">
        <div className="space-y-4 text-xs">
          {addError && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-medium">{addError}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input type="text" value={newFaculty.full_name} onChange={(e) => setNewFaculty(p => ({ ...p, full_name: e.target.value }))}
                placeholder="e.g. Dr. Priya Nair"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Designation *</label>
              <input type="text" value={newFaculty.designation} onChange={(e) => setNewFaculty(p => ({ ...p, designation: e.target.value }))}
                placeholder="e.g. Assistant Professor"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">College Email *</label>
              <input type="email" value={newFaculty.email} onChange={(e) => setNewFaculty(p => ({ ...p, email: e.target.value }))}
                placeholder="dr.name@cce.edu"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone</label>
              <input type="tel" value={newFaculty.phone} onChange={(e) => setNewFaculty(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Initial Password *</label>
            <input type="password" value={newFaculty.password} onChange={(e) => setNewFaculty(p => ({ ...p, password: e.target.value }))}
              placeholder="Set a temporary password for the faculty"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none" />
          </div>

          <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
            <input type="checkbox" id="newDeptWide" checked={newFaculty.is_department_wide}
              onChange={(e) => setNewFaculty(p => ({ ...p, is_department_wide: e.target.checked }))}
              className="w-4 h-4 text-[#004990] rounded" />
            <label htmlFor="newDeptWide" className="font-bold text-slate-800 cursor-pointer">
              Grant Department-Wide Scope (can approve any student's submissions)
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button onClick={() => setShowAddFaculty(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
            <button onClick={handleAddFaculty} disabled={adding}
              className="px-5 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
              {adding ? 'Creating...' : <><UserCheck className="w-4 h-4" /> Create Faculty Account</>}
            </button>
          </div>
        </div>
      </Modal>

      {/* Provision Student Modal */}
      <Modal isOpen={showAddStudent} onClose={() => setShowAddStudent(false)}
        title="Provision Student Account"
        subtitle="Pre-create student credentials with official @sece.ac.in email and assigned password">
        <div className="space-y-4 text-xs">
          {addStudentError && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-medium">{addStudentError}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input type="text" value={newStudent.full_name} onChange={(e) => setNewStudent(p => ({ ...p, full_name: e.target.value }))}
                placeholder="e.g. Alex Mercer"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Roll Number / Reg No *</label>
              <input type="text" value={newStudent.register_number} onChange={(e) => setNewStudent(p => ({ ...p, register_number: e.target.value.toUpperCase() }))}
                placeholder="e.g. 24CC009"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Email (@sece.ac.in) *</label>
              <input type="email" value={newStudent.email} onChange={(e) => setNewStudent(p => ({ ...p, email: e.target.value }))}
                placeholder="alex.student@sece.ac.in"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Academic Year *</label>
              <select value={newStudent.year} onChange={(e) => setNewStudent(p => ({ ...p, year: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-[#004990] outline-none">
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Number (used for auto-password) *</label>
              <input type="tel" value={newStudent.phone} onChange={(e) => setNewStudent(p => ({ ...p, phone: e.target.value }))}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Faculty Mentor *</label>
              <select value={newStudent.mentor_name} onChange={(e) => setNewStudent(p => ({ ...p, mentor_name: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:border-[#004990] outline-none">
                {MENTORS_LIST.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Initial Password (Auto: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">sece@{newStudent.phone.replace(/\D/g, '').slice(-5) || 'XXXXX'}</code>)
            </label>
            <input type="text" value={newStudent.password} onChange={(e) => setNewStudent(p => ({ ...p, password: e.target.value }))}
              placeholder={`Default: sece@${newStudent.phone.replace(/\D/g, '').slice(-5) || '12345'} (leave blank to auto-generate)`}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none font-mono" />
          </div>

          <p className="text-[11px] text-amber-700 font-medium bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            Note: Username is the official email (<code className="font-mono">@sece.ac.in</code>). Password auto-generates as <code className="font-mono">sece@&lt;last 5 digits of mobile&gt;</code>. Student will be forced to set a new password on first login.
          </p>

          <div className="pt-2 flex justify-end gap-3">
            <button onClick={() => setShowAddStudent(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
            <button onClick={handleAddStudent} disabled={addingStudent}
              className="px-5 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
              {addingStudent ? 'Provisioning...' : <><UserCheck className="w-4 h-4" /> Provision Student Account</>}
            </button>
          </div>
        </div>
      </Modal>
        </>
      )}
    </div>
  );
};
