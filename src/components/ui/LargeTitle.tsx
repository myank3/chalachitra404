import React from 'react';

interface LargeTitleProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const LargeTitle: React.FC<LargeTitleProps> = ({
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 pt-6 pb-4 ${className}`}>
      <div>
        {subtitle && (
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)] mb-1">
            {subtitle}
          </p>
        )}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#f5f5f7] font-heading tracking-[-0.02em]">
          {title}
        </h1>
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
};
