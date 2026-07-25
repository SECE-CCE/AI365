import React, { useState } from 'react';
import { Link, Loader2, CheckCircle, ExternalLink, Info } from 'lucide-react';
import { apiFetch } from '../../services/api';

interface CertificateFormProps {
  onSuccess: () => void;
}

export const CertificateForm: React.FC<CertificateFormProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [skillsLearned, setSkillsLearned] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');

  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleValidateLink = async () => {
    if (!driveLink.trim()) return setError('Please paste your Google Drive link first.');
    setError('');
    setValidating(true);
    try {
      const res = await apiFetch<{ url: string }>('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ driveLink }),
      });
      setCertificateUrl(res.url);
    } catch (err: any) {
      setError(err.message || 'Invalid Drive link. Make sure sharing is set to "Anyone with link".');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) return setError('Certificate title is required.');
    if (!issuer.trim()) return setError('Issuing organization is required.');
    if (!certificateUrl) return setError('Please validate your Google Drive link first.');

    setSubmitting(true);
    try {
      await apiFetch('/api/students/certificates', {
        method: 'POST',
        body: JSON.stringify({ title, issuer, completion_date: completionDate, skills_learned: skillsLearned, certificate_url: certificateUrl }),
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
      {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-medium">{error}</div>}

      <div>
        <label className="block font-bold text-slate-700 mb-1">Certificate Title *</label>
        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. AWS Certified Machine Learning - Specialty"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Issuing Organization *</label>
          <input type="text" required value={issuer} onChange={(e) => setIssuer(e.target.value)}
            placeholder="e.g. Amazon Web Services, Google, Microsoft"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Date of Issue *</label>
          <input type="date" required value={completionDate} onChange={(e) => setCompletionDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
        </div>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Skills & Competencies Earned</label>
        <input type="text" value={skillsLearned} onChange={(e) => setSkillsLearned(e.target.value)}
          placeholder="e.g., MLOps, Computer Vision, Transformers, SageMaker"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
      </div>

      {/* Google Drive Link Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-blue-700 leading-relaxed">
          Upload your certificate PDF to <strong>Google Drive</strong>, right-click → <strong>Share</strong> → set to <strong>"Anyone with the link can view"</strong>, then paste the link below.
        </p>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Google Drive Link *</label>
        <div className="flex gap-2">
          <input type="url" value={driveLink} onChange={(e) => { setDriveLink(e.target.value); setCertificateUrl(''); }}
            placeholder="https://drive.google.com/file/d/..."
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
          <button type="button" onClick={handleValidateLink} disabled={validating}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-900 text-white rounded-xl font-semibold flex items-center gap-1.5 disabled:opacity-50 shrink-0">
            {validating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link className="w-3.5 h-3.5" />}
            Validate
          </button>
        </div>
        {certificateUrl && (
          <div className="mt-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 font-semibold">Link validated!</span>
            <a href={certificateUrl} target="_blank" rel="noreferrer" className="text-[#004990] hover:underline flex items-center gap-1">
              Preview <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <button type="submit" disabled={submitting}
          className="px-5 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Add to AI Passport
        </button>
      </div>
    </form>
  );
};
