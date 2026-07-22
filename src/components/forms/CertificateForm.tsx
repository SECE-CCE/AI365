import React, { useState } from 'react';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { apiFetch } from '../../services/api';

interface CertificateFormProps {
  onSuccess: () => void;
}

export const CertificateForm: React.FC<CertificateFormProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [skillsLearned, setSkillsLearned] = useState('');
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
      setError(err.message || 'Failed to upload certificate PDF.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) return setError('Certificate title is required.');
    if (!issuer.trim()) return setError('Issuing organization is required.');
    if (!certificateUrl) return setError('Please upload the certificate PDF / document.');

    setSubmitting(true);
    try {
      await apiFetch('/api/students/certificates', {
        method: 'POST',
        body: JSON.stringify({
          title,
          issuer,
          completion_date: completionDate,
          skills_learned: skillsLearned,
          certificate_url: certificateUrl,
        }),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit certificate.');
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
        <label className="block font-bold text-slate-700 mb-1">Certificate Title *</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. AWS Certified Machine Learning - Specialty"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Issuing Organization *</label>
          <input
            type="text"
            required
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            placeholder="e.g. Amazon Web Services, Google, Microsoft"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Date of Issue *</label>
          <input
            type="date"
            required
            value={completionDate}
            onChange={(e) => setCompletionDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Skills & Competencies Earned</label>
        <input
          type="text"
          value={skillsLearned}
          onChange={(e) => setSkillsLearned(e.target.value)}
          placeholder="e.g., MLOps, Computer Vision, Transformers, SageMaker"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
        />
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Upload Certificate PDF / Document *</label>
        <div className="flex items-center space-x-3">
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold border border-slate-200 transition-colors">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin text-[#004990]" /> : <Upload className="w-4 h-4" />}
            <span>{uploading ? 'Uploading PDF...' : 'Choose PDF'}</span>
            <input type="file" onChange={handleFileUpload} accept=".pdf,image/*" className="hidden" />
          </label>
          {certificateUrl && (
            <span className="text-emerald-600 font-medium flex items-center gap-1 text-[11px]">
              <CheckCircle className="w-3.5 h-3.5" /> PDF Attached
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
          <span>Add to AI Passport</span>
        </button>
      </div>
    </form>
  );
};
