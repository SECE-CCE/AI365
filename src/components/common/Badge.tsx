import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'blue' | 'amber' | 'emerald' | 'rose' | 'slate' | 'indigo';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'blue', className = '' }) => {
  const variantStyles = {
    blue: 'bg-blue-50 text-[#004990] border-blue-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${variantStyles[variant]} ${className}`}>
      {label}
    </span>
  );
};
