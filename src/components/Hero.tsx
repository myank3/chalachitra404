import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem } from '../types';
import { getImageUrl } from '../lib/api';
import { WatchlistButton } from './WatchlistButton';
import { useUIStore } from '../stores/useUIStore';
import { useReducedMotionSafe } from '../hooks/useReducedMotionSafe';

interface HeroProps {
  items: MediaItem[];
}

export const Hero: React.FC<HeroProps> = ({ items }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { openDetail } = useUIStore();
  const prefersReducedMotion = useReducedMotionSafe();
  const containerRef = useRef<HTMLDivElement>(null);

  const heroItems = items.slice(0, 5);
  const activeItem = heroItems[currentIndex] || heroItems[0];

  useEffect(() => {
    if (prefersReducedMotion || heroItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroItems.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [heroItems.length, prefersReducedMotion]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % heroItems.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + heroItems.length) % heroItems.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [heroItems.length]);

  if (!activeItem) return null;

  const releaseYear = activeItem.release_date
    ? activeItem.release_date.substring(0, 4)
    : activeItem.first_air_date
    ? activeItem.first_air_date.substring(0, 4)
    : '2026';

  const backdropUrl = getImageUrl(
    activeItem.backdrop_path || activeItem.poster_path,
    'original'
  );

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroItems.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + heroItems.length) % heroItems.length);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/10] sm:aspect-[21/9] min-h-[460px] max-h-[660px] rounded-xl overflow-hidden my-4 border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.4)] bg-[#0a0a0b]"
    >
      {/* Backdrop Image - Ken Burns slow zoom (20s loop, disabled on reduced motion) */}
      <div className="absolute inset-0 w-full h-full bg-[#000000] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeItem.id}
            src={backdropUrl}
            alt={activeItem.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover object-center ${
              !prefersReducedMotion ? 'animate-[kenburns_20s_ease-in-out_infinite]' : ''
            }`}
          />
        </AnimatePresence>

        {/* Ambient Dark Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0b]/85 via-[#0a0a0b]/25 to-transparent" />
      </div>

      {/* Hero Info - Staggered entrance */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10 md:p-12 max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Metadata */}
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.62)] mb-2">
              <span className="text-[#f5f5f7]">Featured</span>
              <span aria-hidden="true" className="text-white/20">·</span>
              <span className="flex items-center gap-1 text-[#f5f5f7] font-mono tabular-nums">
                <Star className="w-3 h-3 text-[#ffb347] fill-[#ffb347] stroke-[1.5]" />
                <span>{activeItem.vote_average ? activeItem.vote_average.toFixed(1) : '8.0'}</span>
              </span>
              <span aria-hidden="true" className="text-white/20">·</span>
              <span>{activeItem.media_type === 'tv' ? 'Series' : 'Movie'}</span>
              <span aria-hidden="true" className="text-white/20">·</span>
              <span className="tabular-nums">{releaseYear}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold text-[#f5f5f7] font-heading tracking-[-0.02em] leading-tight mb-3">
              {activeItem.title}
            </h1>

            {/* Subtitle / Overview */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-xs sm:text-sm text-[rgba(245,245,247,0.62)] line-clamp-2 sm:line-clamp-3 mb-6 max-w-2xl leading-relaxed"
            >
              {activeItem.overview}
            </motion.p>

            {/* Action Buttons: Violet Play primary */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex flex-wrap items-center gap-2.5"
            >
              <button
                type="button"
                onClick={() => {
                  if (activeItem.media_type === 'movie') {
                    navigate(`/watch/movie/${activeItem.id}`);
                  } else {
                    navigate(`/watch/tv/${activeItem.id}?s=1&e=1`);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-[#7c5cff] text-white font-semibold text-xs hover:bg-[#8f72ff] active:scale-[0.97] transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current stroke-[1.5]" />
                <span>Watch Now</span>
              </button>

              <WatchlistButton
                item={{
                  id: activeItem.id,
                  type: activeItem.media_type,
                  title: activeItem.title,
                  posterPath: activeItem.poster_path,
                  backdropPath: activeItem.backdrop_path,
                  year: releaseYear,
                  rating: activeItem.vote_average,
                  overview: activeItem.overview,
                }}
                variant="button"
                size="sm"
              />

              <button
                type="button"
                onClick={() => navigate(`/${activeItem.media_type}/${activeItem.id}`)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] active:scale-[0.97] border border-white/[0.08] text-[#f5f5f7] text-xs font-medium transition-all flex items-center gap-2 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>More Info</span>
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls: Clean, solid, no blur */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#0a0a0b]/90 border border-white/[0.08]">
          {heroItems.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                idx === currentIndex ? 'w-5 bg-[#7c5cff]' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous featured title"
            className="w-7 h-7 rounded-lg bg-[#0a0a0b]/90 hover:bg-[#17171a] border border-white/[0.08] text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next featured title"
            className="w-7 h-7 rounded-lg bg-[#0a0a0b]/90 hover:bg-[#17171a] border border-white/[0.08] text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
