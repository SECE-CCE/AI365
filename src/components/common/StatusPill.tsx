import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

interface StatusPillProps {
  status: 'Pending' | 'Approved' | 'Rejected' | string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  const normStatus = (status || 'Pending').toLowerCase();

  if (normStatus === 'approved') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
      </span>
    );
  }

  if (normStatus === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle className="w-3.5 h-3.5" /> Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
      <Clock className="w-3.5 h-3.5 animate-spin-slow" /> Pending Review
    </span>
  );
};
