import React from 'react';

interface ProgressBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  colorClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  current,
  target,
  unit = '',
  colorClass = 'bg-[#004990]',
}) => {
  const percentage = Math.min(100, Math.round((current / (target || 1)) * 100));

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-900 font-bold">
          {current.toLocaleString()} / {target.toLocaleString()} {unit} ({percentage}%)
        </span>
      </div>
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
