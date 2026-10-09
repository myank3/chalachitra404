import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Play, Info, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import {
  useTrending,
  usePopularMovies,
  useTopRatedTV,
  getImageUrl,
  getDetails,
} from '../lib/api';
import { MOCK_GENRES } from '../data/mockData';
import { MovieCard } from '../components/MovieCard';

/* ────────────────────────────────────────────────
   History types
   ──────────────────────────────────────────────── */
interface HistoryItem {
  id: number | string;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  backdropPath?: string | null;
  year: string;
  rating: number;
  overview?: string;
  season?: number;
  episode?: number;
  progress?: number;
  watchedAt: number;
}

const STORAGE_KEY = 'chalachitra:watchlist';

function readHistoryFromStorage(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const map = parsed?.state?.history ?? {};
    const arr = Object.values(map) as HistoryItem[];
    return arr.sort((a, b) => (b.watchedAt ?? 0) - (a.watchedAt ?? 0));
  } catch (e) {
    console.error('[Home] history read failed', e);
    return [];
  }
}

/* ────────────────────────────────────────────────
   Hero
   ──────────────────────────────────────────────── */
const Hero: React.FC<{ items: any[] }> = ({ items }) => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  const featured = items.slice(0, 5);

  useEffect(() => {
    if (featured.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % featured.length);
    }, 8000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [featured.length]);

  if (featured.length === 0) {
    return <div className="h-[70vh] bg-[#0a0a0b]" />;
  }

  const current = featured[index];
  const title = current.title || current.name || 'Untitled';
  const year = (current.release_date || current.first_air_date || '').slice(0, 4);
  const type = current.media_type || 'movie';
  const backdrop = getImageUrl(current.backdrop_path, 'original');
  const rating = current.vote_average?.toFixed(1);

  const goToDetails = () =>
    navigate(type === 'movie' ? `/movie/${current.id}` : `/tv/${current.id}`);

  return (
    <section className="relative w-full h-[78vh] min-h-[560px]">
      {backdrop && (
        <div
          key={current.id}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${backdrop})`,
            animation: 'kenburns 20s ease-in-out infinite alternate',
          }}
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,10,11,0.55) 0%, rgba(10,10,11,0.15) 30%, rgba(10,10,11,0.85) 75%, #0a0a0b 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(10,10,11,0.9) 0%, rgba(10,10,11,0.4) 40%, transparent 70%)',
        }}
      />

      <div className="relative h-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-16 lg:pb-24">
        <div key={current.id} className="max-w-2xl">
          <div
            className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.03]"
            style={{ animation: 'fadeUp 500ms ease-out' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'linear-gradient(135deg, #7c5cff, #ff6b9d)' }}
            />
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[rgba(245,245,247,0.7)]">
              {type === 'tv' ? 'Featured Series' : 'Featured Film'}
            </span>
          </div>

          <h1
            className="text-[40px] sm:text-[52px] lg:text-[64px] font-bold text-white tracking-[-0.03em] leading-[0.95] mb-5"
            style={{ animation: 'fadeUp 600ms 80ms ease-out backwards' }}
          >
            {title}
          </h1>

          <div
            className="flex items-center flex-wrap gap-x-4 gap-y-1.5 mb-5 text-[13px] text-[rgba(245,245,247,0.7)]"
            style={{ animation: 'fadeUp 600ms 160ms ease-out backwards' }}
          >
            {year && <span>{year}</span>}
            {rating && (
              <span className="flex items-center gap-1.5">
                <span className="text-[#f5c451]">★</span>
                <span className="font-medium text-[#f5f5f7]">{rating}</span>
              </span>
            )}
            <span className="px-1.5 py-0.5 rounded border border-white/[0.15] text-[10px] font-medium uppercase tracking-wider">
              {type === 'tv' ? 'Series' : 'Film'}
            </span>
            {current.genre_ids?.slice(0, 3).map((gid: number) => {
              const g = MOCK_GENRES.find((x) => x.id === gid);
              return g ? (
                <span key={gid} className="text-[rgba(245,245,247,0.5)]">
                  {g.name}
                </span>
              ) : null;
            })}
          </div>

          {current.overview && (
            <p
              className="text-[15px] leading-[1.65] text-[rgba(245,245,247,0.78)] max-w-[560px] mb-7 line-clamp-3"
              style={{ animation: 'fadeUp 600ms 240ms ease-out backwards' }}
            >
              {current.overview}
            </p>
          )}

          <div
            className="flex items-center gap-3"
            style={{ animation: 'fadeUp 600ms 320ms ease-out backwards' }}
          >
            <button
              onClick={goToDetails}
              className="group inline-flex items-center gap-2 h-12 px-6 rounded-xl font-semibold text-[14px] text-black transition-all duration-300 active:scale-[0.98] cursor-pointer"
              style={{
                background: '#ffffff',
                boxShadow: '0 8px 32px rgba(255,255,255,0.15)',
              }}
            >
              <Play className="w-4 h-4 fill-current" strokeWidth={0} />
              <span>Play</span>
            </button>

            <button
              onClick={goToDetails}
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl font-semibold text-[14px] text-white border border-white/[0.15] bg-white/[0.05] hover:bg-white/[0.1] backdrop-blur transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              <Info className="w-4 h-4" strokeWidth={2} />
              <span>More Info</span>
            </button>
          </div>
        </div>
      </div>

      {featured.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              className="h-1 rounded-full overflow-hidden transition-all duration-500 cursor-pointer"
              style={{
                width: i === index ? 32 : 8,
                background:
                  i === index
                    ? 'linear-gradient(90deg, #7c5cff, #ff6b9d)'
                    : 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes kenburns {
          from { transform: scale(1) translate(0, 0); }
          to   { transform: scale(1.08) translate(-1%, -1%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="kenburns"], [style*="fadeUp"] {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
};

/* ────────────────────────────────────────────────
   Horizontal Row — uses MovieCard
   ──────────────────────────────────────────────── */
const Row: React.FC<{
  title: string;
  subtitle?: string;
  items: any[];
  ranked?: boolean;
  icon?: React.ReactNode;
}> = ({ title, subtitle, items, ranked = false, icon }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative">
      <div className="flex items-end justify-between mb-5 px-1">
        <div>
          {subtitle && (
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[rgba(245,245,247,0.35)] mb-1 flex items-center gap-1.5">
              {icon}
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
          className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none opacity-0 group-hover/row:opacity-100 transition-opacity"
          style={{
            background: 'linear-gradient(90deg, #0a0a0b 0%, transparent 100%)',
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none opacity-0 group-hover/row:opacity-100 transition-opacity"
          style={{
            background: 'linear-gradient(270deg, #0a0a0b 0%, transparent 100%)',
          }}
        />

        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/70 backdrop-blur border border-white/[0.12] text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 hover:bg-black/90 transition-all duration-300 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 rotate-180" strokeWidth={2} />
        </button>

        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/70 backdrop-blur border border-white/[0.12] text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 hover:bg-black/90 transition-all duration-300 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" strokeWidth={2} />
        </button>

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-1"
        >
          {items.map((item, i) => (
            <div
              key={`${item.media_type || 'x'}-${item.id}-${i}`}
              className="w-[160px] sm:w-[180px] shrink-0"
            >
              <MovieCard
                item={item}
                rank={ranked ? i + 1 : undefined}
                index={i}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ────────────────────────────────────────────────
   Continue Watching Tile
   ──────────────────────────────────────────────── */
const ContinueCard: React.FC<{ item: HistoryItem }> = ({ item }) => {
  const navigate = useNavigate();
  const backdrop = getImageUrl(item.backdropPath || item.posterPath, 'w500');
  const progressPct = Math.min(100, Math.max(0, (item.progress ?? 0) * 100));

  return (
    <div
      onClick={() => {
        if (item.type === 'movie') navigate(`/movie/${item.id}`);
        else navigate(`/tv/${item.id}`);
      }}
      className="group relative cursor-pointer rounded-2xl bg-[#111113] border border-white/[0.08] hover:border-[rgba(124,92,255,0.4)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      <div className="relative aspect-video overflow-hidden">
        {backdrop ? (
          <img
            src={backdrop}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-[#0a0a0b]" />
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
            <Play className="w-4 h-4 fill-current ml-0.5" strokeWidth={0} />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
          <div
            className="h-full"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #7c5cff, #ff6b9d)',
            }}
          />
        </div>
      </div>
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[13px] font-medium text-[#f5f5f7] truncate">
            {item.title}
          </h3>
          <p className="text-[11px] text-[rgba(245,245,247,0.5)] mt-0.5">
            {item.type === 'tv'
              ? `S${item.season || 1} · E${item.episode || 1}`
              : `${Math.round(progressPct)}% watched`}
          </p>
        </div>
        <span className="text-[11px] font-medium text-[rgba(245,245,247,0.55)] group-hover:text-[#7c5cff] transition-colors shrink-0 mt-0.5">
          Resume
        </span>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────
   Continue Watching Row — horizontal scroller
   Same style as Row, but using ContinueCard
   ──────────────────────────────────────────────── */
const ContinueWatchingRow: React.FC<{ items: HistoryItem[]; total: number }> = ({
  items,
  total,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative">
      <div className="flex items-end justify-between mb-5 px-1">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[rgba(245,245,247,0.35)] mb-1">
            Pick up where you left off
          </p>
          <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#f5f5f7] tracking-[-0.02em]">
            Continue Watching
          </h2>
        </div>
        <span className="text-[11px] text-[rgba(245,245,247,0.4)]">
          {total} in progress
        </span>
      </div>

      <div className="relative group/row">
        <div
          className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none opacity-0 group-hover/row:opacity-100 transition-opacity"
          style={{
            background: 'linear-gradient(90deg, #0a0a0b 0%, transparent 100%)',
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none opacity-0 group-hover/row:opacity-100 transition-opacity"
          style={{
            background: 'linear-gradient(270deg, #0a0a0b 0%, transparent 100%)',
          }}
        />

        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/70 backdrop-blur border border-white/[0.12] text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 hover:bg-black/90 transition-all duration-300 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 rotate-180" strokeWidth={2} />
        </button>

        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/70 backdrop-blur border border-white/[0.12] text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 hover:bg-black/90 transition-all duration-300 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" strokeWidth={2} />
        </button>

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-1"
        >
          {items.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="w-[280px] sm:w-[320px] shrink-0"
            >
              <ContinueCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ────────────────────────────────────────────────
   Home
   ──────────────────────────────────────────────── */
export const Home: React.FC = () => {
  const { data: trending = [] } = useTrending();
  const { data: popularMovies = [] } = usePopularMovies();
  const { data: topRatedTV = [] } = useTopRatedTV();

  const queryClient = useQueryClient();

  /* Prefetch trailers for the first few rows so hover plays instantly */
  useEffect(() => {
    const allItems: any[] = [
      ...trending.slice(0, 12),
      ...popularMovies.slice(0, 12),
      ...topRatedTV.slice(0, 12),
    ];

    const timers: number[] = [];

    allItems.forEach((it, i) => {
      if (!it?.id || !it?.media_type) return;
      const t = window.setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey: ['hover-trailer', it.media_type, it.id],
          queryFn: () => getDetails(it.media_type, it.id),
          staleTime: 1000 * 60 * 10,
        });
      }, i * 80);
      timers.push(t);
    });

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [trending, popularMovies, topRatedTV, queryClient]);

  const [history, setHistory] = useState<HistoryItem[]>(() =>
    readHistoryFromStorage()
  );

  useEffect(() => {
    const read = () => setHistory(readHistoryFromStorage());
    read();
    window.addEventListener('focus', read);
    window.addEventListener('storage', read);
    const interval = window.setInterval(read, 2000);
    return () => {
      window.removeEventListener('focus', read);
      window.removeEventListener('storage', read);
      window.clearInterval(interval);
    };
  }, []);

  const continueWatching = useMemo(
    () => history.filter((h) => (h.progress ?? 0) > 0 && (h.progress ?? 0) < 1),
    [history]
  );

  const trendingNow = useMemo(() => trending.slice(1, 13), [trending]);

  return (
    <div className="pb-24">
      <Hero items={trending} />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 mt-4">
        {/* Continue Watching — now a horizontal scroller */}
        {continueWatching.length > 0 && (
          <ContinueWatchingRow
            items={continueWatching}
            total={continueWatching.length}
          />
        )}

        <Row
          title="Trending Today"
          subtitle="Global Leaderboard"
          items={trendingNow}
          ranked
          icon={<TrendingUp className="w-3 h-3" strokeWidth={2} />}
        />

        <Row
          title="Popular Masterpieces"
          subtitle="Curated for you"
          items={popularMovies}
          icon={<Sparkles className="w-3 h-3" strokeWidth={2} />}
        />

        <Row
          title="Top Rated TV Series"
          subtitle="Episodic Sagas"
          items={topRatedTV}
        />
      </div>
    </div>
  );
};

export default Home;