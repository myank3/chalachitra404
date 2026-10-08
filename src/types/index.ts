export type MediaType = 'movie' | 'tv';

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface VideoItem {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official?: boolean;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date: string;
  vote_average: number;
  runtime?: number;
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
  episodes?: Episode[];
}

export interface MediaItem {
  id: number | string;
  title: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count?: number;
  popularity?: number;
  release_date?: string;
  first_air_date?: string;
  media_type: MediaType;
  genre_ids?: number[];
  genres?: Genre[];
  tagline?: string;
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: Season[];
  imdb_id?: string;
  accent_color?: string;
  credits?: {
    cast: CastMember[];
  };
  videos?: {
    results: VideoItem[];
  };
}

export interface ContinueWatchingItem {
  id: number | string;
  type: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  progress: number; // 0 - 100%
  season?: number;
  episode?: number;
  lastWatchedAt: number;
  overview?: string;
}
