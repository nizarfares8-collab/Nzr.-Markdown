import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  ExternalHyperlink,
} from 'docx';
import { marked, Tokens, Token } from 'marked';
import { containsArabic } from './markdown';

export interface DocxExportOptions {
  title?: string;
  author?: string;
}

/**
 * Converts Markdown string into a Microsoft Word (.docx) Document Blob
 */
export async function exportToDocx(markdown: string, options: DocxExportOptions = {}): Promise<Blob> {
  const tokens = marked.lexer(markdown);
  const children: (Paragraph | Table)[] = [];

  // If a document title is provided and not already the first H1, add a clean title
  const docTitle = options.title?.trim();

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const elements = renderTokenToDocx(token);
    children.push(...elements);
  }

  // Fallback if empty
  if (children.length === 0) {
    children.push(new Paragraph({ text: 'Empty document' }));
  }

  const doc = new Document({
    title: docTitle || 'Markdown Export',
    creator: options.author || 'Markdown to HTML/DOCX Converter',
    description: 'Converted from Markdown',
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22, // 11pt
            color: '1E293B',
          },
          paragraph: {
            spacing: { line: 280, after: 140 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch (1440 twips)
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

function renderTokenToDocx(token: Token): (Paragraph | Table)[] {
  switch (token.type) {
    case 'heading': {
      const headingToken = token as Tokens.Heading;
      const isRtl = containsArabic(headingToken.text);
      const headingLevelMap = [
        HeadingLevel.HEADING_1,
        HeadingLevel.HEADING_2,
        HeadingLevel.HEADING_3,
        HeadingLevel.HEADING_4,
        HeadingLevel.HEADING_5,
        HeadingLevel.HEADING_6,
      ];
      const level = headingLevelMap[Math.min(headingToken.depth - 1, 5)];

      const fontSizeMap = [36, 30, 26, 24, 22, 20]; // in half-points (18pt, 15pt, 13pt, 12pt...)
      const size = fontSizeMap[Math.min(headingToken.depth - 1, 5)];

      const runs = renderInlineTokensToRuns(headingToken.tokens, {
        bold: true,
        size,
        color: headingToken.depth === 1 ? '0F172A' : '1E293B',
      });

      return [
        new Paragraph({
          heading: level,
          bidirectional: isRtl,
          alignment: isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
          spacing: { before: 240, after: 120 },
          children: runs,
        }),
      ];
    }

    case 'paragraph': {
      const pToken = token as Tokens.Paragraph;
      const isRtl = containsArabic(pToken.text);
      const runs = renderInlineTokensToRuns(pToken.tokens);

      return [
        new Paragraph({
          bidirectional: isRtl,
          alignment: isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
          spacing: { after: 140, line: 280 },
          children: runs,
        }),
      ];
    }

    case 'blockquote': {
      const bqToken = token as Tokens.Blockquote;
      const paragraphs: Paragraph[] = [];

      for (const item of bqToken.tokens) {
        if (item.type === 'paragraph') {
          const isRtl = containsArabic(item.text);
          const runs = renderInlineTokensToRuns((item as Tokens.Paragraph).tokens, {
            italics: true,
            color: '334155',
          });

          paragraphs.push(
            new Paragraph({
              bidirectional: isRtl,
              alignment: isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
              indent: { left: 480 },
              border: {
                left: isRtl
                  ? undefined
                  : { style: BorderStyle.SINGLE, size: 24, color: '6366F1', space: 12 },
                right: isRtl
                  ? { style: BorderStyle.SINGLE, size: 24, color: '6366F1', space: 12 }
                  : undefined,
              },
              spacing: { after: 120 },
              children: runs,
            })
          );
        }
      }

      return paragraphs;
    }

    case 'code': {
      const codeToken = token as Tokens.Code;
      const lines = codeToken.text.split('\n');

      return lines.map(
        (line, idx) =>
          new Paragraph({
            spacing: {
              before: idx === 0 ? 120 : 0,
              after: idx === lines.length - 1 ? 160 : 0,
              line: 240,
            },
            shading: {
              type: ShadingType.CLEAR,
              fill: 'F1F5F9',
            },
            indent: { left: 240, right: 240 },
            children: [
              new TextRun({
                text: line || ' ',
                font: 'Consolas',
                size: 19, // 9.5pt
                color: '0F172A',
              }),
            ],
          })
      );
    }

    case 'list': {
      const listToken = token as Tokens.List;
      const paragraphs: Paragraph[] = [];

      listToken.items.forEach((item, index) => {
        const isRtl = containsArabic(item.text);
        const runs = renderInlineTokensToRuns(item.tokens);

        let prefixRun: TextRun | null = null;
        if (item.task) {
          prefixRun = new TextRun({
            text: item.checked ? '☑ ' : '☐ ',
            font: 'Segoe UI Symbol',
            bold: true,
          });
        }

        paragraphs.push(
          new Paragraph({
            bidirectional: isRtl,
            alignment: isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
            bullet: listToken.ordered
              ? undefined
              : item.task
              ? undefined
              : { level: 0 },
            spacing: { after: 80 },
            children: [
              ...(listToken.ordered
                ? [new TextRun({ text: `${listToken.start ? Number(listToken.start) + index : index + 1}. `, bold: true })]
                : []),
              ...(prefixRun ? [prefixRun] : []),
              ...runs,
            ],
          })
        );
      });

      return paragraphs;
    }

    case 'table': {
      const tableToken = token as Tokens.Table;
      const rows: TableRow[] = [];

      // Header row
      const headerCells: TableCell[] = tableToken.header.map((cell) => {
        const isRtl = containsArabic(cell.text);
        const runs = renderInlineTokensToRuns(cell.tokens, { bold: true, color: '0F172A' });
        return new TableCell({
          shading: {
            type: ShadingType.CLEAR,
            fill: 'F8FAFC',
          },
          margins: { top: 120, bottom: 120, left: 140, right: 140 },
          children: [
            new Paragraph({
              bidirectional: isRtl,
              alignment: isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
              children: runs,
            }),
          ],
        });
      });
      rows.push(new TableRow({ children: headerCells, tableHeader: true }));

      // Data rows
      for (const row of tableToken.rows) {
        const cells: TableCell[] = row.map((cell) => {
          const isRtl = containsArabic(cell.text);
          const runs = renderInlineTokensToRuns(cell.tokens);
          return new TableCell({
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: [
              new Paragraph({
                bidirectional: isRtl,
                alignment: isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
                children: runs,
              }),
            ],
          });
        });
        rows.push(new TableRow({ children: cells }));
      }

      return [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows,
        }),
        new Paragraph({ spacing: { after: 140 } }), // space after table
      ];
    }

    case 'hr': {
      return [
        new Paragraph({
          spacing: { before: 200, after: 200 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1', space: 1 },
          },
        }),
      ];
    }

    default:
      return [];
  }
}

interface InlineFormattingOptions {
  bold?: boolean;
  italics?: boolean;
  strike?: boolean;
  code?: boolean;
  size?: number;
  color?: string;
}

function renderInlineTokensToRuns(
  tokens?: Token[],
  formatting: InlineFormattingOptions = {}
): (TextRun | ExternalHyperlink)[] {
  if (!tokens || tokens.length === 0) return [];

  const results: (TextRun | ExternalHyperlink)[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'text': {
        const textToken = token as Tokens.Text;
        const isArabic = containsArabic(textToken.text);
        results.push(
          new TextRun({
            text: textToken.text,
            bold: formatting.bold,
            italics: formatting.italics,
            strike: formatting.strike,
            size: formatting.size,
            color: formatting.color,
            font: isArabic ? 'Segoe UI' : formatting.code ? 'Consolas' : 'Calibri',
          })
        );
        break;
      }

      case 'strong': {
        const strongToken = token as Tokens.Strong;
        results.push(
          ...renderInlineTokensToRuns(strongToken.tokens, {
            ...formatting,
            bold: true,
          })
        );
        break;
      }

      case 'em': {
        const emToken = token as Tokens.Em;
        results.push(
          ...renderInlineTokensToRuns(emToken.tokens, {
            ...formatting,
            italics: true,
          })
        );
        break;
      }

      case 'del': {
        const delToken = token as Tokens.Del;
        results.push(
          ...renderInlineTokensToRuns(delToken.tokens, {
            ...formatting,
            strike: true,
          })
        );
        break;
      }

      case 'codespan': {
        const codeToken = token as Tokens.Codespan;
        results.push(
          new TextRun({
            text: codeToken.text,
            font: 'Consolas',
            size: formatting.size ? formatting.size - 2 : 20, // slightly smaller
            color: '0F172A',
            shading: {
              type: ShadingType.CLEAR,
              fill: 'F1F5F9',
            },
          })
        );
        break;
      }

      case 'link': {
        const linkToken = token as Tokens.Link;
        const linkRuns = renderInlineTokensToRuns(linkToken.tokens, {
          ...formatting,
          color: '4F46E5',
        });

        // Use ExternalHyperlink for real clickable link in Word
        results.push(
          new ExternalHyperlink({
            link: linkToken.href,
            children: linkRuns.filter((r): r is TextRun => r instanceof TextRun),
          })
        );
        break;
      }

      case 'br': {
        results.push(new TextRun({ break: 1 }));
        break;
      }

      default: {
        if ('text' in token && typeof (token as { text: unknown }).text === 'string') {
          results.push(
            new TextRun({
              text: (token as { text: string }).text,
              bold: formatting.bold,
              italics: formatting.italics,
              size: formatting.size,
              color: formatting.color,
            })
          );
        }
        break;
      }
    }
  }

  return results;
}
