import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Loader2, Database, RefreshCw, FileJson, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';

interface BackupFile {
  filename: string;
  size: number;
  mtime: string;
}

export const AdminSettings: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Backup & Restore State
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState<string | null>(null);
  const [backupMessage, setBackupMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchBackups = async () => {
    setLoadingBackups(true);
    setBackupMessage(null);
    try {
      const data = await apiFetch<{ backups: BackupFile[] }>('/api/admin/backups');
      setBackups(data.backups || []);
    } catch (err: any) {
      setBackupMessage({ text: err.message || 'Failed to load backup files list.', type: 'error' });
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    setBackupMessage(null);
    try {
      const res = await apiFetch<{ message: string }>('/api/admin/backup', { method: 'POST' });
      setBackupMessage({ text: res.message || 'Backup snapshot created successfully!', type: 'success' });
      await fetchBackups();
    } catch (err: any) {
      setBackupMessage({ text: err.message || 'Failed to create backup.', type: 'error' });
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    const confirmRestore = window.confirm(
      `⚠️ WARNING: Are you sure you want to restore the database to the snapshot "${filename}"?\n\nThis will completely overwrite all current users, logs, and activity records. This action CANNOT be undone.`
    );
    if (!confirmRestore) return;

    setRestoringBackup(filename);
    setBackupMessage(null);
    try {
      const res = await apiFetch<{ message: string }>('/api/admin/restore', {
        method: 'POST',
        body: JSON.stringify({ filename }),
      });
      setBackupMessage({ text: res.message || 'Database restored successfully!', type: 'success' });
    } catch (err: any) {
      setBackupMessage({ text: err.message || 'Restoration failed. Please check logs.', type: 'error' });
    } finally {
      setRestoringBackup(null);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchBackups();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      await apiFetch('/api/auth/me', {
        method: 'PUT',
        body: JSON.stringify({
          full_name: fullName,
          phone,
          ...(password ? { password } : {}),
        }),
      });

      await refreshUser();
      setMessage({ text: 'Admin profile updated successfully!', type: 'success' });
      setPassword('');
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update settings.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDateString = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Admin Account Settings</h2>
        <p className="text-xs text-slate-500 font-medium">Department Administrator credentials and security preferences</p>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium border flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{message.text}</span>
        </div>
      )}

      <Card title="Admin Administrator Details" subtitle="Full system administrator privileges for AI365">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Admin Email</label>
              <input
                type="email"
                readOnly
                value={user.email}
                className="w-full px-3.5 py-2.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block font-bold text-slate-700 mb-1">Change Password (Optional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </Card>

      {/* Database Backup & Restore Card */}
      <Card title="Database Backup & Recovery" subtitle="Manage localized JSON database snapshots and restoration points">
        <div className="space-y-4 text-xs">
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900">Important System Safeguard</h4>
              <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                Restoring a snapshot deletes all current users, registrations, and learning activities. The system will be overwritten to the selected backup state. Only perform restores when necessary.
              </p>
            </div>
          </div>

          {backupMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                backupMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {backupMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              <span>{backupMessage.text}</span>
            </div>
          )}

          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#004990]" />
              <span>Available Backups ({backups.length})</span>
            </h3>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={fetchBackups}
                disabled={loadingBackups}
                className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all flex items-center gap-1 disabled:opacity-50"
                title="Refresh Backups List"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingBackups ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                type="button"
                onClick={handleCreateBackup}
                disabled={creatingBackup}
                className="px-4 py-2 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold transition-all shadow flex items-center gap-1.5 disabled:opacity-50"
              >
                {creatingBackup ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Database className="w-3.5 h-3.5" />
                )}
                <span>Create Backup</span>
              </button>
            </div>
          </div>

          {loadingBackups ? (
            <div className="py-10 text-center text-slate-500 font-medium flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#004990]" />
              <span>Loading backup files...</span>
            </div>
          ) : backups.length === 0 ? (
            <div className="py-8 text-center text-slate-400 font-medium">
              No backups found. Click "Create Backup" to save the current database state.
            </div>
          ) : (
            <div className="border border-slate-150 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
              {backups.map((backup) => (
                <div key={backup.filename} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                      <FileJson className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 tracking-tight">{backup.filename}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Created: {formatDateString(backup.mtime)} • Size: {formatSize(backup.size)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      disabled={restoringBackup !== null}
                      onClick={() => handleRestoreBackup(backup.filename)}
                      className="px-3.5 py-1.5 bg-amber-550 hover:bg-amber-600 text-white font-bold rounded-lg transition-all flex items-center gap-1 text-[11px] disabled:opacity-50"
                    >
                      {restoringBackup === backup.filename ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Restoring...</span>
                        </>
                      ) : (
                        <span>Restore</span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
