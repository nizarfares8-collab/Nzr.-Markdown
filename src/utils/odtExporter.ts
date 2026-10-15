import JSZip from 'jszip';
import { marked, Tokens, Token } from 'marked';
import { containsArabic } from './markdown';

export interface OdtExportOptions {
  title?: string;
  author?: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Converts Markdown text into a valid OpenDocument Text (.odt) Blob
 * compliant with ODF 1.2 specifications and fully compatible with LibreOffice Writer,
 * Apache OpenOffice, Google Docs, and Microsoft Word.
 */
export async function exportToOdt(markdown: string, options: OdtExportOptions = {}): Promise<Blob> {
  const docTitle = options.title?.trim() || 'Markdown Document';
  const tokens = marked.lexer(markdown);

  // Generate content.xml body
  const bodyXml = renderTokensToOdt(tokens);

  // Build the complete ODT ZIP archive
  const zip = new JSZip();

  // 1. mimetype: MUST be stored uncompressed as the first file in the ZIP archive
  zip.file('mimetype', 'application/vnd.oasis.opendocument.text', { compression: 'STORE' });

  // 2. META-INF/manifest.xml
  const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
  <manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.text"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`;
  zip.file('META-INF/manifest.xml', manifestXml);

  // 3. meta.xml
  const metaXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0"
  office:version="1.2">
  <office:meta>
    <dc:title>${escapeXml(docTitle)}</dc:title>
    <dc:creator>${escapeXml(options.author || 'Markdown to ODT Converter')}</dc:creator>
    <dc:date>${new Date().toISOString()}</dc:date>
    <meta:generator>Markdown to HTML/ODT Studio</meta:generator>
  </office:meta>
</office:document-meta>`;
  zip.file('meta.xml', metaXml);

  // 4. styles.xml
  const stylesXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
  xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"
  office:version="1.2">
  <office:styles>
    <style:default-style style:family="paragraph">
      <style:paragraph-properties fo:line-height="150%" fo:margin-bottom="0.25cm" fo:text-align="start"/>
      <style:text-properties fo:color="#1e293b" fo:font-size="11pt" style:font-name="Liberation Sans" fo:font-family="Liberation Sans, Calibri, sans-serif"/>
    </style:default-style>
  </office:styles>
</office:document-styles>`;
  zip.file('styles.xml', stylesXml);

  // 5. content.xml
  const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
  xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  office:version="1.2">
  <office:automatic-styles>
    <!-- Headings -->
    <style:style style:name="Heading_1" style:family="paragraph">
      <style:paragraph-properties fo:margin-top="0.6cm" fo:margin-bottom="0.3cm" fo:keep-with-next="always"/>
      <style:text-properties fo:color="#0f172a" fo:font-size="20pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="RTL_Heading_1" style:family="paragraph">
      <style:paragraph-properties fo:margin-top="0.6cm" fo:margin-bottom="0.3cm" fo:text-align="end" style:writing-mode="rl-tb" fo:keep-with-next="always"/>
      <style:text-properties fo:color="#0f172a" fo:font-size="20pt" fo:font-weight="bold"/>
    </style:style>

    <style:style style:name="Heading_2" style:family="paragraph">
      <style:paragraph-properties fo:margin-top="0.5cm" fo:margin-bottom="0.25cm" fo:keep-with-next="always"/>
      <style:text-properties fo:color="#1e293b" fo:font-size="16pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="RTL_Heading_2" style:family="paragraph">
      <style:paragraph-properties fo:margin-top="0.5cm" fo:margin-bottom="0.25cm" fo:text-align="end" style:writing-mode="rl-tb" fo:keep-with-next="always"/>
      <style:text-properties fo:color="#1e293b" fo:font-size="16pt" fo:font-weight="bold"/>
    </style:style>

    <style:style style:name="Heading_3" style:family="paragraph">
      <style:paragraph-properties fo:margin-top="0.4cm" fo:margin-bottom="0.2cm" fo:keep-with-next="always"/>
      <style:text-properties fo:color="#334155" fo:font-size="13pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="RTL_Heading_3" style:family="paragraph">
      <style:paragraph-properties fo:margin-top="0.4cm" fo:margin-bottom="0.2cm" fo:text-align="end" style:writing-mode="rl-tb" fo:keep-with-next="always"/>
      <style:text-properties fo:color="#334155" fo:font-size="13pt" fo:font-weight="bold"/>
    </style:style>

    <!-- Standard Paragraphs -->
    <style:style style:name="Standard_P" style:family="paragraph">
      <style:paragraph-properties fo:margin-bottom="0.3cm" fo:line-height="150%" fo:text-align="start"/>
    </style:style>
    <style:style style:name="RTL_Standard_P" style:family="paragraph">
      <style:paragraph-properties fo:margin-bottom="0.3cm" fo:line-height="150%" fo:text-align="end" style:writing-mode="rl-tb"/>
    </style:style>

    <!-- Blockquotes -->
    <style:style style:name="Blockquote_P" style:family="paragraph">
      <style:paragraph-properties fo:margin-left="0.8cm" fo:margin-bottom="0.3cm" fo:border-left="0.08cm solid #6366f1" fo:padding-left="0.3cm" fo:text-align="start"/>
      <style:text-properties fo:font-style="italic" fo:color="#475569"/>
    </style:style>
    <style:style style:name="RTL_Blockquote_P" style:family="paragraph">
      <style:paragraph-properties fo:margin-right="0.8cm" fo:margin-bottom="0.3cm" fo:border-right="0.08cm solid #6366f1" fo:padding-right="0.3cm" fo:text-align="end" style:writing-mode="rl-tb"/>
      <style:text-properties fo:font-style="italic" fo:color="#475569"/>
    </style:style>

    <!-- Code Block -->
    <style:style style:name="Code_Block_P" style:family="paragraph">
      <style:paragraph-properties fo:background-color="#f1f5f9" fo:margin-bottom="0.1cm" fo:padding="0.1cm 0.3cm" fo:line-height="130%"/>
      <style:text-properties fo:font-family="Consolas, Courier, monospace" fo:font-size="9.5pt" fo:color="#0f172a"/>
    </style:style>

    <!-- Inlines -->
    <style:style style:name="T_Bold" style:family="text">
      <style:text-properties fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="T_Italic" style:family="text">
      <style:text-properties fo:font-style="italic"/>
    </style:style>
    <style:style style:name="T_Strike" style:family="text">
      <style:text-properties style:text-line-through-style="solid"/>
    </style:style>
    <style:style style:name="T_Code" style:family="text">
      <style:text-properties fo:font-family="Consolas, Courier, monospace" fo:font-size="9.5pt" fo:background-color="#f1f5f9" fo:color="#0f172a"/>
    </style:style>
    <style:style style:name="T_Link" style:family="text">
      <style:text-properties fo:color="#4f46e5" style:text-underline-style="solid"/>
    </style:style>

    <!-- Table Styles -->
    <style:style style:name="Table_Header_Cell" style:family="table-cell">
      <style:table-cell-properties fo:background-color="#f8fafc" fo:padding="0.2cm" fo:border="0.03cm solid #cbd5e1"/>
    </style:style>
    <style:style style:name="Table_Data_Cell" style:family="table-cell">
      <style:table-cell-properties fo:padding="0.18cm" fo:border="0.03cm solid #e2e8f0"/>
    </style:style>
  </office:automatic-styles>
  <office:body>
    <office:text>
      ${bodyXml}
    </office:text>
  </office:body>
</office:document-content>`;
  zip.file('content.xml', contentXml);

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.oasis.opendocument.text',
  });
}

function renderTokensToOdt(tokens: Token[]): string {
  let xml = '';

  for (const token of tokens) {
    switch (token.type) {
      case 'heading': {
        const hToken = token as Tokens.Heading;
        const isRtl = containsArabic(hToken.text);
        const depth = Math.min(Math.max(1, hToken.depth), 3);
        const styleName = isRtl ? `RTL_Heading_${depth}` : `Heading_${depth}`;
        const inlineXml = renderInlineTokensToOdt(hToken.tokens);
        xml += `<text:h text:style-name="${styleName}" text:outline-level="${depth}">${inlineXml}</text:h>\n`;
        break;
      }

      case 'paragraph': {
        const pToken = token as Tokens.Paragraph;
        const isRtl = containsArabic(pToken.text);
        const styleName = isRtl ? 'RTL_Standard_P' : 'Standard_P';
        const inlineXml = renderInlineTokensToOdt(pToken.tokens);
        xml += `<text:p text:style-name="${styleName}">${inlineXml}</text:p>\n`;
        break;
      }

      case 'blockquote': {
        const bqToken = token as Tokens.Blockquote;
        for (const item of bqToken.tokens) {
          if (item.type === 'paragraph') {
            const p = item as Tokens.Paragraph;
            const isRtl = containsArabic(p.text);
            const styleName = isRtl ? 'RTL_Blockquote_P' : 'Blockquote_P';
            const inlineXml = renderInlineTokensToOdt(p.tokens);
            xml += `<text:p text:style-name="${styleName}">${inlineXml}</text:p>\n`;
          }
        }
        break;
      }

      case 'code': {
        const codeToken = token as Tokens.Code;
        const lines = codeToken.text.split('\n');
        for (const line of lines) {
          const escaped = escapeXml(line) || ' ';
          xml += `<text:p text:style-name="Code_Block_P">${escaped}</text:p>\n`;
        }
        break;
      }

      case 'list': {
        const listToken = token as Tokens.List;
        xml += `<text:list>\n`;
        listToken.items.forEach((item, index) => {
          const isRtl = containsArabic(item.text);
          const styleName = isRtl ? 'RTL_Standard_P' : 'Standard_P';
          let prefix = '';
          if (listToken.ordered) {
            const num = listToken.start ? Number(listToken.start) + index : index + 1;
            prefix = `${num}. `;
          }
          if (item.task) {
            prefix = item.checked ? '☑ ' : '☐ ';
          }
          const itemInline = renderInlineTokensToOdt(item.tokens);
          xml += `  <text:list-item>\n    <text:p text:style-name="${styleName}">${escapeXml(prefix)}${itemInline}</text:p>\n  </text:list-item>\n`;
        });
        xml += `</text:list>\n`;
        break;
      }

      case 'table': {
        const tableToken = token as Tokens.Table;
        xml += `<table:table table:name="Table">\n`;

        // Column definitions
        for (let i = 0; i < tableToken.header.length; i++) {
          xml += `  <table:table-column/>\n`;
        }

        // Header
        xml += `  <table:table-header-rows>\n    <table:table-row>\n`;
        for (const cell of tableToken.header) {
          const isRtl = containsArabic(cell.text);
          const cellInline = renderInlineTokensToOdt(cell.tokens);
          const pStyle = isRtl ? 'RTL_Standard_P' : 'Standard_P';
          xml += `      <table:table-cell table:style-name="Table_Header_Cell" office:value-type="string">\n        <text:p text:style-name="${pStyle}"><text:span text:style-name="T_Bold">${cellInline}</text:span></text:p>\n      </table:table-cell>\n`;
        }
        xml += `    </table:table-row>\n  </table:table-header-rows>\n`;

        // Rows
        for (const row of tableToken.rows) {
          xml += `  <table:table-row>\n`;
          for (const cell of row) {
            const isRtl = containsArabic(cell.text);
            const cellInline = renderInlineTokensToOdt(cell.tokens);
            const pStyle = isRtl ? 'RTL_Standard_P' : 'Standard_P';
            xml += `    <table:table-cell table:style-name="Table_Data_Cell" office:value-type="string">\n      <text:p text:style-name="${pStyle}">${cellInline}</text:p>\n    </table:table-cell>\n`;
          }
          xml += `  </table:table-row>\n`;
        }

        xml += `</table:table>\n<text:p text:style-name="Standard_P"></text:p>\n`;
        break;
      }

      case 'hr': {
        xml += `<text:p text:style-name="Standard_P">____________________________________________________</text:p>\n`;
        break;
      }

      default:
        break;
    }
  }

  return xml;
}

function renderInlineTokensToOdt(tokens?: Token[]): string {
  if (!tokens || tokens.length === 0) return '';

  let res = '';
  for (const token of tokens) {
    switch (token.type) {
      case 'text': {
        const textToken = token as Tokens.Text;
        res += escapeXml(textToken.text);
        break;
      }

      case 'strong': {
        const strongToken = token as Tokens.Strong;
        res += `<text:span text:style-name="T_Bold">${renderInlineTokensToOdt(strongToken.tokens)}</text:span>`;
        break;
      }

      case 'em': {
        const emToken = token as Tokens.Em;
        res += `<text:span text:style-name="T_Italic">${renderInlineTokensToOdt(emToken.tokens)}</text:span>`;
        break;
      }

      case 'del': {
        const delToken = token as Tokens.Del;
        res += `<text:span text:style-name="T_Strike">${renderInlineTokensToOdt(delToken.tokens)}</text:span>`;
        break;
      }

      case 'codespan': {
        const codeToken = token as Tokens.Codespan;
        res += `<text:span text:style-name="T_Code">${escapeXml(codeToken.text)}</text:span>`;
        break;
      }

      case 'link': {
        const linkToken = token as Tokens.Link;
        res += `<text:a xlink:type="simple" xlink:href="${escapeXml(linkToken.href)}"><text:span text:style-name="T_Link">${renderInlineTokensToOdt(linkToken.tokens)}</text:span></text:a>`;
        break;
      }

      case 'br': {
        res += `<text:line-break/>`;
        break;
      }

      default: {
        if ('text' in token && typeof (token as { text: unknown }).text === 'string') {
          res += escapeXml((token as { text: string }).text);
        }
        break;
      }
    }
  }

  return res;
}
