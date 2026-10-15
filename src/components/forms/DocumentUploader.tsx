/**
 * DocumentUploader
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable upload section used inside CertificateForm and ResearchForm.
 *
 * Responsibilities:
 *  - Lets student pick a file or submit a Google Drive URL
 *  - Validates file signature + size on selection
 *  - Offers "Reduce Size" (canvas compression for images; PDFs pass-through)
 *  - Keeps Continue disabled until the file is within the configured limit
 *  - Verifies Drive URL accessibility via the API before accepting
 *  - Calls back with { base64, extension, sha256, size, mode, driveUrl }
 */

import React, { useState, useCallback } from 'react';
import {
  Upload,
  Link2,
  CheckCircle,
  XCircle,
  Loader2,
  Minimize2,
  ExternalLink,
  AlertTriangle,
  FileText,
  HardDrive,
} from 'lucide-react';
import {
  validateDocument,
  computeSha256,
  formatBytes,
  MAX_DOCUMENT_SIZE_MB,
  MAX_DOCUMENT_SIZE_BYTES,
} from '../../utils/documentValidator';
import { compressDocumentToLimit } from '../../utils/compressToLimit';
import { apiFetch } from '../../services/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UploadMode = 'file' | 'drive';

export interface DocumentReadyPayload {
  mode: 'file' | 'drive';
  // File upload
  base64?: string;
  extension?: string;
  sha256?: string;
  sizeBytes?: number;
  mimeType?: string;
  filename?: string;
  // Drive
  driveUrl?: string;
  driveFileId?: string;
  driveMimeType?: string;
  driveSizeBytes?: number;
  driveFilename?: string;
}

interface Props {
  /** Called when a valid, size-compliant document is ready. Calling this does NOT submit — it just lifts state. */
  onReady: (payload: DocumentReadyPayload) => void;
  /** Called when document becomes invalid / is cleared */
  onClear: () => void;
  /** Label shown above the upload area */
  label: string;
  /** Whether this document attachment is required before submission */
  required?: boolean;
  /** Unique HTML id prefix for accessibility */
  idPrefix?: string;
  /** Override max bytes (defaults to MAX_DOCUMENT_SIZE_BYTES) */
  maxBytes?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const DocumentUploader: React.FC<Props> = ({
  onReady,
  onClear,
  label,
  required = true,
  idPrefix = 'doc',
  maxBytes = MAX_DOCUMENT_SIZE_BYTES,
}) => {
  const [mode, setMode] = useState<UploadMode>('file');

  // --- File-upload state ---
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [fileValid, setFileValid] = useState(false);
  const [fileExceedsLimit, setFileExceedsLimit] = useState(false);
  const [fileMeta, setFileMeta] = useState<{
    name: string; size: number; mime: string | null; label: string | null;
  } | null>(null);

  // Compression
  const [compressing, setCompressing] = useState(false);
  const [compressStatus, setCompressStatus] = useState('');
  const [compressionDone, setCompressionDone] = useState(false);
  const [compressionFailed, setCompressionFailed] = useState(false);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [savedPercent, setSavedPercent] = useState<number | null>(null);

  // Accepted payload (after validation + optional compression)
  const [acceptedBase64, setAcceptedBase64] = useState('');
  const [acceptedExtension, setAcceptedExtension] = useState('');

  // --- Drive state ---
  const [driveLink, setDriveLink] = useState('');
  const [driveChecking, setDriveChecking] = useState(false);
  const [driveReady, setDriveReady] = useState(false);
  const [driveMeta, setDriveMeta] = useState<{
    url: string; fileId: string; filename: string; mime: string; sizeBytes: number;
  } | null>(null);
  const [driveError, setDriveError] = useState('');

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  const maxMb = (maxBytes / (1024 * 1024)).toFixed(0);

  const resetFileState = useCallback(() => {
    setFile(null);
    setValidationError('');
    setFileValid(false);
    setFileExceedsLimit(false);
    setFileMeta(null);
    setCompressStatus('');
    setCompressionDone(false);
    setCompressionFailed(false);
    setCompressedSize(null);
    setSavedPercent(null);
    setAcceptedBase64('');
    setAcceptedExtension('');
    onClear();
  }, [onClear]);

  const resetDriveState = useCallback(() => {
    setDriveLink('');
    setDriveReady(false);
    setDriveMeta(null);
    setDriveError('');
    onClear();
  }, [onClear]);

  // -------------------------------------------------------------------------
  // File selection handler
  // -------------------------------------------------------------------------

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Reset prior state
    resetFileState();
    setFile(selected);
    setValidating(true);

    try {
      const result = await validateDocument(selected, maxBytes);

      setFileMeta({
        name: selected.name,
        size: selected.size,
        mime: result.detectedMime,
        label: result.detectedLabel,
      });

      if (!result.valid) {
        setValidationError(result.errors.join(' '));
        setValidating(false);
        return;
      }

      setFileValid(true);
      setFileExceedsLimit(result.exceedsLimit);

      if (!result.exceedsLimit) {
        // File is valid and within limit → read and accept immediately
        const reader = new FileReader();
        reader.readAsDataURL(selected);
        reader.onload = async () => {
          const base64 = reader.result as string;
          const sha256 = await computeSha256(selected);
          const ext = result.detectedMime === 'application/pdf' ? 'pdf' : 'jpg';
          setAcceptedBase64(base64);
          setAcceptedExtension(ext);
          onReady({
            mode: 'file',
            base64,
            extension: ext,
            sha256,
            sizeBytes: selected.size,
            mimeType: result.detectedMime ?? undefined,
            filename: selected.name,
          });
        };
        reader.onerror = () => {
          setValidationError('Failed to read the selected file. Please try again.');
        };
      }
      // If exceeds limit, file is NOT accepted yet — user must compress first
    } catch {
      setValidationError('An unexpected error occurred while validating the file.');
    } finally {
      setValidating(false);
    }
  }, [maxBytes, resetFileState, onReady]);

  // -------------------------------------------------------------------------
  // Compression handler
  // -------------------------------------------------------------------------

  const handleCompress = useCallback(async () => {
    if (!file || !fileValid) return;

    const mime = fileMeta?.mime;
    const isPdf = mime === 'application/pdf';

    setCompressing(true);
    setCompressionFailed(false);
    setCompressionDone(false);
    setCompressStatus(isPdf ? 'Preparing in-browser PDF optimization…' : 'Compressing image…');

    try {
      const result = await compressDocumentToLimit(file, maxBytes, (msg) => {
        setCompressStatus(msg);
      });

      setCompressedSize(result.compressedSize);
      setSavedPercent(result.savedPercent);

      if (!result.withinLimit) {
        setCompressionFailed(true);
        setValidationError(
          `Even after maximum compression, the file is ${result.compressedSizeLabel} — ` +
          `still above the ${maxMb} MB limit. Please choose a smaller file or use a Google Drive link.`
        );
        return;
      }

      // Compression succeeded — compute sha256 of the compressed data
      const base64Data = result.base64.split(',')[1];
      const byteChars = atob(base64Data);
      const byteArray = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteArray[i] = byteChars.charCodeAt(i);
      const targetMime = result.extension === 'pdf' ? 'application/pdf' : 'image/jpeg';
      const compressedBlob = new Blob([byteArray], { type: targetMime });
      const sha256 = await computeSha256(compressedBlob as unknown as File);

      setAcceptedBase64(result.base64);
      setAcceptedExtension(result.extension);
      setCompressionDone(true);
      setFileExceedsLimit(false);
      setCompressionFailed(false);
      setValidationError('');

      const cleanFilename = file.name.replace(/\.[^.]+$/, `.${result.extension}`);

      onReady({
        mode: 'file',
        base64: result.base64,
        extension: result.extension,
        sha256,
        sizeBytes: result.compressedSize,
        mimeType: targetMime,
        filename: cleanFilename,
      });
    } catch (err: any) {
      setCompressionFailed(true);
      setValidationError('Compression failed: ' + (err?.message ?? 'Unknown error.'));
    } finally {
      setCompressing(false);
      setCompressStatus('');
    }
  }, [file, fileValid, fileMeta, maxBytes, maxMb, onReady]);

  // -------------------------------------------------------------------------
  // Drive URL handler
  // -------------------------------------------------------------------------

  const handleDriveCheck = useCallback(async () => {
    const url = driveLink.trim();
    if (!url) return;

    setDriveChecking(true);
    setDriveError('');
    setDriveReady(false);
    setDriveMeta(null);
    onClear();

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
        setDriveError(
          res.error ??
          'The Google Drive file is not publicly accessible. Please set sharing to "Anyone with the link can view".'
        );
        return;
      }

      if (res.sizeBytes > maxBytes) {
        setDriveError(
          `The Drive file is ${formatBytes(res.sizeBytes)}, which exceeds the ${maxMb} MB limit. ` +
          `Please compress the file and share a smaller version, or upload it directly.`
        );
        return;
      }

      setDriveMeta({
        url: res.url,
        fileId: res.fileId,
        filename: res.filename,
        mime: res.mimeType,
        sizeBytes: res.sizeBytes,
      });
      setDriveReady(true);

      onReady({
        mode: 'drive',
        driveUrl: res.url,
        driveFileId: res.fileId,
        driveFilename: res.filename,
        driveMimeType: res.mimeType,
        driveSizeBytes: res.sizeBytes,
      });
    } catch (err: any) {
      setDriveError(err?.message ?? 'Could not verify the Drive link. Please try again.');
    } finally {
      setDriveChecking(false);
    }
  }, [driveLink, maxBytes, maxMb, onReady, onClear]);

  // -------------------------------------------------------------------------
  // Tab switch
  // -------------------------------------------------------------------------

  const handleModeChange = (m: UploadMode) => {
    if (m === mode) return;
    setMode(m);
    resetFileState();
    resetDriveState();
  };

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  const isFileAccepted = fileValid && !fileExceedsLimit && !!acceptedBase64;
  const isFilePdf = fileMeta?.mime === 'application/pdf';

  return (
    <div className="space-y-3">
      {/* Label + Tab Switcher */}
      <div className="flex items-center justify-between">
        <label className="block font-bold text-slate-700 text-xs">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="flex gap-1.5 text-[11px]">
          <button
            type="button"
            id={`${idPrefix}-tab-file`}
            onClick={() => handleModeChange('file')}
            className={`px-3 py-1 rounded-lg font-semibold border transition-all flex items-center gap-1 ${
              mode === 'file'
                ? 'bg-[#004990] text-white border-[#004990]'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Upload className="w-3 h-3" /> Direct Upload
          </button>
          <button
            type="button"
            id={`${idPrefix}-tab-drive`}
            onClick={() => handleModeChange('drive')}
            className={`px-3 py-1 rounded-lg font-semibold border transition-all flex items-center gap-1 ${
              mode === 'drive'
                ? 'bg-[#004990] text-white border-[#004990]'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <HardDrive className="w-3 h-3" /> Google Drive Link
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* FILE UPLOAD MODE                                                    */}
      {/* ------------------------------------------------------------------ */}
      {mode === 'file' && (
        <div className="space-y-2">
          {/* Drop zone */}
          <label
            htmlFor={`${idPrefix}-file-input`}
            className={`cursor-pointer flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl transition-all text-center ${
              isFileAccepted
                ? 'border-emerald-400 bg-emerald-50/60'
                : fileExceedsLimit
                ? 'border-amber-400 bg-amber-50/60'
                : validationError
                ? 'border-rose-400 bg-rose-50/60'
                : 'border-slate-300 hover:border-[#004990] bg-slate-50 hover:bg-slate-100/80'
            }`}
          >
            {validating ? (
              <div className="flex items-center gap-2 text-[#004990] font-semibold text-xs">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Validating file…</span>
              </div>
            ) : isFileAccepted ? (
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>File accepted — ready to submit</span>
              </div>
            ) : fileExceedsLimit && fileMeta ? (
              <div className="flex flex-col items-center gap-1 text-amber-700 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span className="font-bold">File exceeds {maxMb} MB limit</span>
                <span className="text-slate-500 text-[10px]">Click to select a different file</span>
              </div>
            ) : (
              <>
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="font-semibold text-slate-700 text-xs">Click to upload PDF or Image</span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  PDF, JPEG, PNG, WebP, GIF — max {maxMb} MB
                </span>
              </>
            )}
            <input
              id={`${idPrefix}-file-input`}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,application/pdf,image/*"
              disabled={validating || compressing}
              className="hidden"
            />
          </label>

          {/* File metadata card */}
          {fileMeta && (
            <div className={`p-3 rounded-xl border text-[11px] space-y-1.5 ${
              isFileAccepted
                ? 'bg-emerald-50 border-emerald-200'
                : fileExceedsLimit
                ? 'bg-amber-50 border-amber-200'
                : 'bg-rose-50 border-rose-200'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 truncate">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[200px]">{fileMeta.name}</span>
                </div>
                <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  isFileAccepted
                    ? 'bg-emerald-200 text-emerald-800'
                    : fileExceedsLimit
                    ? 'bg-amber-200 text-amber-800'
                    : 'bg-rose-200 text-rose-800'
                }`}>
                  {isFileAccepted ? '✓ Accepted' : fileExceedsLimit ? 'Too large' : 'Invalid'}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-slate-600">
                <span>Size: <strong>{formatBytes(fileMeta.size)}</strong></span>
                <span>Type: <strong>{fileMeta.label ?? 'Unknown'}</strong></span>
                <span>Limit: <strong>{maxMb} MB</strong></span>
                {compressionDone && compressedSize !== null && (
                  <>
                    <span>Compressed: <strong>{formatBytes(compressedSize)}</strong></span>
                    <span>Saved: <strong>{savedPercent}%</strong></span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Validation error message */}
          {validationError && (
            <div className="flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700">
              <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Reduce Size / Compress button */}
          {fileExceedsLimit && fileValid && !compressionDone && !compressing && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                id={`${idPrefix}-compress-btn`}
                onClick={handleCompress}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-[11px] transition-all shadow-sm"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                Reduce Size {isFilePdf ? '(Compress PDF)' : '(Compress Image)'}
              </button>
              <span className="text-[10px] text-slate-500">
                Click to compress and optimize to under {maxMb} MB right here in your browser.
              </span>
            </div>
          )}

          {compressing && (
            <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-semibold">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600 shrink-0" />
              <span>{compressStatus || 'Compressing document — please wait…'}</span>
            </div>
          )}

          {compressionDone && compressedSize !== null && !compressionFailed && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-700 font-semibold">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              Compressed to {formatBytes(compressedSize)} ({savedPercent}% saved) — ready to submit!
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* GOOGLE DRIVE MODE                                                   */}
      {/* ------------------------------------------------------------------ */}
      {mode === 'drive' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              id={`${idPrefix}-drive-input`}
              value={driveLink}
              onChange={(e) => {
                setDriveLink(e.target.value);
                setDriveReady(false);
                setDriveMeta(null);
                setDriveError('');
                onClear();
              }}
              placeholder="https://drive.google.com/file/d/…"
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all text-xs"
            />
            <button
              type="button"
              id={`${idPrefix}-drive-check-btn`}
              onClick={handleDriveCheck}
              disabled={driveChecking || !driveLink.trim()}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 disabled:opacity-50 shrink-0 transition-all"
            >
              {driveChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
              Verify
            </button>
          </div>

          {/* Drive error */}
          {driveError && (
            <div className="flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700">
              <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{driveError}</span>
            </div>
          )}

          {/* Drive success card */}
          {driveReady && driveMeta && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Drive file verified — publicly accessible</span>
                </div>
                <a
                  href={driveMeta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#004990] hover:underline flex items-center gap-1 text-[10px] font-semibold"
                >
                  Preview <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-slate-600">
                {driveMeta.filename && <span>File: <strong>{driveMeta.filename}</strong></span>}
                {driveMeta.sizeBytes > 0 && <span>Size: <strong>{formatBytes(driveMeta.sizeBytes)}</strong></span>}
                <span>Type: <strong>{driveMeta.mime || 'Unknown'}</strong></span>
              </div>
              <p className="text-slate-500 text-[10px] leading-relaxed">
                This document URL will be stored. The file remains on your Google Drive.
              </p>
            </div>
          )}

          {/* Helper tip */}
          {!driveReady && !driveError && (
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Upload your document to Google Drive → right-click → <strong>Share</strong> → set to{' '}
              <strong>"Anyone with the link can view"</strong> → copy the link and paste it above, then click Verify.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
