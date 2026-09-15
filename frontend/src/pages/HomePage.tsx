import React, { useState } from 'react';
import { Terminal, Layers, ShieldCheck, Cpu, Activity } from 'lucide-react';
import { RoleDossierCard } from '../components/interview/RoleDossierCard';
import { HardwareDiagnosticsConsole } from '../components/interview/HardwareDiagnosticsConsole';
import { useSessionStore } from '../store/sessionStore';

interface HomePageProps {
  onStartSession: (roleId: string, interviewType: string, language: string) => void;
  isLoading: boolean;
}

const ROLES = [
  {
    id: 'software_engineer',
    title: 'Software Engineer',
    subheadline: 'Distributed Systems, Concurrency & Low-Latency Architecture',
    description:
      'Evaluates architectural trade-offs, p99 latency guarantees, cache coherence, distributed transactions, and real-time concurrency under load.',
    tags: ['SYSTEM DESIGN', 'CONCURRENCY', 'DISTRIBUTED ALGORITHMS', 'STORAGE ENGINES'],
    benchmark: '85+ (Strong)',
    icon: Terminal,
    iconColor: '#F59E0B',
  },
  {
    id: 'product_manager',
    title: 'Product Manager',
    subheadline: 'Product Sense, Roadmapping & North Star Metric Decomposition',
    description:
      'Evaluates prioritization frameworks (RICE/Kano), metric decomposition, user empathy discovery, and cross-functional conflict resolution.',
    tags: ['PRODUCT SENSE', 'METRIC TAXONOMY', 'GTM EXECUTION', 'STAKEHOLDER ROADMAP'],
    benchmark: '85+ (Strong)',
    icon: Layers,
    iconColor: '#10B981',
  },
  {
    id: 'hr_behavioral',
    title: 'HR & Executive Behavioral',
    subheadline: 'Leadership Principles, Ethical Decision-Making & STAR Framework',
    description:
      'Evaluates Situation-Task-Action-Result narratives, ethical decision-making, executive composure, and navigating high-friction workplace dynamics.',
    tags: ['STAR METHOD', 'EXECUTIVE PRESENCE', 'CONFLICT RESOLUTION', 'ETHICAL GOVERNANCE'],
    benchmark: '85+ (Strong)',
    icon: ShieldCheck,
    iconColor: '#FB7185',
  },
];

/**
 * HomePage Component (Screen 1: The Executive Interview Suite)
 * Studio-grade asymmetric layout avoiding AI-slop:
 * - Left column: Suite designation, commanding Space Grotesk headline, and 3D tilt role dossiers
 * - Right column: Live Hardware Diagnostics Console with camera reticle & real-time mic visualizer
 */
export const HomePage: React.FC<HomePageProps> = ({ onStartSession, isLoading }) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('software_engineer');
  const { selectRole } = useSessionStore();

  const handleSelectRole = (id: string) => {
    setSelectedRoleId(id);
    const selected = ROLES.find((r) => r.id === id);
    if (selected) {
      selectRole(id, selected.title);
    }
  };

  const handleEnterRoom = () => {
    const selected = ROLES.find((r) => r.id === selectedRoleId);
    if (selected) {
      selectRole(selected.id, selected.title);
    }
    onStartSession(selectedRoleId, 'all', 'en');
  };

  const selectedRole = ROLES.find((r) => r.id === selectedRoleId) || ROLES[0];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-surface-ground py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-7xl mx-auto w-full">
        {/* Asymmetric Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Suite Designation & 3D Tilt Role Dossiers (col-span-7) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Context & Headline (Asymmetric, not centered) */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-panel border border-border-subtle text-amber-signal text-xs font-mono font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-signal animate-pulse" />
                <span>SYSTEM DESIGNATION // FYP 2026</span>
              </div>

              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-5xl tracking-tight text-text-primary leading-[1.1]">
                Executive Interview <br />
                <span className="text-amber-signal">Simulation Suite</span>
              </h1>

              <p className="font-body text-text-secondary text-base sm:text-lg leading-relaxed max-w-2xl">
                High-fidelity multimodal interview training. Evaluates technical depth, vocal pacing,
                and physical composure via real-time local vision landmarker and Whisper speech pipeline.
              </p>
            </div>

            {/* Role Dossiers Header */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-4 border-b border-border-subtle/60 pb-3">
                <h2 className="font-display font-semibold text-base sm:text-lg text-text-primary flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-signal stroke-[1.5]" />
                  SELECT TARGET ROLE DOSSIER
                </h2>
                <span className="font-mono text-xs text-text-tertiary">
                  3 RIGOROUS BENCHMARKS
                </span>
              </div>

              {/* 3D Tilt Role Dossier Cards */}
              <div
                role="radiogroup"
                aria-label="Interview target role dossiers"
                className="space-y-4"
              >
                {ROLES.map((role) => (
                  <RoleDossierCard
                    key={role.id}
                    id={role.id}
                    title={role.title}
                    subheadline={role.subheadline}
                    description={role.description}
                    tags={role.tags}
                    benchmark={role.benchmark}
                    icon={role.icon}
                    iconColor={role.iconColor}
                    isSelected={selectedRoleId === role.id}
                    onSelect={handleSelectRole}
                  />
                ))}
              </div>
            </div>

            {/* Architecture Telemetry Metrics Banner */}
            <div className="p-4 rounded-xl bg-surface-panel/60 border border-border-subtle flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-text-tertiary">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-mint-eval stroke-[1.5]" />
                <span>VISION LANDMARKER: <strong className="text-text-primary">15 FPS</strong></span>
              </div>
              <span className="text-border-subtle hidden sm:inline">|</span>
              <div>
                <span>SPEECH PIPELINE: <strong className="text-text-primary">WHISPER-V3</strong></span>
              </div>
              <span className="text-border-subtle hidden sm:inline">|</span>
              <div>
                <span>EVALUATION ENGINE: <strong className="text-text-primary">OPENROUTER / GEMINI</strong></span>
              </div>
            </div>
          </div>

          {/* Right Column: Hardware Diagnostics Console (col-span-5) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <HardwareDiagnosticsConsole
              selectedRoleTitle={selectedRole.title}
              isLoading={isLoading}
              onEnterRoom={handleEnterRoom}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
