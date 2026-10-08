import { useQuery } from '@tanstack/react-query';
import { TMDB_API_KEY, TMDB_BASE_URL, getImageUrl } from '../lib/api';
import { Episode, Season } from '../types';

export interface SeasonDetails {
  id: number;
  _id?: string;
  name: string;
  overview: string;
  season_number: number;
  poster_path: string | null;
  air_date: string;
  episodes: Episode[];
}

export async function getSeasonDetails(
  tvId: string | number,
  seasonNumber: number,
  signal?: AbortSignal
): Promise<SeasonDetails> {
  const url = new URL(`${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'en-US');

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch season details: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

export function useSeasonDetails(tvId: string | number | null | undefined, seasonNumber: number) {
  return useQuery<SeasonDetails>({
    queryKey: ['tv-season', tvId, seasonNumber],
    queryFn: ({ signal }) => getSeasonDetails(tvId!, seasonNumber, signal),
    enabled: Boolean(tvId && seasonNumber !== undefined && seasonNumber !== null),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
