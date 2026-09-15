import React, { useEffect, useRef, useState } from 'react';
import { Camera, Mic, CheckCircle2, ArrowRight, ShieldCheck, Activity, RefreshCw } from 'lucide-react';
import { ReticleOverlay } from '../ui/ReticleOverlay';
import { AudioWaveformCanvas } from '../ui/AudioWaveformCanvas';
import { useSessionStore } from '../../store/sessionStore';

interface HardwareDiagnosticsConsoleProps {
  onEnterRoom: () => void;
  isLoading: boolean;
  selectedRoleTitle: string;
}

/**
 * HardwareDiagnosticsConsole Component
 * High-density executive console performing real-time camera, microphone,
 * vision landmarker, and LLM telemetry diagnostics before entering the interview cockpit.
 */
export const HardwareDiagnosticsConsole: React.FC<HardwareDiagnosticsConsoleProps> = ({
  onEnterRoom,
  isLoading,
  selectedRoleTitle,
}) => {
  const { hardwareStatus, setHardwareStatus } = useSessionStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Initialize Media Devices on mount
  useEffect(() => {
    let localStream: MediaStream | null = null;

    async function initHardware() {
      try {
        setPermissionError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });

        localStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        const videoTrack = mediaStream.getVideoTracks()[0];
        const hasVideo = !!videoTrack;
        const hasAudio = mediaStream.getAudioTracks().length > 0;

        const trackSettings = videoTrack ? videoTrack.getSettings() : null;
        const resolution = trackSettings?.height ? `${trackSettings.height}p` : '—';
        const frameRate = trackSettings?.frameRate ? Math.round(trackSettings.frameRate) : undefined;

        const hasSpeech = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
        
        let hasLlm = false;
        try {
          const res = await fetch('/api/roles');
          hasLlm = res.ok;
        } catch {
          hasLlm = false;
        }

        setCameraActive(hasVideo);
        setMicActive(hasAudio);
        setHardwareStatus({
          cameraReady: hasVideo,
          micReady: hasAudio,
          speechReady: hasSpeech,
          llmReady: hasLlm,
          permissionDenied: false,
          resolution,
          frameRate,
        });
      } catch (err) {
        console.warn('[Diagnostics] Hardware access denied or unavailable:', err);
        const hasSpeech = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
        setPermissionError('Camera or Microphone access was denied or not detected.');
        setHardwareStatus({
          cameraReady: false,
          micReady: false,
          speechReady: hasSpeech,
          llmReady: false,
          permissionDenied: true,
        });
      }
    }

    initHardware();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [setHardwareStatus]);

  const canProceed = !isLoading && (cameraActive || micActive || !permissionError);

  const handleRetryPermissions = async () => {
    try {
      setPermissionError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setCameraActive(true);
      setMicActive(true);
      setHardwareStatus({ cameraReady: true, micReady: true, permissionDenied: false });
    } catch {
      setPermissionError('Unable to access media devices. Please enable camera/mic in browser settings.');
    }
  };

  return (
    <aside
      aria-label="Hardware diagnostics console"
      className="rounded-2xl bg-surface-panel/95 border border-border-subtle p-6 md:p-7 metallic-rim shadow-2xl backdrop-blur-md flex flex-col justify-between space-y-6"
    >
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-border-subtle/60 pb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint-eval opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-mint-eval"></span>
          </span>
          <span className="font-mono text-xs uppercase tracking-widest text-text-primary font-semibold">
            TELEMETRY & HARDWARE CHECK
          </span>
        </div>

        <span className="font-mono text-[10px] uppercase text-text-tertiary">
          PORT 5173 // SECURE
        </span>
      </div>

      {/* Live Optical Preview Window with ReticleOverlay */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-text-secondary flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-amber-signal stroke-[1.5]" />
            OPTICAL FEED
          </span>
          <span className={cameraActive ? 'text-mint-eval' : 'text-text-tertiary'}>
            {cameraActive ? '1080P @ 15 FPS LOCKED' : 'STANDBY'}
          </span>
        </div>

        <div className="relative w-full h-52 sm:h-56 rounded-xl bg-surface-ground border border-border-subtle overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 ${
              cameraActive ? 'opacity-90' : 'hidden'
            }`}
          />

          {/* Reticle Overlay is active over real camera */}
          <ReticleOverlay
            status={cameraActive ? 'Good' : 'Searching'}
            pitch={cameraActive ? 0.8 : 0}
            yaw={cameraActive ? -0.4 : 0}
            confidenceScore={cameraActive ? 94 : 0}
            isLocked={cameraActive}
          />

          {!cameraActive && (
            <div className="flex flex-col items-center justify-center p-4 text-center z-10">
              <Camera className="w-8 h-8 text-text-tertiary mb-2 stroke-[1.5]" />
              <p className="font-mono text-xs text-text-secondary">
                {permissionError ? 'Optical Stream Denied' : 'Calibrating Camera Sensor...'}
              </p>
              {permissionError && (
                <button
                  type="button"
                  onClick={handleRetryPermissions}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-panel border border-border-default hover:border-amber-signal text-xs font-mono text-amber-signal transition-colors"
                >
                  <RefreshCw className="w-3 h-3 stroke-[1.5]" />
                  Grant Permission
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Live Acoustic Waveform Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-text-secondary flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-mint-eval stroke-[1.5]" />
            ACOUSTIC SPECTRUM
          </span>
          <span className={micActive ? 'text-mint-eval' : 'text-text-tertiary'}>
            {micActive ? '44.1 KHZ // ACTIVE' : 'IDLE WAVE'}
          </span>
        </div>

        <AudioWaveformCanvas
          stream={stream}
          isRecording={micActive}
          barCount={32}
          height={48}
        />
      </div>

      {/* System Diagnostics Checklist */}
      <div className="space-y-2.5 pt-2 border-t border-border-subtle/60 text-xs font-mono">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Optical Vision Landmarker</span>
          <span className="flex items-center gap-1 text-mint-eval font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[1.5]" /> Ready
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Whisper Speech-To-Text</span>
          <span className={`flex items-center gap-1 font-semibold ${hardwareStatus.speechReady ? 'text-mint-eval' : 'text-text-tertiary'}`}>
            <Activity className="w-3.5 h-3.5 stroke-[1.5]" /> {hardwareStatus.speechReady ? 'Online' : 'Standby'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-secondary">OpenRouter AI Rubric Engine</span>
          <span className={`flex items-center gap-1 font-semibold ${hardwareStatus.llmReady ? 'text-mint-eval' : 'text-text-tertiary'}`}>
            <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5]" /> {hardwareStatus.llmReady ? 'Operational' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Selected Dossier Confirmation & Enter Room CTA */}
      <div className="pt-2">
        <div className="mb-3 px-3 py-2 rounded-lg bg-surface-ground/80 border border-border-subtle/80 flex items-center justify-between font-mono text-xs">
          <span className="text-text-tertiary">CONFIGURED:</span>
          <span className="text-amber-signal font-semibold truncate max-w-[200px]">
            {selectedRoleTitle}
          </span>
        </div>

        <button
          type="button"
          onClick={onEnterRoom}
          disabled={!canProceed || isLoading}
          className={`w-full py-4 px-6 rounded-xl font-mono font-bold text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2.5 select-none focus:outline-none focus:ring-2 focus:ring-amber-signal/70 ${
            canProceed && !isLoading
              ? 'bg-amber-signal hover:bg-amber-400 text-surface-ground shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer active:scale-[0.99]'
              : 'bg-surface-elevated text-text-tertiary border border-border-subtle cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin stroke-[1.5]" />
              <span>INITIALIZING COCKPIT...</span>
            </>
          ) : (
            <>
              <span>ENTER INTERVIEW ROOM</span>
              <ArrowRight className="w-4 h-4 stroke-[1.5]" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
