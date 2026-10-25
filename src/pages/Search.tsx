import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useSearch, useTrending, getImageUrl } from '../lib/api';
import { EmptyState } from '../components/EmptyState';
import { Mascot } from '../components/Mascot';

/* ────────────────────────────────────────────────
   Poster card — Netflix-style, no chrome
   ──────────────────────────────────────────────── */
const PosterCard: React.FC<{ item: any; showTitle?: boolean }> = ({
  item,
  showTitle = true,
}) => {
  const navigate = useNavigate();
  const title = item.title || item.name || 'Untitled';
  const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');

  return (
    <button
      type="button"
      onClick={() => navigate(`/${type}/${item.id}`)}
      aria-label={title}
      className="group relative block w-full text-left focus:outline-none
                 focus-visible:ring-2 focus-visible:ring-[#7c5cff]/60 rounded-[3px]"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[3px] bg-[#17171a]">
        {item.poster_path ? (
          <img
            src={getImageUrl(item.poster_path, 'w300')}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-300
                       group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center
                          text-white/30 text-[10px] px-2 text-center leading-tight">
            {title}
          </div>
        )}

        {/* Hover overlay — desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        hidden sm:flex flex-col justify-end p-2">
          <p className="text-[11px] font-medium text-white line-clamp-3 leading-tight">
            {title}
          </p>
        </div>
      </div>

      {showTitle && (
        <p className="mt-1.5 text-[11px] text-white/70 line-clamp-1
                      group-hover:text-white transition-colors sm:hidden">
          {title}
        </p>
      )}
    </button>
  );
};

/* ────────────────────────────────────────────────
   Skeleton card
   ──────────────────────────────────────────────── */
const SkeletonCard: React.FC = () => (
  <div className="animate-pulse">
    <div className="aspect-[2/3] w-full rounded-[3px] bg-white/[0.04]" />
    <div className="h-2 w-3/4 rounded bg-white/[0.05] mt-2 sm:hidden" />
  </div>
);

/* ────────────────────────────────────────────────
   Search bar
   ──────────────────────────────────────────────── */
const SearchBar: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  onBack: () => void;
}> = ({ value, onChange, onSubmit, onClear, onBack }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
        inputRef.current?.blur();
      }}
      className="flex items-center gap-2"
    >
      {/* Back arrow — mobile only */}
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        className="sm:hidden shrink-0 w-11 h-11 -ml-2 rounded-full
                   flex items-center justify-center text-white/80
                   active:scale-90 active:bg-white/[0.06] transition-all"
      >
        <ArrowLeft className="w-5 h-5" strokeWidth={2.2} />
      </button>

      <div className="relative flex-1">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none"
          strokeWidth={2.2}
        />
        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClear();
          }}
          placeholder="Search movies, series…"
          aria-label="Search"
          className="w-full h-11 sm:h-12 pl-10 pr-10 rounded-md
                     bg-[#17171a] border border-white/[0.08]
                     hover:border-white/[0.16] focus:border-white/40
                     text-[15px] text-white placeholder:text-white/35
                     outline-none transition-colors"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2
                       w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.14]
                       flex items-center justify-center text-white/70 hover:text-white
                       active:scale-90 transition-all"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2.4} />
          </button>
        )}
      </div>
    </form>
  );
};

/* ────────────────────────────────────────────────
   Section heading — Netflix label style
   ──────────────────────────────────────────────── */
const SectionLabel: React.FC<{ children: React.ReactNode; count?: number }> = ({
  children,
  count,
}) => (
  <div className="flex items-baseline justify-between mb-3 sm:mb-4">
    <h2 className="text-[17px] sm:text-[20px] font-bold text-white tracking-[-0.01em]">
      {children}
    </h2>
    {typeof count === 'number' && (
      <span className="text-[11px] uppercase tracking-[0.12em] text-white/40 tabular-nums">
        {count} {count === 1 ? 'title' : 'titles'}
      </span>
    )}
  </div>
);

/* ────────────────────────────────────────────────
   Grid wrapper — one definition, used everywhere
   ──────────────────────────────────────────────── */
const gridCls =
  'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 ' +
  'gap-1.5 sm:gap-2 md:gap-2.5';

/* ────────────────────────────────────────────────
   SearchPage
   ──────────────────────────────────────────────── */
export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  const [input, setInput] = useState(urlQuery);

  useEffect(() => {
    setInput(urlQuery);
  }, [urlQuery]);

  const { data: results = [], isLoading } = useSearch(urlQuery);
  const { data: trending = [] } = useTrending();

  const submit = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setSearchParams({});
      return;
    }
    setSearchParams({ q: trimmed });
  };

  const clear = () => {
    setInput('');
    setSearchParams({});
  };

  const hasQuery = urlQuery.trim().length > 0;
  const topSearches = trending.slice(0, 6);

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0b] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Search bar — the only top chrome ── */}
        <div className="pt-4 sm:pt-6 pb-4">
          <SearchBar
            value={input}
            onChange={setInput}
            onSubmit={submit}
            onClear={clear}
            onBack={() => navigate(-1)}
          />
        </div>

        {/* ── No query → Top Searches ── */}
        {!hasQuery && !isLoading && (
          <>
            <SectionLabel>Top Searches</SectionLabel>
            {topSearches.length > 0 ? (
              <div className={gridCls}>
                {topSearches.map((item) => (
                  <PosterCard key={`${item.media_type}-${item.id}`} item={item} />
                ))}
              </div>
            ) : (
              <div className="py-20">
                <EmptyState
                  mascotState="idle"
                  mascotSize={64}
                  title="Ready to Discover"
                  message="Type a title above, or open the command palette (⌘K / Ctrl+K)."
                />
              </div>
            )}
          </>
        )}

        {/* ── Loading ── */}
        {hasQuery && isLoading && (
          <div className={gridCls}>
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Results ── */}
        {hasQuery && !isLoading && results.length > 0 && (
          <>
            <SectionLabel count={results.length}>
              Results for "{urlQuery}"
            </SectionLabel>
            <div className={gridCls}>
              {results.map((item) => (
                <PosterCard key={`${item.media_type}-${item.id}`} item={item} />
              ))}
            </div>
          </>
        )}

        {/* ── Empty ── */}
        {hasQuery && !isLoading && results.length === 0 && (
          <div className="py-20">
            <EmptyState
              mascotState="empty"
              mascotSize={64}
              title="No Results"
              message={`Try different keywords — "${urlQuery}" returned nothing.`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export { SearchPage as default, SearchPage as Search };