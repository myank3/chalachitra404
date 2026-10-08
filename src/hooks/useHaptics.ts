import { useCallback } from 'react';

export function useHaptics() {
  const triggerHaptic = useCallback((pattern: number | number[] = 10) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore devices or browsers that block vibration
      }
    }
  }, []);

  return { triggerHaptic };
}
