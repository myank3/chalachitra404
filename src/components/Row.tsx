import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '../types';
import { MovieCard } from './MovieCard';

interface RowProps {
  title: string;
  subtitle?: string;
  items: MediaItem[];
  showRankBadges?: boolean;
  action?: React.ReactNode;
}

export const Row: React.FC<RowProps> = ({
  title,
  subtitle,
  items,
  showRankBadges = false,
  action,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -offset : offset,
      behavior: 'smooth',
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative my-8 group">
      <div className="flex items-end justify-between mb-3 px-1">
        <div>
          {subtitle && (
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)] mb-0.5">
              {subtitle}
            </p>
          )}
          <h2 className="text-xl sm:text-2xl font-semibold font-heading text-[#f5f5f7] tracking-[-0.02em]">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {action}
          {/* Arrow buttons fade in on row hover */}
          <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              aria-label={`Scroll ${title} left`}
              className="w-7 h-7 rounded-lg bg-[#111113] hover:bg-[#17171a] active:scale-[0.97] border border-white/[0.08] hover:border-white/[0.14] flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              aria-label={`Scroll ${title} right`}
              className="w-7 h-7 rounded-lg bg-[#111113] hover:bg-[#17171a] active:scale-[0.97] border border-white/[0.08] hover:border-white/[0.14] flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Left edge fade gradient (subtle, 24px wide) */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#0a0a0b] to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1"
        >
          {items.map((item, index) => {
            const rank = showRankBadges ? index + 1 : undefined;
            return (
              <div
                key={`${item.media_type}-${item.id}`}
                className="relative w-40 sm:w-48 shrink-0 snap-start"
              >
                {rank && (
                  <div className="absolute -left-3 bottom-6 select-none pointer-events-none z-0">
                    <span
                      className="text-7xl sm:text-8xl font-semibold font-heading leading-none text-transparent tracking-tighter"
                      style={{
                        WebkitTextStroke: '1px rgba(255, 255, 255, 0.16)',
                      }}
                    >
                      {rank}
                    </span>
                  </div>
                )}

                <div className={`relative ${rank ? 'ml-5' : ''}`}>
                  <MovieCard item={item} rank={rank} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right edge fade gradient (subtle, 24px wide) */}
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0a0a0b] to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
    </section>
  );
};

export default Row;
