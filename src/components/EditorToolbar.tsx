import React from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Code,
  FileCode,
  Quote,
  List,
  ListOrdered,
  ListTodo,
  Link,
  Image,
  Table,
  Minus,
  Trash2,
  Languages,
} from 'lucide-react';
import { TextDirection } from '../types';

interface EditorToolbarProps {
  onInsertMarkdown: (prefix: string, suffix?: string, defaultPlaceholder?: string) => void;
  onClear: () => void;
  isWordWrap: boolean;
  onToggleWordWrap: () => void;
  directionMode?: TextDirection;
  onToggleDirection?: () => void;
  hasArabic?: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onInsertMarkdown,
  onClear,
  isWordWrap,
  onToggleWordWrap,
  directionMode = 'auto',
  onToggleDirection,
  hasArabic = false,
}) => {
  return (
    <div
      id="editor-toolbar"
      className="flex items-center justify-between px-3 py-2 bg-neutral-50/90 border-b border-neutral-200 text-neutral-600 gap-1 overflow-x-auto text-xs select-none"
    >
      <div className="flex items-center gap-0.5 flex-wrap">
        {/* Headings */}
        <div className="flex items-center bg-white rounded-md border border-neutral-200 p-0.5 shadow-2xs mr-1">
          <button
            type="button"
            id="toolbar-btn-h1"
            title="Heading 1"
            onClick={() => onInsertMarkdown('# ', '', 'Heading 1')}
            className="p-1.5 hover:bg-neutral-100 hover:text-neutral-900 rounded text-neutral-700 transition-colors"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            id="toolbar-btn-h2"
            title="Heading 2"
            onClick={() => onInsertMarkdown('## ', '', 'Heading 2')}
            className="p-1.5 hover:bg-neutral-100 hover:text-neutral-900 rounded text-neutral-700 transition-colors"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            id="toolbar-btn-h3"
            title="Heading 3"
            onClick={() => onInsertMarkdown('### ', '', 'Heading 3')}
            className="p-1.5 hover:bg-neutral-100 hover:text-neutral-900 rounded text-neutral-700 transition-colors"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Text styling */}
        <div className="flex items-center bg-white rounded-md border border-neutral-200 p-0.5 shadow-2xs mr-1">
          <button
            type="button"
            id="toolbar-btn-bold"
            title="Bold (Ctrl+B)"
            onClick={() => onInsertMarkdown('**', '**', 'bold text')}
            className="p-1.5 hover:bg-neutral-100 hover:text-neutral-900 rounded text-neutral-700 transition-colors"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            id="toolbar-btn-italic"
            title="Italic (Ctrl+I)"
            onClick={() => onInsertMarkdown('*', '*', 'italic text')}
            className="p-1.5 hover:bg-neutral-100 hover:text-neutral-900 rounded text-neutral-700 transition-colors"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            id="toolbar-btn-strikethrough"
            title="Strikethrough"
            onClick={() => onInsertMarkdown('~~', '~~', 'strikethrough text')}
            className="p-1.5 hover:bg-neutral-100 hover:text-neutral-900 rounded text-neutral-700 transition-colors"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Code & Quote */}
        <div className="flex items-center bg-white rounded-md border border-neutral-200 p-0.5 shadow-2xs mr-1">
          <button
            type="button"
            id="toolbar-btn-code-inline"
            title="Inline Code"
            onClick={() => onInsertMarkdown('`', '`', 'code')}
            className="p-1.5 hover:bg-neutral-100 hover:text-neutral-900 rounded text-neutral-700 transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            id="toolbar-btn-code-block"
            title="Code Block"
            onClick={() => onInsertMarkdown('```javascript\n', '\n```', '// Your code here')}
            className="p-1.5 hover:bg-neutral-100 hover:text-neutral-900 rounded text-neutral-700 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            id="toolbar-btn-quote"
            title="Blockquote"
            onClick={() => onInsertMarkdown('> ', '', 'Quote text')}
            className="p-1.5 hover:bg-neutral-100 hover:text-neutral-900 rounded text-neutral-700 transition-colors"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center bg-white rounded-md border border-neutral-200 p-0.5 shadow-2xs mr-1">
          <button
            type="button"
            id="toolbar-btn-ul"
            title="Unordered List"
            onClick={() => onInsertMarkdown('- ', '', 'List item')}
            className="p-1.5 hover:bg-neutral-100 hover:text-neutral-900 rounded text-neutral-700 transition-colors"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            id="toolbar-btn-ol"
            title="Ordered List"
            onClick={() => onInsertMarkdown('1. ', '', 'First item')}
            className="p-1.5 hover:bg-neutral-100 hover:text-neutral-900 rounded text-neutral-700 transition-colors"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            id="toolbar-btn-task"
            title="Task List"
            onClick={() => onInsertMarkdown('- [ ] ', '', 'New task')}
            className="p-1.5 hover:bg-neutral-100 hover:text-neutral-900 rounded text-neutral-700 transition-colors"
          >
            <ListTodo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Links, Media & Tables */}
        <div className="flex items-center bg-white rounded-md border border-neutral-200 p-0.5 shadow-2xs mr-1">
          <button
            type="button"
            id="toolbar-btn-link"
            title="Link (Ctrl+K)"
            onClick={() => onInsertMarkdown('[', '](https://example.com)', 'link text')}
            className="p-1.5 hover:bg-neutral-100 hover:text-neutral-900 rounded text-neutral-700 transition-colors"
          >
            <Link className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            id="toolbar-btn-image"
            title="Image"
            onClick={() => onInsertMarkdown('![', '](https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800)', 'Image description')}
            className="p-1.5 hover:bg-neutral-100 hover:text-neutral-900 rounded text-neutral-700 transition-colors"
          >
            <Image className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            id="toolbar-btn-table"
            title="Insert Table"
            onClick={() =>
              onInsertMarkdown(
                '| Column 1 | Column 2 | Column 3 |\n| :--- | :---: | ---: |\n| Row 1 | Cell | 100 |\n| Row 2 | Cell | 200 |\n',
                '',
                ''
              )
            }
            className="p-1.5 hover:bg-neutral-100 hover:text-neutral-900 rounded text-neutral-700 transition-colors"
          >
            <Table className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            id="toolbar-btn-hr"
            title="Horizontal Divider"
            onClick={() => onInsertMarkdown('\n---\n\n', '', '')}
            className="p-1.5 hover:bg-neutral-100 hover:text-neutral-900 rounded text-neutral-700 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right controls: Direction, Word Wrap & Clear */}
      <div className="flex items-center gap-1.5">
        {onToggleDirection && (
          <button
            type="button"
            id="toolbar-btn-direction"
            onClick={onToggleDirection}
            title={`Direction: ${directionMode.toUpperCase()} (Click to cycle Auto / RTL / LTR)`}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-sans border transition-colors cursor-pointer ${
              hasArabic && directionMode === 'auto'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
                : directionMode === 'rtl'
                ? 'bg-indigo-50 border-indigo-300 text-indigo-800 font-medium'
                : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Languages className="w-3 h-3 text-neutral-500" />
            <span>
              {directionMode === 'rtl'
                ? 'RTL'
                : directionMode === 'ltr'
                ? 'LTR'
                : hasArabic
                ? 'Auto RTL (عربي)'
                : 'Auto RTL'}
            </span>
          </button>
        )}

        <button
          type="button"
          id="toolbar-btn-wrap"
          onClick={onToggleWordWrap}
          title={isWordWrap ? 'Disable Word Wrap' : 'Enable Word Wrap'}
          className={`px-2 py-1 rounded font-mono text-[11px] border transition-colors ${
            isWordWrap
              ? 'bg-neutral-200 border-neutral-300 text-neutral-800'
              : 'bg-white border-neutral-200 text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Wrap
        </button>
        <button
          type="button"
          id="toolbar-btn-clear"
          title="Clear editor text"
          onClick={onClear}
          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
