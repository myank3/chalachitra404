import React from 'react';
import { Mascot } from './Mascot';

interface EmptyStateProps {
  mascotState?: 'empty' | 'loading' | 'idle';
  mascotSize?: number;
  title?: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  mascotState = 'empty',
  mascotSize = 64,
  title,
  message,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`py-16 sm:py-24 px-4 flex flex-col items-center justify-center text-center max-w-md mx-auto ${className}`}
    >
      <div className="mb-4">
        <Mascot state={mascotState} size={mascotSize} />
      </div>

      {title && (
        <h3 className="text-lg font-semibold text-[#f5f5f7] mb-1 font-heading">
          {title}
        </h3>
      )}

      <p className="text-xs sm:text-sm text-[rgba(245,245,247,0.62)] leading-relaxed mb-6">
        {message}
      </p>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-[#7c5cff] hover:bg-[#8f72ff] active:scale-[0.97] text-white text-xs font-semibold transition-all duration-150 cursor-pointer shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
