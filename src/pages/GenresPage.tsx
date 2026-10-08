import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MOCK_GENRES } from '../data/mockData';
import { getDiscoverMovies, getDiscoverTV } from '../lib/api';
import { MovieCard } from '../components/MovieCard';
import { LargeTitle } from '../components/ui/LargeTitle';
import { MovieCardSkeleton } from '../components/ui/Skeleton';

export const GenresPage: React.FC = () => {
  const [selectedGenreId, setSelectedGenreId] = useState<number>(MOCK_GENRES[0]?.id ?? 28);
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');

  const activeGenre = MOCK_GENRES.find((g) => g.id === selectedGenreId) || MOCK_GENRES[0];

  const { data: movieData, isLoading: isLoadingMovies } = useQuery({
    queryKey: ['discover-genres-movies', selectedGenreId],
    queryFn: () =>
      getDiscoverMovies({
        with_genres: selectedGenreId,
        page: 1,
        sort_by: 'popularity.desc',
      }),
    enabled: mediaType === 'movie',
    staleTime: 1000 * 60 * 5,
  });

  const { data: tvData, isLoading: isLoadingTV } = useQuery({
    queryKey: ['discover-genres-tv', selectedGenreId],
    queryFn: () =>
      getDiscoverTV({
        with_genres: selectedGenreId,
        page: 1,
        sort_by: 'popularity.desc',
      }),
    enabled: mediaType === 'tv',
    staleTime: 1000 * 60 * 5,
  });

  const items = mediaType === 'movie' ? movieData?.results || [] : tvData?.results || [];
  const isLoading = mediaType === 'movie' ? isLoadingMovies : isLoadingTV;

  return (
    <div className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <LargeTitle
        title="Genres"
        subtitle="Catalog Classification"
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs">
              <button
                type="button"
                onClick={() => setMediaType('movie')}
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
                onClick={() => setMediaType('tv')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  mediaType === 'tv'
                    ? 'bg-white text-black font-semibold'
                    : 'text-[rgba(245,245,247,0.62)] hover:text-white'
                }`}
              >
                TV Series
              </button>
            </div>
          </div>
        }
      />

      {/* Genre Selector */}
      <div className="my-6 flex gap-2 overflow-x-auto no-scrollbar py-1">
        {MOCK_GENRES.map((genre) => {
          const isSelected = selectedGenreId === genre.id;
          return (
            <button
              key={genre.id}
              type="button"
              onClick={() => setSelectedGenreId(genre.id)}
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

      {/* Grid Results */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#f5f5f7] tracking-[-0.02em]">
            {activeGenre.name} · {mediaType === 'movie' ? 'Movies' : 'Series'}
          </h2>
          <span className="text-xs text-[rgba(245,245,247,0.45)] font-mono">
            {items.length} titles
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {items.map((item) => (
              <MovieCard key={`${item.media_type || mediaType}-${item.id}`} item={item} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-[rgba(245,245,247,0.38)] text-sm">
            No titles found for this genre.
          </div>
        )}
      </div>
    </div>
  );
};
