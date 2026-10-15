export type ViewMode = 'split-preview' | 'split-html' | 'preview-only' | 'html-only' | 'three-panel';

export type ExportTheme = 'modern' | 'github' | 'minimal' | 'serif' | 'dark';

export type ExportFormat = 'html' | 'docx' | 'odt' | 'md';

export type TextDirection = 'auto' | 'ltr' | 'rtl';

export interface DocumentStats {
  words: number;
  characters: number;
  lines: number;
  readingTimeMinutes: number;
  htmlSizeKb: number;
  headingsCount: number;
  hasArabic: boolean;
  isRtl: boolean;
}

export interface SampleDoc {
  id: string;
  title: string;
  category: string;
  markdown: string;
}

export interface ExportOptions {
  format: ExportFormat;
  includeHead: boolean;
  documentTitle: string;
  theme: ExportTheme;
  minifyHtml: boolean;
  includeSyntaxHighlighting: boolean;
  responsiveWrapper: boolean;
}
