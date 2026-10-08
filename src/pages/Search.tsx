import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../lib/api';
import { MovieCard } from '../components/MovieCard';
import { EmptyState } from '../components/EmptyState';
import { Mascot } from '../components/Mascot';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { data: results = [], isLoading } = useSearch(query);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="border-b border-white/[0.08] pb-6 mb-8">
        <h1 className="text-3xl font-bold font-heading text-[#f5f5f7]">
          {query ? `Search: "${query}"` : 'Catalog Search'}
        </h1>
        <p className="text-xs text-[rgba(245,245,247,0.5)] mt-1">
          Explore movies, series, and filmmakers across global cinema
        </p>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Mascot state="loading" size={48} />
          <span className="text-xs text-[rgba(245,245,247,0.62)]">
            Scanning cinematic archives...
          </span>
        </div>
      ) : query && results.length === 0 ? (
        <EmptyState
          mascotState="empty"
          mascotSize={64}
          title="No Titles Found"
          message="Nothing matches that search yet."
        />
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map((item) => (
            <MovieCard key={`${item.media_type}-${item.id}`} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          mascotState="idle"
          mascotSize={64}
          title="Ready to Discover"
          message="Type in the search palette or enter a title above to begin."
        />
      )}
    </div>
  );
};

export { SearchPage as default, SearchPage as Search };
