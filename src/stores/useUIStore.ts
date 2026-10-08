import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ContinueWatchingItem, MediaType } from '../types';

export type NavTab = 'home' | 'movies' | 'tv' | 'genres' | 'recommend' | 'watchlist';

interface UIState {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  detailModal: {
    isOpen: boolean;
    id: string | number | null;
    type: MediaType;
  };
  openDetail: (id: string | number, type: MediaType) => void;
  closeDetail: () => void;

  playerModal: {
    isOpen: boolean;
    id: string | number | null;
    type: MediaType;
    title: string;
    season: number;
    episode: number;
  };
  openPlayer: (
    id: string | number,
    type: MediaType,
    title: string,
    season?: number,
    episode?: number
  ) => void;
  closePlayer: () => void;

  continueWatching: ContinueWatchingItem[];
  saveProgress: (item: Omit<ContinueWatchingItem, 'lastWatchedAt'>) => void;
  removeProgress: (id: string | number, type: MediaType) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),

      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      detailModal: {
        isOpen: false,
        id: null,
        type: 'movie',
      },
      openDetail: (id, type) =>
        set({
          detailModal: {
            isOpen: true,
            id,
            type,
          },
        }),
      closeDetail: () =>
        set({
          detailModal: {
            isOpen: false,
            id: null,
            type: 'movie',
          },
        }),

      playerModal: {
        isOpen: false,
        id: null,
        type: 'movie',
        title: '',
        season: 1,
        episode: 1,
      },
      openPlayer: (id, type, title, season = 1, episode = 1) =>
        set({
          playerModal: {
            isOpen: true,
            id,
            type,
            title,
            season,
            episode,
          },
        }),
      closePlayer: () =>
        set((state) => ({
          playerModal: {
            ...state.playerModal,
            isOpen: false,
          },
        })),

      continueWatching: [],
      saveProgress: (item) =>
        set((state) => {
          const key = `${item.type}-${item.id}`;
          const filtered = state.continueWatching.filter(
            (c) => `${c.type}-${c.id}` !== key
          );
          const updated: ContinueWatchingItem = {
            ...item,
            lastWatchedAt: Date.now(),
          };
          return { continueWatching: [updated, ...filtered] };
        }),

      removeProgress: (id, type) =>
        set((state) => ({
          continueWatching: state.continueWatching.filter(
            (c) => `${c.type}-${c.id}` !== `${type}-${id}`
          ),
        })),
    }),
    {
      name: 'chalachitra:ui',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      partialize: (state) => ({ continueWatching: state.continueWatching }),
    }
  )
);
