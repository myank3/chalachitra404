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

interface WatchlistState {
  items: Record<string, WatchlistItem>;
  add: (item: Omit<WatchlistItem, 'addedAt'>) => void;
  remove: (id: number | string, type: MediaType) => void;
  toggle: (item: Omit<WatchlistItem, 'addedAt'>) => boolean;
  has: (id: number | string, type: MediaType) => boolean;
  clear: () => void;
  getAll: () => WatchlistItem[];
}

export const useWatchlist = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: {},

      has: (id: number | string, type: MediaType) => {
        const key = `${type}-${id}`;
        return Boolean(get().items[key]);
      },

      add: (item) => {
        const key = `${item.type}-${item.id}`;
        if (get().items[key]) return; // Idempotent check

        const fullItem: WatchlistItem = {
          ...item,
          addedAt: Date.now(),
        };

        set((state) => ({
          items: {
            ...state.items,
            [key]: fullItem,
          },
        }));

        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate?.(10);
          } catch {
            // ignore
          }
        }

        toast.success(`Added "${item.title}" to My List`);
      },

      remove: (id: number | string, type: MediaType) => {
        const key = `${type}-${id}`;
        const existing = get().items[key];
        if (!existing) return;

        set((state) => {
          const nextItems = { ...state.items };
          delete nextItems[key];
          return { items: nextItems };
        });

        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate?.(10);
          } catch {
            // ignore
          }
        }

        toast.info(`Removed "${existing.title}" from My List`);
      },

      toggle: (item) => {
        const key = `${item.type}-${item.id}`;
        const exists = Boolean(get().items[key]);

        if (exists) {
          get().remove(item.id, item.type);
          return false;
        } else {
          get().add(item);
          return true;
        }
      },

      clear: () => {
        set({ items: {} });
        toast.info('My List has been cleared');
      },

      getAll: () => {
        return Object.values(get().items).sort((a, b) => b.addedAt - a.addedAt);
      },
    }),
    {
      name: 'chalachitra:watchlist',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
    }
  )
);
