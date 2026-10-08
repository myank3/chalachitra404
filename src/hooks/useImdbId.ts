import { useState, useEffect } from 'react';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/api';
import { MOCK_MEDIA_ITEMS } from '../data/mockData';

export function useImdbId(
  tmdbId: string | number | null,
  type: 'movie' | 'tv' = 'movie',
  initialImdbId?: string
) {
  const getInitialId = (): string | null => {
    if (initialImdbId && String(initialImdbId).startsWith('tt')) {
      return initialImdbId;
    }
    if (typeof tmdbId === 'string' && tmdbId.startsWith('tt')) {
      return tmdbId;
    }
    if (tmdbId) {
      const mockItem = MOCK_MEDIA_ITEMS.find((m) => String(m.id) === String(tmdbId));
      if (mockItem?.imdb_id) {
        return mockItem.imdb_id;
      }
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(`chalachitra:imdb:${type}:${tmdbId}`);
          if (cached) return cached;
        } catch {
          // ignore
        }
      }
    }
    return null;
  };

  const [imdbId, setImdbId] = useState<string | null>(getInitialId);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tmdbId) {
      setImdbId(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (initialImdbId && String(initialImdbId).startsWith('tt')) {
      setImdbId(initialImdbId);
      setLoading(false);
      return;
    }

    if (typeof tmdbId === 'string' && tmdbId.startsWith('tt')) {
      setImdbId(tmdbId);
      setLoading(false);
      return;
    }

    // Check mock data
    const mockItem = MOCK_MEDIA_ITEMS.find((m) => String(m.id) === String(tmdbId));
    if (mockItem?.imdb_id) {
      setImdbId(mockItem.imdb_id);
      setLoading(false);
      return;
    }

    // Check localStorage cache
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`chalachitra:imdb:${type}:${tmdbId}`);
        if (cached && cached.startsWith('tt')) {
          setImdbId(cached);
          setLoading(false);
          return;
        }
      } catch {
        // ignore
      }
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const controller = new AbortController();

    const fetchExternalIds = async () => {
      try {
        const url = `${TMDB_BASE_URL}/${type}/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Failed to resolve external IDs: ${res.status}`);
        }
        const data = await res.json();
        const resolvedImdb = data.imdb_id;

        if (isMounted) {
          if (resolvedImdb && typeof resolvedImdb === 'string') {
            setImdbId(resolvedImdb);
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem(
                  `chalachitra:imdb:${type}:${tmdbId}`,
                  resolvedImdb
                );
              } catch {
                // ignore
              }
            }
          } else {
            setImdbId(null);
          }
          setLoading(false);
        }
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        if (isMounted) {
          setError((err as Error).message);
          setImdbId(null);
          setLoading(false);
        }
      }
    };

    fetchExternalIds();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [tmdbId, type, initialImdbId]);

  return { imdbId, loading, error };
}
