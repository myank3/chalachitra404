import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Play, Info, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from '../stores/useUIStore';
import { useSearch, getImageUrl } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';
import { MediaItem } from '../types';
import { Mascot } from './Mascot';

export const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);
  const { data: results = [], isLoading } = useSearch(debouncedQuery);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('chalachitra:searches');
      return saved ? JSON.parse(saved) : ['Dune', 'Arcane', 'Cyberpunk', 'Oppenheimer'];
    } catch {
      return ['Dune', 'Arcane', 'Cyberpunk', 'Oppenheimer'];
    }
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [commandPaletteOpen]);

  const saveRecent = (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem('chalachitra:searches', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSelectItem = (item: MediaItem) => {
    saveRecent(item.title);
    setCommandPaletteOpen(false);
    navigate(`/${item.media_type}/${item.id}`);
  };

  const handlePlayItem = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    saveRecent(item.title);
    setCommandPaletteOpen(false);
    if (item.media_type === 'movie') {
      navigate(`/watch/movie/${item.id}`);
    } else {
      navigate(`/watch/tv/${item.id}?s=1&e=1`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelectItem(results[selectedIndex]);
      }
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight Command Search"
        onClick={() => setCommandPaletteOpen(false)}
        className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 bg-black/85"
      >
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
          className="relative w-full max-w-2xl rounded-xl bg-[#17171a] border border-white/[0.14] shadow-[0_4px_24px_rgba(0,0,0,0.4)] overflow-hidden"
        >
          {/* Search Header - Solid, no blur */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-[#111113]">
            <Search className="w-4 h-4 text-white/60 stroke-[1.5] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, series, directors, genres..."
              className="flex-1 bg-transparent text-[#f5f5f7] placeholder-[rgba(245,245,247,0.38)] text-sm outline-none font-normal"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded text-white/40 hover:text-white"
                aria-label="Clear query"
              >
                <X className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-white/40 bg-white/[0.04] rounded border border-white/[0.06]">
                ESC
              </kbd>
            )}
          </div>

          {/* Results List */}
          <div className="max-h-[55vh] overflow-y-auto no-scrollbar p-2">
            {isLoading && (
              <div className="p-8 text-center text-white/60 flex flex-col items-center justify-center gap-3 text-xs">
                <Mascot state="loading" size={36} />
                <span>Scanning reels...</span>
              </div>
            )}

            {!isLoading && query.trim() && results.length === 0 && (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                <Mascot state="empty" size={56} />
                <span className="text-xs text-[rgba(245,245,247,0.62)] mt-1">
                  Nothing matches that search yet.
                </span>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)]">
                  Top Matches
                </div>
                {results.slice(0, 8).map((item, index) => {
                  const isSelected = index === selectedIndex;
                  const releaseYear = item.release_date
                    ? item.release_date.substring(0, 4)
                    : item.first_air_date
                    ? item.first_air_date.substring(0, 4)
                    : '2026';

                  return (
                    <div
                      key={`${item.media_type}-${item.id}`}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-white/[0.08] border border-white/[0.12] text-white'
                          : 'hover:bg-white/[0.04] border border-transparent text-[rgba(245,245,247,0.7)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-14 rounded overflow-hidden bg-neutral-850 shrink-0 border border-white/[0.06]">
                          {item.poster_path ? (
                            <img
                              src={getImageUrl(item.poster_path, 'w300')}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-xs">
                              {item.title.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-[#f5f5f7] truncate">
                            {item.title}
                          </h4>
                          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[rgba(245,245,247,0.4)]">
                            <span className="capitalize">{item.media_type}</span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{releaseYear}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-400 font-mono tabular-nums">
                              ★ {item.vote_average ? item.vote_average.toFixed(1) : '8.0'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={(e) => handlePlayItem(e, item)}
                          className="p-1.5 rounded-lg bg-white/[0.08] hover:bg-white/20 text-white transition-colors"
                          title="Stream"
                        >
                          <Play className="w-3 h-3 fill-current stroke-[1.5] ml-0.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectItem(item)}
                          className="p-1.5 rounded-lg text-white/40 hover:text-white"
                          title="Details"
                        >
                          <Info className="w-3.5 h-3.5 stroke-[1.5]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!query.trim() && (
              <div className="p-2 space-y-3">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)] mb-1.5 px-1">
                      <Clock className="w-3 h-3 stroke-[1.5]" />
                      <span>Recent Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setQuery(term)}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs text-[rgba(245,245,247,0.62)] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>{term}</span>
                          <ArrowRight className="w-3 h-3 stroke-[1.5] text-white/30" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-[rgba(245,245,247,0.38)] bg-[#111113]">
            <div className="flex items-center gap-2">
              <span>
                <kbd className="px-1 py-0.2 bg-white/[0.04] rounded border border-white/[0.06] font-mono">↑↓</kbd> navigate
              </span>
              <span>
                <kbd className="px-1 py-0.2 bg-white/[0.04] rounded border border-white/[0.06] font-mono">↵</kbd> select
              </span>
            </div>
            <span>Chalachitra Spotlight</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
