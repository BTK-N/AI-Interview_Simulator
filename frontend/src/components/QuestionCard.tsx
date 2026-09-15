import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  language?: string;
  autoSpeak?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  language = 'en',
  autoSpeak = true
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [showUrduText, setShowUrduText] = useState<boolean>(language === 'ur');

  // Text-To-Speech using Web Speech API
  const speakQuestion = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (showUrduText && question.question_ur) {
      const urduVoice = voices.find(v => v.lang.startsWith('ur') || v.lang.startsWith('hi'));
      if (urduVoice) utterance.voice = urduVoice;
    } else {
      const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (englishVoice) utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    setShowUrduText(language === 'ur');
  }, [language]);

  // Speak whenever the question changes
  useEffect(() => {
    if (autoSpeak && question?.question) {
      const timer = setTimeout(() => {
        const textToRead = showUrduText && question.question_ur ? question.question_ur : question.question;
        speakQuestion(textToRead);
      }, 400);
      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    }
    return () => stopSpeaking();
  }, [question?.id, showUrduText]);

  const difficultyColors = {
    easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    hard: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className={`px-2.5 py-1 rounded-md border text-xs font-semibold uppercase tracking-wider ${
            difficultyColors[question.difficulty] || difficultyColors.medium
          }`}>
            {question.difficulty}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium capitalize">
            {question.type}
          </span>
        </div>

        {/* Controls: Read Aloud & Urdu Toggle */}
        <div className="flex items-center gap-2">
          {question.question_ur && (
            <button
              onClick={() => setShowUrduText(!showUrduText)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
            >
              {showUrduText ? "English" : "اردو ترجمہ"}
            </button>
          )}

          <button
            onClick={() => {
              const textToRead = showUrduText && question.question_ur ? question.question_ur : question.question;
              isSpeaking ? stopSpeaking() : speakQuestion(textToRead);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
              isSpeaking 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/25' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title={isSpeaking ? "Mute Bot Speech" : "Re-read question aloud"}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                <span>Speaking...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Read Aloud</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Question Text */}
      <h2 className={`text-xl md:text-2xl font-bold text-white leading-snug tracking-tight mb-2 ${
        showUrduText ? 'font-serif text-right leading-loose text-indigo-100' : ''
      }`}>
        "{showUrduText && question.question_ur ? question.question_ur : question.question}"
      </h2>

      {/* Secondary Question Text (if viewing Urdu, show English below, and vice versa) */}
      {question.question_ur && (
        <p className={`text-xs text-slate-400 mb-4 ${showUrduText ? 'text-left' : 'text-right font-serif text-slate-400'}`}>
          {showUrduText ? question.question : question.question_ur}
        </p>
      )}

      {/* Collapsible Rubric / Concept Hints */}
      <div className="border-t border-slate-800/80 pt-3">
        <button
          onClick={() => setShowHints(!showHints)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition font-medium"
        >
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span>{showHints ? "Hide Rubric & Key Concepts" : "View Expected Key Points"}</span>
          {showHints ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showHints && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <p className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Key concepts expected in your response:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              {question.expected_points.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
