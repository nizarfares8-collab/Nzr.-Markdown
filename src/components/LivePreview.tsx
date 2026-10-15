import React, { useEffect, useRef } from 'react';
import { Eye } from 'lucide-react';
import { TextDirection } from '../types';
import { containsArabic } from '../utils/markdown';

interface LivePreviewProps {
  html: string;
  onScroll?: (scrollTopPercentage: number) => void;
  previewRefProp?: React.RefObject<HTMLDivElement | null>;
  directionMode?: TextDirection;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  html,
  onScroll,
  previewRefProp,
  directionMode = 'auto',
}) => {
  const localRef = useRef<HTMLDivElement | null>(null);
  const containerRef = previewRefProp || localRef;
  const hasArabic = containsArabic(html);

  // Attach event listener for the custom copy code buttons embedded inside rendered code blocks
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleCopyClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('.copy-code-btn') as HTMLElement;
      if (!button) return;

      const codeToCopy = button.getAttribute('data-code');
      if (codeToCopy) {
        navigator.clipboard.writeText(codeToCopy).then(() => {
          const originalHtml = button.innerHTML;
          button.innerHTML = '<span class="text-emerald-400">Copied!</span>';
          setTimeout(() => {
            button.innerHTML = originalHtml;
          }, 1800);
        });
      }
    };

    container.addEventListener('click', handleCopyClick);
    return () => {
      container.removeEventListener('click', handleCopyClick);
    };
  }, [html, containerRef]);

  const handleScroll = () => {
    if (!containerRef.current || !onScroll) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight > clientHeight) {
      const percentage = scrollTop / (scrollHeight - clientHeight);
      onScroll(percentage);
    }
  };

  return (
    <div
      id="live-preview-panel"
      className="flex-1 flex flex-col h-full bg-white overflow-hidden"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-50/90 border-b border-neutral-200 text-xs text-neutral-600 select-none shrink-0">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-semibold text-neutral-800">Live Visual Preview</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200/60">
            Real-time
          </span>
          {hasArabic && (
            <span
              id="preview-arabic-badge"
              className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-medium border border-indigo-200/60"
              title="Arabic content detected: Automatic RTL alignment active"
            >
              Auto RTL
            </span>
          )}
        </div>
      </div>

      {/* Rendered content */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        id="preview-content-scroll"
        className="flex-1 p-6 sm:p-8 overflow-y-auto overflow-x-hidden bg-white selection:bg-indigo-100"
      >
        {html ? (
          <div
            id="rendered-markdown"
            dir={directionMode}
            className="markdown-preview max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400">
            <Eye className="w-10 h-10 mb-3 text-neutral-300 stroke-1" />
            <h3 className="text-sm font-semibold text-neutral-600 mb-1">No content to preview</h3>
            <p className="text-xs text-neutral-400 max-w-xs">
              Start typing markdown in the editor or select a sample document from the top bar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
