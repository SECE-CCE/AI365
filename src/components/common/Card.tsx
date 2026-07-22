import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, icon, action, className = '', children }) => {
  return (
    <div className={`bg-white rounded-[20px] border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 lg:p-6 ${className}`}>
      {(title || icon || action) && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            {icon && <div className="p-2.5 rounded-xl bg-blue-50 text-[#004990]">{icon}</div>}
            <div>
              {title && <h3 className="font-bold text-slate-800 text-base tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
