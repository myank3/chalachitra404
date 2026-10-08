import React, { useState } from 'react';
import { Bookmark, Check, Plus, Heart } from 'lucide-react';
import { useWatchlist, MediaType } from '../stores/watchlist';

interface WatchlistButtonProps {
  item: {
    id: number | string;
    type: MediaType;
    title: string;
    posterPath: string | null;
    backdropPath?: string | null;
    year: string;
    rating: number;
    overview?: string;
  };
  variant?: 'icon' | 'badge' | 'button' | 'heart';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const WatchlistButton: React.FC<WatchlistButtonProps> = ({
  item,
  variant = 'icon',
  size = 'md',
  className = '',
}) => {
  const isSaved = useWatchlist((state) => state.has(item.id, item.type));
  const toggle = useWatchlist((state) => state.toggle);
  const [animating, setAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);
    toggle(item);
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-9 h-9 text-xs',
  }[size];

  const buttonSizeClasses = {
    sm: 'px-2.5 py-1 text-[11px] h-7 gap-1 rounded-lg font-medium',
    md: 'px-2.5 py-1.5 text-xs h-7.5 gap-1.5 rounded-lg font-medium',
    lg: 'px-3.5 py-1.5 text-xs h-8 gap-1.5 rounded-xl font-medium',
  }[size];

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={
          isSaved ? `Remove ${item.title} from My List` : `Add ${item.title} to My List`
        }
        className={`inline-flex items-center justify-center transition-all active:scale-[0.97] border cursor-pointer select-none ${
          isSaved
            ? 'bg-white text-[#0a0a0b] border-white hover:bg-[#e8e8ea]'
            : 'bg-white/[0.06] text-[#f5f5f7] border-white/[0.08] hover:bg-white/[0.1]'
        } ${buttonSizeClasses} ${className}`}
      >
        <span className={animating ? 'animate-[pulseHeart_400ms_ease-in-out]' : ''}>
          {isSaved ? (
            <Check className="w-3 h-3 stroke-[2] text-[#5eead4]" />
          ) : (
            <Plus className="w-3 h-3 stroke-[1.5]" />
          )}
        </span>
        <span>{isSaved ? 'In My List' : 'Add to List'}</span>
      </button>
    );
  }

  if (variant === 'heart') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={
          isSaved ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`
        }
        className={`rounded-full flex items-center justify-center transition-all active:scale-[0.97] cursor-pointer ${
          isSaved
            ? 'bg-white text-black border border-white'
            : 'bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.1] hover:bg-white/[0.14]'
        } ${sizeClasses} ${className}`}
      >
        <Heart
          className={`w-3.5 h-3.5 stroke-[1.5] ${
            isSaved ? 'fill-current text-[#ff6b9d]' : ''
          } ${animating ? 'animate-[pulseHeart_400ms_ease-in-out]' : ''}`}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={
        isSaved ? `Remove ${item.title} from My List` : `Add ${item.title} to My List`
      }
      className={`rounded-full flex items-center justify-center transition-all active:scale-[0.97] cursor-pointer ${
        isSaved
          ? 'bg-white text-black border border-white font-medium'
          : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
      } ${sizeClasses} ${className}`}
    >
      <span className={animating ? 'animate-[pulseHeart_400ms_ease-in-out]' : ''}>
        {isSaved ? (
          <Check className="w-3.5 h-3.5 stroke-[2] text-[#5eead4]" />
        ) : (
          <Bookmark className="w-3.5 h-3.5 stroke-[1.5]" />
        )}
      </span>
    </button>
  );
};
