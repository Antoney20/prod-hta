"use client";

import { sanitizeHtml } from "@/app/portal/config/criteria-information/cc/clean";

const PROSE =
  "text-sm text-slate-700 leading-relaxed " +
  "[&_p]:mb-2 [&_p:last-child]:mb-0 " +
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ul]:space-y-0.5 " +
  "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_ol]:space-y-0.5 " +
  "[&_li]:leading-relaxed " +
  "[&_b]:font-semibold [&_strong]:font-semibold [&_i]:italic [&_em]:italic [&_u]:underline " +
  "[&_a]:text-[#27aae1] [&_a]:underline [&_a:hover]:text-[#1c86b3] [&_a]:break-all " +
  "[&_table]:w-full [&_table]:text-xs [&_td]:border [&_td]:border-slate-200 [&_td]:px-2 [&_td]:py-1 " +
  "[&_th]:border [&_th]:border-slate-200 [&_th]:px-2 [&_th]:py-1 " +
  "whitespace-pre-wrap break-words";

// already markup?
const looksHtml = (s: string) => /<\/?[a-z][\s\S]*>/i.test(s);

// plain text → HTML: bare URLs to links, newlines to <br>. markup left as-is.
// sanitizeHtml runs afterwards in HtmlContent, so this only shapes, never trusts.
const toHtml = (s: string): string =>
  looksHtml(s)
    ? s
    : s
        .replace(/(https?:\/\/[^\s<]+)/g, (u) => `<a href="${u}">${u}</a>`)
        .replace(/\r\n|\r|\n/g, "<br>");

export function HtmlContent({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={className ?? PROSE}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(toHtml(html || "")) }}
    />
  );
}

export function HtmlContentSimple({ html, className }: { html: string; className?: string }) {
  const clean = sanitizeHtml(toHtml(html || ""))
    .replace(/<(?!\/?(br|b|strong)\b)[^>]*>/gi, "");
  return <div className={className ?? PROSE} dangerouslySetInnerHTML={{ __html: clean }} />;
}

/** Render one evidence value — HTML string, number, plain text, object, or a merged list. */
export function EvidenceValue({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-300">—</span>;
  }

  const render = (v: unknown, key: number) => {
    // real object/array from a JSON upload cell → show readable, not [object Object]
    if (v !== null && typeof v === "object") {
      return (
        <pre
          key={key}
          className="overflow-x-auto rounded bg-slate-50 px-2 py-1 text-xs text-slate-600"
        >
          {JSON.stringify(v, null, 2)}
        </pre>
      );
    }
    return <HtmlContent key={key} html={String(v)} />;
  };

  // a top-level array is a "merged list" of values → render each item
  const items = Array.isArray(value) ? value : [value];
  return <div className="space-y-1.5">{items.map((it, i) => render(it, i))}</div>;
}