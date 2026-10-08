export type MediaType = 'movie' | 'tv';

export interface Provider {
  id: string;
  name: string;
  movie: (imdbId: string) => string;
  tv: (imdbId: string, season: number, episode: number) => string;
}

export const PROVIDERS: Provider[] = [
  {
    id: 'imdbsu',
    name: 'Server 1',
    movie: (id) => `https://player.imdb.su/embed/movie/${id}`,
    tv: (id, s, e) => `https://player.imdb.su/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidlink',
    name: 'Server 2',
    movie: (id) => `https://vidlink.pro/movie/${id}`,
    tv: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidsrcpm',
    name: 'Server 3',
    movie: (id) => `https://vidsrc.pm/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.pm/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'autoembed',
    name: 'Server 4',
    movie: (id) => `https://autoembed.co/movie/${id}`,
    tv: (id, s, e) => `https://autoembed.co/tv/${id}-${s}-${e}`,
  },
];

export function buildEmbedUrl(
  provider: Provider,
  type: MediaType,
  imdbId: string,
  season: number = 1,
  episode: number = 1
): string {
  return type === 'movie'
    ? provider.movie(imdbId)
    : provider.tv(imdbId, season, episode);
}

export function getEmbedUrl(
  providerId: string,
  type: MediaType,
  imdbId: string,
  season: number = 1,
  episode: number = 1
): string {
  const provider = PROVIDERS.find((p) => p.id === providerId) || PROVIDERS[0];
  return buildEmbedUrl(provider, type, imdbId, season, episode);
}