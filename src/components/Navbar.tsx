import React, { useRef, useState, useEffect } from 'react';
import {
  FileText,
  Eye,
  Code2,
  Columns2,
  Columns3,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  ChevronDown,
  FileCode,
  File,
} from 'lucide-react';
import { ViewMode, SampleDoc, ExportFormat } from '../types';
import { SAMPLE_DOCS } from '../data/samples';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSelectSample: (doc: SampleDoc) => void;
  onFileUpload: (content: string, filename: string) => void;
  onReset: () => void;
  onOpenExport: (format?: ExportFormat) => void;
  onQuickCopyHtml: () => void;
  isQuickCopied: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onViewModeChange,
  onSelectSample,
  onFileUpload,
  onReset,
  onOpenExport,
  onQuickCopyHtml,
  isQuickCopied,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const exportDropdownRef = useRef<HTMLDivElement | null>(null);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    };
    if (isExportDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportDropdownOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          onFileUpload(text, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header
      id="main-navbar"
      className="bg-white border-b border-neutral-200 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3 select-none shrink-0"
    >
      {/* Brand & App Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-neutral-900 tracking-tight leading-none">
                Markdown to HTML
              </h1>
              <span className="hidden md:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono bg-neutral-100 text-neutral-600 border border-neutral-200">
                GFM Live
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 hidden sm:block leading-none mt-1">
              Live Preview • HTML Inspector • Standalone Export
            </p>
          </div>
        </div>

        {/* Sample document selector */}
        <div className="relative hidden lg:block ml-2">
          <select
            id="sample-doc-select"
            aria-label="Load sample markdown document"
            onChange={(e) => {
              const selected = SAMPLE_DOCS.find((d) => d.id === e.target.value);
              if (selected) onSelectSample(selected);
            }}
            defaultValue="feature-showcase"
            className="text-xs bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-neutral-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-colors"
          >
            <option disabled value="">
              Load Sample Template...
            </option>
            {SAMPLE_DOCS.map((sample) => (
              <option key={sample.id} value={sample.id}>
                Template: {sample.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* View Mode Switcher */}
      <div className="flex items-center bg-neutral-100/90 p-0.5 rounded-lg border border-neutral-200/80 text-xs">
        <button
          type="button"
          id="view-btn-split-preview"
          title="Split: Editor + Live Preview"
          onClick={() => onViewModeChange('split-preview')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
            viewMode === 'split-preview'
              ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Columns2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </button>

        <button
          type="button"
          id="view-btn-split-html"
          title="Split: Editor + HTML Code"
          onClick={() => onViewModeChange('split-html')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
            viewMode === 'split-html'
              ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">HTML Code</span>
        </button>

        <button
          type="button"
          id="view-btn-three-panel"
          title="3-Panel: Editor + Preview + HTML"
          onClick={() => onViewModeChange('three-panel')}
          className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
            viewMode === 'three-panel'
              ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Columns3 className="w-3.5 h-3.5" />
          <span>3-Panel</span>
        </button>

        <button
          type="button"
          id="view-btn-preview-only"
          title="Full Preview"
          onClick={() => onViewModeChange('preview-only')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${
            viewMode === 'preview-only'
              ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Upload Button */}
        <button
          type="button"
          id="navbar-upload-btn"
          title="Import Markdown file (.md)"
          onClick={() => fileInputRef.current?.click()}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import</span>
        </button>

        {/* Reset / Clear Button */}
        <button
          type="button"
          id="navbar-reset-btn"
          title="Reset to sample markdown"
          onClick={onReset}
          className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-500 hover:text-neutral-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Quick Copy HTML Button */}
        <button
          type="button"
          id="navbar-quick-copy-html-btn"
          title="Quick Copy HTML"
          onClick={onQuickCopyHtml}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors"
        >
          {isQuickCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">Copied HTML!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy HTML</span>
            </>
          )}
        </button>

        {/* Primary Export Button Group */}
        <div ref={exportDropdownRef} className="relative inline-flex items-center">
          <button
            type="button"
            id="navbar-export-btn"
            onClick={() => onOpenExport('docx')}
            title="Export Document (Word, ODT, HTML, Markdown)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-l-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            type="button"
            id="navbar-export-dropdown-toggle"
            onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
            aria-label="More export formats"
            className="px-1.5 py-1.5 rounded-r-lg bg-indigo-700 hover:bg-indigo-800 text-white border-l border-indigo-500 text-xs shadow-xs transition-colors cursor-pointer"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Dropdown Menu */}
          {isExportDropdownOpen && (
            <div
              id="navbar-export-menu"
              className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="px-3 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Export Options
              </div>

              <button
                type="button"
                id="menu-export-word"
                onClick={() => {
                  setIsExportDropdownOpen(false);
                  onOpenExport('docx');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-neutral-700 hover:bg-blue-50 hover:text-blue-900 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">Word Document (.docx)</div>
                  <div className="text-[10px] text-neutral-500">MS Word, Google Docs, Pages</div>
                </div>
              </button>

              <button
                type="button"
                id="menu-export-odt"
                onClick={() => {
                  setIsExportDropdownOpen(false);
                  onOpenExport('odt');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-neutral-700 hover:bg-teal-50 hover:text-teal-900 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">OpenDocument (.odt)</div>
                  <div className="text-[10px] text-neutral-500">LibreOffice, OpenOffice, Word</div>
                </div>
              </button>

              <button
                type="button"
                id="menu-export-html"
                onClick={() => {
                  setIsExportDropdownOpen(false);
                  onOpenExport('html');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-neutral-700 hover:bg-indigo-50 hover:text-indigo-900 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <FileCode className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">HTML Document (.html)</div>
                  <div className="text-[10px] text-neutral-500">Standalone with styled themes</div>
                </div>
              </button>

              <button
                type="button"
                id="menu-export-md"
                onClick={() => {
                  setIsExportDropdownOpen(false);
                  onOpenExport('md');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors cursor-pointer border-t border-neutral-100 mt-1"
              >
                <div className="w-6 h-6 rounded bg-neutral-200 text-neutral-700 flex items-center justify-center shrink-0">
                  <File className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">Markdown (.md)</div>
                  <div className="text-[10px] text-neutral-500">Raw Markdown source code</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
