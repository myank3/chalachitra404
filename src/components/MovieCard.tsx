import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Star } from 'lucide-react';
import { MediaItem } from '../types';
import { getImageUrl } from '../lib/api';
import { useWatchlist } from '../stores/watchlist';
import { useHoverPreview } from '../stores/hoverPreview';

interface MovieCardProps {
  item: MediaItem;
  rank?: number;
  index?: number;
}

export const MovieCard: React.FC<MovieCardProps> = React.memo(
  ({ item, rank, index = 0 }) => {
    const navigate = useNavigate();
    const cardRef = useRef<HTMLDivElement>(null);
    const hoverTimerRef = useRef<number | null>(null);

    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const showPreview = useHoverPreview((s) => s.show);
    const hidePreview = useHoverPreview((s) => s.hide);

    const inList = useWatchlist((s) =>
      Boolean(s.items[`${item.media_type}-${item.id}`])
    );
    const toggleWatchlist = useWatchlist((s) => s.toggle);

    const onMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      if (window.matchMedia('(hover: none)').matches) return;
      const rect = e.currentTarget.getBoundingClientRect();
      if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = window.setTimeout(() => {
        showPreview(item, rect);
      }, 200);
    };

    const onMouseLeave = () => {
      if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = window.setTimeout(() => {
        hidePreview();
      }, 250);
    };

    const releaseYear = item.release_date
      ? item.release_date.substring(0, 4)
      : item.first_air_date
      ? item.first_air_date.substring(0, 4)
      : '2026';

    const posterSrc = getImageUrl(item.poster_path, 'w500');
    const title = item.title || (item as any).name || 'Untitled';

    const goToDetails = () => {
      if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
      hidePreview();
      navigate(`/${item.media_type}/${item.id}`);
    };

    const handleCardClick = () => goToDetails();

    const handlePlay = (e: React.MouseEvent) => {
      e.stopPropagation();
      goToDetails();
    };

    const handleToggleList = (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleWatchlist({
        id: item.id,
        type: item.media_type,
        title,
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        year: releaseYear,
        rating: item.vote_average,
        overview: item.overview,
      });
    };

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return (
      <div
        ref={cardRef}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={handleCardClick}
        className="group relative cursor-pointer select-none"
        style={{
          animation: prefersReduced
            ? 'none'
            : `mcFadeUp 500ms cubic-bezier(0.16,1,0.3,1) ${index * 40}ms backwards`,
        }}
      >
        {/* Poster */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-[#111113] border border-white/[0.08] group-hover:border-[rgba(124,92,255,0.4)] transition-all duration-300 group-hover:shadow-[0_20px_40px_-12px_rgba(124,92,255,0.4)]">
          {posterSrc && !imageError ? (
            <>
              <img
                src={posterSrc}
                alt={title}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-[#17171a] animate-pulse" />
              )}
            </>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center p-3 text-center bg-[#17171a]">
              <span className="text-[11px] font-medium text-[rgba(245,245,247,0.5)] line-clamp-3">
                {title}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-90 pointer-events-none" />

          {/* Rank badge */}
          {rank !== undefined && (
            <div
              className="absolute top-2.5 left-2.5 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[13px] text-white z-10"
              style={{
                background:
                  rank <= 3
                    ? 'linear-gradient(135deg, #7c5cff, #ff6b9d)'
                    : 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(8px)',
                border:
                  rank <= 3
                    ? '1px solid rgba(255,255,255,0.15)'
                    : '1px solid rgba(255,255,255,0.1)',
                boxShadow:
                  rank <= 3 ? '0 4px 16px rgba(124,92,255,0.5)' : 'none',
              }}
            >
              {rank}
            </div>
          )}

          {/* Rating chip */}
          {item.vote_average > 0 && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[11px] font-medium tabular-nums text-white px-2 py-0.5 rounded-md bg-black/70 backdrop-blur border border-white/[0.08] z-10">
              <Star
                className="w-2.5 h-2.5 text-[#ffb347] fill-[#ffb347]"
                strokeWidth={0}
              />
              <span>{item.vote_average.toFixed(1)}</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={handlePlay}
              aria-label={`Play ${title}`}
              className="w-11 h-11 rounded-full flex items-center justify-center text-black transition-all duration-200 active:scale-[0.95] cursor-pointer"
              style={{
                background: '#ffffff',
                boxShadow: '0 8px 24px rgba(255,255,255,0.2)',
              }}
            >
              <Play className="w-4 h-4 fill-current ml-0.5" strokeWidth={0} />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleList}
                aria-label={inList ? 'Remove from list' : 'Add to list'}
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 active:scale-[0.95] cursor-pointer ${
                  inList
                    ? 'bg-[rgba(124,92,255,0.25)] border-[rgba(124,92,255,0.6)] text-[#7c5cff]'
                    : 'bg-black/60 border-white/[0.25] text-white hover:bg-white hover:text-black'
                }`}
              >
                {inList ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                ) : (
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                )}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
                aria-label="More information"
                className="w-8 h-8 rounded-full bg-black/60 border border-white/[0.25] text-white hover:bg-white hover:text-black transition-all duration-200 active:scale-[0.95] flex items-center justify-center cursor-pointer"
              >
                <span className="text-[14px] font-bold leading-none">i</span>
              </button>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-2.5 px-0.5">
          <h3 className="text-[13px] font-medium text-[#f5f5f7] tracking-[-0.01em] truncate leading-tight group-hover:text-white transition-colors">
            {title}
          </h3>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[rgba(245,245,247,0.5)]">
            <span className="tabular-nums">{releaseYear}</span>
            <span aria-hidden="true" className="text-white/20">
              ·
            </span>
            <span className="uppercase tracking-wider text-[10px]">
              {item.media_type === 'tv' ? 'Series' : 'Film'}
            </span>
          </div>
        </div>

        <style>{`
          @keyframes mcFadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @media (prefers-reduced-motion: reduce) {
            [style*="mcFadeUp"] { animation: none !important; }
          }
        `}</style>
      </div>
    );
  }
);

MovieCard.displayName = 'MovieCard';