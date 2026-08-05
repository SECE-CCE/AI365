import React, { useState } from 'react';
import { Link, Loader2, CheckCircle, ExternalLink, Upload, FileText } from 'lucide-react';
import { apiFetch } from '../../services/api';
import { compressDocument } from '../../utils/compressDocument';

interface CertificateFormProps {
  onSuccess: () => void;
}

export const CertificateForm: React.FC<CertificateFormProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [skillsLearned, setSkillsLearned] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'drive'>('file');
  
  const [driveLink, setDriveLink] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!title.trim()) {
      setError('Please enter the Certificate Title first before attaching the document.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // 1. Compress image or process document
      const { base64, extension } = await compressDocument(file);

      // 2. Upload to server into <User_Name>/certificates/<User_Name>_<Certificate_Title>.<ext>
      const res = await apiFetch<{ url: string; filename: string }>('/api/upload/certificate', {
        method: 'POST',
        body: JSON.stringify({
          fileBase64: base64,
          extension,
          certificateTitle: title,
        }),
      });

      setCertificateUrl(res.url);
      setUploadedFileName(res.filename);
    } catch (err: any) {
      console.error('Certificate Upload Error:', err);
      setError(err.message || 'Failed to upload and compress certificate file.');
    } finally {
      setUploading(false);
    }
  };

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
      setUploadedFileName('Google Drive Link');
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
    if (!certificateUrl) return setError('Please upload your certificate file or validate a link first.');

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
        <label className="block font-bold text-slate-700 mb-1">Skills & Competencies Earned</label>
        <input
          type="text"
          value={skillsLearned}
          onChange={(e) => setSkillsLearned(e.target.value)}
          placeholder="e.g., MLOps, Computer Vision, Artificial Intelligence"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
        />
      </div>

      {/* Upload Mode Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block font-bold text-slate-700">Certificate Proof Document *</label>
          <div className="flex gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`px-3 py-1 rounded-lg font-semibold border transition-all ${
                uploadMode === 'file'
                  ? 'bg-[#004990] text-white border-[#004990]'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Direct File Upload
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('drive')}
              className={`px-3 py-1 rounded-lg font-semibold border transition-all ${
                uploadMode === 'drive'
                  ? 'bg-[#004990] text-white border-[#004990]'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Google Drive Link
            </button>
          </div>
        </div>

        {uploadMode === 'file' ? (
          <div className="space-y-2">
            <label className="cursor-pointer flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-[#004990] bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-all text-center">
              {uploading ? (
                <div className="flex items-center gap-2 text-[#004990] font-semibold">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Compressing & Saving Certificate...</span>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="font-semibold text-slate-700">Click to upload Certificate File</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Images (PNG, JPG, WEBP) or PDF documents</span>
                </>
              )}
              <input
                type="file"
                onChange={handleFileUpload}
                accept="image/*,.pdf"
                disabled={uploading}
                className="hidden"
              />
            </label>

            {certificateUrl && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold truncate">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{uploadedFileName || 'Certificate File Saved'}</span>
                </div>
                <a
                  href={certificateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#004990] font-bold hover:underline shrink-0 flex items-center gap-1 ml-2"
                >
                  Preview <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="url"
                value={driveLink}
                onChange={(e) => {
                  setDriveLink(e.target.value);
                  setCertificateUrl('');
                }}
                placeholder="https://drive.google.com/file/d/..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
              />
              <button
                type="button"
                onClick={handleValidateLink}
                disabled={validating}
                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-900 text-white rounded-xl font-semibold flex items-center gap-1.5 disabled:opacity-50 shrink-0"
              >
                {validating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link className="w-3.5 h-3.5" />}
                Validate
              </button>
            </div>
            {certificateUrl && (
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Link validated!</span>
                <a
                  href={certificateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#004990] hover:underline flex items-center gap-1"
                >
                  Preview <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="px-5 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Add to AI Passport
        </button>
      </div>
    </form>
  );
};
