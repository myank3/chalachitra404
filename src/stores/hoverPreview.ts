import { create } from 'zustand';
import { MediaItem } from '../types';

interface HoverPreviewState {
  item: MediaItem | null;
  anchorRect: DOMRect | null;
  show: (item: MediaItem, rect: DOMRect) => void;
  hide: () => void;
}

export const useHoverPreview = create<HoverPreviewState>((set) => ({
  item: null,
  anchorRect: null,
  show: (item, rect) => set({ item, anchorRect: rect }),
  hide: () => set({ item: null, anchorRect: null }),
}));