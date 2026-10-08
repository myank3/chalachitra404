import React, { useEffect, useState } from 'react';
import { ArrowRight, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MediaItem } from '../types';
import { MovieCard } from './MovieCard';
import { getRecommendations, TMDB_GENRES } from '../lib/recommend';

interface RecommendedRowProps {
  sourceItem?: MediaItem | null;
  title?: string;
  subtitle?: string;
}

export const RecommendedRow: React.FC<RecommendedRowProps> = ({
  sourceItem,
  title = 'Recommended',
  subtitle,
}) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Genre names of sourceItem
  const sourceGenreNames = React.useMemo(() => {
    if (!sourceItem) return [];
    let ids = sourceItem.genre_ids || [];
    if (ids.length === 0 && sourceItem.genres) {
      ids = sourceItem.genres.map((g) => g.id);
    }
    return ids.map((id) => TMDB_GENRES[id]).filter(Boolean).slice(0, 3);
  }, [sourceItem]);

  useEffect(() => {
    let isCancelled = false;

    async function loadRecs() {
      setLoading(true);
      try {
        const recs = await getRecommendations({
          sourceItem: sourceItem || null,
          limit: 12,
        });

        if (!isCancelled) {
          setItems(recs);
        }
      } catch (err) {
        console.warn('Error loading genre recommendations:', err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadRecs();

    return () => {
      isCancelled = true;
    };
  }, [sourceItem]);

  if (!loading && items.length === 0) {
    return null;
  }

  const rowSubtitle =
    subtitle ||
    (sourceItem && sourceGenreNames.length > 0
      ? `Based on ${sourceGenreNames.join(' • ')}`
      : 'Based on genres you watch most');

  return (
    <section className="mt-12 pt-8 border-t border-white/[0.08]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/[0.06] border border-white/[0.08] text-[rgba(245,245,247,0.7)]">
              <Film className="w-3 h-3 stroke-[1.8] text-[#7c5cff]" />
              Genre Match
            </span>
            <h2 className="text-lg md:text-xl font-semibold tracking-[-0.02em] text-[#f5f5f7]">
              {title}
            </h2>
          </div>
          <p className="text-xs text-[rgba(245,245,247,0.5)]">
            {rowSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/recommend')}
          className="inline-flex items-center gap-1 text-xs text-[rgba(245,245,247,0.7)] hover:text-white transition-colors cursor-pointer"
        >
          <span>All Recommendations</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
        </button>
      </div>

      {/* Grid Row */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-[#111113] p-1.5 border border-white/[0.08] animate-pulse"
            >
              <div className="aspect-[2/3] w-full rounded-lg bg-[#17171a]" />
              <div className="mt-2 h-3 w-3/4 rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {items.map((item) => {
            const genres = (item.genre_ids || [])
              .map((id) => TMDB_GENRES[id])
              .filter(Boolean)
              .slice(0, 2);

            return (
              <div key={`${item.media_type}-${item.id}`} className="flex flex-col gap-1.5">
                <MovieCard item={item} />
                {genres.length > 0 && (
                  <div className="px-1 text-[11px] text-[rgba(245,245,247,0.45)] line-clamp-1">
                    {genres.join(' • ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
