import React, { useState } from 'react';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { apiFetch } from '../../services/api';

interface LearningHoursFormProps {
  onSuccess: () => void;
}

export const LearningHoursForm: React.FC<LearningHoursFormProps> = ({ onSuccess }) => {
  const [activityName, setActivityName] = useState('');
  const [platform, setPlatform] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE_BYTES) {
      setError(`File size exceeds 5 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a smaller file.`);
      return;
    }

    setError('');
    setUploading(true);
    try {
      const res = await apiFetch<{ url: string }>('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, fileSize: file.size, type: 'certificate' }),
      });
      setCertificateUrl(res.url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload proof document.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!activityName.trim()) return setError('Activity Name is required.');
    if (!platform.trim()) return setError('Platform name is required.');
    if (!hours || Number(hours) <= 0) return setError('Please enter valid positive learning hours.');

    setSubmitting(true);
    try {
      await apiFetch('/api/students/learning-hours', {
        method: 'POST',
        body: JSON.stringify({
          activity_name: activityName,
          platform,
          date,
          hours: Number(hours),
          description,
          certificate_url: certificateUrl,
        }),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit learning hours.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {error && (
        <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block font-bold text-slate-700 mb-1">Activity / Course Name *</label>
        <input
          type="text"
          required
          value={activityName}
          onChange={(e) => setActivityName(e.target.value)}
          placeholder="e.g., Deep Learning Specialization - Coursera"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Platform / Host *</label>
          <input
            type="text"
            required
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="e.g. Coursera, NVIDIA DLI, NPTEL"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Date Completed *</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Total Hours Logged *</label>
        <input
          type="number"
          required
          min="0.5"
          step="0.5"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="e.g. 24"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
        />
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Short Description / Key Learnings</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Summarize key modules, algorithms, or practical models mastered..."
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
        />
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Upload Certificate / Proof (PDF/Image)</label>
        <div className="flex items-center space-x-3">
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold border border-slate-200 transition-colors">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin text-[#004990]" /> : <Upload className="w-4 h-4" />}
            <span>{uploading ? 'Uploading to Blob...' : 'Choose File'}</span>
            <input type="file" onChange={handleFileUpload} accept=".pdf,image/*" className="hidden" />
          </label>
          {certificateUrl && (
            <span className="text-emerald-600 font-medium flex items-center gap-1 text-[11px]">
              <CheckCircle className="w-3.5 h-3.5" /> Uploaded
            </span>
          )}
        </div>
      </div>

      <div className="pt-2 flex justify-end gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Submit for Faculty Approval</span>
        </button>
      </div>
    </form>
  );
};
