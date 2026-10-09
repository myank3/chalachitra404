import React, { useState, useEffect, useRef, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Check,
  CheckCircle2,
  RotateCw,
  Minimize2,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDetails } from '../lib/api';
import { useImdbId } from '../hooks/useImdbId';
import { PROVIDERS, buildEmbedUrl } from '../lib/embedProviders';
import { useWatchlist } from '../stores/watchlist';
import { useUIStore } from '../stores/useUIStore';
import { RecommendedRow } from '../components/RecommendedRow';
import { recordWatched } from '../lib/recommend';
import { Mascot } from '../components/Mascot';
import { ServerDropdown } from '../components/ServerDropdown';

/* Shared size ladder */
const WIDTH_LADDER =
  'w-full max-w-full sm:max-w-[624px] md:max-w-[844px] lg:max-w-[1044px] xl:max-w-[1184px] mx-auto';

/* Memoized iframe */
const PlayerFrame = memo(function PlayerFrame({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  return (
    <iframe
      src={url}
      title={title}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen; accelerometer; gyroscope"
      allowFullScreen
      referrerPolicy="origin"
      style={{ border: 0, width: '100%', height: '100%', contain: 'strict' }}
    />
  );
});

export const WatchMovie: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: movie, isLoading: movieLoading } = useDetails('movie', id || null);
  const { imdbId, loading: imdbLoading } = useImdbId(id || null, 'movie', movie?.imdb_id);

  const { has: isInWatchlist, toggle: toggleWatchlist } = useWatchlist();
  const { saveProgress } = useUIStore();

  /* History — write to the store */
  const recordHistory = useWatchlist((s) => s.recordHistory);

  const [copied, setCopied] = useState(false);
  const [markedWatched, setMarkedWatched] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const scrollRafRef = useRef<number | null>(null);

  const [selectedProviderId, setSelectedProviderId] = useState<string>(() => {
    if (typeof window !== 'undefined' && id) {
      try {
        const saved = localStorage.getItem(`chalachitra:provider:movie:${id}`);
        if (saved && PROVIDERS.some((p) => p.id === saved)) return saved;
        const globalSaved = localStorage.getItem('chalachitra:default_provider');
        if (globalSaved && PROVIDERS.some((p) => p.id === globalSaved)) return globalSaved;
      } catch {}
    }
    return PROVIDERS[0].id;
  });

  const selectedProvider =
    PROVIDERS.find((p) => p.id === selectedProviderId) || PROVIDERS[0];

  const handleProviderSelect = (providerId: string) => {
    setSelectedProviderId(providerId);
    if (typeof window !== 'undefined' && id) {
      try {
        localStorage.setItem(`chalachitra:provider:movie:${id}`, providerId);
        localStorage.setItem('chalachitra:default_provider', providerId);
      } catch {}
    }
  };

  /* ---------- Record history when movie loads ---------- */
  useEffect(() => {
    if (!movie || !id) return;

    recordHistory({
      id: movie.id,
      type: 'movie',
      title: movie.title,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      year: movie.release_date ? movie.release_date.substring(0, 4) : '',
      rating: movie.vote_average ?? 0,
      overview: movie.overview,
      progress: 0.05,
    });
  }, [movie, id, recordHistory]);

  /* ---------- 144Hz-smooth scroll ---------- */
  const scrollToDetails = () => {
    const el = detailsRef.current;
    if (!el) return;

    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    }

    const startY = window.scrollY;
    const targetY = startY + el.getBoundingClientRect().top - 8;
    const distance = targetY - startY;
    if (Math.abs(distance) < 2) return;

    const duration = 900;
    let startTime: number | null = null;

    const easeInOutQuint = (t: number) =>
      t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

    const step = (now: number) => {
      if (startTime === null) startTime = now;
      const progress = Math.min((now - startTime) / duration, 1);
      window.scrollTo({
        top: startY + distance * easeInOutQuint(progress),
        behavior: 'instant' as ScrollBehavior,
      });
      if (progress < 1) {
        scrollRafRef.current = requestAnimationFrame(step);
      } else {
        scrollRafRef.current = null;
      }
    };

    scrollRafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    return () => {
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, []);

  /* ---------- Rotate / Fullscreen ---------- */
  const enterFullscreen = async () => {
    const el = playerWrapperRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen();
        setIsFullscreen(true);
      }
      const orientation = (screen as any).orientation;
      if (orientation?.lock) {
        try {
          await orientation.lock('landscape');
        } catch {}
      }
    } catch {}
  };

  const exitFullscreen = async () => {
    try {
      const orientation = (screen as any).orientation;
      if (orientation?.unlock) {
        try {
          orientation.unlock();
        } catch {}
      }
      if (document.fullscreenElement) await document.exitFullscreen();
      setIsFullscreen(false);
    } catch {}
  };

  const handleRotateToggle = () => (isFullscreen ? exitFullscreen() : enterFullscreen());

  useEffect(() => {
    const onFsChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active) {
        const orientation = (screen as any).orientation;
        if (orientation?.unlock) {
          try {
            orientation.unlock();
          } catch {}
        }
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange as any);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange as any);
    };
  }, []);

  /* ---------- Share / Watchlist / Watched ---------- */
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.info(url);
    }
  };

  const handleToggleWatchlist = () => {
    if (!movie) return;
    const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : '2026';
    toggleWatchlist({
      id: movie.id,
      type: 'movie',
      title: movie.title,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      year: releaseYear,
      rating: movie.vote_average,
      overview: movie.overview,
    });
  };

  const handleMarkWatched = () => {
    if (!movie) return;
    saveProgress({
      id: movie.id,
      type: 'movie',
      title: movie.title,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      progress: 100,
    });
    recordWatched(movie.id);
    recordHistory({
      id: movie.id,
      type: 'movie',
      title: movie.title,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      year: movie.release_date ? movie.release_date.substring(0, 4) : '',
      rating: movie.vote_average ?? 0,
      overview: movie.overview,
      progress: 1,
    });
    setMarkedWatched(true);
    toast.success(`Marked "${movie.title}" as watched`);
  };

  /* ---------- Meta formatting ---------- */
  const formatRuntime = (minutes?: number) => {
    if (!minutes) return null;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const releaseYear = movie?.release_date ? movie.release_date.substring(0, 4) : null;
  const genresFormatted = movie?.genres?.slice(0, 3).map((g) => g.name).join(', ');

  const metaParts: string[] = [];
  if (releaseYear) metaParts.push(releaseYear);
  if (movie?.runtime) {
    const rt = formatRuntime(movie.runtime);
    if (rt) metaParts.push(rt);
  }
  if (movie?.vote_average) metaParts.push(`★ ${movie.vote_average.toFixed(1)}`);
  if (genresFormatted) metaParts.push(genresFormatted);

  const embedUrl = imdbId ? buildEmbedUrl(selectedProvider, 'movie', imdbId) : '';
  const inWatchlist = movie ? isInWatchlist(movie.id, 'movie') : false;

  return (
    <div className="min-h-screen text-[#f5f5f7] relative overflow-x-hidden bg-[#08080a]">
      {/* LIGHT AMBIENT */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0a14] via-[#08080a] to-[#050507]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 40% at 20% 8%, rgba(124,92,255,0.10) 0%, transparent 65%), ' +
              'radial-gradient(55% 40% at 85% 18%, rgba(255,107,157,0.07) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 30%, transparent 45%, rgba(0,0,0,0.55) 100%)',
          }}
        />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* 1. Back button */}
        <div className="mb-4 animate-[fadeSlideDown_400ms_ease-out_both]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 text-sm text-[rgba(245,245,247,0.62)] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[1.5] transition-transform group-hover:-translate-x-0.5" />
            <span>Back</span>
          </button>
        </div>

        {/* 2. Player */}
        <div className={`${WIDTH_LADDER} animate-[playerIn_600ms_cubic-bezier(0.16,1,0.3,1)_both]`}>
          <div
            ref={playerWrapperRef}
            className="
              group relative w-full aspect-video
              bg-black rounded-2xl overflow-hidden
              border border-white/[0.08]
              shadow-[0_8px_40px_-8px_rgba(0,0,0,0.9)]
            "
          >
            <div
              aria-hidden
              className="absolute top-0 left-0 right-0 h-px z-20 pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(124,92,255,0.7), rgba(255,107,157,0.6), rgba(124,92,255,0.7), transparent)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 6s linear infinite',
              }}
            />

            {embedUrl ? (
              <PlayerFrame url={embedUrl} title={movie?.title || 'Movie Player'} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[rgba(245,245,247,0.38)] text-sm gap-3">
                {imdbLoading || movieLoading ? (
                  <>
                    <Mascot state="loading" size={36} />
                    <span className="animate-[pulseSoft_1.6s_ease-in-out_infinite]">
                      Loading stream…
                    </span>
                  </>
                ) : (
                  <span>No video source found for this title.</span>
                )}
              </div>
            )}

            {embedUrl && (
              <button
                type="button"
                onClick={handleRotateToggle}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Rotate / Fullscreen'}
                title={isFullscreen ? 'Exit fullscreen' : 'Rotate / Fullscreen'}
                className="
                  absolute top-3 right-3 z-20
                  inline-flex items-center justify-center
                  w-10 h-10 sm:w-11 sm:h-11 rounded-xl
                  bg-black/55 hover:bg-black/80
                  backdrop-blur-md
                  border border-white/15 hover:border-white/35
                  text-white/85 hover:text-white
                  transition-all duration-300
                  hover:scale-105 active:scale-95
                  opacity-100 sm:opacity-0 sm:group-hover:opacity-100
                  focus:opacity-100
                  cursor-pointer
                  animate-[softPulse_2.4s_ease-in-out_infinite]
                  sm:animate-none
                "
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            )}
          </div>

          <p className="mt-2 text-[11px] text-[rgba(245,245,247,0.38)] text-center sm:hidden">
            Tap <RotateCw className="inline w-3 h-3 -mt-0.5" /> to rotate &amp; go fullscreen
          </p>
        </div>

        {/* 3. Server dropdown */}
        <div
          className={`${WIDTH_LADDER} mt-5 flex flex-wrap items-center gap-3 animate-[fadeSlideDown_500ms_ease-out_120ms_both]`}
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)] shrink-0">
            Source:
          </span>
          <ServerDropdown
            value={selectedProviderId}
            onChange={handleProviderSelect}
          />
        </div>

        {/* 3b. Scroll for details */}
        <div
          className={`${WIDTH_LADDER} mt-3 flex justify-end animate-[fadeSlideDown_500ms_ease-out_160ms_both]`}
        >
          <button
            type="button"
            onClick={scrollToDetails}
            className="group inline-flex items-center gap-1.5 text-xs text-[rgba(245,245,247,0.55)] hover:text-white transition-colors cursor-pointer"
          >
            <span>Scroll for details</span>
            <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>

        {/* 4. Info panel */}
        {movie && (
          <div ref={detailsRef} className={`${WIDTH_LADDER} mt-8 scroll-mt-4`}>
            <div className="max-w-[820px] space-y-4">
              <h1 className="text-[28px] sm:text-[34px] font-semibold tracking-[-0.02em] text-[#f5f5f7] leading-tight animate-[fadeSlideUp_500ms_ease-out_180ms_both]">
                {movie.title}
              </h1>

              {metaParts.length > 0 && (
                <p className="text-sm text-[rgba(245,245,247,0.62)] flex flex-wrap items-center gap-1 animate-[fadeSlideUp_500ms_ease-out_240ms_both]">
                  {metaParts.join(' · ')}
                </p>
              )}

              {movie.tagline && (
                <p className="italic text-sm text-[rgba(245,245,247,0.55)] animate-[fadeSlideUp_500ms_ease-out_300ms_both]">
                  "{movie.tagline}"
                </p>
              )}

              {movie.overview && (
                <p className="text-[15px] leading-relaxed text-[rgba(245,245,247,0.78)] pt-1 animate-[fadeSlideUp_500ms_ease-out_360ms_both]">
                  {movie.overview}
                </p>
              )}

              {movie.credits?.cast && movie.credits.cast.length > 0 && (
                <div className="pt-2 text-sm text-[rgba(245,245,247,0.62)] animate-[fadeSlideUp_500ms_ease-out_420ms_both]">
                  <span className="text-[rgba(245,245,247,0.38)] uppercase tracking-[0.06em] text-xs block mb-1">
                    Starring
                  </span>
                  <span className="text-[rgba(245,245,247,0.85)]">
                    {movie.credits.cast.slice(0, 5).map((a) => a.name).join(', ')}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-white/[0.08] animate-[fadeSlideUp_500ms_ease-out_480ms_both]">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-[rgba(245,245,247,0.75)] hover:text-white transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[1.5]" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5 stroke-[1.5]" />
                  )}
                  <span>{copied ? 'Copied' : 'Share'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleWatchlist}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                    inWatchlist
                      ? 'bg-white text-black border-white font-medium hover:bg-[#e8e8ea]'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-[rgba(245,245,247,0.75)] hover:text-white'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 stroke-[1.5] ${inWatchlist ? 'fill-current' : ''}`} />
                  <span>{inWatchlist ? 'In List' : 'Add to List'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleMarkWatched}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                    markedWatched
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-[rgba(245,245,247,0.75)] hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>{markedWatched ? 'Watched' : 'Mark Watched'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. Recommendations */}
        {movie && (
          <div className="animate-[fadeSlideUp_600ms_ease-out_540ms_both]">
            <RecommendedRow sourceItem={movie} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes playerIn {
          from { opacity: 0; transform: scale(0.985) translateY(10px); filter: blur(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        @keyframes shimmer {
          from { background-position: 0% 50%; }
          to   { background-position: 200% 50%; }
        }
        @keyframes softPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.0); }
          50%      { box-shadow: 0 0 0 6px rgba(255,255,255,0.06); }
        }
        @keyframes pulseSoft {
          0%, 100% { opacity: 0.55; }
          50%      { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="animate-["] { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

export default WatchMovie;