import React, { useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, ChevronRight } from 'lucide-react';

interface RoleDossierCardProps {
  id: string;
  title: string;
  subheadline: string;
  description: string;
  tags: string[];
  benchmark: string;
  icon: LucideIcon;
  iconColor: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

/**
 * RoleDossierCard Component
 * High-density executive role dossier card featuring interactive 3D perspective tilt
 * and 1px metallic rim focus states.
 * 
 * Motion Spec: 240ms duration, cubic-bezier(0.16, 1, 0.3, 1) spring easing.
 * Strictly respects prefers-reduced-motion: zero transforms, instant border feedback.
 */
export const RoleDossierCard: React.FC<RoleDossierCardProps> = ({
  id,
  title,
  subheadline,
  description,
  tags,
  benchmark,
  icon: Icon,
  iconColor,
  isSelected,
  onSelect,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const reducedMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
    const yRatio = (e.clientY - rect.top) / rect.height - 0.5;

    // Max 7 degrees tilt on X and Y
    setTilt({
      x: -yRatio * 7,
      y: xRatio * 7,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(id);
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: reducedMotion
          ? 'none'
          : `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: reducedMotion
          ? 'none'
          : 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1), border-color 240ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 240ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`group relative rounded-2xl p-6 sm:p-7 border cursor-pointer select-none outline-none focus:ring-2 focus:ring-amber-signal/60 ${
        isSelected
          ? 'bg-surface-card border-amber-signal/60 shadow-[0_0_24px_rgba(245,158,11,0.14)] metallic-rim'
          : 'bg-surface-panel/80 border-border-subtle hover:border-border-default hover:bg-surface-card/90'
      }`}
    >
      {/* Active Selection Glow Dot */}
      {isSelected && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-subtle border border-amber-500/40 text-amber-signal font-mono text-[11px] font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>ACTIVE DOSSIER</span>
        </div>
      )}

      {/* Header Row: Icon + Title */}
      <div className="flex items-start gap-4 mb-3">
        <div
          className={`p-3 rounded-xl bg-surface-ground border flex items-center justify-center transition-colors ${
            isSelected ? 'border-amber-500/40 text-amber-signal' : 'border-border-subtle text-text-secondary group-hover:text-text-primary'
          }`}
        >
          <Icon className="w-6 h-6 stroke-[1.5]" style={{ color: isSelected ? undefined : iconColor }} />
        </div>

        <div className="flex-1 pr-24">
          <h3 className="font-display font-bold text-xl sm:text-2xl text-text-primary tracking-tight group-hover:text-white">
            {title}
          </h3>
          <p className="font-body font-medium text-xs sm:text-sm text-text-secondary mt-0.5">
            {subheadline}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="font-body text-sm text-text-secondary/90 leading-relaxed mb-5">
        {description}
      </p>

      {/* Competency Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 rounded-md bg-surface-ground/70 border border-border-subtle/80 font-mono text-[10px] text-text-tertiary tracking-wider uppercase group-hover:text-text-secondary transition-colors"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer Row: Benchmark Target */}
      <div className="pt-3 border-t border-border-subtle/60 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5 text-text-tertiary">
          <span>RUBRIC:</span>
          <span className="font-semibold text-mint-eval">{benchmark}</span>
        </div>

        <span className="text-text-tertiary flex items-center gap-1 group-hover:text-amber-signal group-hover:translate-x-1 transition-all duration-200">
          Select <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
        </span>
      </div>
    </div>
  );
};
