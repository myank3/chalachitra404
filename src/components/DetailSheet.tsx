import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, Star, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from '../stores/useUIStore';
import { useDetails, useSimilar, getImageUrl } from '../lib/api';
import { WatchlistButton } from './WatchlistButton';

export const DetailSheet: React.FC = () => {
  const navigate = useNavigate();
  const { detailModal, closeDetail, continueWatching } = useUIStore();
  const { isOpen, id, type } = detailModal;
  const [showTrailer, setShowTrailer] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const { data: item } = useDetails(type, id);
  const { data: similarItems = [] } = useSimilar(type, id || '');

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDetail();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedElement.current?.focus?.();
    };
  }, [isOpen, closeDetail]);

  if (!isOpen || !id) return null;

  const releaseYear = item?.release_date
    ? item.release_date.substring(0, 4)
    : item?.first_air_date
    ? item.first_air_date.substring(0, 4)
    : '2026';

  const trailer = item?.videos?.results?.find(
    (v) => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube'
  );

  const handleDragEnd = (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y > 140 || info.velocity.y > 500) {
      closeDetail();
    }
  };

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item?.title || 'Title Details'}
        onClick={closeDetail}
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-black/85"
      >
        <motion.div
          ref={sheetRef}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.5 }}
          onDragEnd={handleDragEnd}
          onClick={(e) => e.stopPropagation()}
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full md:max-w-4xl h-[92vh] md:h-auto md:max-h-[88vh] rounded-t-xl md:rounded-xl bg-[#111113] border-t md:border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col"
        >
          {/* Drag handle for mobile */}
          <div className="md:hidden flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={closeDetail}
            aria-label="Close details"
            className="absolute top-4 right-4 z-30 w-8 h-8 rounded-lg bg-[#17171a] hover:bg-white/[0.1] text-white/70 hover:text-white border border-white/[0.08] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>

          {/* Scrollable sheet body - No blur */}
          <div className="overflow-y-auto no-scrollbar flex-1 pb-10">
            {/* Backdrop Hero Area */}
            <div className="relative aspect-[16/9] md:aspect-[21/9] w-full bg-[#000000] overflow-hidden">
              <img
                src={getImageUrl(item?.backdrop_path || item?.poster_path, 'w1280')}
                alt={item?.title || ''}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/60 to-transparent" />

              {/* Action Buttons in Backdrop */}
              {item && (
                <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      closeDetail();
                      if (item.media_type === 'movie') {
                        navigate(`/watch/movie/${item.id}`);
                      } else {
                        const progress = continueWatching.find(
                          (c) => String(c.id) === String(item.id) && c.type === 'tv'
                        );
                        const s = progress?.season ?? 1;
                        const e = progress?.episode ?? 1;
                        navigate(`/watch/tv/${item.id}?s=${s}&e=${e}`);
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-[#e8e8ea] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current stroke-[1.5]" />
                    <span>Watch Now</span>
                  </button>

                  <WatchlistButton
                    item={{
                      id: item.id,
                      type: item.media_type,
                      title: item.title,
                      posterPath: item.poster_path,
                      backdropPath: item.backdrop_path,
                      year: releaseYear,
                      rating: item.vote_average,
                      overview: item.overview,
                    }}
                    variant="button"
                    size="sm"
                  />

                  {trailer && (
                    <button
                      type="button"
                      onClick={() => setShowTrailer(!showTrailer)}
                      className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] active:scale-[0.98] border border-white/[0.08] text-white text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span>{showTrailer ? 'Hide Trailer' : 'Watch Trailer'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Embedded Trailer preview */}
            {showTrailer && trailer && (
              <div className="mx-6 my-4 p-3 rounded-xl bg-[#17171a] border border-white/[0.08]">
                <div className="flex items-center justify-between mb-2 text-[11px] text-[rgba(245,245,247,0.62)] font-medium uppercase tracking-[0.08em]">
                  <span>Official Trailer</span>
                  <button
                    type="button"
                    onClick={() => setShowTrailer(false)}
                    className="text-white/40 hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-white/[0.06]">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&modestbranding=1`}
                    title={trailer.name}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Metadata and Description */}
            {item && (
              <div className="px-6 pt-5 space-y-5">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)] mb-1">
                    <span className="capitalize">{item.media_type === 'tv' ? 'Series' : 'Movie'}</span>
                    {item.tagline && (
                      <>
                        <span aria-hidden="true" className="text-white/20">·</span>
                        <span className="text-[rgba(245,245,247,0.62)] truncate">{item.tagline}</span>
                      </>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-semibold text-[#f5f5f7] font-heading tracking-[-0.02em]">
                    {item.title}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[rgba(245,245,247,0.62)]">
                    <span className="flex items-center gap-1 font-mono tabular-nums text-white/90">
                      <Star className="w-3 h-3 text-amber-400 stroke-[1.5]" />
                      <span>{item.vote_average ? item.vote_average.toFixed(1) : '8.0'}</span>
                    </span>
                    <span aria-hidden="true" className="text-white/20">·</span>
                    <span className="tabular-nums">{releaseYear}</span>
                    {item.runtime && (
                      <>
                        <span aria-hidden="true" className="text-white/20">·</span>
                        <span className="tabular-nums">{item.runtime}m</span>
                      </>
                    )}
                    {item.number_of_seasons && (
                      <>
                        <span aria-hidden="true" className="text-white/20">·</span>
                        <span className="tabular-nums">
                          {item.number_of_seasons} {item.number_of_seasons === 1 ? 'Season' : 'Seasons'}
                        </span>
                      </>
                    )}
                    {item.genres && item.genres.length > 0 && (
                      <>
                        <span aria-hidden="true" className="text-white/20">·</span>
                        <span>{item.genres.map((g) => g.name).slice(0, 3).join(', ')}</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)] mb-1">
                    Overview
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-[rgba(245,245,247,0.62)]">
                    {item.overview || 'No synopsis available for this title.'}
                  </p>
                </div>

                {/* Cast */}
                {item.credits?.cast && item.credits.cast.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)] mb-2.5">
                      Top Cast
                    </h3>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                      {item.credits.cast.slice(0, 10).map((actor) => (
                        <div key={actor.id} className="flex flex-col items-center w-16 shrink-0 text-center">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-800 border border-white/[0.08] mb-1">
                            {actor.profile_path ? (
                              <img
                                src={getImageUrl(actor.profile_path, 'w300')}
                                alt={actor.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
                                {actor.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-medium text-white/90 line-clamp-1">
                            {actor.name}
                          </span>
                          <span className="text-[9px] text-[rgba(245,245,247,0.38)] line-clamp-1">
                            {actor.character}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Similar */}
                {similarItems.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)] mb-2.5">
                      You May Also Like
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {similarItems.slice(0, 4).map((sim) => (
                        <div
                          key={`${sim.media_type}-${sim.id}`}
                          onClick={() => {
                            useUIStore.getState().openDetail(sim.id, sim.media_type);
                          }}
                          className="cursor-pointer rounded-lg bg-white/[0.03] p-1.5 border border-white/[0.08] hover:border-white/[0.14] transition-colors"
                        >
                          <div className="aspect-[2/3] w-full rounded overflow-hidden bg-neutral-800 mb-1.5">
                            <img
                              src={getImageUrl(sim.poster_path, 'w300')}
                              alt={sim.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <p className="text-[11px] font-medium text-[rgba(245,245,247,0.7)] truncate">
                            {sim.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
