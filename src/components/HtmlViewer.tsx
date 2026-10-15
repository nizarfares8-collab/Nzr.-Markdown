import React, { useState, useMemo, useRef } from 'react';
import { Code2, Copy, Check, Minimize2, AlignLeft, WrapText } from 'lucide-react';
import hljs from 'highlight.js';
import { formatHtml, minifyHtml } from '../utils/markdown';

interface HtmlViewerProps {
  rawHtml: string;
  onScroll?: (scrollTopPercentage: number) => void;
  htmlRefProp?: React.RefObject<HTMLDivElement | null>;
}

export const HtmlViewer: React.FC<HtmlViewerProps> = ({
  rawHtml,
  onScroll,
  htmlRefProp,
}) => {
  const localRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = htmlRefProp || localRef;
  const [isMinified, setIsMinified] = useState(false);
  const [isWordWrap, setIsWordWrap] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  // Formatted or minified code string
  const displayCode = useMemo(() => {
    if (!rawHtml) return '';
    return isMinified ? minifyHtml(rawHtml) : formatHtml(rawHtml);
  }, [rawHtml, isMinified]);

  // Syntax highlighted HTML
  const highlightedHtml = useMemo(() => {
    if (!displayCode) return '';
    try {
      return hljs.highlight(displayCode, { language: 'html' }).value;
    } catch {
      return displayCode;
    }
  }, [displayCode]);

  const lines = useMemo(() => {
    return displayCode ? displayCode.split('\n') : [];
  }, [displayCode]);

  const handleCopy = async () => {
    if (!displayCode) return;
    try {
      await navigator.clipboard.writeText(displayCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy HTML:', err);
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current || !onScroll) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight > clientHeight) {
      const percentage = scrollTop / (scrollHeight - clientHeight);
      onScroll(percentage);
    }
  };

  return (
    <div
      id="html-viewer-panel"
      className="flex-1 flex flex-col h-full bg-[#0d1117] text-[#e6edf3] overflow-hidden"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-neutral-800 text-xs text-neutral-300 select-none shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-neutral-200">HTML Output Viewer</span>
          <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[10px] font-mono border border-neutral-700">
            {lines.length} lines • {(new Blob([displayCode]).size / 1024).toFixed(1)} KB
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Formatted vs Minified switch */}
          <div className="flex items-center bg-[#0d1117] rounded-md border border-neutral-700 p-0.5 text-[11px]">
            <button
              type="button"
              id="btn-format-pretty"
              title="Formatted with Indentation"
              onClick={() => setIsMinified(false)}
              className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                !isMinified ? 'bg-neutral-700 text-white font-medium' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <AlignLeft className="w-3 h-3" />
              <span>Pretty</span>
            </button>
            <button
              type="button"
              id="btn-format-minify"
              title="Minified"
              onClick={() => setIsMinified(true)}
              className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                isMinified ? 'bg-neutral-700 text-white font-medium' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Minimize2 className="w-3 h-3" />
              <span>Minified</span>
            </button>
          </div>

          {/* Word wrap toggle */}
          <button
            type="button"
            id="btn-html-wrap"
            onClick={() => setIsWordWrap(!isWordWrap)}
            title={isWordWrap ? 'Disable Wrap' : 'Enable Wrap'}
            className={`p-1.5 rounded border transition-colors ${
              isWordWrap
                ? 'bg-neutral-700 border-neutral-600 text-neutral-100'
                : 'bg-[#0d1117] border-neutral-700 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <WrapText className="w-3.5 h-3.5" />
          </button>

          {/* Copy HTML button */}
          <button
            type="button"
            id="btn-copy-html"
            onClick={handleCopy}
            disabled={!displayCode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              isCopied
                ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
            }`}
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied' : 'Copy HTML'}</span>
          </button>
        </div>
      </div>

      {/* Code Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        id="html-content-scroll"
        className="flex-1 flex overflow-auto bg-[#0d1117]"
      >
        {displayCode ? (
          <div className="flex min-w-full font-mono text-xs sm:text-[13px] leading-5">
            {/* Line numbers for pretty mode */}
            {!isMinified && (
              <div
                className="w-11 sm:w-12 py-3 bg-[#161b22]/70 text-neutral-500 text-right pr-2 select-none border-r border-neutral-800 shrink-0"
                aria-hidden="true"
              >
                {lines.map((_, i) => (
                  <div key={i} className="h-5 leading-5">
                    {i + 1}
                  </div>
                ))}
              </div>
            )}

            {/* Syntax-highlighted code output */}
            <div className="flex-1 p-3 overflow-x-auto">
              <pre
                className={`font-mono text-neutral-100 ${
                  isWordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'
                }`}
              >
                <code
                  className="hljs language-html"
                  dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                />
              </pre>
            </div>
          </div>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-center p-8 text-neutral-500">
            <Code2 className="w-10 h-10 mb-3 text-neutral-600 stroke-1" />
            <h3 className="text-sm font-semibold text-neutral-400 mb-1">No HTML generated yet</h3>
            <p className="text-xs text-neutral-500 max-w-xs">
              Enter markdown in the editor to view generated HTML in real time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
