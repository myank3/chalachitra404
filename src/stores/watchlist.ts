import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';

export type MediaType = 'movie' | 'tv';

export interface WatchlistItem {
  id: number | string;
  type: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath?: string | null;
  year: string;
  rating: number;
  addedAt: number;
  overview?: string;
}

export interface HistoryItem {
  id: number | string;
  type: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath?: string | null;
  year: string;
  rating: number;
  overview?: string;
  season?: number;
  episode?: number;
  progress?: number; // 0..1
  watchedAt: number;
}

interface WatchlistState {
  /* Watchlist */
  items: Record<string, WatchlistItem>;
  add: (item: Omit<WatchlistItem, 'addedAt'>) => void;
  remove: (id: number | string, type: MediaType) => void;
  toggle: (item: Omit<WatchlistItem, 'addedAt'>) => boolean;
  has: (id: number | string, type: MediaType) => boolean;
  clear: () => void;
  getAll: () => WatchlistItem[];

  /* History */
  history: Record<string, HistoryItem>;
  recordHistory: (item: Omit<HistoryItem, 'watchedAt'>) => void;
  removeHistory: (id: number | string, type: MediaType) => void;
  clearHistory: () => void;
  getHistory: () => HistoryItem[];
  hasWatched: (id: number | string, type: MediaType) => boolean;
}

const keyOf = (id: number | string, type: MediaType) => `${type}-${id}`;

const buzz = () => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate?.(10);
    } catch {
      /* ignore */
    }
  }
};

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useWatchlist = create<WatchlistState>()(
  persist(
    (set, get) => ({
      /* ---------- Watchlist ---------- */
      items: {},

      has: (id, type) => Boolean(get().items[keyOf(id, type)]),

      add: (item) => {
        const key = keyOf(item.id, item.type);
        if (get().items[key]) return;

        const fullItem: WatchlistItem = { ...item, addedAt: Date.now() };
        set((state) => ({ items: { ...state.items, [key]: fullItem } }));

        buzz();
        toast.success(`Added "${item.title}" to My List`);
      },

      remove: (id, type) => {
        const key = keyOf(id, type);
        const existing = get().items[key];
        if (!existing) return;

        set((state) => {
          const next = { ...state.items };
          delete next[key];
          return { items: next };
        });

        buzz();
        toast.info(`Removed "${existing.title}" from My List`);
      },

      toggle: (item) => {
        const key = keyOf(item.id, item.type);
        const exists = Boolean(get().items[key]);
        if (exists) {
          get().remove(item.id, item.type);
          return false;
        }
        get().add(item);
        return true;
      },

      clear: () => {
        set({ items: {} });
        toast.info('My List has been cleared');
      },

      getAll: () =>
        Object.values(get().items).sort((a, b) => b.addedAt - a.addedAt),

      /* ---------- History ---------- */
      history: {},

      recordHistory: (item) => {
        const key = keyOf(item.id, item.type);
        set((state) => ({
          history: {
            ...state.history,
            [key]: { ...item, watchedAt: Date.now() },
          },
        }));
      },

      removeHistory: (id, type) => {
        const key = keyOf(id, type);
        if (!get().history[key]) return;
        set((state) => {
          const next = { ...state.history };
          delete next[key];
          return { history: next };
        });
      },

      clearHistory: () => {
        set({ history: {} });
        toast.info('Watch history cleared');
      },

      getHistory: () =>
        Object.values(get().history).sort((a, b) => b.watchedAt - a.watchedAt),

      hasWatched: (id, type) => Boolean(get().history[keyOf(id, type)]),
    }),
    {
      name: 'chalachitra:watchlist',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : noopStorage
      ),
      version: 1,
    }
  )
);