"use client";

import { sanitizeHtml } from "@/app/portal/config/criteria-information/cc/clean";

const PROSE =
  "text-sm text-slate-700 leading-relaxed " +
  "[&_p]:mb-2 [&_p:last-child]:mb-0 " +
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ul]:space-y-0.5 " +
  "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_ol]:space-y-0.5 " +
  "[&_li]:leading-relaxed " +
  "[&_b]:font-semibold [&_strong]:font-semibold [&_i]:italic [&_em]:italic [&_u]:underline " +
  "[&_a]:text-[#27aae1] [&_a]:underline [&_a:hover]:text-[#1c86b3] " +
  "[&_table]:w-full [&_table]:text-xs [&_td]:border [&_td]:border-slate-200 [&_td]:px-2 [&_td]:py-1 " +
  "[&_th]:border [&_th]:border-slate-200 [&_th]:px-2 [&_th]:py-1";

export function HtmlContent({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={className ?? PROSE}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html || "") }}
    />
  );
}

/** Render one evidence value — HTML string, number, or a merged list. */
export function EvidenceValue({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-300">—</span>;
  }
  const items = Array.isArray(value) ? value : [value];
  return (
    <div className="space-y-1.5">
      {items.map((it, i) => (
        <HtmlContent key={i} html={String(it)} />
      ))}
    </div>
  );
}