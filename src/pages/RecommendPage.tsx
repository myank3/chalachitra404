import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Film,
  Tv,
  RefreshCw,
  Compass,
  Sparkles,
  TrendingUp,
  Target,
  Layers,
} from 'lucide-react';
import {
  getRecommendations,
  getUserGenreFrequencies,
  TMDB_GENRES,
  GenreCount,
} from '../lib/recommend';
import { MediaItem } from '../types';
import { MovieCard } from '../components/MovieCard';
import { useWatchlist } from '../stores/watchlist';
import { Mascot } from '../components/Mascot';

type FilterType = 'all' | 'movie' | 'tv';

const SKELETON_KEYS = Array.from({ length: 12 }, (_, i) => i);

export const RecommendPage: React.FC = () => {
  const { items: watchlistItems } = useWatchlist();

  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);

  const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [genreStats, setGenreStats] = useState<{
    genreCounts: GenreCount[];
    topGenres: GenreCount[];
  }>({ genreCounts: [], topGenres: [] });

  const refreshFrequencies = useCallback(() => {
    const stats = getUserGenreFrequencies();
    setGenreStats({
      genreCounts: stats.genreCounts,
      topGenres: stats.topGenres,
    });
  }, []);

  useEffect(() => {
    refreshFrequencies();
  }, [watchlistItems, refreshFrequencies]);

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getRecommendations({
        type: filterType,
        selectedGenreId: selectedGenreId || undefined,
        limit: 40,
      });
      setRecommendations(items);
    } catch (err) {
      console.warn('Error loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, [filterType, selectedGenreId]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const totalInteractions = useMemo(
    () => genreStats.genreCounts.reduce((acc, curr) => acc + curr.count, 0),
    [genreStats.genreCounts]
  );

  const hasHistory = totalInteractions > 0;
  const topGenres = genreStats.topGenres;

  const handleRefresh = () => {
    refreshFrequencies();
    loadRecommendations();
  };

  const handleResetFilters = () => {
    setSelectedGenreId(null);
    setFilterType('all');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f7] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        {/* ============ HERO HEADER ============ */}
        <header className="border-b border-white/[0.08] pb-10 mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.08em] bg-gradient-to-r from-[#7c5cff]/15 to-[#ff6b9d]/10 border border-[#7c5cff]/25 text-[#c4b5fd] mb-4">
                <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
                <span>Personalized</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold tracking-[-0.035em] leading-[1.05] text-[#f5f5f7]">
                For You
              </h1>

              <p className="mt-3 text-[15px] md:text-base text-[rgba(245,245,247,0.6)] leading-relaxed">
                Curated from your viewing activity and watchlist. The more you watch,
                the sharper these get.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] text-sm font-medium text-[rgba(245,245,247,0.85)] hover:text-white transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <RefreshCw
                className={`w-4 h-4 stroke-[1.75] transition-transform duration-500 ${
                  loading ? 'animate-spin' : 'group-hover:rotate-180'
                }`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* ============ INSIGHT CARD ============ */}
        <section className="mb-10">
          <div className="relative rounded-2xl bg-[#111113] border border-white/[0.08] overflow-hidden">
            {/* Ambient top hairline */}
            <div
              aria-hidden
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(124,92,255,0.5), rgba(255,107,157,0.4), transparent)',
              }}
            />

            {/* Header row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 sm:px-6 py-5 border-b border-white/[0.06]">
              <div className="flex items-start gap-3.5">
                <div className="shrink-0 -mt-1">
                  <Mascot state="idle" size={44} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[rgba(245,245,247,0.4)] mb-1">
                    Chitra
                  </p>
                  <p className="text-sm text-[rgba(245,245,247,0.85)] leading-relaxed">
                    {hasHistory
                      ? 'These picks match the genres you return to most.'
                      : 'Watch or save a few titles and I\'ll start tuning these to your taste.'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[rgba(245,245,247,0.35)] shrink-0">
                Local · On-device
              </span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
              {/* Top genres */}
              <div className="px-5 sm:px-6 py-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-3.5 h-3.5 text-[#7c5cff] stroke-[2]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[rgba(245,245,247,0.4)]">
                    Top Genres
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {topGenres.length > 0 ? (
                    topGenres.map((g) => (
                      <span
                        key={g.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-xs font-medium text-white"
                      >
                        {g.name}
                        {g.count > 0 && (
                          <span className="text-[10px] text-white/45 font-mono">
                            ×{g.count}
                          </span>
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[rgba(245,245,247,0.45)]">
                      Not enough data yet
                    </span>
                  )}
                </div>
              </div>

              {/* Interaction count */}
              <div className="px-5 sm:px-6 py-5">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-3.5 h-3.5 text-[#7c5cff] stroke-[2]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[rgba(245,245,247,0.4)]">
                    Signals
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-white font-mono tabular-nums">
                    {totalInteractions}
                  </span>
                  <span className="text-xs text-[rgba(245,245,247,0.45)]">
                    interactions
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-[rgba(245,245,247,0.45)]">
                  History · Watchlist · Watched
                </p>
              </div>

              {/* Method */}
              <div className="px-5 sm:px-6 py-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-3.5 h-3.5 text-[#7c5cff] stroke-[2]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[rgba(245,245,247,0.4)]">
                    Method
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/20">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                  </span>
                  <span className="text-[11px] font-medium text-emerald-300">
                    Genre frequency
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-[rgba(245,245,247,0.45)]">
                  Direct match · Client-side
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FILTER BAR ============ */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            {/* Format segmented control */}
            <div className="inline-flex rounded-xl bg-[#111113] p-1 border border-white/[0.08]">
              {(
                [
                  { key: 'all', label: 'All', icon: null },
                  { key: 'movie', label: 'Movies', icon: Film },
                  { key: 'tv', label: 'TV', icon: Tv },
                ] as const
              ).map(({ key, label, icon: Icon }) => {
                const isActive = filterType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilterType(key)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-white text-black shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
                        : 'text-[rgba(245,245,247,0.6)] hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 stroke-[2]" />}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Genre chips */}
            {topGenres.length > 0 && (
              <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-[#111113] p-1 border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setSelectedGenreId(null)}
                  className={`px-3.5 py-2 text-xs rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                    selectedGenreId === null
                      ? 'bg-[#7c5cff] text-white shadow-[0_2px_8px_rgba(124,92,255,0.35)]'
                      : 'text-[rgba(245,245,247,0.6)] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  All genres
                </button>
                {topGenres.map((g) => {
                  const isActive = selectedGenreId === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGenreId(g.id)}
                      className={`px-3.5 py-2 text-xs rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-[#7c5cff] text-white shadow-[0_2px_8px_rgba(124,92,255,0.35)]'
                          : 'text-[rgba(245,245,247,0.6)] hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {g.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Result count */}
            <div className="ml-auto text-xs font-mono uppercase tracking-[0.1em] text-[rgba(245,245,247,0.4)] tabular-nums">
              {loading ? 'Loading…' : `${recommendations.length} results`}
            </div>
          </div>
        </section>

        {/* ============ RESULTS GRID ============ */}
        <section>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {SKELETON_KEYS.map((i) => (
                <div
                  key={i}
                  className="rounded-xl bg-[#111113] p-2 border border-white/[0.08] animate-pulse"
                >
                  <div className="aspect-[2/3] w-full rounded-lg bg-[#17171a]" />
                  <div className="mt-2.5 h-3.5 w-3/4 rounded bg-white/[0.06]" />
                  <div className="mt-1.5 h-3 w-1/2 rounded bg-white/[0.04]" />
                </div>
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <EmptyState onReset={handleResetFilters} hasHistory={hasHistory} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {recommendations.map((item, idx) => {
                const genres = (item.genre_ids || [])
                  .map((id) => TMDB_GENRES[id])
                  .filter(Boolean)
                  .slice(0, 2);

                return (
                  <div
                    key={`${item.media_type}-${item.id}`}
                    className="flex flex-col gap-2 opacity-0 animate-[cardIn_400ms_ease-out_forwards]"
                    style={{ animationDelay: `${Math.min(idx * 20, 400)}ms` }}
                  >
                    <MovieCard item={item} />

                    {genres.length > 0 && (
                      <div className="px-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.4)] line-clamp-1">
                        {genres.join(' · ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="animate-["] { animation: none !important; opacity: 1 !important; }
        }
      `}</style>
    </div>
  );
};

/* ============ EMPTY STATE ============ */
const EmptyState: React.FC<{ onReset: () => void; hasHistory: boolean }> = ({
  onReset,
  hasHistory,
}) => {
  return (
    <div className="py-24 px-6 text-center rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#111113] to-[#0d0d0f]">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-4">
        <Compass className="w-6 h-6 text-white/40 stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-semibold text-white">
        {hasHistory ? 'Nothing matches those filters' : 'No recommendations yet'}
      </h3>
      <p className="text-sm text-[rgba(245,245,247,0.5)] mt-1.5 max-w-sm mx-auto leading-relaxed">
        {hasHistory
          ? 'Try a different format or clear the genre filter to see more.'
          : 'Watch or save a few titles and we\'ll start surfacing picks tuned to you.'}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#e8e8ea] transition-colors cursor-pointer"
      >
        Reset filters
      </button>
    </div>
  );
};

export default RecommendPage;