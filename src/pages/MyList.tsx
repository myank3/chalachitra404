import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, List, Trash2, Play, Bookmark, History as HistoryIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWatchlist, WatchlistItem, HistoryItem } from '../stores/watchlist';
import { MovieCard } from '../components/MovieCard';
import { getImageUrl } from '../lib/api';
import { EmptyState } from '../components/EmptyState';

type Tab = 'list' | 'history';

export const WatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('list');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  const itemsMap = useWatchlist((s) => s.items);
  const historyMap = useWatchlist((s) => s.history);
  const remove = useWatchlist((s) => s.remove);
  const removeHistory = useWatchlist((s) => s.removeHistory);
  const clearHistory = useWatchlist((s) => s.clearHistory);

  const watchlistItems = useMemo(
    () => Object.values(itemsMap ?? {}).sort((a, b) => b.addedAt - a.addedAt),
    [itemsMap]
  );

  const historyItems = useMemo(
    () => Object.values(historyMap ?? {}).sort((a, b) => b.watchedAt - a.watchedAt),
    [historyMap]
  );

  const sourceItems: (WatchlistItem | HistoryItem)[] =
    tab === 'list' ? watchlistItems : historyItems;

  const filteredItems = sourceItems.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const formatRelative = (ts: number) => {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(ts).toLocaleDateString();
  };

  const isHistory = tab === 'history';

  return (
    <div className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08] mb-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] font-medium text-[rgba(245,245,247,0.38)] mb-1">
            Personal Collection
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold font-heading text-[#f5f5f7]">
            {isHistory ? 'Watch History' : 'My List'}{' '}
            <span className="text-[rgba(245,245,247,0.4)]">
              ({sourceItems.length})
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Pills */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs">
            {(['all', 'movie', 'tv'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterType === f
                    ? 'bg-white text-black font-semibold'
                    : 'text-[rgba(245,245,247,0.62)] hover:text-white'
                }`}
              >
                {f === 'all' ? 'All' : f === 'movie' ? 'Movies' : 'TV'}
              </button>
            ))}
          </div>

          {/* View Mode */}
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

          {isHistory && historyItems.length > 0 ? (
            <button
              onClick={() => {
                if (confirm('Clear your entire watch history?')) clearHistory();
              }}
              className="text-xs text-rose-400/80 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Clear history"
            >
              <X className="w-4 h-4 stroke-[1.5]" />
            </button>
          ) : !isHistory && watchlistItems.length > 0 ? (
            <button
              onClick={() => {
                if (confirm('Clear your entire watchlist?')) {
                  useWatchlist.getState().clear();
                }
              }}
              className="text-xs text-rose-400/80 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4 stroke-[1.5]" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8">
        <button
          onClick={() => setTab('list')}
          className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
            tab === 'list'
              ? 'text-[#f5f5f7] bg-white/[0.06]'
              : 'text-[rgba(245,245,247,0.5)] hover:text-[rgba(245,245,247,0.85)]'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" strokeWidth={1.75} />
          My List
          {watchlistItems.length > 0 && (
            <span className="text-[10px] opacity-70">{watchlistItems.length}</span>
          )}
        </button>

        <button
          onClick={() => setTab('history')}
          className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
            tab === 'history'
              ? 'text-[#f5f5f7] bg-white/[0.06]'
              : 'text-[rgba(245,245,247,0.5)] hover:text-[rgba(245,245,247,0.85)]'
          }`}
        >
          <HistoryIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
          History
          {historyItems.length > 0 && (
            <span className="text-[10px] opacity-70">{historyItems.length}</span>
          )}
        </button>
      </div>

      {/* Content */}
      {filteredItems.length === 0 ? (
        <EmptyState
          mascotState="empty"
          mascotSize={64}
          title={isHistory ? 'No Watch History' : 'Your List is Empty'}
          message={
            isHistory
              ? 'Movies and shows you watch will appear here.'
              : 'Add movies and shows to watch later.'
          }
          actionText={isHistory ? 'Explore Titles' : 'Explore Masterpieces'}
          onAction={() => navigate('/')}
        />
      ) : viewMode === 'grid' ? (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        >
          <AnimatePresence>
            {filteredItems.map((item) => {
              const hist = item as HistoryItem;
              const progressPct = isHistory
                ? Math.min(100, Math.max(0, (hist.progress ?? 0) * 100))
                : 0;

              return (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="relative"
                >
                  {/* Progress bar for history grid items */}
                  {isHistory && progressPct > 0 && (
                    <div className="absolute -bottom-1 left-2 right-2 h-[2px] rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${progressPct}%`,
                          background: 'linear-gradient(90deg, #7c5cff, #ff6b9d)',
                        }}
                      />
                    </div>
                  )}
                  <MovieCard
                    item={{
                      id: item.id,
                      media_type: item.type,
                      title: item.title,
                      poster_path: item.posterPath,
                      backdrop_path: item.backdropPath || null,
                      vote_average: item.rating,
                      release_date:
                        item.type === 'movie' ? `${item.year}-01-01` : undefined,
                      first_air_date:
                        item.type === 'tv' ? `${item.year}-01-01` : undefined,
                      overview: item.overview || '',
                    }}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const hist = item as HistoryItem;
            return (
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
                      <span className="text-amber-400 font-mono">
                        ★ {item.rating.toFixed(1)}
                      </span>
                      {isHistory && hist.watchedAt && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>
                            {hist.type === 'tv' && hist.season != null
                              ? `S${hist.season} · E${hist.episode ?? 1} · `
                              : ''}
                            {formatRelative(hist.watchedAt)}
                          </span>
                        </>
                      )}
                    </div>
                    {/* Progress for history list items */}
                    {isHistory && (hist.progress ?? 0) > 0 && (hist.progress ?? 0) < 1 && (
                      <div className="mt-2 h-[3px] w-40 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: `${Math.min(100, (hist.progress ?? 0) * 100)}%`,
                            background: 'linear-gradient(90deg, #7c5cff, #ff6b9d)',
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.type === 'movie') {
                        navigate(`/watch/movie/${item.id}`);
                      } else {
                        const s = hist.season ?? 1;
                        const ep = hist.episode ?? 1;
                        navigate(`/watch/tv/${item.id}?s=${s}&e=${ep}`);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white hover:text-black text-white transition-colors cursor-pointer"
                    title={isHistory ? 'Resume' : 'Stream'}
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isHistory) removeHistory(item.id, item.type);
                      else remove(item.id, item.type);
                    }}
                    className="p-2.5 rounded-xl text-[rgba(245,245,247,0.4)] hover:text-rose-400 transition-colors cursor-pointer"
                    title={isHistory ? 'Remove from history' : 'Remove from My List'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;