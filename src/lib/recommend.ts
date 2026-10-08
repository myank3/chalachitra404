import { MediaItem, MediaType } from '../types';
import { MOCK_MEDIA_ITEMS } from '../data/mockData';
import { TMDB_API_KEY, TMDB_BASE_URL } from './api';

// TMDB Standard Genre Map
export const TMDB_GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

// Default fallback genres if user has no interactions yet
export const DEFAULT_GENRES = [28, 18, 878]; // Action, Drama, Sci-Fi

export interface GenreCount {
  id: number;
  name: string;
  count: number;
}

/**
 * Record a title visit into localStorage history (capped at 30)
 */
export function recordHistory(item: MediaItem) {
  if (typeof window === 'undefined') return;
  try {
    const key = 'chalachitra:history';
    const raw = localStorage.getItem(key);
    let history: {
      id: string | number;
      type: MediaType;
      title: string;
      genre_ids?: number[];
      timestamp: number;
    }[] = raw ? JSON.parse(raw) : [];

    history = history.filter(
      (h) => !(String(h.id) === String(item.id) && h.type === item.media_type)
    );

    let genre_ids = item.genre_ids || [];
    if ((!genre_ids || genre_ids.length === 0) && item.genres) {
      genre_ids = item.genres.map((g) => g.id);
    }

    history.unshift({
      id: item.id,
      type: item.media_type,
      title: item.title,
      genre_ids,
      timestamp: Date.now(),
    });

    if (history.length > 30) {
      history = history.slice(0, 30);
    }

    localStorage.setItem(key, JSON.stringify(history));
  } catch {
    // ignore
  }
}

/**
 * Mark a title as watched in localStorage
 */
export function recordWatched(id: string | number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`chalachitra:watched:${id}`, 'true');
  } catch {
    // ignore
  }
}

/**
 * Read user interaction history from localStorage and count genre frequencies
 */
export function getUserGenreFrequencies(): {
  genreCounts: GenreCount[];
  topGenres: GenreCount[];
  excludedIds: Set<string>;
} {
  const genreFrequencyMap = new Map<number, number>();
  const excludedIds = new Set<string>();

  if (typeof window === 'undefined') {
    return {
      genreCounts: [],
      topGenres: DEFAULT_GENRES.map((id) => ({
        id,
        name: TMDB_GENRES[id] || 'General',
        count: 0,
      })),
      excludedIds,
    };
  }

  // Helper to count genres for an item
  const countItemGenres = (genreIds?: number[], fallbackId?: string | number) => {
    let ids = genreIds;
    if (!ids || ids.length === 0) {
      const match = MOCK_MEDIA_ITEMS.find((m) => String(m.id) === String(fallbackId));
      if (match?.genre_ids) {
        ids = match.genre_ids;
      }
    }
    if (ids && Array.isArray(ids)) {
      ids.forEach((gId) => {
        if (TMDB_GENRES[gId]) {
          genreFrequencyMap.set(gId, (genreFrequencyMap.get(gId) || 0) + 1);
        }
      });
    }
  };

  // 1. Read chalachitra:watchlist
  try {
    const rawWatchlist = localStorage.getItem('chalachitra:watchlist');
    if (rawWatchlist) {
      const parsed = JSON.parse(rawWatchlist);
      const items = parsed.state?.items || {};
      Object.values(items).forEach((w: any) => {
        excludedIds.add(String(w.id));
        countItemGenres(w.genre_ids, w.id);
      });
    }
  } catch (err) {
    console.warn('Error reading watchlist:', err);
  }

  // 2. Read watched titles (chalachitra:watched:* and continueWatching completed)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chalachitra:watched:')) {
        const id = key.replace('chalachitra:watched:', '');
        if (id) {
          excludedIds.add(String(id));
          countItemGenres(undefined, id);
        }
      }
    }

    const rawUI = localStorage.getItem('chalachitra:ui');
    if (rawUI) {
      const parsed = JSON.parse(rawUI);
      const cw = parsed.state?.continueWatching || [];
      cw.forEach((c: any) => {
        if (c.progress >= 95) {
          excludedIds.add(String(c.id));
        }
        countItemGenres(c.genre_ids, c.id);
      });
    }
  } catch (err) {
    console.warn('Error reading watched items:', err);
  }

  // 3. Read chalachitra:history (last 30 titles opened)
  try {
    const rawHistory = localStorage.getItem('chalachitra:history');
    if (rawHistory) {
      const historyList: {
        id: string | number;
        type: MediaType;
        title: string;
        genre_ids?: number[];
        timestamp: number;
      }[] = JSON.parse(rawHistory);

      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      historyList.slice(0, 30).forEach((h) => {
        // Exclude titles opened in last 7 days
        if (h.timestamp && h.timestamp > sevenDaysAgo) {
          excludedIds.add(String(h.id));
        }
        countItemGenres(h.genre_ids, h.id);
      });
    }
  } catch (err) {
    console.warn('Error reading history:', err);
  }

  // Sort genres by frequency
  const genreCounts: GenreCount[] = Array.from(genreFrequencyMap.entries())
    .map(([id, count]) => ({
      id,
      name: TMDB_GENRES[id] || `Genre ${id}`,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  // Pick top 3 genres, or backfill with defaults
  const topGenres: GenreCount[] = [...genreCounts.slice(0, 3)];
  for (const defId of DEFAULT_GENRES) {
    if (topGenres.length >= 3) break;
    if (!topGenres.some((g) => g.id === defId)) {
      topGenres.push({
        id: defId,
        name: TMDB_GENRES[defId],
        count: 0,
      });
    }
  }

  return {
    genreCounts,
    topGenres,
    excludedIds,
  };
}

/**
 * Fetch candidate titles for a given genre from TMDB
 * Limit to 20 per genre (combines up to 10 movies and 10 tv shows)
 */
async function fetchCandidatesForGenre(
  genreId: number,
  signal?: AbortSignal
): Promise<MediaItem[]> {
  const items: MediaItem[] = [];

  try {
    // 1. Fetch movies: /discover/movie?with_genres={genreId}&sort_by=vote_average.desc&vote_count.gte=500
    const movieUrl = new URL(`${TMDB_BASE_URL}/discover/movie`);
    movieUrl.searchParams.set('api_key', TMDB_API_KEY);
    movieUrl.searchParams.set('with_genres', String(genreId));
    movieUrl.searchParams.set('sort_by', 'vote_average.desc');
    movieUrl.searchParams.set('vote_count.gte', '500');
    movieUrl.searchParams.set('language', 'en-US');
    movieUrl.searchParams.set('page', '1');

    // 2. Fetch tv shows: /discover/tv?with_genres={genreId}&sort_by=vote_average.desc&vote_count.gte=200
    const tvUrl = new URL(`${TMDB_BASE_URL}/discover/tv`);
    tvUrl.searchParams.set('api_key', TMDB_API_KEY);
    tvUrl.searchParams.set('with_genres', String(genreId));
    tvUrl.searchParams.set('sort_by', 'vote_average.desc');
    tvUrl.searchParams.set('vote_count.gte', '200');
    tvUrl.searchParams.set('language', 'en-US');
    tvUrl.searchParams.set('page', '1');

    const [movieRes, tvRes] = await Promise.allSettled([
      fetch(movieUrl.toString(), { signal }),
      fetch(tvUrl.toString(), { signal }),
    ]);

    if (movieRes.status === 'fulfilled' && movieRes.value.ok) {
      const data = await movieRes.value.json();
      if (Array.isArray(data.results)) {
        data.results.slice(0, 10).forEach((m: any) => {
          items.push({
            id: m.id,
            media_type: 'movie',
            title: m.title || m.original_title || 'Untitled',
            overview: m.overview || '',
            poster_path: m.poster_path,
            backdrop_path: m.backdrop_path,
            vote_average: m.vote_average || 0,
            release_date: m.release_date,
            genre_ids: m.genre_ids || [genreId],
            popularity: m.popularity || 0,
          });
        });
      }
    }

    if (tvRes.status === 'fulfilled' && tvRes.value.ok) {
      const data = await tvRes.value.json();
      if (Array.isArray(data.results)) {
        data.results.slice(0, 10).forEach((t: any) => {
          items.push({
            id: t.id,
            media_type: 'tv',
            title: t.name || t.original_name || 'Untitled',
            overview: t.overview || '',
            poster_path: t.poster_path,
            backdrop_path: t.backdrop_path,
            vote_average: t.vote_average || 0,
            first_air_date: t.first_air_date,
            genre_ids: t.genre_ids || [genreId],
            popularity: t.popularity || 0,
          });
        });
      }
    }
  } catch (err) {
    console.warn(`Error discovering titles for genre ${genreId}:`, err);
  }

  // Fallback to local mock data if fetch returned few or no items
  if (items.length < 5) {
    const localMatches = MOCK_MEDIA_ITEMS.filter((m) =>
      m.genre_ids?.includes(genreId)
    );
    localMatches.forEach((m) => {
      if (!items.some((existing) => String(existing.id) === String(m.id))) {
        items.push(m);
      }
    });
  }

  return items.slice(0, 20);
}

export interface RecommendationOptions {
  type?: 'all' | 'movie' | 'tv';
  selectedGenreId?: number;
  sourceItem?: MediaItem | null;
  limit?: number;
}

/**
 * Generate pure genre-based recommendations:
 * 1. Read user history (watchlist, watched, history)
 * 2. Count genre frequency
 * 3. Pick top 3 genres
 * 4. Fetch candidates per genre (up to 20 each)
 * 5. Merge and dedupe by id
 * 6. Remove excluded titles (in watchlist, watched, or opened in last 7 days)
 * 7. Sort by vote_average desc, then popularity desc
 * 8. Return top 40 (or specified limit)
 */
export async function getRecommendations(
  options: RecommendationOptions = {},
  signal?: AbortSignal
): Promise<MediaItem[]> {
  const { type = 'all', selectedGenreId, sourceItem, limit = 40 } = options;

  const { topGenres, excludedIds } = getUserGenreFrequencies();

  // If a sourceItem is specified (e.g. from Watch page), prioritize its genres
  let genresToFetch: number[] = [];

  if (selectedGenreId) {
    genresToFetch = [selectedGenreId];
  } else if (sourceItem) {
    let sourceGenreIds = sourceItem.genre_ids || [];
    if (sourceGenreIds.length === 0 && sourceItem.genres) {
      sourceGenreIds = sourceItem.genres.map((g) => g.id);
    }
    if (sourceGenreIds.length > 0) {
      genresToFetch = sourceGenreIds.slice(0, 3);
    } else {
      genresToFetch = topGenres.map((g) => g.id);
    }
    // Also exclude the sourceItem itself
    excludedIds.add(String(sourceItem.id));
  } else {
    genresToFetch = topGenres.map((g) => g.id);
  }

  if (genresToFetch.length === 0) {
    genresToFetch = DEFAULT_GENRES;
  }

  // Fetch candidates per genre (up to 20 per genre)
  const candidateLists = await Promise.all(
    genresToFetch.map((gId) => fetchCandidatesForGenre(gId, signal))
  );

  // Merge candidates and dedupe by id
  const candidateMap = new Map<string, MediaItem>();
  candidateLists.flat().forEach((item) => {
    const key = `${item.media_type}-${item.id}`;
    if (!candidateMap.has(key)) {
      candidateMap.set(key, item);
    }
  });

  // Filter candidates:
  let filtered = Array.from(candidateMap.values());

  // Filter by media type if requested
  if (type !== 'all') {
    filtered = filtered.filter((item) => item.media_type === type);
  }

  // Remove titles in watchlist, watched history, or opened in last 7 days
  filtered = filtered.filter((item) => !excludedIds.has(String(item.id)));

  // If exclusions left too few results, re-include some candidates rather than returning empty
  if (filtered.length < 6) {
    filtered = Array.from(candidateMap.values());
    if (type !== 'all') {
      filtered = filtered.filter((item) => item.media_type === type);
    }
    if (sourceItem) {
      filtered = filtered.filter((item) => String(item.id) !== String(sourceItem.id));
    }
  }

  // Sort by vote_average desc, then by popularity desc
  filtered.sort((a, b) => {
    const diff = (b.vote_average || 0) - (a.vote_average || 0);
    if (Math.abs(diff) > 0.05) {
      return diff;
    }
    return (b.popularity || 0) - (a.popularity || 0);
  });

  return filtered.slice(0, limit);
}
