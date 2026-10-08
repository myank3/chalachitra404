import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Trash2, Bookmark } from 'lucide-react';
import { getImageUrl } from '../lib/api';
import { useWatchlist } from '../stores/watchlist';

export const MyList: React.FC = () => {
  const navigate = useNavigate();
  const { items, remove } = useWatchlist();   // ← the single source of truth

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[rgba(245,245,247,0.35)] mb-1">
          Saved for later
        </p>
        <h1 className="text-[28px] sm:text-[32px] font-semibold text-[#f5f5f7] tracking-[-0.02em]">
          My List
        </h1>
        {items.length > 0 && (
          <p className="text-[13px] text-[rgba(245,245,247,0.5)] mt-2">
            {items.length} {items.length === 1 ? 'title' : 'titles'}
          </p>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-14 h-14 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center mb-5">
            <Bookmark className="w-6 h-6 text-[rgba(245,245,247,0.5)]" strokeWidth={1.75} />
          </div>
          <h2 className="text-[18px] font-semibold text-[#f5f5f7] mb-2">
            Your list is empty
          </h2>
          <p className="text-[13px] text-[rgba(245,245,247,0.5)] max-w-sm mb-6">
            Add movies and shows you want to watch later.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-5 h-11 rounded-xl font-semibold text-[13px] text-black transition-all duration-200 active:scale-[0.98] cursor-pointer"
            style={{ background: '#ffffff' }}
          >
            Browse titles
          </button>
        </div>
      )}

      {/* Grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => {
            const poster = getImageUrl(item.posterPath, 'w500');
            return (
              <div key={`${item.type}-${item.id}`} className="group relative">
                <div
                  onClick={() =>
                    navigate(item.type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`)
                  }
                  className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/[0.08] hover:border-[rgba(124,92,255,0.4)] transition-all duration-300 cursor-pointer"
                >
                  {poster ? (
                    <img
                      src={poster}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#111113] flex items-center justify-center text-[rgba(245,245,247,0.3)] text-xs">
                      No poster
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(item.id, item.type);
                      }}
                      className="self-end w-8 h-8 rounded-full border border-white/[0.3] bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-[#ff453a] hover:border-[#ff453a] transition-all duration-200 cursor-pointer"
                      aria-label="Remove from list"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.type === 'movie')
                          navigate(`/watch/movie/${item.id}`);
                        else navigate(`/watch/tv/${item.id}?s=1&e=1`);
                      }}
                      className="self-start inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white text-black font-medium text-[11px] hover:bg-[#e8e8ea] transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" strokeWidth={0} />
                      Play
                    </button>
                  </div>
                </div>

                <div className="mt-2.5 px-0.5">
                  <h3 className="text-[13px] font-medium text-[#f5f5f7] truncate leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-[rgba(245,245,247,0.45)] mt-0.5 uppercase tracking-wider">
                    {item.type === 'tv' ? 'Series' : 'Film'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyList;