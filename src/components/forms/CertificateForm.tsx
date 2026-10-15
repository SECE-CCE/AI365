import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '../../services/api';
import { DocumentUploader, DocumentReadyPayload } from './DocumentUploader';

interface CertificateFormProps {
  onSuccess: () => void;
}

export const CertificateForm: React.FC<CertificateFormProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [skillsLearned, setSkillsLearned] = useState('');

  const [docPayload, setDocPayload] = useState<DocumentReadyPayload | null>(null);
  const [docReady, setDocReady] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleDocReady = (payload: DocumentReadyPayload) => {
    setDocPayload(payload);
    setDocReady(true);
    setError('');
  };

  const handleDocClear = () => {
    setDocPayload(null);
    setDocReady(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) return setError('Certificate title is required.');
    if (!issuer.trim()) return setError('Issuing organization is required.');
    if (!docReady || !docPayload) return setError('Please attach your certificate file or verify a Google Drive link first.');

    setSubmitting(true);
    try {
      // Build the certificate_url based on mode
      let certificateUrl = '';

      if (docPayload.mode === 'drive') {
        // Store the Google Drive view URL — no file bytes in DB
        certificateUrl = docPayload.driveUrl ?? '';
      } else {
        // Direct upload: upload base64 to server (stored in filesystem for local dev, 
        // or via PostgreSQL BYTEA in production migration)
        const uploadRes = await apiFetch<{ url: string; filename: string }>('/api/upload/certificate', {
          method: 'POST',
          body: JSON.stringify({
            fileBase64: docPayload.base64,
            extension: docPayload.extension,
            certificateTitle: title,
          }),
        });
        certificateUrl = uploadRes.url;
      }

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
      {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-medium">{error}</div>}

      <div>
        <label className="block font-bold text-slate-700 mb-1">Certificate Title *</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Nptel AI, AWS Certified Machine Learning"
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
            placeholder="e.g. NPTEL, Coursera, Google, Microsoft"
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
        <label className="block font-bold text-slate-700 mb-1">Skills &amp; Competencies Earned</label>
        <input
          type="text"
          value={skillsLearned}
          onChange={(e) => setSkillsLearned(e.target.value)}
          placeholder="e.g., MLOps, Computer Vision, Artificial Intelligence"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
        />
      </div>

      {/* Enhanced document uploader with validation, size enforcement, and Drive check */}
      <DocumentUploader
        label="Certificate Proof Document"
        required
        idPrefix="cert"
        onReady={handleDocReady}
        onClear={handleDocClear}
      />

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          id="cert-submit-btn"
          disabled={submitting || !docReady}
          className="px-5 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Add to AI Passport
        </button>
      </div>
    </form>
  );
};
