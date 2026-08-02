import React, { useState, useEffect } from 'react';
import { Users, Search, Edit, Plus, Check, X, UserCheck, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Table, Column } from '../../components/common/Table';
import { StatusPill } from '../../components/common/StatusPill';
import { Modal } from '../../components/common/Modal';
import { apiFetch } from '../../services/api';

const MENTORS_LIST = [
  'Dr. S. Dhamodharan',
  'Ms. G. G. Sreeja',
  'Ms. R. Preethi',
  'Ms. R. Megala',
];

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

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

  useEffect(() => { fetchUsers(); }, []);

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
          <img src={row.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
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
      header: 'Actions',
      cell: (row) => (
        <button onClick={() => handleOpenEdit(row)}
          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1">
          <Edit className="w-3.5 h-3.5" /> Edit
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">CCE User Directory</h2>
          <p className="text-xs text-slate-500 font-medium">Manage student registrations, approvals, and chosen faculty mentors</p>
        </div>
      </div>

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
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['All', 'Student', 'Admin'].map((rl) => (
              <button key={rl} onClick={() => setRoleFilter(rl)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${roleFilter === rl ? 'bg-[#004990] text-white shadow' : 'text-slate-600 hover:bg-slate-200'}`}>
                {rl}s
              </button>
            ))}
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
    </div>
  );
};
