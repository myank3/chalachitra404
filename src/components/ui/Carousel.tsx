import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Carousel: React.FC<CarouselProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -offset : offset,
      behavior: 'smooth',
    });
  };

  return (
    <section className={`relative my-8 ${className}`}>
      {/* Section Header */}
      {(title || subtitle || action) && (
        <div className="flex items-end justify-between mb-4 px-1">
          <div>
            {subtitle && (
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)] mb-0.5">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-xl sm:text-2xl font-semibold font-heading text-[#f5f5f7] tracking-[-0.02em]">
                {title}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-2">
            {action}
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={() => scroll('left')}
                aria-label="Scroll left"
                className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-colors active:scale-[0.98] cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                aria-label="Scroll right"
                className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-colors active:scale-[0.98] cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Carousel Container */}
      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {children}
        </div>
      </div>
    </section>
  );
};
