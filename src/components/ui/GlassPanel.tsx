import React from 'react';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'regular' | 'subtle' | 'card';
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  variant = 'regular',
  ...props
}) => {
  const variantClass = {
    regular: 'bg-[#111113] border border-white/[0.08]',
    subtle: 'bg-white/[0.03] border border-white/[0.06]',
    card: 'bg-[#111113] border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.4)]',
  }[variant];

  return (
    <div
      className={`rounded-xl transition-colors duration-150 ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
