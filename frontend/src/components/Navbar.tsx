import React from 'react';
import { Bot, Sparkles, GraduationCap, RotateCcw } from 'lucide-react';

interface NavbarProps {
  onReset?: () => void;
  inSession?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onReset, inSession }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and App Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">AI Interview Simulator</span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> HR Bot
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> Dept. of Software Engineering • Univ. of Sindh
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {inSession && onReset && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Leave interview and start over"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Exit Session
            </button>
          )}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            OpenRouter AI Ready
          </div>
        </div>
      </div>
    </header>
  );
};
