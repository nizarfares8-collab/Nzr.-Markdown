import { ExportOptions, ExportTheme } from '../types';
import { formatHtml, minifyHtml, containsArabic } from './markdown';

const SHARED_RTL_STYLES = `
    /* Automatic RTL alignment and Arabic typography */
    [dir="auto"] { text-align: start; }
    [dir="rtl"], [dir="auto"]:dir(rtl) { text-align: right; direction: rtl; }
    blockquote {
      border-inline-start: 4px solid var(--accent, #4f46e5);
      border-inline-end: 0;
      padding-inline-start: 1.25rem;
      padding-inline-end: 0.75rem;
      text-align: start;
    }
    blockquote:dir(rtl), [dir="rtl"] blockquote {
      border-left: 0;
      border-right: 4px solid var(--accent, #4f46e5);
      text-align: right;
      font-style: normal;
    }
    ul, ol { padding-inline-start: 1.75rem; padding-inline-end: 0; }
    li { text-align: start; }
    li:dir(rtl), [dir="rtl"] li { text-align: right; }
    th, td { text-align: start; }
    pre, code, .code-block-wrapper { direction: ltr !important; text-align: left !important; unicode-bidi: isolate; }
    input[type="checkbox"] { margin-inline-end: 0.5rem; margin-inline-start: 0; }
`;

const THEME_STYLES: Record<ExportTheme, string> = {
  modern: `
    :root {
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #0f172a;
      --muted: #64748b;
      --accent: #4f46e5;
      --border: #e2e8f0;
      --code-bg: #0f172a;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Arabic", "Segoe UI Arabic", Tahoma, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.65;
      padding: 2rem 1rem;
      margin: 0;
    }
    .markdown-container {
      max-width: 820px;
      margin: 0 auto;
      background: var(--card-bg);
      padding: 3rem;
      border-radius: 1rem;
      border: 1px solid var(--border);
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
    }
    h1, h2, h3, h4, h5, h6 { color: var(--text); font-weight: 700; line-height: 1.25; margin-top: 2rem; margin-bottom: 0.75rem; }
    h1 { font-size: 2.25rem; border-bottom: 2px solid var(--border); padding-bottom: 0.5rem; }
    h2 { font-size: 1.65rem; border-bottom: 1px solid var(--border); padding-bottom: 0.35rem; }
    h3 { font-size: 1.3rem; }
    a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
    p { margin: 1rem 0; text-align: start; }
    ul, ol { margin: 1rem 0; }
    li { margin-bottom: 0.35rem; }
    blockquote {
      background: #f1f5f9;
      color: #334155;
      font-style: italic;
      border-radius: 0.5rem;
      margin: 1.5rem 0;
    }
    pre {
      background: var(--code-bg);
      color: #f8fafc;
      padding: 1.25rem;
      border-radius: 0.75rem;
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.9rem;
    }
    code:not(pre code) {
      background: #f1f5f9;
      color: #0f172a;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 0.875em;
    }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
    th, td { border: 1px solid var(--border); padding: 0.75rem 1rem; }
    th { background: #f8fafc; font-weight: 600; }
    hr { border: 0; height: 1px; background: var(--border); margin: 2.5rem 0; }
    img { max-width: 100%; border-radius: 0.5rem; }
    ${SHARED_RTL_STYLES}
  `,
  github: `
    body {
      font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans Arabic","Segoe UI Arabic","Noto Sans",Helvetica,Arial,sans-serif;
      font-size: 16px;
      line-height: 1.5;
      color: #1f2328;
      background-color: #ffffff;
      padding: 2rem 1rem;
      margin: 0;
    }
    .markdown-container { max-width: 920px; margin: 0 auto; padding: 2rem; border: 1px solid #d0d7de; border-radius: 6px; }
    h1, h2, h3, h4 { font-weight: 600; margin-top: 24px; margin-bottom: 16px; line-height: 1.25; }
    h1 { font-size: 2em; padding-bottom: 0.3em; border-bottom: 1px solid #d0d7de; }
    h2 { font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid #d0d7de; }
    a { color: #0969da; text-decoration: none; }
    a:hover { text-decoration: underline; }
    blockquote { padding: 0 1em; color: #59636e; border-inline-start: 0.25em solid #d0d7de; margin: 0 0 16px 0; }
    pre { padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background-color: #f6f8fa; border-radius: 6px; font-family: ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace; }
    code:not(pre code) { padding: .2em .4em; margin: 0; font-size: 85%; white-space: break-spaces; background-color: rgba(175,184,193,0.2); border-radius: 6px; }
    table { border-spacing: 0; border-collapse: collapse; margin: 16px 0; width: 100%; }
    td, th { padding: 6px 13px; border: 1px solid #d0d7de; }
    th { font-weight: 600; background: #f6f8fa; }
    hr { height: .25em; padding: 0; margin: 24px 0; background-color: #d0d7de; border: 0; }
    ${SHARED_RTL_STYLES}
  `,
  minimal: `
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans Arabic", "Segoe UI Arabic", Roboto, sans-serif;
      color: #18181b;
      background: #fafafa;
      line-height: 1.7;
      padding: 3rem 1.5rem;
      margin: 0;
    }
    .markdown-container { max-width: 740px; margin: 0 auto; }
    h1, h2, h3 { font-weight: 600; letter-spacing: -0.02em; margin-top: 2rem; }
    h1 { font-size: 2rem; }
    a { color: #18181b; text-decoration: underline; text-underline-offset: 4px; }
    pre { background: #18181b; color: #fafafa; padding: 1.25rem; border-radius: 8px; overflow-x: auto; font-size: 0.875rem; }
    code:not(pre code) { background: #e4e4e7; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
    blockquote { border-inline-start: 3px solid #71717a; padding-inline-start: 1rem; color: #52525b; margin: 1.5rem 0; font-style: italic; }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
    th, td { border-bottom: 1px solid #e4e4e7; padding: 0.75rem 0.5rem; }
    th { font-weight: 600; color: #18181b; }
    ${SHARED_RTL_STYLES}
  `,
  serif: `
    body {
      font-family: "Noto Sans Arabic", "Segoe UI Arabic", Georgia, Cambria, "Times New Roman", Times, serif;
      color: #2c2925;
      background: #fdfbf7;
      line-height: 1.8;
      padding: 3.5rem 1.5rem;
      margin: 0;
      font-size: 18px;
    }
    .markdown-container { max-width: 760px; margin: 0 auto; }
    h1, h2, h3 { font-family: "Noto Sans Arabic", "Palatino Linotype", Book Antiqua, Palatino, serif; font-weight: normal; color: #171614; }
    h1 { font-size: 2.4rem; margin-bottom: 1rem; }
    h2 { font-size: 1.7rem; margin-top: 2.2rem; }
    a { color: #8b3a2b; text-decoration: underline; }
    blockquote { border-inline-start: 3px solid #d3c7b8; padding-inline-start: 1.2rem; color: #695e54; font-style: italic; margin: 2rem 0; }
    pre { background: #2c2925; color: #f4efe6; padding: 1.25rem; border-radius: 6px; overflow-x: auto; font-family: monospace; font-size: 15px; }
    code:not(pre code) { background: #eee8df; padding: 2px 6px; border-radius: 3px; font-size: 0.88em; }
    table { width: 100%; border-collapse: collapse; margin: 2rem 0; font-size: 16px; }
    th, td { border: 1px solid #d9d2c7; padding: 8px 12px; }
    th { background: #f3ede2; font-weight: bold; }
    ${SHARED_RTL_STYLES}
  `,
  dark: `
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans Arabic", "Segoe UI Arabic", Roboto, sans-serif;
      color: #e2e8f0;
      background-color: #0f172a;
      line-height: 1.65;
      padding: 2rem 1rem;
      margin: 0;
    }
    .markdown-container { max-width: 840px; margin: 0 auto; background: #1e293b; padding: 2.5rem; border-radius: 12px; border: 1px solid #334155; }
    h1, h2, h3 { color: #f8fafc; font-weight: 700; }
    h1 { font-size: 2.25rem; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; }
    h2 { font-size: 1.6rem; border-bottom: 1px solid #334155; padding-bottom: 0.35rem; }
    a { color: #818cf8; text-decoration: underline; }
    blockquote { border-inline-start: 4px solid #6366f1; padding: 0.75rem 1.25rem; background: #1e1b4b/40; color: #cbd5e1; border-radius: 8px; margin: 1.5rem 0; }
    pre { background: #0b0f19; color: #f1f5f9; padding: 1.25rem; border-radius: 8px; border: 1px solid #334155; overflow-x: auto; font-family: monospace; }
    code:not(pre code) { background: #334155; color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.88em; }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
    th, td { border: 1px solid #334155; padding: 0.75rem 1rem; }
    th { background: #0f172a; }
    hr { border: 0; height: 1px; background: #334155; margin: 2rem 0; }
    ${SHARED_RTL_STYLES}
  `,
};

/**
 * Builds a complete standalone HTML document string
 */
export function buildStandaloneHtml(htmlContent: string, options: ExportOptions): string {
  let content = htmlContent;

  if (options.minifyHtml) {
    content = minifyHtml(content);
  } else {
    content = formatHtml(content);
  }

  if (!options.includeHead) {
    return content;
  }

  const hasArabic = containsArabic(content);
  const themeStyle = THEME_STYLES[options.theme] || THEME_STYLES.modern;

  const wrapperStart = options.responsiveWrapper ? '    <main class="markdown-container" dir="auto">\n' : '    <main dir="auto">\n';
  const wrapperEnd = options.responsiveWrapper ? '\n    </main>' : '\n    </main>';

  return `<!DOCTYPE html>
<html lang="${hasArabic ? 'ar' : 'en'}" dir="auto">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeXml(options.documentTitle || 'Markdown Export')}</title>
    <meta name="generator" content="Markdown to HTML Converter" />
    <style>
${themeStyle}
    </style>
  </head>
  <body>
${wrapperStart}${content}${wrapperEnd}
  </body>
</html>`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Triggers a client-side file download in browser
 */
export function downloadFile(filename: string, content: string, mimeType: string = 'text/html') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  downloadBlob(filename, blob);
}

/**
 * Triggers a download from a Blob
 */
export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export { exportToDocx } from './docxExporter';
export { exportToOdt } from './odtExporter';
