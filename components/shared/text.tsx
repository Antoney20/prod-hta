"use client";

import { useEffect } from "react";

export function htmlToText(html?: string | null): string {
  if (!html) return "";
  let text = html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|blockquote|tr)>/gi, " ")
    .replace(/<[^>]+>/g, "");
  // decode the entities the editor/backend can emit
  text = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
  return text.replace(/\s+/g, " ").trim();
}

function sanitizeRichHtml(html: string): string {
  return html
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|noscript)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*\/?\s*(script|style|iframe|object|embed|link|meta|noscript)[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/(href|src)\s*=\s*"(?:javascript|data):[^"]*"/gi, "")
    .replace(/(href|src)\s*=\s*'(?:javascript|data):[^']*'/gi, "");
}


const STYLE_ID = "rich-content-styles";
function ensureStyles() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
.rich-content { color: #111827; line-height: 1.65; }
.rich-content > :first-child { margin-top: 0; }
.rich-content > :last-child { margin-bottom: 0; }
.rich-content p { margin: 0 0 .75em; }
.rich-content h2 { font-size: 1.125rem; font-weight: 700; margin: 1em 0 .4em; }
.rich-content h3 { font-size: 1.05rem;  font-weight: 700; margin: 1em 0 .4em; }
.rich-content h4 { font-size: 1rem;     font-weight: 700; margin: 1em 0 .4em; }
.rich-content ul { list-style: disc;    padding-left: 1.4rem; margin: .5em 0; }
.rich-content ol { list-style: decimal; padding-left: 1.4rem; margin: .5em 0; }
.rich-content li { margin: .2em 0; }
.rich-content blockquote { border-left: 3px solid #1d70b8; padding-left: .75rem; margin: .6em 0; color: #4b5563; font-style: italic; }
.rich-content a { color: #1d70b8; text-decoration: underline; }
.rich-content a:hover { color: #003078; }
.rich-content strong, .rich-content b { font-weight: 700; }
.rich-content em, .rich-content i { font-style: italic; }
.rich-content u { text-decoration: underline; }
`;
  document.head.appendChild(el);
}


export function RichText({
  html,
  className = "",
}: {
  html?: string | null;
  className?: string;
}) {
  useEffect(() => ensureStyles(), []);

  // nothing meaningful to show (e.g. "<p><br></p>")
  if (!html || htmlToText(html).length === 0) return null;

  return (
    <div
      className={`rich-content text-sm ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(html) }}
    />
  );
}

export default RichText;