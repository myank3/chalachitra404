import { useQuery } from '@tanstack/react-query';
import { MediaItem, MediaType } from '../types';
import { MOCK_MEDIA_ITEMS } from '../data/mockData';

export const TMDB_API_KEY = '4885ba83e8fcc37c495a2e71ece8366d';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/';

export interface Genre {
  id: number;
  name: string;
}

export const getImageUrl = (
  path: string | null | undefined,
  size: 'w300' | 'w500' | 'w780' | 'w1280' | 'original' = 'w780'
): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}${size}${path}`;
};

export const getEmbedUrl = (
  type: MediaType,
  imdbOrTmdbId: string | number,
  season = 1,
  episode = 1
): string => {
  if (type === 'movie') {
    return `https://embed.su/embed/movie/${imdbOrTmdbId}`;
  }
  return `https://embed.su/embed/tv/${imdbOrTmdbId}/${season}/${episode}`;
};

async function fetchTMDB<T>(
  endpoint: string,
  params: Record<string, string | number | boolean | undefined> = {},
  signal?: AbortSignal
): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'en-US');

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) {
      url.searchParams.set(k, String(v));
    }
  });

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    throw new Error(`TMDB error: ${response.status}`);
  }
  return response.json();
}

/* ------------------------------------------------------------------
   GENRES — real TMDB endpoints. These are the only IDs that
   /discover/movie and /discover/tv actually understand.
   ------------------------------------------------------------------ */
export async function getMovieGenres(signal?: AbortSignal): Promise<Genre[]> {
  const data = await fetchTMDB<{ genres: Genre[] }>('/genre/movie/list', {}, signal);
  return data.genres;
}

export async function getTVGenres(signal?: AbortSignal): Promise<Genre[]> {
  const data = await fetchTMDB<{ genres: Genre[] }>('/genre/tv/list', {}, signal);
  return data.genres;
}

export function useMovieGenres() {
  return useQuery({
    queryKey: ['genres', 'movie'],
    queryFn: ({ signal }) => getMovieGenres(signal),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useTVGenres() {
  return useQuery({
    queryKey: ['genres', 'tv'],
    queryFn: ({ signal }) => getTVGenres(signal),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

/* ------------------------------------------------------------------
   LISTS
   ------------------------------------------------------------------ */
export async function getTrending(signal?: AbortSignal): Promise<MediaItem[]> {
  try {
    const data = await fetchTMDB<{ results: MediaItem[] }>('/trending/all/week', {}, signal);
    return data.results.map((item) => ({
      ...item,
      media_type: item.media_type || (item.title ? 'movie' : 'tv'),
      title: item.title || item.name || 'Untitled',
    }));
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') throw error;
    console.warn('Using mock data for trending:', error);
    return MOCK_MEDIA_ITEMS.slice(0, 15);
  }
}

export async function getPopularMovies(signal?: AbortSignal): Promise<MediaItem[]> {
  try {
    const data = await fetchTMDB<{ results: MediaItem[] }>('/movie/popular', {}, signal);
    return data.results.map((item) => ({
      ...item,
      media_type: 'movie' as const,
      title: item.title || 'Untitled',
    }));
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') throw error;
    console.warn('Using mock data for movies:', error);
    return MOCK_MEDIA_ITEMS.filter((m) => m.media_type === 'movie').slice(0, 15);
  }
}

export async function getTopRatedTV(signal?: AbortSignal): Promise<MediaItem[]> {
  try {
    const data = await fetchTMDB<{ results: MediaItem[] }>('/tv/top_rated', {}, signal);
    return data.results.map((item) => ({
      ...item,
      media_type: 'tv' as const,
      title: item.name || item.title || 'Untitled',
    }));
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') throw error;
    console.warn('Using mock data for top rated TV:', error);
    return MOCK_MEDIA_ITEMS.filter((m) => m.media_type === 'tv').slice(0, 15);
  }
}

/* ------------------------------------------------------------------
   DISCOVER — genre-driven, uses real TMDB genre IDs
   ------------------------------------------------------------------ */
export async function getDiscoverMovies(
  params: {
    page?: number;
    with_genres?: number | string;
    primary_release_year?: number | string;
    'vote_average.gte'?: number;
    'vote_count.gte'?: number;
    sort_by?: string;
  } = {},
  signal?: AbortSignal
): Promise<{ results: MediaItem[]; page: number; total_pages: number }> {
  try {
    const data = await fetchTMDB<{ results: MediaItem[]; page: number; total_pages: number }>(
      '/discover/movie',
      {
        include_adult: false,
        include_video: false,
        ...params,
      },
      signal
    );
    return {
      ...data,
      results: data.results.map((item) => ({
        ...item,
        media_type: 'movie',
        title: item.title || 'Untitled',
      })),
    };
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') throw error;
    console.warn('Discover movies failed:', error);
    return { results: [], page: 1, total_pages: 0 };
  }
}

export async function getDiscoverTV(
  params: {
    page?: number;
    with_genres?: number | string;
    first_air_date_year?: number | string;
    'vote_average.gte'?: number;
    'vote_count.gte'?: number;
    sort_by?: string;
  } = {},
  signal?: AbortSignal
): Promise<{ results: MediaItem[]; page: number; total_pages: number }> {
  try {
    const data = await fetchTMDB<{ results: MediaItem[]; page: number; total_pages: number }>(
      '/discover/tv',
      {
        include_adult: false,
        ...params,
      },
      signal
    );
    return {
      ...data,
      results: data.results.map((item) => ({
        ...item,
        media_type: 'tv',
        title: item.name || item.title || 'Untitled',
      })),
    };
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') throw error;
    console.warn('Discover TV failed:', error);
    return { results: [], page: 1, total_pages: 0 };
  }
}

/* ------------------------------------------------------------------
   SEARCH
   ------------------------------------------------------------------ */
export async function searchAll(query: string, signal?: AbortSignal): Promise<MediaItem[]> {
  if (!query.trim()) return [];
  try {
    const data = await fetchTMDB<{ results: MediaItem[] }>(
      '/search/multi',
      { query: query.trim(), include_adult: false },
      signal
    );
    return data.results
      .filter((i) => i.media_type === 'movie' || i.media_type === 'tv')
      .map((item) => ({
        ...item,
        title: item.title || item.name || 'Untitled',
      }));
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') throw error;
    console.warn('Search failed:', error);
    return [];
  }
}

/* ------------------------------------------------------------------
   DETAILS
   ------------------------------------------------------------------ */
export async function getDetails(
  type: MediaType,
  id: string | number,
  signal?: AbortSignal
): Promise<MediaItem> {
  try {
    const data = await fetchTMDB<MediaItem>(
      `/${type}/${id}`,
      { append_to_response: 'credits,videos,similar,external_ids' },
      signal
    );

    const ext = (data as unknown as { external_ids?: { imdb_id?: string } }).external_ids;
    return {
      ...data,
      media_type: type,
      title: data.title || data.name || 'Untitled',
      imdb_id: data.imdb_id || ext?.imdb_id,
    };
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') throw error;
    console.warn('Details failed for id:', id, error);
    const found = MOCK_MEDIA_ITEMS.find((m) => String(m.id) === String(id));
    if (found) return found;
    return {
      id,
      title: 'Cinematic Feature',
      overview: 'High fidelity spatial entertainment experience.',
      poster_path: null,
      backdrop_path: null,
      vote_average: 8.4,
      media_type: type,
    };
  }
}

export async function getSimilar(
  type: MediaType,
  id: string | number,
  signal?: AbortSignal
): Promise<MediaItem[]> {
  try {
    const data = await fetchTMDB<{ results: MediaItem[] }>(`/${type}/${id}/similar`, {}, signal);
    return data.results.map((item) => ({
      ...item,
      media_type: type,
      title: item.title || item.name || 'Untitled',
    }));
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') throw error;
    return MOCK_MEDIA_ITEMS.filter((m) => m.media_type === type && String(m.id) !== String(id)).slice(0, 8);
  }
}

/* ------------------------------------------------------------------
   TANSTACK QUERY HOOKS
   ------------------------------------------------------------------ */
export function useTrending() {
  return useQuery({
    queryKey: ['trending'],
    queryFn: ({ signal }) => getTrending(signal),
    staleTime: 1000 * 60 * 10,
  });
}

export function usePopularMovies() {
  return useQuery({
    queryKey: ['popular-movies'],
    queryFn: ({ signal }) => getPopularMovies(signal),
    staleTime: 1000 * 60 * 10,
  });
}

export function useTopRatedTV() {
  return useQuery({
    queryKey: ['top-rated-tv'],
    queryFn: ({ signal }) => getTopRatedTV(signal),
    staleTime: 1000 * 60 * 10,
  });
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: ({ signal }) => searchAll(query, signal),
    enabled: Boolean(query.trim()),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });
}

export function useDetails(type: MediaType, id: string | number | null) {
  return useQuery({
    queryKey: ['details', type, id],
    queryFn: ({ signal }) => (id ? getDetails(type, id, signal) : null),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 15,
  });
}

export function useSimilar(type: MediaType, id: string | number | null) {
  return useQuery({
    queryKey: ['similar', type, id],
    queryFn: ({ signal }) => (id ? getSimilar(type, id, signal) : []),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 15,
  });
}