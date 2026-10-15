import React, { useRef, useEffect, useState } from 'react';
import { TextDirection } from '../types';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onScroll?: (scrollTopPercentage: number) => void;
  isWordWrap: boolean;
  onOpenExport?: () => void;
  editorRefProp?: React.RefObject<HTMLTextAreaElement | null>;
  directionMode?: TextDirection;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  onScroll,
  isWordWrap,
  onOpenExport,
  editorRefProp,
  directionMode = 'auto',
}) => {
  const localRef = useRef<HTMLTextAreaElement | null>(null);
  const textareaRef = editorRefProp || localRef;
  const lineNumbersRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const lines = value.split('\n');
  const lineCount = Math.max(1, lines.length);

  // Sync line numbers scroll with textarea
  const handleScroll = () => {
    if (!textareaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = textareaRef.current;

    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }

    if (onScroll && scrollHeight > clientHeight) {
      const percentage = scrollTop / (scrollHeight - clientHeight);
      onScroll(percentage);
    }
  };

  // Keyboard shortcut handlers
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Save shortcut: Ctrl+S or Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (onOpenExport) onOpenExport();
      return;
    }

    // Bold shortcut: Ctrl+B or Cmd+B
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      wrapSelection(textarea, '**', '**', 'bold text');
      return;
    }

    // Italic shortcut: Ctrl+I or Cmd+I
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      wrapSelection(textarea, '*', '*', 'italic text');
      return;
    }

    // Link shortcut: Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      wrapSelection(textarea, '[', '](https://)', 'link title');
      return;
    }

    // Tab key handling
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (e.shiftKey) {
        // Dedent: remove up to 2 spaces before line start
        const textBefore = value.substring(0, start);
        const lastNewline = textBefore.lastIndexOf('\n');
        const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
        const lineText = value.substring(lineStart, end);

        if (lineText.startsWith('  ')) {
          const updated = value.substring(0, lineStart) + value.substring(lineStart + 2);
          onChange(updated);
          requestAnimationFrame(() => {
            textarea.selectionStart = Math.max(lineStart, start - 2);
            textarea.selectionEnd = Math.max(lineStart, end - 2);
          });
        }
      } else {
        // Indent: insert 2 spaces
        const updated = value.substring(0, start) + '  ' + value.substring(end);
        onChange(updated);
        requestAnimationFrame(() => {
          textarea.selectionStart = start + 2;
          textarea.selectionEnd = start + 2;
        });
      }
    }
  };

  const wrapSelection = (
    textarea: HTMLTextAreaElement,
    prefix: string,
    suffix: string,
    defaultText: string
  ) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const replacement = selected.length > 0 ? prefix + selected + suffix : prefix + defaultText + suffix;
    const updated = value.substring(0, start) + replacement + value.substring(end);
    onChange(updated);

    requestAnimationFrame(() => {
      textarea.focus();
      if (selected.length > 0) {
        textarea.selectionStart = start + prefix.length;
        textarea.selectionEnd = end + prefix.length;
      } else {
        textarea.selectionStart = start + prefix.length;
        textarea.selectionEnd = start + prefix.length + defaultText.length;
      }
    });
  };

  // Drag and drop markdown file
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          onChange(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div
      id="markdown-editor-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex-1 flex h-full bg-white overflow-hidden transition-colors ${
        isDragging ? 'ring-2 ring-indigo-500 bg-indigo-50/20' : ''
      }`}
    >
      {/* Line Numbers Gutter */}
      <div
        ref={lineNumbersRef}
        className="w-11 sm:w-12 py-3 bg-neutral-50 border-r border-neutral-200 text-right pr-2 select-none overflow-hidden font-mono text-xs text-neutral-400 shrink-0"
        aria-hidden="true"
      >
        {Array.from({ length: lineCount }).map((_, idx) => (
          <div key={idx} className="h-5 leading-5">
            {idx + 1}
          </div>
        ))}
      </div>

      {/* Editor Textarea */}
      <textarea
        ref={textareaRef}
        id="markdown-textarea"
        dir={directionMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        placeholder="Type or paste your Markdown here... You can also drag and drop a .md file!"
        spellCheck={false}
        className={`flex-1 w-full h-full p-3 font-mono text-xs sm:text-sm text-neutral-800 bg-transparent resize-none outline-none leading-5 ${
          isWordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'
        }`}
      />

      {/* Drag & drop overlay indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-xs flex items-center justify-center pointer-events-none border-2 border-dashed border-indigo-500 rounded-lg m-2 z-10">
          <p className="text-indigo-700 font-medium text-sm bg-white/95 px-4 py-2 rounded-lg shadow-sm">
            Drop Markdown or text file to load
          </p>
        </div>
      )}
    </div>
  );
};
