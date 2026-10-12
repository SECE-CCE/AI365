import React, { useState } from 'react';
import { Loader2, Link2, CheckCircle, ExternalLink, XCircle, Info } from 'lucide-react';
import { apiFetch } from '../../services/api';
import { formatBytes } from '../../utils/documentValidator';

interface LearningHoursFormProps {
  onSuccess: () => void;
}

export const LearningHoursForm: React.FC<LearningHoursFormProps> = ({ onSuccess }) => {
  const [activityName, setActivityName] = useState('');
  const [platform, setPlatform] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');

  // Drive state
  const [driveLink, setDriveLink] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');
  const [driveChecking, setDriveChecking] = useState(false);
  const [driveReady, setDriveReady] = useState(false);
  const [driveMeta, setDriveMeta] = useState<{ filename: string; sizeBytes: number; mime: string } | null>(null);
  const [driveError, setDriveError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleDriveCheck = async () => {
    const url = driveLink.trim();
    if (!url) return setError('Please paste your Google Drive link first.');
    setError('');
    setDriveError('');
    setDriveChecking(true);
    setDriveReady(false);
    setDriveMeta(null);
    setCertificateUrl('');

    try {
      const res = await apiFetch<{
        accessible: boolean;
        url: string;
        fileId: string;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        error?: string;
      }>('/api/upload/drive-check', {
        method: 'POST',
        body: JSON.stringify({ driveLink: url }),
      });

      if (!res.accessible) {
        setDriveError(res.error ?? 'Drive file is not accessible. Please check sharing settings.');
        return;
      }

      setCertificateUrl(res.url);
      setDriveReady(true);
      setDriveMeta({ filename: res.filename, sizeBytes: res.sizeBytes, mime: res.mimeType });
    } catch (err: any) {
      setDriveError(err?.message ?? 'Could not verify the Drive link. Please try again.');
    } finally {
      setDriveChecking(false);
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
      {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-medium">{error}</div>}

      <div>
        <label className="block font-bold text-slate-700 mb-1">Activity / Course Name *</label>
        <input type="text" required value={activityName} onChange={(e) => setActivityName(e.target.value)}
          placeholder="e.g., Deep Learning Specialization - Coursera"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Platform / Host *</label>
          <input type="text" required value={platform} onChange={(e) => setPlatform(e.target.value)}
            placeholder="e.g. Coursera, NVIDIA DLI, NPTEL"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Date Completed *</label>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
        </div>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Total Hours Logged *</label>
        <input type="number" required min="0.5" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)}
          placeholder="e.g. 24"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Short Description / Key Learnings</label>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Summarize key modules, algorithms, or practical models mastered..."
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
      </div>

      {/* Google Drive Link Section — with real accessibility check */}
      <div className="space-y-2">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-blue-700 leading-relaxed">
            Upload your certificate/proof to <strong>Google Drive</strong>, right-click → <strong>Share</strong> → set to <strong>"Anyone with the link can view"</strong>, then paste the link below and click <strong>Verify</strong>. (Optional)
          </p>
        </div>

        <label className="block font-bold text-slate-700">Google Drive Proof Link (Optional)</label>
        <div className="flex gap-2">
          <input
            type="url"
            id="lh-drive-input"
            value={driveLink}
            onChange={(e) => {
              setDriveLink(e.target.value);
              setDriveReady(false);
              setDriveMeta(null);
              setDriveError('');
              setCertificateUrl('');
            }}
            placeholder="https://drive.google.com/file/d/…"
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
          />
          <button
            type="button"
            id="lh-drive-verify-btn"
            onClick={handleDriveCheck}
            disabled={driveChecking || !driveLink.trim()}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-900 text-white rounded-xl font-semibold flex items-center gap-1.5 disabled:opacity-50 shrink-0 transition-all"
          >
            {driveChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
            Verify
          </button>
        </div>

        {driveError && (
          <div className="flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700">
            <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{driveError}</span>
          </div>
        )}

        {driveReady && driveMeta && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Drive file verified — publicly accessible
              <a href={certificateUrl} target="_blank" rel="noopener noreferrer"
                className="ml-auto text-[#004990] hover:underline flex items-center gap-1 font-semibold text-[10px]">
                Preview <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="flex flex-wrap gap-x-4 text-slate-600">
              {driveMeta.filename && <span>File: <strong>{driveMeta.filename}</strong></span>}
              {driveMeta.sizeBytes > 0 && <span>Size: <strong>{formatBytes(driveMeta.sizeBytes)}</strong></span>}
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <button type="submit" id="lh-submit-btn" disabled={submitting}
          className="px-5 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit for Faculty Approval
        </button>
      </div>
    </form>
  );
};
