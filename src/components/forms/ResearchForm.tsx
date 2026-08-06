import React, { useState } from 'react';
import { Link, Loader2, CheckCircle, ExternalLink, Upload, FileText } from 'lucide-react';
import { apiFetch } from '../../services/api';
import { compressDocument } from '../../utils/compressDocument';

interface ResearchFormProps {
  onSuccess: () => void;
}

export const ResearchForm: React.FC<ResearchFormProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [conferenceJournal, setConferenceJournal] = useState('');
  const [authors, setAuthors] = useState('');
  const [totalHours, setTotalHours] = useState(80);
  const [abstract, setAbstract] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'drive'>('file');

  const [driveLink, setDriveLink] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Calculate live team author division
  const parsedCoAuthors = authors.split(/,| and /i).map((a) => a.trim()).filter((a) => a.length > 0);
  const totalAuthorsCount = Math.max(1, 1 + parsedCoAuthors.length);
  const individualShareHours = Math.max(1, Math.round(Number(totalHours || 80) / totalAuthorsCount));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!title.trim()) {
      setError('Please enter the Paper Title first before attaching the manuscript.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // 1. Compress image or process document
      const { base64, extension } = await compressDocument(file);

      // 2. Upload to server into assets/Documents/<User_Name>/papers/<User_Name>_<Paper_Title>.<ext>
      const res = await apiFetch<{ url: string; filename: string }>('/api/upload/paper', {
        method: 'POST',
        body: JSON.stringify({
          fileBase64: base64,
          extension,
          paperTitle: title,
        }),
      });

      setPdfUrl(res.url);
      setUploadedFileName(res.filename);
    } catch (err: any) {
      console.error('Paper Upload Error:', err);
      setError(err.message || 'Failed to upload research paper file.');
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
      setPdfUrl(res.url);
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
    if (!title.trim()) return setError('Paper Title is required.');
    if (!conferenceJournal.trim()) return setError('Conference or Journal name is required.');
    if (!authors.trim()) return setError('Authors list is required.');
    if (!pdfUrl) return setError('Please attach your research paper file or validate a link first.');

    setSubmitting(true);
    try {
      await apiFetch('/api/students/research', {
        method: 'POST',
        body: JSON.stringify({
          title,
          conference_journal: conferenceJournal,
          authors,
          total_hours: totalHours,
          abstract,
          pdf_url: pdfUrl,
        }),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit research paper.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-medium">{error}</div>}

      <div>
        <label className="block font-bold text-slate-700 mb-1">Paper Title *</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Edge-AI Optimization for Low-Power IoT Communication Networks"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Conference / Journal Name *</label>
          <input
            type="text"
            required
            value={conferenceJournal}
            onChange={(e) => setConferenceJournal(e.target.value)}
            placeholder="e.g. IEEE ICCSP 2026, Springer JISA"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
          />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Total Effort Hours Invested *</label>
          <input
            type="number"
            min={10}
            max={300}
            required
            value={totalHours}
            onChange={(e) => setTotalHours(Number(e.target.value))}
            placeholder="e.g. 80 hours"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">
          Co-Authors * <span className="text-slate-400 font-normal">(comma-separated, excluding yourself)</span>
        </label>
        <input
          type="text"
          required
          value={authors}
          onChange={(e) => setAuthors(e.target.value)}
          placeholder="e.g., Alex Mercer, Dr. Rajesh Sharma"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
        />
      </div>

      {/* Live Co-Author Hours Division Preview Card */}
      <div className="bg-indigo-50 border border-indigo-200/80 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-indigo-900 font-bold">
          <span>Effort Hours Distribution:</span>
          <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[11px]">
            {totalHours} hrs ÷ {totalAuthorsCount} authors = {individualShareHours} hrs each
          </span>
        </div>
        <div className="text-[11px] text-indigo-800 space-y-1">
          <p className="font-bold">Authors ({totalAuthorsCount} total):</p>
          <p className="font-semibold text-emerald-700">1. You (Submitter) — {individualShareHours} hrs credited to your leaderboard</p>
          {parsedCoAuthors.map((name, i) => (
            <p key={i} className="font-medium text-indigo-700">
              {i + 2}. {name} — {individualShareHours} hrs
            </p>
          ))}
        </div>
        <p className="text-[11px] text-indigo-700 leading-relaxed font-medium border-t border-indigo-200 pt-2">
          Upon approval, <strong>{individualShareHours} learning hours</strong> will be credited to your AI Passport. Overall <strong>{totalHours} hrs</strong> will appear on the home screen stats.
        </p>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Abstract Summary</label>
        <textarea
          rows={3}
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          placeholder="Brief summary of methodology, experimental setup, and key results..."
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
        />
      </div>

      {/* Manuscript Proof Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block font-bold text-slate-700">Research Paper Manuscript *</label>
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
                  <span>Processing & Saving Manuscript...</span>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="font-semibold text-slate-700">Click to upload Research Paper (PDF/Doc)</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">PDF or Image manuscript documents</span>
                </>
              )}
              <input type="file" onChange={handleFileUpload} accept=".pdf,image/*" disabled={uploading} className="hidden" />
            </label>

            {pdfUrl && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold truncate">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{uploadedFileName || 'Paper Document Saved'}</span>
                </div>
                <a
                  href={pdfUrl}
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
                  setPdfUrl('');
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
            {pdfUrl && (
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Link validated!</span>
                <a
                  href={pdfUrl}
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
          Submit Research Paper
        </button>
      </div>
    </form>
  );
};
