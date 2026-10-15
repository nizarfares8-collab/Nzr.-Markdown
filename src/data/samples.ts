import { SampleDoc } from '../types';

export const SAMPLE_DOCS: SampleDoc[] = [
  {
    id: 'feature-showcase',
    title: 'Full Feature Showcase',
    category: 'Showcase',
    markdown: `# Markdown to HTML Converter

Welcome to the **real-time Markdown to HTML converter**! Edit text on the left, and watch the *live visual preview* and *raw HTML output* update instantly.

---

## 🚀 Key Highlights

* **Real-time instant rendering** with GitHub-flavored markdown (GFM)
* **Formatted HTML Code Viewer** with syntax highlighting & indentation
* **Export directly to standalone HTML** with selectable modern styling themes
* Interactive tables, code blocks with quick-copy, and checklist support

> *"Simplicity is the prerequisite for reliability."*  
> — Edsger W. Dijkstra

---

## 💻 Code Highlighting

Here is a sample TypeScript code snippet demonstrating modern async functions:

\`\`\`typescript
interface UserProfile {
  id: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
}

async function fetchUser(userId: string): Promise<UserProfile> {
  const response = await fetch(\`/api/users/\${userId}\`);
  if (!response.ok) {
    throw new Error(\`Failed to fetch user: \${response.statusText}\`);
  }
  return await response.json();
}
\`\`\`

And here is a small Python example:

\`\`\`python
def calculate_markdown_stats(text: str) -> dict:
    words = len(text.split())
    characters = len(text)
    return {
        "word_count": words,
        "char_count": characters,
        "reading_time_min": max(1, round(words / 200))
    }
\`\`\`

---

## 📊 Comparison Table

| Feature | Built-in | Customization | Exportable |
| :--- | :---: | :---: | :---: |
| Real-time Sync | ✅ Yes | Instant | Yes |
| Syntax Highlighting | ✅ Yes | 100+ Languages | Included |
| HTML Prettifier | ✅ Yes | Indent / Minify | Clean & Raw |
| Standalone File | ✅ Yes | 5 Themes | .html / .md |

---

## 📝 Task List & Next Actions

- [x] Integrate high-performance markdown parser
- [x] Build dual preview and raw HTML inspector
- [x] Add embedded responsive styles for export
- [ ] Share exported documents with your team
- [ ] Connect custom publishing pipelines

---

## 🔗 Typography & Formatting

You can format text with **bold**, *italic*, ~~strikethrough~~, or \`inline code\`.
Visit [Google AI Studio](https://ai.studio) to explore more developer tools.
`,
  },
  {
    id: 'technical-readme',
    title: 'Project README',
    category: 'Documentation',
    markdown: `# VectorStream Engine

A fast, lightweight stream-processing library for distributed telemetry and real-time event analytics.

## Installation

Install using your preferred package manager:

\`\`\`bash
# Using npm
npm install @vectorstream/core

# Using pnpm
pnpm add @vectorstream/core
\`\`\`

## Quick Start

\`\`\`javascript
import { StreamPipeline } from '@vectorstream/core';

const pipeline = new StreamPipeline({
  bufferSize: 1024,
  flushIntervalMs: 50,
});

pipeline.subscribe((batch) => {
  console.log(\`Received \${batch.length} events\`);
});
\`\`\`

## Configuration Matrix

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| \`bufferSize\` | number | \`512\` | Maximum events buffered before forced flush |
| \`retryAttempts\` | number | \`3\` | Number of reconnection retries |
| \`compression\` | boolean | \`true\` | Enable gzip compression on payload batches |

## License

Distributed under the MIT License. See \`LICENSE\` for more information.
`,
  },
  {
    id: 'blog-post',
    title: 'Modern Web Performance',
    category: 'Article',
    markdown: `# The Anatomy of a High-Performance Web App

In modern web development, speed is no longer just an engineering vanity metric; it directly correlates with user retention, conversion rates, and accessibility.

## 1. Eliminate Blocking Network Waterfalls

When browsers load your webpage, every render-blocking stylesheet or synchronous script introduces perceptible friction.

> Optimizing critical rendering paths reduces Largest Contentful Paint (LCP) by up to 40% across real-world cellular connections.

### Best Practices

1. **Defer non-essential scripts** using standard ESM modules
2. **Incorporate critical CSS** directly within initial HTML payload
3. **Preconnect** to high-priority third-party origins
4. **Leverage modern image formats** like WebP and AVIF

## 2. Structural Rendering Budgets

Always benchmark your client bundles:

\`\`\`json
{
  "performance": {
    "maxInitialBundleKb": 120,
    "maxTotalChunkKb": 350,
    "targetFCP": "0.8s"
  }
}
\`\`\`

Happy building!
`,
  },
  {
    id: 'arabic-rtl-showcase',
    title: 'دليل ماركداون (العربية / RTL)',
    category: 'Arabic / عربي',
    markdown: `# دليل لغة ماركداون مع المحاذاة التلقائية (Auto RTL)

مرحباً بك في المحول المتقدم من **ماركداون** إلى **HTML** مع دعم أصيل للمحاذاة التلقائية للغة العربية من اليمين إلى اليسار (RTL)!

---

## 🌟 ميزات المحاذاة الذكية للنصوص العربية

* **محاذاة تلقائية (Auto-Direction)**: يتم كشف الفقرات والعناوين العربية تلقائياً ومحاذاتها إلى اليمين.
* **توافق الجمل المختلطة**: كتابة الكلمات البرمجية والإنجليزية مثل \`JavaScript\` أو \`React\` دون التأثير على الترتيب الصحيح للكلمات العربية أو علامات الترقيم.
* **قوائم نقطية ومرقمة متناسقة**: نقاط القوائم والأرقام تتوضع تلقائياً في الجهة اليمنى المناسبة.

> *"البساطة هي الشرط الأساسي والأهم لضمان موثوقية البرمجيات وجودتها."*  
> — إدسكير ديكسترا

---

## 💻 شفرات برمجية داخل نص عربي

تظل الشفرات البرمجية محتفظة باتجاهها الطبيعي من اليسار إلى اليمين (LTR) لسهولة القراءة والنسخ:

\`\`\`typescript
interface Article {
  title: string;
  language: 'ar' | 'en';
  isRtl: boolean;
}

const doc: Article = {
  title: "المحتوى العربي الرقمي",
  language: "ar",
  isRtl: true,
};
\`\`\`

---

## 📊 جدول مقارنة المصطلحات التقنية

| المصطلح بالإنجليزية | المقابل بالعربية | الوصف والتوضيح |
| :--- | :--- | :--- |
| **Markdown** | ماركداون | لغة ترميز نصية خفيفة وسهلة القراءة |
| **Real-time Preview** | معاينة فورية | مشاهدة مخرجات التصميم مباشرة أثناء الكتابة |
| **Syntax Highlighting** | تمييز الأكواد | تلوين الشفرات البرمجية لتسهيل مراجعتها |
| **Standalone Export** | تصدير مستقل | حفظ ملف HTML مستقل جاهز للمشاركة والنشر |

---

## 📝 قائمة المهام التفاعلية

- [x] تفعيل المحاذاة التلقائية من اليمين لليسار (RTL) للنصوص العربية
- [x] ضبط علامات الترقيم وعلامات الاقتباس في الاتجاه الصحيح
- [x] دعم التصدير بصيغة HTML مع الحفاظ على التنسيق
- [ ] إضافة المزيد من القوالب التنسيقية
`,
  },
];
