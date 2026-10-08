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
    name: 'IMDb.su',
    movie: (id) => `https://player.imdb.su/embed/movie/${id}`,
    tv: (id, s, e) => `https://player.imdb.su/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidlink',
    name: 'VidLink',
    movie: (id) => `https://vidlink.pro/movie/${id}`,
    tv: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidsrcpm',
    name: 'VidSrc.pm',
    movie: (id) => `https://vidsrc.pm/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.pm/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: '2embed',
    name: '2Embed',
    movie: (id) => `https://2embed.skin/movie/${id}`,
    tv: (id, s, e) => `https://2embed.skin/tv/${id}/${s}/${e}`,
  },
  {
    id: 'autoembed',
    name: 'AutoEmbed',
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

