import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  getDiscoverMovies,
  getDiscoverTV,
  useMovieGenres,
  useTVGenres,
} from '../lib/api';
import { MovieCard } from '../components/MovieCard';
import { LargeTitle } from '../components/ui/LargeTitle';
import { MovieCardSkeleton } from '../components/ui/Skeleton';

const TMDB_MAX_PAGES = 500;

type MediaType = 'movie' | 'tv';

/** Parse a URL param as a positive integer, or return null. */
function parsePositiveInt(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
  return n;
}

export const GenresPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  /* ---------- URL → state (single source of truth) ---------- */
  const mediaType: MediaType =
    searchParams.get('type') === 'tv' ? 'tv' : 'movie';

  const urlGenreId = parsePositiveInt(searchParams.get('genre'));
  const urlPage = parsePositiveInt(searchParams.get('page')) ?? 1;
  const page = Math.min(Math.max(urlPage, 1), TMDB_MAX_PAGES);

  /* ---------- real TMDB genres ---------- */
  const { data: movieGenres = [], isLoading: loadingMovieGenres } =
    useMovieGenres();
  const { data: tvGenres = [], isLoading: loadingTVGenres } = useTVGenres();

  const genres = mediaType === 'movie' ? movieGenres : tvGenres;
  const loadingGenres =
    mediaType === 'movie' ? loadingMovieGenres : loadingTVGenres;

  /* ---------- resolve active genre: URL value if valid, else first ---------- */
  const urlGenreIsValid =
    urlGenreId !== null && genres.some((g) => g.id === urlGenreId);
  const activeGenreId = urlGenreIsValid ? urlGenreId : genres[0]?.id ?? null;
  const activeGenre = genres.find((g) => g.id === activeGenreId) ?? null;

  /* ---------- keep URL in sync (auto-selects first genre, fixes bad params) ---------- */
  useEffect(() => {
    if (loadingGenres || activeGenreId === null) return;

    const urlType = searchParams.get('type');
    const urlGenre = searchParams.get('genre');
    if (urlType === mediaType && urlGenre === String(activeGenreId)) return;

    const next = new URLSearchParams(searchParams);
    next.set('type', mediaType);
    next.set('genre', String(activeGenreId));
    if (!next.get('page')) next.set('page', '1');
    setSearchParams(next, { replace: true });
  }, [loadingGenres, activeGenreId, mediaType, searchParams, setSearchParams]);

  /* ---------- discovery queries ---------- */
  const { data: movieData, isLoading: loadingMovies } = useQuery({
    queryKey: ['discover', 'movie', activeGenreId, page],
    queryFn: () =>
      getDiscoverMovies({
        with_genres: activeGenreId!,
        page,
        sort_by: 'popularity.desc',
        'vote_count.gte': 50,
      }),
    enabled: mediaType === 'movie' && activeGenreId !== null,
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev, // v5. Use `keepPreviousData: true` on v4.
  });

  const { data: tvData, isLoading: loadingTV } = useQuery({
    queryKey: ['discover', 'tv', activeGenreId, page],
    queryFn: () =>
      getDiscoverTV({
        with_genres: activeGenreId!,
        page,
        sort_by: 'popularity.desc',
        'vote_count.gte': 50,
      }),
    enabled: mediaType === 'tv' && activeGenreId !== null,
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  /* ---------- normalize results ---------- */
  const items = useMemo(() => {
    const raw =
      mediaType === 'movie' ? movieData?.results ?? [] : tvData?.results ?? [];
    return raw.map((it: any) => ({
      ...it,
      media_type: mediaType,
      title: it.title || it.name || 'Untitled',
    }));
  }, [mediaType, movieData, tvData]);

  const totalPages = Math.min(
    (mediaType === 'movie' ? movieData?.total_pages : tvData?.total_pages) ?? 1,
    TMDB_MAX_PAGES,
  );
  const isLoading = mediaType === 'movie' ? loadingMovies : loadingTV;

  /* ---------- handlers (all write to URL; URL drives state) ---------- */
  const handleGenreChange = (id: number) => {
    if (id === activeGenreId) return;
    setSearchParams({ type: mediaType, genre: String(id), page: '1' });
  };

  const handleTypeChange = (t: MediaType) => {
    if (t === mediaType) return;
    // Genre ids differ between movie & tv — drop the genre, let the sync effect pick one.
    setSearchParams({ type: t, page: '1' });
  };

  const handlePageChange = (nextPage: number) => {
    const clamped = Math.min(Math.max(nextPage, 1), totalPages);
    if (clamped === page) return;
    setSearchParams({
      type: mediaType,
      genre: String(activeGenreId),
      page: String(clamped),
    });
  };

  /* ---------- scroll to top on tab changes ---------- */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [mediaType, activeGenreId, page]);

  /* ---------- render ---------- */
  return (
    <div className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden">
      <LargeTitle
        title="Genres"
        subtitle="Catalog Classification"
        action={
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs">
            {(['movie', 'tv'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer touch-manipulation ${
                  mediaType === t
                    ? 'bg-white text-black font-semibold'
                    : 'text-[rgba(245,245,247,0.62)] hover:text-white'
                }`}
              >
                {t === 'movie' ? 'Movies' : 'TV Series'}
              </button>
            ))}
          </div>
        }
      />

      {/* Genre pills */}
      <div className="my-6 flex gap-2 overflow-x-auto no-scrollbar py-1 w-full max-w-full min-w-0 snap-x snap-proximity scroll-smooth touch-pan-x">
        {loadingGenres
          ? Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-24 rounded-xl bg-white/[0.04] animate-pulse shrink-0"
              />
            ))
          : genres.map((genre) => {
              const isSelected = activeGenreId === genre.id;
              return (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => handleGenreChange(genre.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium shrink-0 whitespace-nowrap snap-start transition-colors cursor-pointer touch-manipulation ${
                    isSelected
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'bg-white/[0.04] text-[rgba(245,245,247,0.7)] hover:bg-white/[0.08] hover:text-white border border-white/[0.08]'
                  }`}
                >
                  {genre.name}
                </button>
              );
            })}
      </div>

      {/* Results */}
      <div className="mt-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-[#f5f5f7] tracking-[-0.02em] truncate min-w-0">
            {activeGenre?.name ?? 'All'} ·{' '}
            {mediaType === 'movie' ? 'Movies' : 'Series'}
          </h2>
          <span className="text-xs text-[rgba(245,245,247,0.45)] font-mono shrink-0">
            {items.length} on this page
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3 md:gap-4">
              {items.map((item, i) => (
                <MovieCard
                  key={`${item.media_type}-${item.id}`}
                  item={item}
                  index={i}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs font-medium text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.1] cursor-pointer transition-colors touch-manipulation"
                >
                  Previous
                </button>
                <span className="text-xs text-[rgba(245,245,247,0.6)] font-mono px-3">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs font-medium text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.1] cursor-pointer transition-colors touch-manipulation"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center text-[rgba(245,245,247,0.38)] text-sm">
            No titles found for this genre.
          </div>
        )}
      </div>
    </div>
  );
};