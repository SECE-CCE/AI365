import React, { useState } from 'react';
import { UserCheck, Lock, Upload, Loader2, CheckCircle2, Shield } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';
import { compressImage } from '../../utils/compressImage';

export const StudentSettings: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profile_photo || '');
  const [password, setPassword] = useState('');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setMessage({ text: 'File size must be under 10MB.', type: 'error' });
      return;
    }

    setUploading(true);
    setMessage(null);
    try {
      // Compress image client-side before sending to server
      const compressedBase64 = await compressImage(file, 400, 400, 0.75);

      // Save compressed photo in local server directory named after user
      const res = await apiFetch<{ url: string }>('/api/upload/photo', {
        method: 'POST',
        body: JSON.stringify({ imageBase64: compressedBase64 }),
      });

      setProfilePhoto(res.url);
      setMessage({ text: 'Photo compressed and saved successfully!', type: 'success' });
    } catch (err: any) {
      console.error('Photo Upload Failure:', err);
      setMessage({ text: err.message || 'Failed to compress and save photo.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

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
          profile_photo: profilePhoto,
          ...(password ? { password } : {}),
        }),
      });

      await refreshUser();
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setPassword('');
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update settings.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Account & Profile Settings</h2>
        <p className="text-xs text-slate-500 font-medium">Manage your personal profile and security preferences</p>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium border flex items-center gap-2 ${message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
        >
          {message.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{message.text}</span>
        </div>
      )}

      <Card title="Student Information" subtitle="Official academic records managed by CCE Dept">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="flex items-center space-x-4 pb-4 border-b border-slate-100">
            <img
              src={profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={fullName}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-[#004990]/20 shadow-md"
            />
            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold border border-slate-200 transition-colors text-xs">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin text-[#004990]" /> : <Upload className="w-4 h-4" />}
                <span>{uploading ? 'Uploading Photo...' : 'Change Profile Photo'}</span>
                <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />
              </label>
              <p className="text-[10px] text-slate-400 mt-1">PNG, JPG or WEBP (Max 5MB)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div>
              <label className="block font-bold text-slate-700 mb-1">Register Number</label>
              <input
                type="text"
                readOnly
                value={user.register_number || 'N/A'}
                className="w-full px-3.5 py-2.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                readOnly
                value={user.department}
                className="w-full px-3.5 py-2.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                readOnly
                value={user.year || 'N/A'}
                className="w-full px-3.5 py-2.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">College Email</label>
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
    </div>
  );
};
