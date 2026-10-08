import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, List, Trash2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWatchlist } from '../stores/watchlist';
import { useUIStore } from '../stores/useUIStore';
import { MovieCard } from '../components/MovieCard';
import { getImageUrl } from '../lib/api';
import { EmptyState } from '../components/EmptyState';

export const WatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, clear, remove } = useWatchlist();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  const watchlistItems = Object.values(items).sort((a, b) => b.addedAt - a.addedAt);
  const filteredItems = watchlistItems.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08] mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] font-medium text-[rgba(245,245,247,0.38)] mb-1">
            Personal Collection
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold font-heading text-[#f5f5f7]">
            My List ({watchlistItems.length})
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Pills */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-black font-semibold'
                  : 'text-[rgba(245,245,247,0.62)] hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('movie')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'movie'
                  ? 'bg-white text-black font-semibold'
                  : 'text-[rgba(245,245,247,0.62)] hover:text-white'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setFilterType('tv')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'tv'
                  ? 'bg-white text-black font-semibold'
                  : 'text-[rgba(245,245,247,0.62)] hover:text-white'
              }`}
            >
              TV
            </button>
          </div>

          {/* Grid/List View Mode */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-black'
                  : 'text-[rgba(245,245,247,0.62)] hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4 stroke-[1.5]" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-black'
                  : 'text-[rgba(245,245,247,0.62)] hover:text-white'
              }`}
            >
              <List className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>

          {watchlistItems.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear your entire watchlist?')) {
                  clear();
                }
              }}
              className="text-xs text-rose-400/80 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4 stroke-[1.5]" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {filteredItems.length === 0 ? (
        <EmptyState
          mascotState="empty"
          mascotSize={64}
          title="Your List is Empty"
          message="Your list is empty. Add something to watch."
          actionText="Explore Masterpieces"
          onAction={() => navigate('/')}
        />
      ) : viewMode === 'grid' ? (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        >
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={`${item.type}-${item.id}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <MovieCard
                  item={{
                    id: item.id,
                    media_type: item.type,
                    title: item.title,
                    poster_path: item.posterPath,
                    backdrop_path: item.backdropPath || null,
                    vote_average: item.rating,
                    release_date: item.type === 'movie' ? `${item.year}-01-01` : undefined,
                    first_air_date: item.type === 'tv' ? `${item.year}-01-01` : undefined,
                    overview: item.overview || '',
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => navigate(`/${item.type}/${item.id}`)}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#111113] hover:bg-[#17171a] border border-white/[0.08] hover:border-white/[0.14] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-neutral-800 shrink-0 border border-white/[0.08]">
                  {item.posterPath ? (
                    <img
                      src={getImageUrl(item.posterPath, 'w300')}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-white/30">
                      {item.title.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[#f5f5f7] truncate group-hover:text-white">
                    {item.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[rgba(245,245,247,0.5)]">
                    <span>{item.year}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{item.type}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-400 font-mono">★ {item.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.type === 'movie') {
                      navigate(`/watch/movie/${item.id}`);
                    } else {
                      navigate(`/watch/tv/${item.id}?s=1&e=1`);
                    }
                  }}
                  className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white hover:text-black text-white transition-colors cursor-pointer"
                  title="Stream"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(item.id, item.type);
                  }}
                  className="p-2.5 rounded-xl text-[rgba(245,245,247,0.4)] hover:text-rose-400 transition-colors cursor-pointer"
                  title="Remove from My List"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
