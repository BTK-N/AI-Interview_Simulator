import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, RotateCcw, Send, Sparkles, Clock, AlertTriangle, Wand2 } from 'lucide-react';
import { transcribeAudio } from '../api/client';

interface SpeechRecorderProps {
  timeLimitSec: number;
  isEvaluating: boolean;
  language?: string;
  onSubmitAnswer: (transcript: string, durationSeconds: number) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

export const SpeechRecorder: React.FC<SpeechRecorderProps> = ({
  timeLimitSec = 60,
  isEvaluating,
  language = 'en',
  onSubmitAnswer,
  onRecordingStateChange
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribingNeural, setIsTranscribingNeural] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimitSec);
  const [transcript, setTranscript] = useState<string>('');
  const [hasReRecorded, setHasReRecorded] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedAudioBlobRef = useRef<Blob | null>(null);

  // Initialize Web Speech Recognition with chosen language
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'ur' ? 'ur-PK' : 'en-US';

      recognition.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(fullTranscript.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  // Timer Countdown Logic
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleStopRecording();
            return 0;
          }
          return prev - 1;
        });
        setRecordingSeconds(sec => sec + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    setTranscript('');
    setTimeLeft(timeLimitSec);
    setRecordingSeconds(0);
    setIsRecording(true);
    audioChunksRef.current = [];
    recordedAudioBlobRef.current = null;
    if (onRecordingStateChange) onRecordingStateChange(true);

    // 1. Start browser Web Speech API for live visual streaming
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Recognition start notice:", e);
      }
    }

    // 2. Start MediaRecorder for Hugging Face neural Whisper capture
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          recordedAudioBlobRef.current = blob;
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(250); // Slice in 250ms chunks
    } catch (err) {
      console.warn("MediaRecorder mic access error:", err);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (onRecordingStateChange) onRecordingStateChange(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
  };

  const handleReRecord = () => {
    if (hasReRecorded) return;
    setHasReRecorded(true);
    handleStopRecording();
    setTranscript('');
    setTimeLeft(timeLimitSec);
    setRecordingSeconds(0);
    recordedAudioBlobRef.current = null;
  };

  // Enhance transcription using local Hugging Face Whisper model
  const handleNeuralWhisperTranscribe = async () => {
    if (!recordedAudioBlobRef.current) return;
    setIsTranscribingNeural(true);
    try {
      const res = await transcribeAudio(recordedAudioBlobRef.current, language);
      if (res && res.transcript && res.transcript.trim().length > 0) {
        setTranscript(res.transcript.trim());
      }
    } catch (err) {
      console.error("Neural Whisper transcription failed:", err);
    } finally {
      setIsTranscribingNeural(false);
    }
  };

  const handleSubmit = async () => {
    if (isRecording) {
      handleStopRecording();
    }

    let finalTranscript = transcript.trim();

    // If candidate recorded audio but live transcript was empty, use neural Whisper automatically
    if (finalTranscript.length === 0 && recordedAudioBlobRef.current) {
      setIsTranscribingNeural(true);
      try {
        const res = await transcribeAudio(recordedAudioBlobRef.current, language);
        if (res && res.transcript) {
          finalTranscript = res.transcript.trim();
        }
      } catch (e) {
        // Continue
      } finally {
        setIsTranscribingNeural(false);
      }
    }

    onSubmitAnswer(
      finalTranscript.length > 0 ? finalTranscript : "I do not have a full response for this question.",
      Math.max(recordingSeconds, 5)
    );
  };

  const wordsCount = transcript.split(/\s+/).filter(Boolean).length;
  const progressPercent = Math.max(0, (timeLeft / timeLimitSec) * 100);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
      {/* Timer & Controls Header */}
      <div className="flex items-center justify-between gap-4">
        {/* Countdown Badge */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono font-bold text-sm shadow ${
            timeLeft <= 10 
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' 
              : timeLeft <= 20 
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
              : 'bg-slate-800 text-slate-200 border-slate-700'
          }`}>
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
          </div>

          <span className="text-xs text-slate-400">
            {isRecording ? "Listening & recording audio..." : "30–90 sec response window"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!isRecording && recordingSeconds === 0 ? (
            <button
              onClick={handleStartRecording}
              disabled={isEvaluating || isTranscribingNeural}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
            >
              <Mic className="w-4 h-4" />
              Start Speaking
            </button>
          ) : isRecording ? (
            <button
              onClick={handleStopRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-500/25 transition"
            >
              <Square className="w-4 h-4" />
              Pause / Finish
            </button>
          ) : (
            <button
              onClick={handleStartRecording}
              disabled={isEvaluating || isTranscribingNeural}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 font-semibold text-xs transition disabled:opacity-50"
            >
              <Mic className="w-3.5 h-3.5" />
              Resume Speaking
            </button>
          )}

          {/* Re-record Option */}
          {recordingSeconds > 0 && !hasReRecorded && (
            <button
              onClick={handleReRecord}
              disabled={isEvaluating || isRecording || isTranscribingNeural}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium transition disabled:opacity-40"
              title="You can re-record your answer once"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Re-record (1 left)
            </button>
          )}

          {/* Submit Answer Button */}
          <button
            onClick={handleSubmit}
            disabled={isEvaluating || isTranscribingNeural || (recordingSeconds === 0 && transcript.length === 0)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/25 transition disabled:opacity-40"
          >
            {isEvaluating || isTranscribingNeural ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>{isTranscribingNeural ? "Transcribing..." : "Evaluating..."}</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Answer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar for Timer */}
      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            timeLeft <= 10 ? 'bg-rose-500' : timeLeft <= 20 ? 'bg-amber-500' : 'bg-indigo-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Live Spoken Transcript Display */}
      <div className="relative">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Transcribed Spoken Answer:
          </span>

          <div className="flex items-center gap-3">
            {recordingSeconds > 0 && !isRecording && (
              <button
                onClick={handleNeuralWhisperTranscribe}
                disabled={isTranscribingNeural}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition"
                title="Use Hugging Face faster-whisper neural model to re-transcribe audio with punctuation"
              >
                <Wand2 className="w-3 h-3" />
                <span>{isTranscribingNeural ? "Enhancing..." : "Enhance with Whisper AI"}</span>
              </button>
            )}
            <span>{wordsCount} words</span>
          </div>
        </div>

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={
            isRecording 
              ? (language === 'ur' ? "سن رہا ہے... آپ اردو یا رومن اردو میں جواب دے سکتے ہیں" : "Listening to your spoken response (English, Urdu, or Roman Urdu)...")
              : (language === 'ur' ? "بولنا شروع کریں پر کلک کریں اور اردو یا انگریزی میں جواب دیں..." : "Click 'Start Speaking' and speak your answer (English, Urdu, or Roman Urdu)...")
          }
          rows={3}
          className="w-full rounded-xl bg-slate-950/80 border border-slate-800 p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none font-normal"
        />

        {transcript.length === 0 && isRecording && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-400/90">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Speak clearly into your microphone; live words will transcribe here.</span>
          </div>
        )}
      </div>
    </div>
  );
};
