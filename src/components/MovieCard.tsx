import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Star } from 'lucide-react';
import { MediaItem } from '../types';
import { getImageUrl } from '../lib/api';

interface MovieCardProps {
  item: MediaItem;
  rank?: number;
  priority?: boolean;
}

const WATCHLIST_KEY = 'chalachitra:watchlist';

export const MovieCard: React.FC<MovieCardProps> = React.memo(
  ({ item, rank }) => {
    const navigate = useNavigate();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [inList, setInList] = useState<boolean>(() => {
      try {
        const raw = localStorage.getItem(WATCHLIST_KEY);
        if (!raw) return false;
        const arr = JSON.parse(raw);
        return (
          Array.isArray(arr) &&
          arr.some(
            (w: any) => w.id === item.id && w.type === item.media_type
          )
        );
      } catch {
        return false;
      }
    });

    const releaseYear = item.release_date
      ? item.release_date.substring(0, 4)
      : item.first_air_date
      ? item.first_air_date.substring(0, 4)
      : '2026';

    const posterSrc = getImageUrl(item.poster_path, 'w500');
    const title = item.title || (item as any).name || 'Untitled';

    const handleCardClick = () => {
      navigate(`/${item.media_type}/${item.id}`);
    };

    const handlePlay = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (item.media_type === 'movie') {
        navigate(`/watch/movie/${item.id}`);
      } else {
        navigate(`/watch/tv/${item.id}?s=1&e=1`);
      }
    };

    const handleToggleList = (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        const raw = localStorage.getItem(WATCHLIST_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        const list = Array.isArray(arr) ? arr : [];
        const exists = list.some(
          (w: any) => w.id === item.id && w.type === item.media_type
        );
        const next = exists
          ? list.filter(
              (w: any) => !(w.id === item.id && w.type === item.media_type)
            )
          : [
              ...list,
              {
                id: item.id,
                type: item.media_type,
                title,
                posterPath: item.poster_path,
                backdropPath: item.backdrop_path,
                year: releaseYear,
                rating: item.vote_average,
                overview: item.overview,
              },
            ];
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
        setInList(!exists);
      } catch {
        setInList((v) => !v);
      }
    };

    return (
      <div
        onClick={handleCardClick}
        className="group relative cursor-pointer select-none"
      >
        {/* Poster */}
        <div
          className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-[#111113] border border-white/[0.08] group-hover:border-[rgba(124,92,255,0.4)] transition-all duration-300"
          style={{
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
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
                className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.06] ${
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

          {/* Gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-90 pointer-events-none" />

          {/* Rank badge — top 3 gradient */}
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

          {/* Rating — top right */}
          {item.vote_average > 0 && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[11px] font-medium tabular-nums text-white px-2 py-0.5 rounded-md bg-black/70 backdrop-blur border border-white/[0.08] z-10">
              <Star
                className="w-2.5 h-2.5 text-[#ffb347] fill-[#ffb347]"
                strokeWidth={0}
              />
              <span>{item.vote_average.toFixed(1)}</span>
            </div>
          )}

          {/* Hover overlay with actions */}
          <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2.5">
            {/* Play */}
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

            {/* Secondary actions */}
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
      </div>
    );
  }
);

MovieCard.displayName = 'MovieCard';