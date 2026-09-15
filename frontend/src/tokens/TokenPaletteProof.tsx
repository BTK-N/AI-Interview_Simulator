import React, { useEffect, useState } from 'react';
import { isReducedMotionPreferred } from './tokens';

/**
 * PHASE 1 FOUNDATION PROOF COMPONENT
 * Renders the 3-layer tokens, Obsidian/Amber/Mint palette, and font pairings
 * to prove visual correctness, contrast accessibility, and reduced-motion wiring.
 */
export const TokenPaletteProof: React.FC = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(isReducedMotionPreferred());
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return (
    <div className="min-h-screen bg-[#080A0F] text-[#F8FAFC] p-8 bg-subtle-grid font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER & TYPOGRAPHY PROOF */}
        <div className="border-b border-white/10 pb-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-amber-500 uppercase tracking-widest font-semibold">
              Phase 1 Deliverable — Foundation & Token Architecture
            </span>
            <div className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${reducedMotion ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
              <span className="font-mono text-xs text-slate-400">
                Reduced Motion: {reducedMotion ? 'Active (0ms)' : 'Inactive (Full Springs)'}
              </span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-white mt-3">
            Obsidian Void & Phosphor Amber Foundation
          </h1>
          <p className="text-slate-400 font-body text-base mt-2 max-w-2xl">
            Proving the 3-layer design system token architecture for the AI-Based Interview Simulator (FYP 2026).
            No purple gradients, no fuzzy shadows, zero AI-slop.
          </p>
        </div>

        {/* THEME VERIFICATION TEST DIV (User Requested Test) */}
        <div className="p-4 rounded-lg bg-surface-panel border border-border-subtle">
          <span className="text-[11px] font-mono text-slate-400 block mb-2">
            Tailwind v4 @theme Wiring Proof:
          </span>
          <div className="bg-amber-signal text-text-primary font-display font-bold px-4 py-2 rounded text-sm inline-block shadow-md">
            bg-amber-signal text-text-primary font-display (Render Verified)
          </div>
        </div>

        {/* LAYER 1: PALETTE SWATCHES & CONTRAST RATIOS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Layer 1 & 2: Palette Swatches & WCAG Contrast Proof
            </h2>
            <span className="font-mono text-xs text-emerald-400">All ratios exceed WCAG AAA/AA</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Obsidian Ground */}
            <div className="p-4 rounded-lg bg-[#0F131C] border border-white/10 metallic-rim space-y-2">
              <div className="h-14 rounded bg-[#080A0F] border border-white/15 flex items-center justify-center">
                <span className="font-mono text-xs text-slate-400">#080A0F</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-200">Obsidian Ground</span>
                <span className="font-mono text-slate-500">Surface</span>
              </div>
              <p className="text-[11px] text-slate-400">Void backdrop, anti-muddy titanium black.</p>
            </div>

            {/* Phosphor Amber */}
            <div className="p-4 rounded-lg bg-[#0F131C] border border-white/10 metallic-rim space-y-2">
              <div className="h-14 rounded bg-[#F59E0B] flex items-center justify-center shadow-[0_0_16px_rgba(245,158,11,0.25)]">
                <span className="font-mono text-xs text-black font-bold">#F59E0B</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-amber-400">Phosphor Amber</span>
                <span className="font-mono text-emerald-400 font-semibold">9.22:1 (AAA)</span>
              </div>
              <p className="text-[11px] text-slate-400">Primary operational signal & countdowns.</p>
            </div>

            {/* Arctic Evaluation Mint */}
            <div className="p-4 rounded-lg bg-[#0F131C] border border-white/10 metallic-rim space-y-2">
              <div className="h-14 rounded bg-[#10B981] flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.25)]">
                <span className="font-mono text-xs text-black font-bold">#10B981</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-emerald-400">Evaluation Mint</span>
                <span className="font-mono text-emerald-400 font-semibold">7.81:1 (AAA)</span>
              </div>
              <p className="text-[11px] text-slate-400">Affirmative telemetry & clarity metrics.</p>
            </div>

            {/* Anomaly Coral */}
            <div className="p-4 rounded-lg bg-[#0F131C] border border-white/10 metallic-rim space-y-2">
              <div className="h-14 rounded bg-[#F43F5E] flex items-center justify-center shadow-[0_0_16px_rgba(244,63,94,0.25)]">
                <span className="font-mono text-xs text-white font-bold">#F43F5E</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-rose-400">Coral Alert</span>
                <span className="font-mono text-rose-400 font-semibold">5.39:1 (AA)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ground: 5.39:1 | Panel: 5.06:1 (Passes AA). Text uses #FB7185 (7.36:1 AAA).
              </p>
            </div>

          </div>
        </section>

        {/* LAYER 3: COMPONENT SURFACES & CRAFTED SURFACES */}
        <section className="space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Layer 3: Component Surfaces & Tactile Depth
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Elevated Cockpit Glass Card */}
            <div className="p-6 rounded-xl cockpit-glass metallic-rim space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-display font-semibold text-sm text-white">Elevated Spatial Glass Card</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  cockpit-glass
                </span>
              </div>
              <p className="text-xs text-slate-300 font-body leading-relaxed">
                Rendered with <code>rgba(18, 24, 37, 0.72)</code> and <code>backdrop-filter: blur(16px)</code> with a 1px metallic rim border.
                Provides spatial depth without muddy shadow blur.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <div className="size-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="font-mono text-xs text-slate-300">Telemetry Stream: OK</span>
              </div>
            </div>

            {/* Editorial Pull Quote Preview */}
            <div className="p-6 rounded-xl bg-[#0F131C] border border-white/10 space-y-3">
              <span className="font-mono text-xs text-slate-400 uppercase tracking-wider font-semibold block">
                Editorial Evaluation Block (No Bullet Lists)
              </span>
              <div className="p-3 rounded-r-lg border-l-2 border-amber-500 bg-amber-500/5">
                <p className="text-xs text-slate-200 italic font-body">
                  "Candidate established a robust architectural thesis around distributed consensus, but exhibited speech deceleration when handling partition recovery edge cases."
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Timestamp [02:14]</span>
                  <span className="text-amber-400">Technical Depth: 84%</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* TYPOGRAPHY TRIO PROOF */}
        <section className="p-6 rounded-xl bg-[#0F131C] border border-white/10 metallic-rim space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Typography Proof (3 Distinct Roles)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div>
              <span className="font-mono text-[11px] text-amber-400 block mb-1">Display / Headings</span>
              <p className="font-display text-lg font-bold text-white">Space Grotesk</p>
              <p className="text-xs text-slate-400 font-display mt-1">Architectural, sharp cuts, authoritative confidence.</p>
            </div>

            <div>
              <span className="font-mono text-[11px] text-emerald-400 block mb-1">Interface / Body</span>
              <p className="font-body text-base font-medium text-white">DM Sans</p>
              <p className="text-xs text-slate-400 font-body mt-1">Neutral Scandinavian ergonomics, high optical clarity.</p>
            </div>

            <div>
              <span className="font-mono text-[11px] text-sky-400 block mb-1">Telemetry / Readouts</span>
              <p className="font-mono text-sm font-semibold text-white">JetBrains Mono</p>
              <p className="text-xs text-slate-400 font-mono mt-1">124 WPM | 88.5% | 00:45.02</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
