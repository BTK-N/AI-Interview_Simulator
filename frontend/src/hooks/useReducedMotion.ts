import { useState, useEffect } from 'react';

/**
 * useReducedMotion Hook
 * Reactively detects if the user has enabled `prefers-reduced-motion: reduce` in OS settings.
 * 
 * CRITICAL ARCHITECTURAL RULE:
 * CSS `!important` rules cannot override JavaScript GSAP animations.
 * Therefore, EVERY GSAP call site and JavaScript animation controller MUST read
 * from this hook (or use `getSafeDuration(seconds)`) to dynamically adjust durations
 * to 0ms or switch to opacity-only transitions when reduced motion is preferred.
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQueryList.matches);

    // Reactive listener for OS setting toggles mid-session
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener);
      return () => mediaQueryList.removeEventListener('change', listener);
    } else {
      // Fallback for older browsers
      mediaQueryList.addListener(listener);
      return () => mediaQueryList.removeListener(listener);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Utility for GSAP / JS animations: returns 0 duration if reduced motion is preferred,
 * otherwise returns the desired animation duration in seconds.
 */
export function getMotionSafeDuration(desiredSeconds: number, reducedMotion: boolean): number {
  return reducedMotion ? 0 : desiredSeconds;
}
