import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, RefreshCw } from 'lucide-react';
import { getDiscoverTV } from '../lib/api';
import { MovieCard } from '../components/MovieCard';
import { LargeTitle } from '../components/ui/LargeTitle';
import { MovieCardSkeleton } from '../components/ui/Skeleton';

export const TVShowsPage: React.FC = () => {
  const [selectedGenre, setSelectedGenre] = useState<number | undefined>(undefined);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  const [page, setPage] = useState<number>(1);

  const tvGenres = [
    { id: 10759, name: 'Action & Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 18, name: 'Drama' },
    { id: 10765, name: 'Sci-Fi & Fantasy' },
    { id: 9648, name: 'Mystery' },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ['discover-tv', selectedGenre, minRating, sortBy, page],
    queryFn: () =>
      getDiscoverTV({
        page,
        with_genres: selectedGenre,
        'vote_average.gte': minRating > 0 ? minRating : undefined,
        sort_by: sortBy,
      }),
    staleTime: 1000 * 60 * 5,
  });

  const tvShows = data?.results || [];

  return (
    <div className="min-h-screen pb-28 md:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <LargeTitle
        title="TV Shows"
        subtitle="Episodic & Series"
        action={
          <div className="text-xs text-[rgba(245,245,247,0.38)] font-mono">
            {tvShows.length} series
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="my-6 p-3 rounded-xl bg-[#111113] border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)] px-2">
          <Filter className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Filters</span>
        </div>

        <select
          value={selectedGenre ?? ''}
          onChange={(e) => {
            setSelectedGenre(e.target.value ? Number(e.target.value) : undefined);
            setPage(1);
          }}
          className="bg-white/[0.05] text-[#f5f5f7] rounded-lg px-3 py-1.5 text-xs border border-white/[0.08] outline-none hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <option value="" className="bg-[#111113] text-white">All Genres</option>
          {tvGenres.map((g) => (
            <option key={g.id} value={g.id} className="bg-[#111113] text-white">
              {g.name}
            </option>
          ))}
        </select>

        <select
          value={minRating}
          onChange={(e) => {
            setMinRating(Number(e.target.value));
            setPage(1);
          }}
          className="bg-white/[0.05] text-[#f5f5f7] rounded-lg px-3 py-1.5 text-xs border border-white/[0.08] outline-none hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <option value={0} className="bg-[#111113] text-white">Any Rating</option>
          <option value={7} className="bg-[#111113] text-white">★ 7.0+ (Great)</option>
          <option value={8} className="bg-[#111113] text-white">★ 8.0+ (Acclaimed)</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          className="bg-white/[0.05] text-[#f5f5f7] rounded-lg px-3 py-1.5 text-xs border border-white/[0.08] outline-none hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <option value="popularity.desc" className="bg-[#111113] text-white">Most Popular</option>
          <option value="vote_average.desc" className="bg-[#111113] text-white">Highest Rated</option>
        </select>

        {(selectedGenre || minRating > 0 || sortBy !== 'popularity.desc') && (
          <button
            onClick={() => {
              setSelectedGenre(undefined);
              setMinRating(0);
              setSortBy('popularity.desc');
              setPage(1);
            }}
            className="ml-auto text-xs text-[rgba(245,245,247,0.62)] hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 18 }, (_, i) => <MovieCardSkeleton key={i} />)
          : tvShows.map((show) => <MovieCard key={show.id} item={show} />)}
      </div>

      {/* Pagination Controls */}
      <div className="mt-12 flex items-center justify-center gap-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-semibold border border-white/[0.08] transition-all cursor-pointer"
        >
          Previous
        </button>
        <span className="text-xs text-[rgba(245,245,247,0.45)] font-mono">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={Boolean(data?.total_pages && page >= data.total_pages)}
          className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-semibold border border-white/[0.08] transition-all cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};
