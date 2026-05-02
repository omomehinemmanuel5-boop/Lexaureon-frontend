import { useState } from 'react';

interface InputConsoleProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onRun: () => void;
  loading: boolean;
  disabled: boolean;
}

export default function InputConsole({
  prompt,
  setPrompt,
  onRun,
  loading,
  disabled,
}: InputConsoleProps) {
  const charCount = prompt.length;
  const maxChars = 5000;
  const remaining = maxChars - charCount;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
      <label className="block text-sm font-medium text-slate-200 mb-3">
        Prompt for Governance
      </label>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value.slice(0, maxChars))}
        placeholder="Enter your prompt. The governor will analyze and constrain the response..."
        className="w-full h-32 sm:h-40 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
        <div className="text-xs text-slate-400">
          {charCount} / {maxChars} characters
          {remaining < 500 && (
            <span className={remaining < 100 ? 'text-red-400 ml-2' : 'text-yellow-400 ml-2'}>
              ({remaining} remaining)
            </span>
          )}
        </div>

        <button
          onClick={onRun}
          disabled={!prompt.trim() || loading || disabled}
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 text-sm sm:text-base"
        >
          {loading ? 'Running...' : disabled ? 'Limit Reached' : 'Run Governance'}
        </button>
      </div>
    </div>
  );
}
