import React, { useState, useEffect, useRef, memo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Share2,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import {
  useDetails,
  getImageUrl,
  TMDB_API_KEY,
  TMDB_BASE_URL,
} from '../lib/api';
import { useImdbId } from '../hooks/useImdbId';
import { useSeasonDetails } from '../hooks/useEpisodes';
import { PROVIDERS, buildEmbedUrl } from '../lib/embedProviders';
import { useWatchlist } from '../stores/watchlist';
import { useUIStore } from '../stores/useUIStore';
import { recordWatched } from '../lib/recommend';
import { Mascot } from '../components/Mascot';
import { ServerDropdown } from '../components/ServerDropdown';

const WIDTH_LADDER =
  'w-full max-w-full sm:max-w-[624px] md:max-w-[844px] lg:max-w-[1044px] xl:max-w-[1184px] mx-auto';

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

/* ────────────────────────────────────────────────
   Related fetch for TV:
   TV has no collection concept in TMDB, so we
   merge /recommendations + /similar.
   ──────────────────────────────────────────────── */
async function fetchRelatedTV(id: string): Promise<any[]> {
  const u = (path: string, extra = '') =>
    `${TMDB_BASE_URL}${path}?api_key=${TMDB_API_KEY}&language=en-US${extra}`;

  try {
    const [recRes, simRes] = await Promise.allSettled([
      fetch(u(`/tv/${id}/recommendations`, '&page=1')),
      fetch(u(`/tv/${id}/similar`, '&page=1')),
    ]);

    const a: any[] =
      recRes.status === 'fulfilled' && recRes.value.ok
        ? (await recRes.value.json()).results ?? []
        : [];
    const b: any[] =
      simRes.status === 'fulfilled' && simRes.value.ok
        ? (await simRes.value.json()).results ?? []
        : [];

    const seen = new Set<number>();
    const merged: any[] = [];
    for (const item of [...a, ...b]) {
      if (!item?.id || seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push(item);
    }
    return merged;
  } catch {
    return [];
  }
}

/* ────────────────────────────────────────────────
   Inline RelatedRow for TV shows
   ──────────────────────────────────────────────── */
const RelatedRow: React.FC<{
  title: string;
  subtitle?: string;
  items: any[];
}> = ({ title, subtitle, items }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative">
      <div className="flex items-end justify-between mb-5 px-1">
        <div>
          {subtitle && (
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[rgba(245,245,247,0.35)] mb-1">
              {subtitle}
            </p>
          )}
          <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#f5f5f7] tracking-[-0.02em]">
            {title}
          </h2>
        </div>
      </div>

      <div className="relative group/row">
        <div
          className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
          style={{ background: 'linear-gradient(90deg, #08080a 0%, transparent 100%)' }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
          style={{ background: 'linear-gradient(270deg, #08080a 0%, transparent 100%)' }}
        />

        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/70 backdrop-blur border border-white/[0.12] text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 hover:bg-black/90 transition-all duration-200 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 rotate-180" strokeWidth={2} />
        </button>
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/70 backdrop-blur border border-white/[0.12] text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 hover:bg-black/90 transition-all duration-200 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" strokeWidth={2} />
        </button>

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-1"
        >
          {items.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              className="w-[160px] sm:w-[180px] shrink-0"
            >
              <button
                type="button"
                onClick={() => {
                  window.location.href = `/tv/${item.id}`;
                }}
                className="group/card block w-full text-left cursor-pointer"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-[#111113] border border-white/[0.08] transition-[border-color,filter] duration-200 group-hover/card:brightness-125 group-hover/card:border-[rgba(124,92,255,0.45)]">
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                      alt={item.name || item.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center p-3 text-center bg-[#17171a]">
                      <span className="text-[11px] text-white/50 line-clamp-3">
                        {item.name || item.title}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent pointer-events-none" />
                  {item.vote_average > 0 && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[11px] font-medium tabular-nums text-white px-2 py-0.5 rounded-md bg-black/85 border border-white/[0.08]">
                      <span className="text-[#ffb347]">★</span>
                      <span>{item.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div className="mt-2.5 px-0.5">
                  <h3 className="text-[13px] font-medium text-[#f5f5f7] truncate leading-tight">
                    {item.name || item.title || 'Untitled'}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[rgba(245,245,247,0.5)]">
                    <span className="tabular-nums">
                      {(item.first_air_date || '').slice(0, 4) || '—'}
                    </span>
                    <span className="text-white/20">·</span>
                    <span className="uppercase tracking-wider text-[10px]">Series</span>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const WatchTV: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const seasonParam = parseInt(searchParams.get('s') || '1', 10);
  const episodeParam = parseInt(searchParams.get('e') || '1', 10);

  const currentSeason = isNaN(seasonParam) || seasonParam < 1 ? 1 : seasonParam;
  const currentEpisode = isNaN(episodeParam) || episodeParam < 1 ? 1 : episodeParam;

  const { data: show, isLoading: showLoading } = useDetails('tv', id || null);
  const { imdbId, loading: imdbLoading } = useImdbId(id || null, 'tv', show?.imdb_id);
  const { data: seasonData, isLoading: seasonLoading } = useSeasonDetails(id, currentSeason);

  const { data: relatedShows = [] } = useQuery({
    queryKey: ['related-tv', id],
    queryFn: () => fetchRelatedTV(id!),
    enabled: !!id && !!show,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const { has: isInWatchlist, toggle: toggleWatchlist } = useWatchlist();
  const { saveProgress } = useUIStore();

  const recordHistory = useWatchlist((s) => s.recordHistory);

  const [copied, setCopied] = useState(false);
  const [markedWatched, setMarkedWatched] = useState(false);

  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const episodesRef = useRef<HTMLDivElement>(null);
  const scrollRafRef = useRef<number | null>(null);

  const [selectedProviderId, setSelectedProviderId] = useState<string>(() => {
    if (typeof window !== 'undefined' && id) {
      try {
        const saved = localStorage.getItem(`chalachitra:provider:tv:${id}`);
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
        localStorage.setItem(`chalachitra:provider:tv:${id}`, providerId);
        localStorage.setItem('chalachitra:default_provider', providerId);
      } catch {}
    }
  };

  const handleSeasonChange = (newSeason: number) => {
    setSearchParams({ s: String(newSeason), e: '1' });
  };

  useEffect(() => {
    if (!show || !id) return;

    recordHistory({
      id: show.id,
      type: 'tv',
      title: show.title,
      posterPath: show.poster_path,
      backdropPath: show.backdrop_path,
      year: show.first_air_date ? show.first_air_date.substring(0, 4) : '',
      rating: show.vote_average ?? 0,
      overview: show.overview,
      season: currentSeason,
      episode: currentEpisode,
      progress: 0.05,
    });
  }, [show, id, currentSeason, currentEpisode, recordHistory]);

  const scrollToTop = () => {
    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    }

    const startY = window.scrollY;
    if (startY < 2) return;

    const duration = 700;
    let startTime: number | null = null;

    const easeInOutQuint = (t: number) =>
      t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

    const step = (now: number) => {
      if (startTime === null) startTime = now;
      const progress = Math.min((now - startTime) / duration, 1);
      window.scrollTo({
        top: startY * (1 - easeInOutQuint(progress)),
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

  const scrollToEpisodes = () => {
    const el = episodesRef.current;
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

  const handleEpisodeSelect = (newEpisode: number) => {
    setSearchParams({ s: String(currentSeason), e: String(newEpisode) });
    scrollToTop();
  };

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
    if (!show) return;
    const releaseYear = show.first_air_date ? show.first_air_date.substring(0, 4) : '2026';
    toggleWatchlist({
      id: show.id,
      type: 'tv',
      title: show.title,
      posterPath: show.poster_path,
      backdropPath: show.backdrop_path,
      year: releaseYear,
      rating: show.vote_average,
      overview: show.overview,
    });
  };

  const handleMarkWatched = () => {
    if (!show) return;
    saveProgress({
      id: show.id,
      type: 'tv',
      title: show.title,
      posterPath: show.poster_path,
      backdropPath: show.backdrop_path,
      progress: 100,
      season: currentSeason,
      episode: currentEpisode,
    });
    recordWatched(show.id);
    recordHistory({
      id: show.id,
      type: 'tv',
      title: show.title,
      posterPath: show.poster_path,
      backdropPath: show.backdrop_path,
      year: show.first_air_date ? show.first_air_date.substring(0, 4) : '',
      rating: show.vote_average ?? 0,
      overview: show.overview,
      season: currentSeason,
      episode: currentEpisode,
      progress: 1,
    });
    setMarkedWatched(true);
    toast.success(`Marked S${currentSeason}:E${currentEpisode} as watched`);
  };

  const releaseYear = show?.first_air_date ? show.first_air_date.substring(0, 4) : null;
  const genresFormatted = show?.genres?.slice(0, 3).map((g) => g.name).join(', ');

  const metaParts: string[] = [];
  if (releaseYear) metaParts.push(releaseYear);
  if (show?.number_of_seasons) {
    metaParts.push(
      `${show.number_of_seasons} ${show.number_of_seasons === 1 ? 'Season' : 'Seasons'}`
    );
  }
  if (show?.vote_average) metaParts.push(`★ ${show.vote_average.toFixed(1)}`);
  if (genresFormatted) metaParts.push(genresFormatted);

  const embedUrl = imdbId
    ? buildEmbedUrl(selectedProvider, 'tv', imdbId, currentSeason, currentEpisode)
    : '';

  const inWatchlist = show ? isInWatchlist(show.id, 'tv') : false;

  const availableSeasons = (show?.seasons || []).filter((s) => s.season_number > 0);
  const episodesList = seasonData?.episodes || [];

  const relatedItems = (relatedShows || [])
    .filter((r: any) => r && r.id !== show?.id)
    .slice(0, 20);

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
        {/* 1. Back */}
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
              <PlayerFrame
                url={embedUrl}
                title={`${show?.title || 'TV Show'} S${currentSeason} E${currentEpisode}`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[rgba(245,245,247,0.38)] text-sm gap-3">
                {imdbLoading || showLoading ? (
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
                onClick={() => {
                  const el = playerWrapperRef.current;
                  if (!el) return;
                  if (!document.fullscreenElement) {
                    (el.requestFullscreen?.() ?? Promise.resolve()).then(() => {
                      const o = (screen as any).orientation;
                      if (o?.lock) o.lock('landscape').catch(() => {});
                    }).catch(() => {});
                  } else {
                    const o = (screen as any).orientation;
                    if (o?.unlock) o.unlock();
                    document.exitFullscreen?.();
                  }
                }}
                aria-label="Rotate / Fullscreen"
                title="Rotate / Fullscreen"
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
                "
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
              </button>
            )}
          </div>

          <p className="mt-2 text-[11px] text-[rgba(245,245,247,0.38)] text-center sm:hidden">
            Tap rotate icon to go fullscreen
          </p>
        </div>

        {/* 3. Server dropdown + S/E badge */}
        <div
          className={`${WIDTH_LADDER} mt-5 flex flex-wrap items-center justify-between gap-3 animate-[fadeSlideDown_500ms_ease-out_120ms_both]`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)] shrink-0">
              Source:
            </span>
            <ServerDropdown
              value={selectedProviderId}
              onChange={handleProviderSelect}
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-[rgba(245,245,247,0.5)]">
              S{String(currentSeason).padStart(2, '0')} · E{String(currentEpisode).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={scrollToEpisodes}
              className="group inline-flex items-center gap-1.5 text-xs text-[rgba(245,245,247,0.55)] hover:text-white transition-colors cursor-pointer"
            >
              <span>Episodes</span>
              <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* 4. Episodes */}
        <div
          ref={episodesRef}
          className="mt-10 pt-8 border-t border-white/[0.08] scroll-mt-4 animate-[fadeSlideUp_500ms_ease-out_180ms_both]"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#f5f5f7]">
                Episodes
              </h2>
              <p className="text-xs text-[rgba(245,245,247,0.45)] mt-0.5">
                {episodesList.length > 0
                  ? `${episodesList.length} episodes in Season ${currentSeason}`
                  : `Season ${currentSeason}`}
              </p>
            </div>

            {availableSeasons.length > 0 && (
              <div className="relative inline-block">
                <select
                  value={currentSeason}
                  onChange={(e) => handleSeasonChange(Number(e.target.value))}
                  aria-label="Select Season"
                  className="appearance-none bg-[#111113] border border-white/[0.12] rounded-lg px-4 py-2 pr-9 text-sm text-white font-medium cursor-pointer hover:border-white/25 focus:outline-none focus:border-white/40 transition-colors"
                >
                  {availableSeasons.map((s) => (
                    <option key={s.id} value={s.season_number} className="bg-[#111113] text-white">
                      Season {s.season_number}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-white/50">
                  <ChevronDown className="w-4 h-4 stroke-[1.5]" />
                </div>
              </div>
            )}
          </div>

          {seasonLoading ? (
            <div className="py-12 text-center text-sm text-[rgba(245,245,247,0.38)]">
              Loading season episodes...
            </div>
          ) : episodesList.length === 0 ? (
            <div className="py-12 text-center text-sm text-[rgba(245,245,247,0.38)]">
              No episode details available for Season {currentSeason}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {episodesList.map((ep) => {
                const isCurrent = ep.episode_number === currentEpisode;
                return (
                  <div
                    key={ep.id}
                    onClick={() => handleEpisodeSelect(ep.episode_number)}
                    className={`group relative rounded-xl p-3 border transition-colors duration-200 cursor-pointer flex gap-3.5 ${
                      isCurrent
                        ? 'bg-[#17171a] border-white/[0.1] border-l-4 border-l-[#7c5cff]'
                        : 'bg-[#111113] border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.14]'
                    }`}
                  >
                    <div className="relative w-32 aspect-video shrink-0 rounded-lg overflow-hidden bg-black/60 border border-white/[0.06]">
                      {ep.still_path ? (
                        <img
                          src={getImageUrl(ep.still_path, 'w500')}
                          alt={ep.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-white/30">
                          EP {ep.episode_number}
                        </div>
                      )}

                      <div
                        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                          isCurrent
                            ? 'bg-black/40 opacity-100'
                            : 'bg-black/40 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white text-black">
                          <Play className="w-3.5 h-3.5 fill-current stroke-[1.5] ml-0.5" />
                        </div>
                      </div>

                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/80 text-white/90">
                        E{ep.episode_number}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <span
                          className={`text-xs font-semibold truncate block mb-1 ${
                            isCurrent ? 'text-white' : 'text-[#f5f5f7]'
                          }`}
                        >
                          {ep.episode_number}. {ep.name || `Episode ${ep.episode_number}`}
                        </span>
                        <p className="text-[11px] text-[rgba(245,245,247,0.62)] line-clamp-2 leading-relaxed">
                          {ep.overview || 'No description available.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-[rgba(245,245,247,0.4)] font-mono mt-1">
                        {ep.runtime && <span>{ep.runtime}m</span>}
                        {ep.air_date && <span>· {ep.air_date}</span>}
                        {ep.vote_average > 0 && <span>· ★ {ep.vote_average.toFixed(1)}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. Info */}
        {show && (
          <div className={`${WIDTH_LADDER} mt-12 pt-8 border-t border-white/[0.08] animate-[fadeSlideUp_500ms_ease-out_240ms_both]`}>
            <div className="max-w-[820px] space-y-4">
              <h1 className="text-[28px] sm:text-[34px] font-semibold tracking-[-0.02em] text-[#f5f5f7] leading-tight">
                {show.title}
              </h1>

              {metaParts.length > 0 && (
                <p className="text-sm text-[rgba(245,245,247,0.62)] flex flex-wrap items-center gap-1">
                  {metaParts.join(' · ')}
                </p>
              )}

              {show.tagline && (
                <p className="italic text-sm text-[rgba(245,245,247,0.55)]">
                  "{show.tagline}"
                </p>
              )}

              {show.overview && (
                <p className="text-[15px] leading-relaxed text-[rgba(245,245,247,0.78)] pt-1">
                  {show.overview}
                </p>
              )}

              {show.credits?.cast && show.credits.cast.length > 0 && (
                <div className="pt-2 text-sm text-[rgba(245,245,247,0.62)]">
                  <span className="text-[rgba(245,245,247,0.38)] uppercase tracking-[0.06em] text-xs block mb-1">
                    Starring
                  </span>
                  <span className="text-[rgba(245,245,247,0.85)]">
                    {show.credits.cast.slice(0, 5).map((a) => a.name).join(', ')}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-white/[0.08]">
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

        {/* 6. Related Shows */}
        {show && relatedItems.length > 0 && (
          <div className="mt-14 animate-[fadeSlideUp_600ms_ease-out_300ms_both]">
            <RelatedRow
              title="Related Shows"
              subtitle="More like this"
              items={relatedItems}
            />
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

export default WatchTV;