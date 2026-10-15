import React from 'react';
import { FileText, Clock, Hash, CheckCircle2, ArrowUpDown } from 'lucide-react';
import { DocumentStats } from '../types';

interface StatsBarProps {
  stats: DocumentStats;
  isSyncScroll: boolean;
  onToggleSyncScroll: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  stats,
  isSyncScroll,
  onToggleSyncScroll,
}) => {
  return (
    <footer
      id="stats-footer-bar"
      className="bg-white border-t border-neutral-200 px-4 py-1.5 flex items-center justify-between text-[11px] text-neutral-500 font-mono select-none shrink-0"
    >
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-neutral-700">
          <FileText className="w-3 h-3 text-neutral-400" />
          <span>
            <strong className="text-neutral-900">{stats.words}</strong> words
          </span>
          <span className="text-neutral-300">•</span>
          <span>
            <strong className="text-neutral-900">{stats.characters}</strong> chars
          </span>
          <span className="text-neutral-300">•</span>
          <span>
            <strong className="text-neutral-900">{stats.lines}</strong> lines
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-neutral-600">
          <Hash className="w-3 h-3 text-neutral-400" />
          <span>{stats.headingsCount} headings</span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-neutral-600">
          <Clock className="w-3 h-3 text-neutral-400" />
          <span>~{stats.readingTimeMinutes} min read</span>
        </div>

        <div className="flex items-center gap-1 text-neutral-600">
          <span>HTML:</span>
          <strong className="text-indigo-600 font-semibold">{stats.htmlSizeKb} KB</strong>
        </div>

        {stats.hasArabic && (
          <div
            id="stats-arabic-rtl-badge"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-sans font-medium"
            title="Arabic text detected: Automatic Right-to-Left (RTL) alignment is active"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Arabic RTL (Auto)</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Sync scroll button */}
        <button
          type="button"
          id="btn-toggle-sync-scroll"
          onClick={onToggleSyncScroll}
          title={isSyncScroll ? 'Synchronized scrolling enabled' : 'Synchronized scrolling disabled'}
          className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer ${
            isSyncScroll
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/70 font-medium'
              : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <ArrowUpDown className="w-3 h-3" />
          <span className="hidden sm:inline">Sync Scroll: {isSyncScroll ? 'ON' : 'OFF'}</span>
        </button>

        <div className="hidden sm:flex items-center gap-1 text-emerald-600 font-medium">
          <CheckCircle2 className="w-3 h-3" />
          <span>Ready</span>
        </div>
      </div>
    </footer>
  );
};
