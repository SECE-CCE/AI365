import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '../../services/api';
import { DocumentUploader, DocumentReadyPayload } from './DocumentUploader';
import { MAX_DOCUMENT_SIZE_MB } from '../../utils/documentValidator';

interface ResearchFormProps {
  onSuccess: () => void;
}

export const ResearchForm: React.FC<ResearchFormProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [conferenceJournal, setConferenceJournal] = useState('');
  const [authors, setAuthors] = useState('');
  const [totalHours, setTotalHours] = useState(80);
  const [abstract, setAbstract] = useState('');

  const [docPayload, setDocPayload] = useState<DocumentReadyPayload | null>(null);
  const [docReady, setDocReady] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Calculate live team author division
  const parsedCoAuthors = authors.split(/,| and /i).map((a) => a.trim()).filter((a) => a.length > 0);
  const totalAuthorsCount = Math.max(1, 1 + parsedCoAuthors.length);
  const individualShareHours = Math.max(1, Math.round(Number(totalHours || 80) / totalAuthorsCount));

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

    if (!title.trim()) return setError('Paper Title is required.');
    if (!conferenceJournal.trim()) return setError('Conference or Journal name is required.');
    if (!authors.trim()) return setError('Authors list is required.');
    if (!docReady || !docPayload) return setError('Please attach your research paper manuscript or verify a Google Drive link first.');

    setSubmitting(true);
    try {
      let pdfUrl = '';

      if (docPayload.mode === 'drive') {
        // Store the Google Drive view URL — no file bytes in DB
        pdfUrl = docPayload.driveUrl ?? '';
      } else {
        // Direct upload
        const uploadRes = await apiFetch<{ url: string; filename: string }>('/api/upload/paper', {
          method: 'POST',
          body: JSON.stringify({
            fileBase64: docPayload.base64,
            extension: docPayload.extension,
            paperTitle: title,
          }),
        });
        pdfUrl = uploadRes.url;
      }

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

      {/* Enhanced document uploader — research papers use 10 MB limit */}
      <DocumentUploader
        label="Research Paper Manuscript"
        required
        idPrefix="research"
        maxBytes={10 * 1024 * 1024}  // 10 MB for research papers
        onReady={handleDocReady}
        onClear={handleDocClear}
      />

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          id="research-submit-btn"
          disabled={submitting || !docReady}
          className="px-5 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit Research Paper
        </button>
      </div>
    </form>
  );
};
