import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, RefreshCw, ChevronLeft, ChevronRight, TrendingUp, Star, Clock } from 'lucide-react';
import { getDiscoverMovies } from '../lib/api';
import { MOCK_GENRES } from '../data/mockData';
import { MovieCard } from '../components/MovieCard';

const YEARS = [
  { value: '', label: 'All Years' },
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
  { value: '2022', label: '2022' },
  { value: '2020', label: '2020s' },
  { value: '2010', label: '2010s' },
  { value: '2000', label: '2000s' },
  { value: '1990', label: '90s' },
];

const RATINGS = [
  { value: 0, label: 'Any Rating' },
  { value: 5, label: '★ 5.0+' },
  { value: 6, label: '★ 6.0+' },
  { value: 7, label: '★ 7.0+' },
  { value: 8, label: '★ 8.0+' },
  { value: 9, label: '★ 9.0+' },
];

const SORTS = [
  { value: 'popularity.desc', label: 'Most Popular', icon: TrendingUp },
  { value: 'vote_average.desc', label: 'Highest Rated', icon: Star },
  { value: 'primary_release_date.desc', label: 'Newest First', icon: Clock },
];

const FilterChip: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`shrink-0 h-9 px-3.5 rounded-full text-[12px] font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
      active
        ? 'text-white'
        : 'text-[rgba(245,245,247,0.6)] bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
    }`}
    style={
      active
        ? { background: 'linear-gradient(135deg, #7c5cff, #ff6b9d)' }
        : undefined
    }
  >
    {children}
  </button>
);

const Select: React.FC<{
  value: string | number;
  onChange: (val: string) => void;
  options: { value: string | number; label: string }[];
}> = ({ value, onChange, options }) => (
  <div className="relative shrink-0">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none h-9 pl-3.5 pr-8 rounded-full text-[12px] font-medium text-[rgba(245,245,247,0.75)] bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white outline-none transition-all duration-200 cursor-pointer"
    >
      {options.map((opt) => (
        <option
          key={opt.value}
          value={opt.value}
          className="bg-[#111113] text-white"
        >
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronRight
      className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[rgba(245,245,247,0.4)] pointer-events-none rotate-90"
      strokeWidth={2}
    />
  </div>
);

export const MoviesPage: React.FC = () => {
  const [selectedGenre, setSelectedGenre] = useState<number | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['discover-movies', selectedGenre, selectedYear, minRating, sortBy, page],
    queryFn: () =>
      getDiscoverMovies({
        page,
        with_genres: selectedGenre,
        primary_release_year: selectedYear || undefined,
        'vote_average.gte': minRating > 0 ? minRating : undefined,
        sort_by: sortBy,
      }),
    staleTime: 1000 * 60 * 5,
  });

  const movies = data?.results || [];
  const totalPages = Math.min(50, data?.total_pages || 1);

  const hasFilters =
    selectedGenre !== undefined ||
    selectedYear !== '' ||
    minRating > 0 ||
    sortBy !== 'popularity.desc';

  const handleReset = () => {
    setSelectedGenre(undefined);
    setSelectedYear('');
    setMinRating(0);
    setSortBy('popularity.desc');
    setPage(1);
  };

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pt-10 pb-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[rgba(245,245,247,0.35)] mb-1.5">
            Catalogue
          </p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="text-[32px] sm:text-[40px] font-bold text-[#f5f5f7] tracking-[-0.03em] leading-none">
              Movies
            </h1>
            <span className="text-[12px] font-mono text-[rgba(245,245,247,0.4)] tabular-nums">
              {isFetching ? 'Loading…' : `${movies.length} on page ${page}`}
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mb-6 p-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 pr-3 mr-1 border-r border-white/[0.08] shrink-0">
              <Filter className="w-3.5 h-3.5 text-[rgba(245,245,247,0.5)]" strokeWidth={2} />
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[rgba(245,245,247,0.5)]">
                Filter
              </span>
            </div>

            <Select
              value={selectedGenre ?? ''}
              onChange={(v) => {
                setSelectedGenre(v ? Number(v) : undefined);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Genres' },
                ...MOCK_GENRES.map((g) => ({ value: g.id, label: g.name })),
              ]}
            />

            <Select
              value={selectedYear}
              onChange={(v) => {
                setSelectedYear(v);
                setPage(1);
              }}
              options={YEARS}
            />

            <Select
              value={minRating}
              onChange={(v) => {
                setMinRating(Number(v));
                setPage(1);
              }}
              options={RATINGS}
            />

            <Select
              value={sortBy}
              onChange={(v) => {
                setSortBy(v);
                setPage(1);
              }}
              options={SORTS.map((s) => ({ value: s.value, label: s.label }))}
            />

            {hasFilters && (
              <button
                onClick={handleReset}
                className="ml-auto shrink-0 flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12px] font-medium text-[rgba(245,245,247,0.7)] hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {isLoading
            ? Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-2xl bg-[#111113] animate-pulse" />
              ))
            : movies.map((movie: any) => (
                <MovieCard key={movie.id} item={movie} />
              ))}
        </div>

        {/* Empty state */}
        {!isLoading && movies.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-[15px] text-[rgba(245,245,247,0.6)]">
              No movies match these filters.
            </p>
            <button
              onClick={handleReset}
              className="mt-4 text-[13px] text-[#7c5cff] hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && movies.length > 0 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            </button>

            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const pageNum =
                  page <= 3
                    ? i + 1
                    : page >= totalPages - 2
                    ? totalPages - 4 + i
                    : page - 2 + i;
                if (pageNum < 1 || pageNum > totalPages) return null;
                const isActive = pageNum === page;
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`w-9 h-9 rounded-full text-[13px] font-medium tabular-nums transition-all cursor-pointer ${
                      isActive
                        ? 'text-white'
                        : 'text-[rgba(245,245,247,0.6)] hover:text-white hover:bg-white/[0.06]'
                    }`}
                    style={
                      isActive
                        ? { background: 'linear-gradient(135deg, #7c5cff, #ff6b9d)' }
                        : undefined
                    }
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};