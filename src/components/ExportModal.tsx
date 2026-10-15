import React, { useState, useMemo } from 'react';
import {
  Download,
  Copy,
  Check,
  X,
  FileCode,
  FileText,
  BookOpen,
  FileDown,
  Loader2,
  Sparkles,
  Layers,
  File,
} from 'lucide-react';
import { ExportOptions, ExportTheme, ExportFormat } from '../types';
import { buildStandaloneHtml, downloadFile, downloadBlob, exportToDocx, exportToOdt } from '../utils/exporter';
import { containsArabic } from '../utils/markdown';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawHtml: string;
  markdown: string;
  defaultTitle: string;
  initialFormat?: ExportFormat;
}

const THEME_OPTIONS: { id: ExportTheme; name: string; desc: string; previewColor: string }[] = [
  { id: 'modern', name: 'Modern Clean', desc: 'Sleek sans-serif with subtle cards & indigo accents', previewColor: 'bg-indigo-600' },
  { id: 'github', name: 'GitHub Classic', desc: 'Standard GitHub markdown formatting & tables', previewColor: 'bg-neutral-800' },
  { id: 'minimal', name: 'Minimal Sans', desc: 'Distraction-free high readability typography', previewColor: 'bg-zinc-600' },
  { id: 'serif', name: 'Editorial Serif', desc: 'Warm bookish typography on ivory paper canvas', previewColor: 'bg-amber-700' },
  { id: 'dark', name: 'Dark Slate', desc: 'Deep slate background with glowing accents', previewColor: 'bg-slate-900' },
];

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  rawHtml,
  markdown,
  defaultTitle,
  initialFormat = 'html',
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(initialFormat);
  const [options, setOptions] = useState<ExportOptions>({
    format: initialFormat,
    includeHead: true,
    documentTitle: defaultTitle || 'My Document',
    theme: 'modern',
    minifyHtml: false,
    includeSyntaxHighlighting: true,
    responsiveWrapper: true,
  });

  const [authorName, setAuthorName] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<ExportFormat | null>(null);

  // Sync title when defaultTitle changes
  React.useEffect(() => {
    if (defaultTitle && !options.documentTitle) {
      setOptions((prev) => ({ ...prev, documentTitle: defaultTitle }));
    }
  }, [defaultTitle, options.documentTitle]);

  const hasArabic = useMemo(() => containsArabic(markdown), [markdown]);

  // Computed standalone HTML
  const finalHtml = useMemo(() => {
    return buildStandaloneHtml(rawHtml, options);
  }, [rawHtml, options]);

  const outputSizeKb = (new Blob([finalHtml]).size / 1024).toFixed(1);

  if (!isOpen) return null;

  const sanitizedTitle =
    options.documentTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0600-\u06FF_-]+/gi, '-')
      .replace(/^-+|-+$/g, '') || 'document';

  const handleDownloadHtml = () => {
    const filename = `${sanitizedTitle}.html`;
    downloadFile(filename, finalHtml, 'text/html');
    triggerSuccess('html');
  };

  const handleDownloadMarkdown = () => {
    const filename = `${sanitizedTitle}.md`;
    downloadFile(filename, markdown, 'text/markdown');
    triggerSuccess('md');
  };

  const handleDownloadDocx = async () => {
    try {
      setIsExporting(true);
      const blob = await exportToDocx(markdown, {
        title: options.documentTitle,
        author: authorName.trim() || undefined,
      });
      const filename = `${sanitizedTitle}.docx`;
      downloadBlob(filename, blob);
      triggerSuccess('docx');
    } catch (err) {
      console.error('Failed to export DOCX:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadOdt = async () => {
    try {
      setIsExporting(true);
      const blob = await exportToOdt(markdown, {
        title: options.documentTitle,
        author: authorName.trim() || undefined,
      });
      const filename = `${sanitizedTitle}.odt`;
      downloadBlob(filename, blob);
      triggerSuccess('odt');
    } catch (err) {
      console.error('Failed to export ODT:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const triggerSuccess = (format: ExportFormat) => {
    setDownloadSuccess(format);
    setTimeout(() => setDownloadSuccess(null), 2200);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(finalHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy HTML:', err);
    }
  };

  return (
    <div
      id="export-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="export-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 leading-none">Export Document</h2>
              <p className="text-xs text-neutral-500 mt-1">
                Save your work as Microsoft Word (.docx), OpenDocument (.odt), HTML, or Markdown
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close export dialog"
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex items-center border-b border-neutral-200 bg-neutral-100/70 px-6 pt-3 gap-1 overflow-x-auto select-none">
          <button
            type="button"
            id="tab-format-docx"
            onClick={() => setSelectedFormat('docx')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-t border-x transition-colors cursor-pointer ${
              selectedFormat === 'docx'
                ? 'bg-white border-neutral-200 text-blue-700 -mb-px shadow-2xs font-bold'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Word (.docx)</span>
          </button>

          <button
            type="button"
            id="tab-format-odt"
            onClick={() => setSelectedFormat('odt')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-t border-x transition-colors cursor-pointer ${
              selectedFormat === 'odt'
                ? 'bg-white border-neutral-200 text-teal-700 -mb-px shadow-2xs font-bold'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-600" />
            <span>OpenDocument (.odt)</span>
          </button>

          <button
            type="button"
            id="tab-format-html"
            onClick={() => setSelectedFormat('html')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-t border-x transition-colors cursor-pointer ${
              selectedFormat === 'html'
                ? 'bg-white border-neutral-200 text-indigo-700 -mb-px shadow-2xs font-bold'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>HTML Document</span>
          </button>

          <button
            type="button"
            id="tab-format-md"
            onClick={() => setSelectedFormat('md')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-t border-x transition-colors cursor-pointer ${
              selectedFormat === 'md'
                ? 'bg-white border-neutral-200 text-neutral-800 -mb-px shadow-2xs font-bold'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
            }`}
          >
            <File className="w-3.5 h-3.5 text-neutral-500" />
            <span>Markdown (.md)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-neutral-700 flex-1">
          {/* Common Document Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
              Document Title
            </label>
            <input
              type="text"
              id="export-doc-title"
              value={options.documentTitle}
              onChange={(e) => setOptions({ ...options, documentTitle: e.target.value })}
              placeholder="e.g. Project Documentation"
              className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Word (.docx) View */}
          {selectedFormat === 'docx' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-blue-900">
                  <FileText className="w-4 h-4 text-blue-700" />
                  <span>Microsoft Word (.docx) Document</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Generates an authentic Open XML (.docx) file ready for Microsoft Word, Office 365, Apple Pages, LibreOffice, and Google Docs.
                </p>
                <div className="pt-2 border-t border-blue-200/70 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-blue-900">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Formatted headings, bold, italics, code</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Tables with bordered cells &amp; header fills</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Bullet, numbered, and task lists</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{hasArabic ? 'Automatic Arabic RTL Bidirectional formatting' : 'RTL Arabic bidirectional support'}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Author / Creator (Optional)
                </label>
                <input
                  type="text"
                  id="export-author-name"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Your Name or Team"
                  className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
                <span>Output Format: <strong className="text-neutral-800">Microsoft Word (.docx)</strong></span>
                <span>Filename: <code className="text-blue-700 bg-neutral-100 px-1 py-0.5 rounded font-mono">{sanitizedTitle}.docx</code></span>
              </div>
            </div>
          )}

          {/* OpenDocument (.odt) View */}
          {selectedFormat === 'odt' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-teal-950 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-teal-900">
                  <BookOpen className="w-4 h-4 text-teal-700" />
                  <span>OpenDocument Text (.odt) File</span>
                </div>
                <p className="text-xs text-teal-800 leading-relaxed">
                  Compliant with the official OASIS OpenDocument (ODF 1.2) standard. Native format for LibreOffice Writer, Apache OpenOffice, and compatible with Microsoft Word and Google Docs.
                </p>
                <div className="pt-2 border-t border-teal-200/70 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-teal-900">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>OASIS standard ODF XML structure</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Formatted headings, blockquotes &amp; code blocks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Ordered, unordered, and task lists</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{hasArabic ? 'Native Arabic RTL writing-mode' : 'Native RTL writing-mode'}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Author / Creator (Optional)
                </label>
                <input
                  type="text"
                  id="export-author-name-odt"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Your Name or Organization"
                  className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
                <span>Output Format: <strong className="text-neutral-800">OpenDocument Text (.odt)</strong></span>
                <span>Filename: <code className="text-teal-700 bg-neutral-100 px-1 py-0.5 rounded font-mono">{sanitizedTitle}.odt</code></span>
              </div>
            </div>
          )}

          {/* HTML View */}
          {selectedFormat === 'html' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              {/* Export Mode */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2">
                  HTML Output Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    id="export-format-standalone"
                    onClick={() => setOptions({ ...options, includeHead: true })}
                    className={`p-3 text-left rounded-lg border transition-all cursor-pointer ${
                      options.includeHead
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="font-semibold text-neutral-900 text-xs mb-0.5">Standalone HTML Document</div>
                    <div className="text-neutral-500 text-[11px] leading-tight">
                      Complete HTML5 file with embedded styling, metadata, and responsive typography.
                    </div>
                  </button>

                  <button
                    type="button"
                    id="export-format-fragment"
                    onClick={() => setOptions({ ...options, includeHead: false })}
                    className={`p-3 text-left rounded-lg border transition-all cursor-pointer ${
                      !options.includeHead
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="font-semibold text-neutral-900 text-xs mb-0.5">Raw HTML Snippet</div>
                    <div className="text-neutral-500 text-[11px] leading-tight">
                      Only the rendered inner tags, perfect for embedding inside other CMS or web apps.
                    </div>
                  </button>
                </div>
              </div>

              {/* Theme Selection (when standalone) */}
              {options.includeHead && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                      Embedded Styling Theme
                    </label>
                    <span className="text-[11px] text-neutral-500">CSS is self-contained in &lt;style&gt;</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {THEME_OPTIONS.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setOptions({ ...options, theme: theme.id })}
                        className={`p-2.5 text-left rounded-lg border transition-all cursor-pointer ${
                          options.theme === theme.id
                            ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-3 h-3 rounded-full ${theme.previewColor}`} />
                          <span className="font-semibold text-xs text-neutral-900">{theme.name}</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 line-clamp-1">{theme.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Options */}
              <div className="bg-neutral-50 p-3.5 rounded-lg border border-neutral-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-700">Minify HTML</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.minifyHtml}
                      onChange={(e) => setOptions({ ...options, minifyHtml: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {options.includeHead && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-700">Constrained responsive container (max-w)</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options.responsiveWrapper}
                        onChange={(e) => setOptions({ ...options, responsiveWrapper: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                )}
              </div>

              {/* Size preview info */}
              <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
                <span>Estimated HTML size: <strong className="text-neutral-800">{outputSizeKb} KB</strong></span>
                <span>Filename: <code className="text-indigo-600 bg-neutral-100 px-1 py-0.5 rounded font-mono">{sanitizedTitle}.html</code></span>
              </div>
            </div>
          )}

          {/* Markdown (.md) View */}
          {selectedFormat === 'md' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-900 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <File className="w-4 h-4 text-neutral-700" />
                  <span>Raw Markdown Source (.md)</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Downloads the exact Markdown source code as entered in the editor, preserving all formatting, tables, lists, and code blocks.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
                <span>Total Characters: <strong className="text-neutral-800">{markdown.length}</strong></span>
                <span>Filename: <code className="text-neutral-700 bg-neutral-100 px-1 py-0.5 rounded font-mono">{sanitizedTitle}.md</code></span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with contextual action buttons */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-50 border-t border-neutral-200 gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            {hasArabic && (
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Arabic RTL Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedFormat === 'html' && (
              <>
                <button
                  type="button"
                  id="export-modal-copy-btn"
                  onClick={handleCopy}
                  className="px-3.5 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied HTML!' : 'Copy Code'}</span>
                </button>

                <button
                  type="button"
                  id="export-modal-download-btn"
                  onClick={handleDownloadHtml}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {downloadSuccess === 'html' ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  <span>{downloadSuccess === 'html' ? 'Downloaded!' : 'Download .html'}</span>
                </button>
              </>
            )}

            {selectedFormat === 'docx' && (
              <button
                type="button"
                id="export-modal-download-docx-btn"
                onClick={handleDownloadDocx}
                disabled={isExporting}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Word...</span>
                  </>
                ) : downloadSuccess === 'docx' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Downloaded Word Document!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Word (.docx)</span>
                  </>
                )}
              </button>
            )}

            {selectedFormat === 'odt' && (
              <button
                type="button"
                id="export-modal-download-odt-btn"
                onClick={handleDownloadOdt}
                disabled={isExporting}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating ODT...</span>
                  </>
                ) : downloadSuccess === 'odt' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Downloaded OpenDocument!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download OpenDocument (.odt)</span>
                  </>
                )}
              </button>
            )}

            {selectedFormat === 'md' && (
              <button
                type="button"
                id="export-modal-download-md-btn"
                onClick={handleDownloadMarkdown}
                className="px-4 py-2 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-900 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {downloadSuccess === 'md' ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                <span>{downloadSuccess === 'md' ? 'Downloaded!' : 'Download .md'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
