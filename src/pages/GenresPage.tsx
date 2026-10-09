import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDiscoverMovies, getDiscoverTV, useMovieGenres, useTVGenres } from '../lib/api';
import { MovieCard } from '../components/MovieCard';
import { LargeTitle } from '../components/ui/LargeTitle';
import { MovieCardSkeleton } from '../components/ui/Skeleton';

export const GenresPage: React.FC = () => {
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  /* ---------- real TMDB genres ---------- */
  const { data: movieGenres = [], isLoading: loadingMovieGenres } = useMovieGenres();
  const { data: tvGenres = [], isLoading: loadingTVGenres } = useTVGenres();

  const genres = mediaType === 'movie' ? movieGenres : tvGenres;
  const loadingGenres = mediaType === 'movie' ? loadingMovieGenres : loadingTVGenres;

  /* ---------- auto-select first genre ---------- */
  const activeGenreId = selectedGenreId ?? genres[0]?.id ?? null;
  const activeGenre = genres.find((g) => g.id === activeGenreId) ?? null;

  /* ---------- discovery query ---------- */
  const { data: movieData, isLoading: loadingMovies } = useQuery({
    queryKey: ['discover', 'movie', activeGenreId, page],
    queryFn: () =>
      getDiscoverMovies({
        with_genres: activeGenreId!,
        page,
        sort_by: 'popularity.desc',
        'vote_count.gte': 50, // filter noise
      }),
    enabled: mediaType === 'movie' && activeGenreId !== null,
    staleTime: 1000 * 60 * 5,
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
  });

  /* ---------- normalize results with media_type guaranteed ---------- */
  const items = useMemo(() => {
    const raw = mediaType === 'movie' ? movieData?.results ?? [] : tvData?.results ?? [];
    return raw.map((it: any) => ({
      ...it,
      media_type: mediaType, // ⭐ critical — discover endpoints omit this
      title: it.title || it.name || 'Untitled',
    }));
  }, [mediaType, movieData, tvData]);

  const totalPages = mediaType === 'movie' ? movieData?.total_pages ?? 1 : tvData?.total_pages ?? 1;
  const isLoading = mediaType === 'movie' ? loadingMovies : loadingTV;

  /* ---------- reset page on genre/type change ---------- */
  const handleGenreChange = (id: number) => {
    setSelectedGenreId(id);
    setPage(1);
  };
  const handleTypeChange = (t: 'movie' | 'tv') => {
    setMediaType(t);
    setSelectedGenreId(null);
    setPage(1);
  };

  return (
    <div className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <LargeTitle
        title="Genres"
        subtitle="Catalog Classification"
        action={
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs">
            <button
              type="button"
              onClick={() => handleTypeChange('movie')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                mediaType === 'movie'
                  ? 'bg-white text-black font-semibold'
                  : 'text-[rgba(245,245,247,0.62)] hover:text-white'
              }`}
            >
              Movies
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('tv')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                mediaType === 'tv'
                  ? 'bg-white text-black font-semibold'
                  : 'text-[rgba(245,245,247,0.62)] hover:text-white'
              }`}
            >
              TV Series
            </button>
          </div>
        }
      />

      {/* Genre pills */}
      <div className="my-6 flex gap-2 overflow-x-auto no-scrollbar py-1">
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
                  className={`px-4 py-2 rounded-xl text-xs font-medium shrink-0 transition-colors cursor-pointer ${
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#f5f5f7] tracking-[-0.02em]">
            {activeGenre?.name ?? 'All'} · {mediaType === 'movie' ? 'Movies' : 'Series'}
          </h2>
          <span className="text-xs text-[rgba(245,245,247,0.45)] font-mono">
            {items.length} on this page
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
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
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs font-medium text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.1] cursor-pointer transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs text-[rgba(245,245,247,0.6)] font-mono px-3">
                  {page} / {Math.min(totalPages, 500)}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages || page >= 500}
                  onClick={() => setPage((p) => Math.min(totalPages, 500, p + 1))}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs font-medium text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.1] cursor-pointer transition-colors"
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