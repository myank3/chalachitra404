import { MediaItem, MediaType } from '../types';
import { TMDB_API_KEY, TMDB_BASE_URL } from './api';

/* ------------------------------------------------------------------
   GENRE MAP
   ------------------------------------------------------------------ */
export const TMDB_GENRES: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News',
  10764: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap',
  10767: 'Talk', 10768: 'War & Politics',
};

export const DEFAULT_GENRES = [28, 18, 878];

export interface GenreCount {
  id: number;
  name: string;
  count: number;
}

/* ------------------------------------------------------------------
   INTERACTION STORAGE
   ------------------------------------------------------------------ */

interface HistoryEntry {
  id: string | number;
  type: MediaType;
  title: string;
  genre_ids?: number[];
  timestamp: number;
}

const HISTORY_KEY = 'chalachitra:history';

/** Record a title visit into localStorage history (capped at 50) */
export function recordHistory(item: MediaItem) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    let history: HistoryEntry[] = raw ? JSON.parse(raw) : [];

    history = history.filter(
      (h) => !(String(h.id) === String(item.id) && h.type === item.media_type)
    );

    let genre_ids = item.genre_ids || [];
    if (genre_ids.length === 0 && item.genres) {
      genre_ids = item.genres.map((g) => g.id);
    }

    history.unshift({
      id: item.id,
      type: item.media_type,
      title: item.title,
      genre_ids,
      timestamp: Date.now(),
    });

    if (history.length > 50) history = history.slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {}
}

/** Mark a title as watched */
export function recordWatched(id: string | number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`chalachitra:watched:${id}`, 'true');
  } catch {}
}

/** Read the raw interaction list — used as seeds for /recommendations */
function readSeeds(): { id: string; type: MediaType; weight: number }[] {
  const seeds: { id: string; type: MediaType; weight: number }[] = [];
  if (typeof window === 'undefined') return seeds;

  const push = (id: string | number, type: MediaType, weight: number) => {
    const s = String(id);
    if (!seeds.some((x) => x.id === s)) {
      seeds.push({ id: s, type, weight });
    }
  };

  // 1. History (most recent 10, highest weight)
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const history: HistoryEntry[] = JSON.parse(raw);
      history.slice(0, 10).forEach((h, i) => {
        push(h.id, h.type, 3 - i * 0.1); // recent = heavier
      });
    }
  } catch {}

  // 2. Watchlist
  try {
    const raw = localStorage.getItem('chalachitra:watchlist');
    if (raw) {
      const parsed = JSON.parse(raw);
      const items = parsed.state?.items || {};
      Object.values(items).forEach((w: any) => {
        push(w.id, w.type || 'movie', 2.5);
      });
    }
  } catch {}

  // 3. Continue watching
  try {
    const rawUI = localStorage.getItem('chalachitra:ui');
    if (rawUI) {
      const parsed = JSON.parse(rawUI);
      const cw = parsed.state?.continueWatching || [];
      cw.forEach((c: any) => {
        push(c.id, c.type || 'movie', 2);
      });
    }
  } catch {}

  return seeds;
}

/** Excluded: already in watchlist, watched, or opened in last 7 days */
function getExcludedIds(): Set<string> {
  const excluded = new Set<string>();
  if (typeof window === 'undefined') return excluded;

  try {
    const raw = localStorage.getItem('chalachitra:watchlist');
    if (raw) {
      const parsed = JSON.parse(raw);
      const items = parsed.state?.items || {};
      Object.values(items).forEach((w: any) => excluded.add(String(w.id)));
    }
  } catch {}

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('chalachitra:watched:')) {
        excluded.add(key.replace('chalachitra:watched:', ''));
      }
    }
  } catch {}

  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const history: HistoryEntry[] = JSON.parse(raw);
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      history.forEach((h) => {
        if (h.timestamp > sevenDaysAgo) excluded.add(String(h.id));
      });
    }
  } catch {}

  return excluded;
}

/** Genre frequencies — kept for the insight card on the page */
export function getUserGenreFrequencies(): {
  genreCounts: GenreCount[];
  topGenres: GenreCount[];
  excludedIds: Set<string>;
} {
  const freqMap = new Map<number, number>();

  if (typeof window === 'undefined') {
    return {
      genreCounts: [],
      topGenres: DEFAULT_GENRES.map((id) => ({
        id,
        name: TMDB_GENRES[id] || 'General',
        count: 0,
      })),
      excludedIds: new Set(),
    };
  }

  const count = (ids?: number[]) => {
    if (!ids) return;
    ids.forEach((id) => {
      if (TMDB_GENRES[id]) freqMap.set(id, (freqMap.get(id) || 0) + 1);
    });
  };

  try {
    const raw = localStorage.getItem('chalachitra:watchlist');
    if (raw) {
      const parsed = JSON.parse(raw);
      const items = parsed.state?.items || {};
      Object.values(items).forEach((w: any) => count(w.genre_ids));
    }
  } catch {}

  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const history: HistoryEntry[] = JSON.parse(raw);
      history.slice(0, 30).forEach((h) => count(h.genre_ids));
    }
  } catch {}

  const genreCounts: GenreCount[] = Array.from(freqMap.entries())
    .map(([id, count]) => ({
      id,
      name: TMDB_GENRES[id] || `Genre ${id}`,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const topGenres: GenreCount[] = [...genreCounts.slice(0, 3)];
  for (const def of DEFAULT_GENRES) {
    if (topGenres.length >= 3) break;
    if (!topGenres.some((g) => g.id === def)) {
      topGenres.push({ id: def, name: TMDB_GENRES[def], count: 0 });
    }
  }

  return { genreCounts, topGenres, excludedIds: getExcludedIds() };
}

/* ------------------------------------------------------------------
   TMDB FETCHING — /recommendations seeded by user's real interactions
   ------------------------------------------------------------------ */

const inflight = new Map<string, Promise<MediaItem[]>>();

async function fetchRecommendationsForSeed(
  seedId: string,
  seedType: MediaType,
  signal?: AbortSignal
): Promise<MediaItem[]> {
  const cacheKey = `${seedType}:${seedId}`;
  if (inflight.has(cacheKey)) return inflight.get(cacheKey)!;

  const promise = (async () => {
    const url = new URL(`${TMDB_BASE_URL}/${seedType}/${seedId}/recommendations`);
    url.searchParams.set('api_key', TMDB_API_KEY);
    url.searchParams.set('language', 'en-US');
    url.searchParams.set('page', '1');

    try {
      const res = await fetch(url.toString(), { signal });
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data.results)) return [];

      return data.results.map((r: any) => ({
        id: r.id,
        media_type: r.media_type || seedType,
        title: r.title || r.name || 'Untitled',
        overview: r.overview || '',
        poster_path: r.poster_path,
        backdrop_path: r.backdrop_path,
        vote_average: r.vote_average || 0,
        vote_count: r.vote_count || 0,
        release_date: r.release_date,
        first_air_date: r.first_air_date,
        genre_ids: r.genre_ids || [],
        popularity: r.popularity || 0,
      })) as MediaItem[];
    } catch {
      return [];
    } finally {
      inflight.delete(cacheKey);
    }
  })();

  inflight.set(cacheKey, promise);
  return promise;
}

/**
 * Fallback for cold-start users with no interactions.
 * Uses trending + top-rated from TMDB instead of genre discover.
 */
async function fetchColdStart(signal?: AbortSignal): Promise<MediaItem[]> {
  const urls = [
    `${TMDB_BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}&language=en-US`,
    `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`,
    `${TMDB_BASE_URL}/tv/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`,
  ];

  const results = await Promise.allSettled(
    urls.map((u) => fetch(u, { signal }).then((r) => (r.ok ? r.json() : { results: [] })))
  );

  const items: MediaItem[] = [];
  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    for (const raw of r.value.results || []) {
      const type = raw.media_type || (raw.title ? 'movie' : 'tv');
      if (type !== 'movie' && type !== 'tv') continue;
      items.push({
        id: raw.id,
        media_type: type,
        title: raw.title || raw.name || 'Untitled',
        overview: raw.overview || '',
        poster_path: raw.poster_path,
        backdrop_path: raw.backdrop_path,
        vote_average: raw.vote_average || 0,
        vote_count: raw.vote_count || 0,
        release_date: raw.release_date,
        first_air_date: raw.first_air_date,
        genre_ids: raw.genre_ids || [],
        popularity: raw.popularity || 0,
      } as MediaItem);
    }
  }
  return items;
}

/* ------------------------------------------------------------------
   PUBLIC API
   ------------------------------------------------------------------ */

export interface RecommendationOptions {
  type?: 'all' | 'movie' | 'tv';
  selectedGenreId?: number;
  sourceItem?: MediaItem | null;
  limit?: number;
}

/**
 * Real recommender:
 *   1. Read user seeds (history + watchlist + continue-watching)
 *   2. For each seed, call TMDB's /recommendations endpoint
 *   3. Merge + score by how many seeds endorsed each candidate
 *   4. Blend in vote_average and popularity for tie-breaks
 *   5. Exclude watched / already-saved items
 *   6. Filter by type + genre if requested
 */
export async function getRecommendations(
  options: RecommendationOptions = {},
  signal?: AbortSignal
): Promise<MediaItem[]> {
  const { type = 'all', selectedGenreId, sourceItem, limit = 40 } = options;

  // Build seeds. If sourceItem given (Watch page context), use it as the only seed.
  let seeds: { id: string; type: MediaType; weight: number }[];

  if (sourceItem) {
    seeds = [{ id: String(sourceItem.id), type: sourceItem.media_type, weight: 1 }];
  } else {
    seeds = readSeeds().slice(0, 8); // cap to 8 seed fetches
  }

  const excluded = getExcludedIds();
  if (sourceItem) excluded.add(String(sourceItem.id));

  // Cold start — no seeds at all
  if (seeds.length === 0) {
    let items = await fetchColdStart(signal);
    if (type !== 'all') items = items.filter((i) => i.media_type === type);
    if (selectedGenreId) {
      items = items.filter((i) => i.genre_ids?.includes(selectedGenreId));
    }
    items = items.filter((i) => !excluded.has(String(i.id)));
    return items.slice(0, limit);
  }

  // Fan out: one TMDB request per seed
  const seedResults = await Promise.allSettled(
    seeds.map((s) => fetchRecommendationsForSeed(s.id, s.type, signal))
  );

  // Score by endorsement count + weighted popularity + rating
  const scoreMap = new Map<
    string,
    { item: MediaItem; endorseCount: number; seedWeightSum: number }
  >();

  seedResults.forEach((res, idx) => {
    if (res.status !== 'fulfilled') return;
    const seedWeight = seeds[idx].weight;

    res.value.forEach((item) => {
      const key = `${item.media_type}-${item.id}`;
      const existing = scoreMap.get(key);
      if (existing) {
        existing.endorseCount += 1;
        existing.seedWeightSum += seedWeight;
      } else {
        scoreMap.set(key, {
          item,
          endorseCount: 1,
          seedWeightSum: seedWeight,
        });
      }
    });
  });

  // Score = endorsement (dominant) + rating + popularity + recency
  const scored = Array.from(scoreMap.values()).map(({ item, endorseCount, seedWeightSum }) => {
    const endorsementScore = endorseCount * 10 + seedWeightSum * 2;
    const ratingScore = (item.vote_average ?? 0) * 0.8;
    const popularityScore = Math.log10((item.popularity ?? 0) + 1) * 1.5;
    const dateStr = (item as any).release_date || (item as any).first_air_date;
    const years = dateStr
      ? (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 365)
      : 20;
    const recencyScore = Math.max(0, 2 - years * 0.1);
    const voteConfidence = Math.log10((item.vote_count ?? 0) + 1);

    const total =
      endorsementScore +
      ratingScore +
      popularityScore +
      recencyScore +
      voteConfidence * 0.5;

    return { item, score: total };
  });

  scored.sort((a, b) => b.score - a.score);

  // Apply filters after ranking
  let filtered = scored.map((s) => s.item);
  if (type !== 'all') filtered = filtered.filter((i) => i.media_type === type);
  if (selectedGenreId) {
    filtered = filtered.filter((i) => i.genre_ids?.includes(selectedGenreId));
  }
  filtered = filtered.filter((i) => !excluded.has(String(i.id)));

  // If over-filtered, relax: drop the genre filter but keep type + exclusions
  if (filtered.length < 6 && selectedGenreId) {
    filtered = scored.map((s) => s.item);
    if (type !== 'all') filtered = filtered.filter((i) => i.media_type === type);
    filtered = filtered.filter((i) => !excluded.has(String(i.id)));
  }

  // If still too few, add cold-start results to fill
  if (filtered.length < 6) {
    const fill = await fetchColdStart(signal);
    for (const item of fill) {
      const key = String(item.id);
      if (excluded.has(key)) continue;
      if (type !== 'all' && item.media_type !== type) continue;
      if (!filtered.some((f) => String(f.id) === key)) {
        filtered.push(item);
      }
      if (filtered.length >= limit) break;
    }
  }

  return filtered.slice(0, limit);
}