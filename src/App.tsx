import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { SAMPLE_DOCS } from './data/samples';
import { ViewMode, SampleDoc, TextDirection, ExportFormat } from './types';
import { convertMarkdownToHtml, calculateStats, formatHtml } from './utils/markdown';
import { Navbar } from './components/Navbar';
import { EditorToolbar } from './components/EditorToolbar';
import { MarkdownEditor } from './components/MarkdownEditor';
import { LivePreview } from './components/LivePreview';
import { HtmlViewer } from './components/HtmlViewer';
import { StatsBar } from './components/StatsBar';
import { ExportModal } from './components/ExportModal';
import { OfflineNotification } from './components/OfflineNotification';
import { initPWA } from './pwa';

export default function App() {
  const [markdown, setMarkdown] = useState<string>(SAMPLE_DOCS[0].markdown);
  const [viewMode, setViewMode] = useState<ViewMode>('split-preview');
  const [directionMode, setDirectionMode] = useState<TextDirection>('auto');
  const [isWordWrap, setIsWordWrap] = useState<boolean>(true);
  const [isSyncScroll, setIsSyncScroll] = useState<boolean>(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportInitialFormat, setExportInitialFormat] = useState<ExportFormat>('docx');
  const [isQuickCopied, setIsQuickCopied] = useState<boolean>(false);
  const [needRefresh, setNeedRefresh] = useState<boolean>(false);
  const [offlineReady, setOfflineReady] = useState<boolean>(false);
  const reloadSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);

  const handleOpenExport = (format: ExportFormat = 'docx') => {
    setExportInitialFormat(format);
    setIsExportModalOpen(true);
  };

  const handleToggleDirection = () => {
    setDirectionMode((prev) => {
      if (prev === 'auto') return 'rtl';
      if (prev === 'rtl') return 'ltr';
      return 'auto';
    });
  };

  // Initialize service worker registration and update listener
  useEffect(() => {
    initPWA(
      (reloadFn) => {
        reloadSWRef.current = reloadFn;
        setNeedRefresh(true);
      },
      () => {
        setOfflineReady(true);
      }
    );
  }, []);

  const handleReload = () => {
    if (reloadSWRef.current) {
      reloadSWRef.current(true);
    } else {
      window.location.reload();
    }
  };

  // References for synchronized scrolling and focus
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const htmlViewerRef = useRef<HTMLDivElement | null>(null);
  const isScrollingSyncRef = useRef<boolean>(false);

  // Convert markdown to HTML in real-time
  const { html, rawCleanHtml } = useMemo(() => {
    return convertMarkdownToHtml(markdown);
  }, [markdown]);

  // Compute statistics
  const stats = useMemo(() => {
    return calculateStats(markdown, html);
  }, [markdown, html]);

  // Extract document title from first H1 or default
  const documentTitle = useMemo(() => {
    const match = markdown.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : 'Document';
  }, [markdown]);

  // Handle synchronized scrolling across panels
  const handleEditorScroll = useCallback((percentage: number) => {
    if (!isSyncScroll || isScrollingSyncRef.current) return;
    isScrollingSyncRef.current = true;

    if (previewRef.current) {
      const target = previewRef.current;
      target.scrollTop = percentage * (target.scrollHeight - target.clientHeight);
    }
    if (htmlViewerRef.current) {
      const target = htmlViewerRef.current;
      target.scrollTop = percentage * (target.scrollHeight - target.clientHeight);
    }

    setTimeout(() => {
      isScrollingSyncRef.current = false;
    }, 40);
  }, [isSyncScroll]);

  const handlePreviewScroll = useCallback((percentage: number) => {
    if (!isSyncScroll || isScrollingSyncRef.current) return;
    isScrollingSyncRef.current = true;

    if (textareaRef.current) {
      const target = textareaRef.current;
      target.scrollTop = percentage * (target.scrollHeight - target.clientHeight);
    }

    setTimeout(() => {
      isScrollingSyncRef.current = false;
    }, 40);
  }, [isSyncScroll]);

  const handleHtmlViewerScroll = useCallback((percentage: number) => {
    if (!isSyncScroll || isScrollingSyncRef.current) return;
    isScrollingSyncRef.current = true;

    if (textareaRef.current) {
      const target = textareaRef.current;
      target.scrollTop = percentage * (target.scrollHeight - target.clientHeight);
    }

    setTimeout(() => {
      isScrollingSyncRef.current = false;
    }, 40);
  }, [isSyncScroll]);

  // Insert markdown helper from toolbar
  const handleInsertMarkdown = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markdown.substring(start, end);

    const replacement = selected.length > 0 ? prefix + selected + suffix : prefix + defaultPlaceholder + suffix;
    const updated = markdown.substring(0, start) + replacement + markdown.substring(end);
    setMarkdown(updated);

    requestAnimationFrame(() => {
      textarea.focus();
      if (selected.length > 0) {
        textarea.selectionStart = start + prefix.length;
        textarea.selectionEnd = end + prefix.length;
      } else {
        textarea.selectionStart = start + prefix.length;
        textarea.selectionEnd = start + prefix.length + defaultPlaceholder.length;
      }
    });
  };

  const handleClear = () => {
    if (markdown.trim() && window.confirm('Clear all markdown text in editor?')) {
      setMarkdown('');
      textareaRef.current?.focus();
    }
  };

  const handleSelectSample = (sample: SampleDoc) => {
    setMarkdown(sample.markdown);
  };

  const handleFileUpload = (content: string, _filename: string) => {
    setMarkdown(content);
  };

  const handleReset = () => {
    setMarkdown(SAMPLE_DOCS[0].markdown);
  };

  const handleQuickCopyHtml = async () => {
    try {
      const formatted = formatHtml(rawCleanHtml);
      await navigator.clipboard.writeText(formatted);
      setIsQuickCopied(true);
      setTimeout(() => setIsQuickCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy HTML:', err);
    }
  };

  return (
    <div id="app-root-container" className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-100">
      {/* Top Navigation */}
      <Navbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSelectSample={handleSelectSample}
        onFileUpload={handleFileUpload}
        onReset={handleReset}
        onOpenExport={handleOpenExport}
        onQuickCopyHtml={handleQuickCopyHtml}
        isQuickCopied={isQuickCopied}
      />

      {/* Offline Status and Service Worker Update Notification */}
      <OfflineNotification
        needRefresh={needRefresh}
        onRefresh={handleReload}
        offlineReady={offlineReady}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden bg-neutral-100">
        {/* Editor Column (shown in split and 3-panel modes) */}
        {viewMode !== 'preview-only' && viewMode !== 'html-only' && (
          <div
            id="editor-column"
            className={`flex flex-col h-full border-r border-neutral-200 min-w-0 ${
              viewMode === 'three-panel' ? 'w-full md:w-1/3' : 'w-full md:w-1/2'
            }`}
          >
            <EditorToolbar
              onInsertMarkdown={handleInsertMarkdown}
              onClear={handleClear}
              isWordWrap={isWordWrap}
              onToggleWordWrap={() => setIsWordWrap(!isWordWrap)}
              directionMode={directionMode}
              onToggleDirection={handleToggleDirection}
              hasArabic={stats.hasArabic}
            />
            <MarkdownEditor
              value={markdown}
              onChange={setMarkdown}
              onScroll={handleEditorScroll}
              isWordWrap={isWordWrap}
              onOpenExport={() => setIsExportModalOpen(true)}
              editorRefProp={textareaRef}
              directionMode={directionMode}
            />
          </div>
        )}

        {/* Live Preview Column */}
        {(viewMode === 'split-preview' || viewMode === 'preview-only' || viewMode === 'three-panel') && (
          <div
            id="preview-column"
            className={`flex flex-col h-full min-w-0 ${
              viewMode === 'preview-only'
                ? 'w-full'
                : viewMode === 'three-panel'
                ? 'w-full md:w-1/3 border-r border-neutral-200'
                : 'w-full md:w-1/2'
            }`}
          >
            <LivePreview
              html={html}
              onScroll={handlePreviewScroll}
              previewRefProp={previewRef}
              directionMode={directionMode}
            />
          </div>
        )}

        {/* Raw HTML Code Viewer Column */}
        {(viewMode === 'split-html' || viewMode === 'html-only' || viewMode === 'three-panel') && (
          <div
            id="html-viewer-column"
            className={`flex flex-col h-full min-w-0 ${
              viewMode === 'html-only'
                ? 'w-full'
                : viewMode === 'three-panel'
                ? 'w-full md:w-1/3'
                : 'w-full md:w-1/2'
            }`}
          >
            <HtmlViewer
              rawHtml={rawCleanHtml}
              onScroll={handleHtmlViewerScroll}
              htmlRefProp={htmlViewerRef}
            />
          </div>
        )}
      </main>

      {/* Bottom Statistics Bar */}
      <StatsBar
        stats={stats}
        isSyncScroll={isSyncScroll}
        onToggleSyncScroll={() => setIsSyncScroll(!isSyncScroll)}
      />

      {/* Export to Word, ODT, HTML Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        rawHtml={rawCleanHtml}
        markdown={markdown}
        defaultTitle={documentTitle}
        initialFormat={exportInitialFormat}
      />
    </div>
  );
}
