import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

/**
 * GSAP Centralized Initialization Module
 * Ensures CustomEase plugin and named motion curves are registered exactly once
 * at application bootstrap before any component or animation timeline is evaluated.
 */

// 1. Register Plugin
gsap.registerPlugin(CustomEase);

// 2. Define Physics & Easing Constants
export const EASE_SPRING = '0.16, 1, 0.3, 1';
export const EASE_OVERSHOOT = '0.34, 1.56, 0.64, 1';
export const EASE_SMOOTH_OUT = '0.25, 1, 0.5, 1';

// 3. Create Named Eases
CustomEase.create('spring', EASE_SPRING);
CustomEase.create('cockpitSpring', EASE_SPRING);
CustomEase.create('overshoot', EASE_OVERSHOOT);
CustomEase.create('cockpitOvershoot', EASE_OVERSHOOT);
CustomEase.create('smoothOut', EASE_SMOOTH_OUT);

// 4. Expose to window in development for runtime verification and console inspection
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as unknown as { gsap: typeof gsap }).gsap = gsap;
}

export { gsap, CustomEase };
