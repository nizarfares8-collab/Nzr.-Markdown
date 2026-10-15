import { Marked, Tokens } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

// Configure custom marked instance
const marked = new Marked({
  gfm: true,
  breaks: true,
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeHtmlAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Arabic and RTL Unicode detection regex
// Arabic: 0600-06FF, 0750-077F, 08A0-08FF, FB50-FDFF, FE70-FEFF
// Hebrew: 0590-05FF
export const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
export const RTL_REGEX = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * Checks if string contains any Arabic characters
 */
export function containsArabic(text: string): boolean {
  return ARABIC_REGEX.test(text);
}

/**
 * Checks if string contains any RTL characters (Arabic, Hebrew, Persian, Urdu)
 */
export function containsRtl(text: string): boolean {
  return RTL_REGEX.test(text);
}

/**
 * Detects whether the first strong directional character is RTL or LTR
 */
export function detectTextDirection(text: string): 'rtl' | 'ltr' {
  if (!text) return 'ltr';
  // Match first character with strong directionality
  const match = text.match(/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z]/);
  if (match) {
    return RTL_REGEX.test(match[0]) ? 'rtl' : 'ltr';
  }
  return 'ltr';
}

marked.use({
  renderer: {
    heading(token: Tokens.Heading) {
      const content = this.parser.parseInline(token.tokens);
      return `<h${token.depth} dir="auto">${content}</h${token.depth}>\n`;
    },
    paragraph(token: Tokens.Paragraph) {
      const content = this.parser.parseInline(token.tokens);
      return `<p dir="auto">${content}</p>\n`;
    },
    blockquote(token: Tokens.Blockquote) {
      const body = this.parser.parse(token.tokens);
      return `<blockquote dir="auto">\n${body}</blockquote>\n`;
    },
    list(token: Tokens.List) {
      let body = '';
      for (const item of token.items) {
        body += this.listitem(item);
      }
      const tag = token.ordered ? 'ol' : 'ul';
      const startAttr = token.ordered && token.start !== 1 ? ` start="${token.start}"` : '';
      return `<${tag}${startAttr} dir="auto">\n${body}</${tag}>\n`;
    },
    listitem(token: Tokens.ListItem) {
      let itemBody = '';
      if (token.task) {
        const checkbox = `<input type="checkbox" disabled${token.checked ? ' checked' : ''} /> `;
        itemBody = checkbox + this.parser.parse(token.tokens);
      } else {
        itemBody = this.parser.parse(token.tokens);
      }
      return `<li dir="auto">${itemBody}</li>\n`;
    },
    table(token: Tokens.Table) {
      let header = '';
      for (const cell of token.header) {
        const alignAttr = cell.align ? ` align="${cell.align}"` : '';
        header += `<th dir="auto"${alignAttr}>${this.parser.parseInline(cell.tokens)}</th>`;
      }
      let body = '';
      for (const row of token.rows) {
        let rowHtml = '';
        for (const cell of row) {
          const alignAttr = cell.align ? ` align="${cell.align}"` : '';
          rowHtml += `<td dir="auto"${alignAttr}>${this.parser.parseInline(cell.tokens)}</td>`;
        }
        body += `<tr>${rowHtml}</tr>\n`;
      }
      return `<div class="table-responsive my-4 overflow-x-auto"><table dir="auto"><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></div>\n`;
    },
    link(token: Tokens.Link) {
      const titleAttr = token.title ? ` title="${escapeHtmlAttr(token.title)}"` : '';
      return `<a href="${token.href}"${titleAttr} target="_blank" rel="noopener noreferrer">${token.text}</a>`;
    },
    code(token: Tokens.Code) {
      const lang = token.lang ? token.lang.trim() : '';
      const validLang = lang && hljs.getLanguage(lang) ? lang : undefined;
      let highlighted = '';
      try {
        if (validLang) {
          highlighted = hljs.highlight(token.text, { language: validLang, ignoreIllegals: true }).value;
        } else {
          highlighted = hljs.highlightAuto(token.text).value;
        }
      } catch {
        highlighted = escapeHtml(token.text);
      }

      const languageLabel = validLang
        ? `<span class="text-xs uppercase font-mono tracking-wider text-neutral-400 select-none">${validLang}</span>`
        : '<span class="text-xs text-neutral-400 select-none font-mono">code</span>';

      return `<div class="code-block-wrapper my-4 rounded-xl overflow-hidden border border-neutral-800 bg-[#161b22] text-neutral-100 shadow-md" dir="ltr">
  <div class="flex items-center justify-between px-4 py-2 bg-[#0d1117] border-b border-neutral-800 text-xs font-mono text-neutral-400" dir="ltr">
    ${languageLabel}
    <button type="button" class="copy-code-btn inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition-colors text-xs cursor-pointer" data-code="${escapeHtmlAttr(token.text)}">
      <span>Copy</span>
    </button>
  </div>
  <pre class="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed bg-[#161b22]" dir="ltr"><code class="hljs ${validLang ? `language-${validLang}` : ''}">${highlighted}</code></pre>
</div>`;
    },
  },
});

/**
 * Converts Markdown string to sanitized HTML string
 */
export function convertMarkdownToHtml(markdown: string): { html: string; rawCleanHtml: string } {
  if (!markdown || markdown.trim() === '') {
    return { html: '', rawCleanHtml: '' };
  }

  try {
    const rawParsed = marked.parse(markdown) as string;
    // Sanitize with DOMPurify allowing classes, ids, targets, data attributes, and dir
    const cleanHtml = DOMPurify.sanitize(rawParsed, {
      ADD_TAGS: ['iframe', 'button'],
      ADD_ATTR: ['target', 'rel', 'class', 'id', 'data-code', 'type', 'checked', 'disabled', 'dir', 'align'],
    });

    return {
      html: cleanHtml,
      rawCleanHtml: cleanHtml,
    };
  } catch (err) {
    console.error('Error converting markdown:', err);
    return {
      html: `<p class="text-rose-600">Failed to render markdown: ${err instanceof Error ? err.message : String(err)}</p>`,
      rawCleanHtml: '',
    };
  }
}

/**
 * Pretty-formats an HTML string with clean indentation
 */
export function formatHtml(html: string): string {
  if (!html) return '';
  let formatted = '';
  let indent = 0;
  const tab = '  ';

  // Split tags and text
  const tokens = html
    .replace(/>\s*</g, '><')
    .replace(/</g, '\n<')
    .split('\n')
    .filter(line => line.trim() !== '');

  for (let i = 0; i < tokens.length; i++) {
    const line = tokens[i].trim();
    if (!line) continue;

    // Closing tag
    if (line.match(/^<\/[^>]+>/)) {
      indent = Math.max(0, indent - 1);
    }

    formatted += tab.repeat(indent) + line + '\n';

    // Opening tag that isn't self-closing or inline
    if (
      line.match(/^<[^\/!][^>]*[^\/]>/) &&
      !line.match(/^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)[^>]*>/i) &&
      !line.match(/<\/[^>]+>$/) // Tag opens and closes on same line
    ) {
      indent++;
    }
  }

  return formatted.trim();
}

/**
 * Minifies HTML by removing unnecessary whitespaces
 */
export function minifyHtml(html: string): string {
  return html
    .replace(/\n+/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

/**
 * Calculate document metrics
 */
export function calculateStats(markdown: string, html: string) {
  const words = (markdown.trim().match(/\S+/g) || []).length;
  const characters = markdown.length;
  const lines = markdown ? markdown.split('\n').length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
  const htmlSizeKb = Number((new Blob([html]).size / 1024).toFixed(2));
  const headingsCount = (markdown.match(/^#{1,6}\s/gm) || []).length;
  const hasArabic = containsArabic(markdown);
  const isRtl = detectTextDirection(markdown) === 'rtl';

  return {
    words,
    characters,
    lines,
    readingTimeMinutes,
    htmlSizeKb,
    headingsCount,
    hasArabic,
    isRtl,
  };
}
