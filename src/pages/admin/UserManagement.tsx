import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Shield, Check, X, Search, Lock, Edit } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Table, Column } from '../../components/common/Table';
import { StatusPill } from '../../components/common/StatusPill';
import { Modal } from '../../components/common/Modal';
import { apiFetch } from '../../services/api';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [roleFilter, setRoleFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal edit states
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [assignMentorId, setAssignMentorId] = useState<string>('');
  const [isDeptWide, setIsDeptWide] = useState<boolean>(false);
  const [resetPass, setResetPass] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await apiFetch<{ users: any[]; faculty: any[] }>('/api/admin/users');
      setUsers(data.users || []);
      setFacultyList(data.faculty || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    setAssignMentorId(user.mentor_id ? String(user.mentor_id) : '');
    setIsDeptWide(!!user.is_department_wide);
    setResetPass('');
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await apiFetch('/api/admin/users', {
        method: 'PUT',
        body: JSON.stringify({
          user_id: selectedUser.id,
          mentor_id: assignMentorId ? Number(assignMentorId) : null,
          is_department_wide: isDeptWide,
          password: resetPass || undefined,
        }),
      });
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveStatus = async (userId: number, action: 'approve' | 'reject') => {
    try {
      await apiFetch('/api/admin/users/approve', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, action }),
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'All' && u.role.toLowerCase() !== roleFilter.toLowerCase()) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = u.full_name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchReg = u.register_number?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchReg) return false;
    }
    return true;
  });

  const columns: Column<any>[] = [
    {
      header: 'User Name',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <img
            src={row.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={row.full_name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
          />
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
        <span
          className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
            row.role === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : row.role === 'faculty'
              ? 'bg-indigo-100 text-indigo-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {row.role}
        </span>
      ),
    },
    {
      header: 'Reg No / Dept',
      cell: (row) => (
        <span className="font-semibold text-slate-700">
          {row.role === 'student' ? `${row.register_number} (${row.year})` : row.department}
        </span>
      ),
    },
    {
      header: 'Account Status',
      cell: (row) => <StatusPill status={row.status} />,
    },
    {
      header: 'Assigned Mentor / Scope',
      cell: (row) => {
        if (row.role === 'student') {
          return <span className="text-slate-700 font-medium">{row.mentor_name || 'Unassigned'}</span>;
        }
        if (row.role === 'faculty') {
          return (
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              {row.is_department_wide ? 'Department-Wide Scope' : 'Assigned Mentees Only'}
            </span>
          );
        }
        return <span className="text-slate-400">System Admin</span>;
      },
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          {row.status === 'pending_approval' && (
            <>
              <button
                onClick={() => handleApproveStatus(row.id, 'approve')}
                className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-[11px] font-bold"
              >
                Approve
              </button>
              <button
                onClick={() => handleApproveStatus(row.id, 'reject')}
                className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md text-[11px] font-bold"
              >
                Reject
              </button>
            </>
          )}
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
          >
            <Edit className="w-3.5 h-3.5" /> Edit
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">CCE User Directory Management</h2>
          <p className="text-xs text-slate-500 font-medium">Manage student accounts, faculty mentors, and RBAC security settings</p>
        </div>
      </div>

      {/* Filter bar */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user name, email, register number..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            {['All', 'Student', 'Faculty', 'Admin'].map((rl) => (
              <button
                key={rl}
                onClick={() => setRoleFilter(rl)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  roleFilter === rl ? 'bg-[#004990] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {rl}s
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card title="System Accounts" subtitle={`Showing ${filteredUsers.length} users`}>
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading directory...</div>
        ) : (
          <Table columns={columns} data={filteredUsers} keyExtractor={(r) => r.id} />
        )}
      </Card>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={`Edit User: ${selectedUser?.full_name}`}
        subtitle="Update mentor mappings, access scope, or reset password"
      >
        {selectedUser && (
          <div className="space-y-4 text-xs">
            {selectedUser.role === 'student' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign Faculty Mentor</label>
                <select
                  value={assignMentorId}
                  onChange={(e) => setAssignMentorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                >
                  <option value="">Unassigned</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.full_name} ({f.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedUser.role === 'faculty' && (
              <div className="flex items-center space-x-3 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <input
                  type="checkbox"
                  id="deptWide"
                  checked={isDeptWide}
                  onChange={(e) => setIsDeptWide(e.target.checked)}
                  className="w-4 h-4 text-[#004990] rounded focus:ring-[#004990]"
                />
                <label htmlFor="deptWide" className="font-bold text-slate-800 cursor-pointer">
                  Grant Department-Wide Approval Scope (Can approve any CCE student submission)
                </label>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reset Password (Optional)</label>
              <input
                type="password"
                value={resetPass}
                onChange={(e) => setResetPass(e.target.value)}
                placeholder="Enter new password for user"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={submitting}
                className="px-5 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold transition-all shadow-md"
              >
                {submitting ? 'Saving...' : 'Save User Settings'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
