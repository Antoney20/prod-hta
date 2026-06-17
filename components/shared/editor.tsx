"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useId, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Brand                                                              */
/* ------------------------------------------------------------------ */
const ACCENT = "#27aae1";
const ACCENT_DARK = "#1d8fc3";  // brand blue (matches submit base)
const ACCENT_TINT = "#e9f7fc";  // light fill for active buttons

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
export function isBlankHtml(html: string): boolean {
  if (!html) return true;
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .trim();
  return text.length === 0;
}

/* Allowlist sanitizer.
   - ALLOWED_TAGS survive with zero attributes (href re-added on <a> after validation).
   - HARD_STRIP are removed entirely (tag + children), silently — they're hazards
     that would execute the instant they enter the DOM and are never author-fixable.
   - BLOCK_TAGS are kept but made inert (event handlers / foreign attrs stripped) so
     the author can see and delete them; while any are present the field is invalid.
   - Anything else is unwrapped: the tag goes, its text/children stay.
   - RETAG maps near-miss block tags onto the editor's vocabulary.            */
const ALLOWED_TAGS = new Set([
  "p", "h2", "h3", "h4", "blockquote", "ul", "ol", "li",
  "a", "b", "strong", "i", "em", "u", "code", "br",
]);

/* Hazards: removed entirely + silently. Never valid, never author-fixable
   (a live <script>/<img onerror> would execute the instant it enters the DOM). */
const HARD_STRIP = new Set([
  "script", "style", "iframe", "object", "embed", "link", "meta", "noscript",
  "svg", "math", "form", "input", "button", "select", "textarea", "template",
  "base", "frame", "frameset", "source",
]);

/* Policy-disallowed media: NOT stripped. They stay (inert — every event
   handler removed) so the author can see and delete them, and while any are
   present the field is invalid and the form can't continue. */
const BLOCK_TAGS = new Set(["img", "picture", "video", "audio", "track"]);

/* The only attributes a blocked tag keeps, so it still renders enough to be
   found + deleted. Everything else — on* handlers, srcset, etc. — is stripped. */
const BLOCK_KEEP: Record<string, Set<string>> = {
  img: new Set(["src", "alt"]),
  video: new Set(["src", "controls"]),
  audio: new Set(["src", "controls"]),
};

const BLOCK_LABELS: Record<string, string> = {
  img: "images", picture: "images",
  video: "videos", audio: "audio clips", track: "captions",
};

const RETAG: Record<string, string> = { h1: "h2", h5: "h4", h6: "h4" };

/* Validates an href value. Strips control chars / embedded whitespace first
   so obfuscations like "java\nscript:alert(1)" can't slip past the protocol
   check. Only absolute http(s) and mailto pass; no relative URLs, no "../". */
function safeHref(raw: string | null): string | null {
  if (!raw) return null;
  const v = raw.replace(/[\u0000-\u001f\u007f\s]/g, "");
  if (!/^(https?:|mailto:)/i.test(v)) return null;
  if (/(^|\/)\.\.(\/|$)/.test(v) || v.includes("..\\")) return null;
  return v;
}

function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") return "";
  const tpl = document.createElement("template");
  tpl.innerHTML = html;

  for (const el of [...tpl.content.querySelectorAll("*")]) {
    if (!tpl.content.contains(el)) continue; // detached by an earlier removal
    let tag = el.tagName.toLowerCase();

    if (HARD_STRIP.has(tag)) {
      el.remove();
      continue;
    }

    if (BLOCK_TAGS.has(tag)) {
      // kept + inert: strip everything not explicitly allowlisted (incl. all on* handlers)
      const keep = BLOCK_KEEP[tag];
      for (const a of [...el.attributes]) {
        if (!keep?.has(a.name.toLowerCase())) el.removeAttribute(a.name);
      }
      continue; // left in place; flagged via validate()/findBlocked()
    }

    if (RETAG[tag]) {
      const next = document.createElement(RETAG[tag]);
      next.append(...el.childNodes);
      el.replaceWith(next);
      tag = RETAG[tag]; // children already snapshotted; new el has no attrs
      continue;
    }

    if (!ALLOWED_TAGS.has(tag)) {
      el.replaceWith(...el.childNodes); // unwrap: keep content, drop the tag
      continue;
    }

    // strip every attribute, then re-add only what we explicitly allow
    const href = tag === "a" ? safeHref(el.getAttribute("href")) : null;
    for (const a of [...el.attributes]) el.removeAttribute(a.name);

    if (tag === "a") {
      if (!href) {
        el.replaceWith(...el.childNodes); // bad/missing href -> plain text
        continue;
      }
      el.setAttribute("href", href);
      el.setAttribute("rel", "noopener noreferrer nofollow");
      el.setAttribute("target", "_blank");
    }
  }
  return tpl.innerHTML;
}

/* Scans current HTML for disallowed media tags. Drives the persistent error
   + form gate. Runs on every change and on external value load. */
function findBlocked(html: string): Set<string> {
  const found = new Set<string>();
  if (typeof window === "undefined" || !html) return found;
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  for (const el of tpl.content.querySelectorAll("*")) {
    const t = el.tagName.toLowerCase();
    if (BLOCK_TAGS.has(t)) found.add(t);
  }
  return found;
}

function describeBlocked(tags: Set<string>): string {
  const labels = [...new Set([...tags].map((t) => BLOCK_LABELS[t] ?? t))];
  const list =
    labels.length === 1 ? labels[0]
    : labels.length === 2 ? `${labels[0]} and ${labels[1]}`
    : `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
  return `Remove the embedded ${list} to continue — they aren’t allowed here.`;
}

function normalizeUrl(raw: string): string | null {
  const v = raw.trim().replace(/[\u0000-\u001f\u007f]/g, "");
  if (!v || /\s/.test(v)) return null;
  if (/(^|\/)\.\.(\/|$)/.test(v)) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (/^mailto:/i.test(v)) return v;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return null; // any other scheme: reject
  return `https://${v}`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* Content styles for the contentEditable region. Injected once.       */
/* Necessary because Tailwind preflight strips list bullets + heading  */
/* sizing, so the editor's own output would otherwise be invisible.    */
const STYLE_ID = "fo-editor-styles";
function ensureStyles() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
.fo-editor { position: relative; line-height: 1.55; font: inherit; }
.fo-editor:focus { outline: none; }
.fo-editor[data-empty="true"]::before {
  content: attr(data-placeholder);
  position: absolute;
  color: #9ca3af;
  pointer-events: none;
}
.fo-editor h2 { font-size: 1.125rem; font-weight: 600; margin: .55em 0 .25em; }
.fo-editor h3 { font-size: 1.05rem;  font-weight: 600; margin: .55em 0 .25em; }
.fo-editor h4 { font-size: 1rem;     font-weight: 600; margin: .55em 0 .25em; }
.fo-editor p  { margin: .25em 0; }
.fo-editor ul { list-style: disc;    padding-left: 1.5rem; margin: .35em 0; }
.fo-editor ol { list-style: decimal; padding-left: 1.5rem; margin: .35em 0; }
.fo-editor li { margin: .12em 0; }
.fo-editor code {
  font-family: ui-monospace, monospace;
  font-size: .875em;
  background: #f1f5f9;
  padding: .1em .35em;
  border-radius: 3px;
}
.fo-editor blockquote {
  border-left: 3px solid ${ACCENT};
  padding-left: .75rem;
  margin: .5em 0;
  color: #475569;
  font-style: italic;
}
.fo-editor a { color: ${ACCENT_DARK}; text-decoration: underline; }
`;
  document.head.appendChild(el);
}

/* ------------------------------------------------------------------ */
/* Toolbar primitives                                                 */
/* ------------------------------------------------------------------ */
function ToolButton({
  label,
  active,
  disabled,
  onApply,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onApply: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={!!active}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        onApply();
      }}
      className={cn(
        "grid h-7 min-w-[28px] place-items-center rounded border px-1.5 text-xs leading-none transition-colors",
        active
          ? "border-[#27aae1] bg-[#e9f7fc] text-[#1576a3]"
          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-gray-200" />;
}

const BLOCKS = [
  { tag: "p", label: "Paragraph", short: "P" },
  { tag: "h2", label: "Heading 2", short: "H2" },
  { tag: "h3", label: "Heading 3", short: "H3" },
  { tag: "h4", label: "Heading 4", short: "H4" },
];

interface LinkState {
  open: boolean;
  url: string;
  text: string;
  editing: boolean;
  hasSelection: boolean;
  error: string | null;
}
const CLOSED_LINK: LinkState = { open: false, url: "", text: "", editing: false, hasSelection: false, error: null };

/* ------------------------------------------------------------------ */
/* Editor                                                             */
/* ------------------------------------------------------------------ */
export interface RichEditorProps {
  value: string;
  onChange: (val: string) => void;
  name?: string;          // mirrored to data-field so the form can find/scroll to it
  label?: string;
  hint?: string;
  required?: boolean;
  invalid?: boolean;      // drives the red error border/ring
  onValidityChange?: (valid: boolean) => void; // false while disallowed media is present
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  disabled?: boolean;
}

export function RichEditor({
  value,
  onChange,
  name,
  label,
  hint,
  required,
  invalid = false,
  onValidityChange,
  placeholder = "Start typing",
  minHeight = 150,
  maxHeight = 360,
  disabled = false,
}: RichEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInternal = useRef(false);
  const hintId = useId();

  const [active, setActive] = useState({ bold: false, italic: false, underline: false, ul: false, ol: false });
  const [block, setBlock] = useState("p");

  const [link, setLink] = useState<LinkState>(CLOSED_LINK);
  const linkWrapRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const linkAnchor = useRef<HTMLAnchorElement | null>(null);

  // persistent content-validity: set while disallowed media is present,
  // cleared once the author removes it. Gates the parent form via onValidityChange.
  const [contentError, setContentError] = useState<string | null>(null);
  const lastValid = useRef(true);

  const validate = useCallback(() => {
    const blocked = findBlocked(ref.current?.innerHTML ?? "");
    const valid = blocked.size === 0;
    setContentError(valid ? null : describeBlocked(blocked));
    if (valid !== lastValid.current) {
      lastValid.current = valid;
      onValidityChange?.(valid);
    }
  }, [onValidityChange]);

  useEffect(() => ensureStyles(), []);

  const markEmpty = () => {
    if (ref.current) ref.current.dataset.empty = String(isBlankHtml(ref.current.innerHTML));
  };

  // keep DOM in sync with external value — sanitized, since this is where
  // API payloads (with foreign data-* attrs, spans, etc.) enter the DOM
  useEffect(() => {
    if (ref.current && !isInternal.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = sanitizeHtml(value ?? "");
    }
    markEmpty();
    validate(); // flag a dirty loaded draft on mount / external change
    isInternal.current = false;
  }, [value, validate]);

  const sync = useCallback(() => {
    isInternal.current = true;
    markEmpty();
    validate(); // clears/sets the error as content changes
    onChange(ref.current?.innerHTML ?? "");
  }, [onChange, validate]);

  const refreshActive = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || !ref.current || !ref.current.contains(sel.anchorNode)) return;
    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      ul: document.queryCommandState("insertUnorderedList"),
      ol: document.queryCommandState("insertOrderedList"),
    });
    let node: Node | null = sel.anchorNode;
    let found = "p";
    while (node && node !== ref.current) {
      if (node.nodeType === 1) {
        const t = (node as Element).tagName.toLowerCase();
        if (["p", "h2", "h3", "h4", "blockquote", "li"].includes(t)) {
          found = t;
          break;
        }
      }
      node = node.parentNode;
    }
    setBlock(found);
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", refreshActive);
    return () => document.removeEventListener("selectionchange", refreshActive);
  }, [refreshActive]);

  const exec = (cmd: string, val?: string) => {
    if (disabled) return;
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    sync();
    refreshActive();
  };

  const applyBlock = (tag: string) => {
    if (disabled) return;
    ref.current?.focus();
    document.execCommand("formatBlock", false, block === tag ? "p" : tag);
    sync();
    refreshActive();
  };

  /* ---- link popover ---- */
  const saveSelection = () => {
    const sel = window.getSelection();
    savedRange.current =
      sel && sel.rangeCount > 0 && ref.current?.contains(sel.anchorNode) ? sel.getRangeAt(0).cloneRange() : null;
  };
  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };
  const anchorUnderCursor = (): HTMLAnchorElement | null => {
    const sel = window.getSelection();
    let node: Node | null = sel?.anchorNode ?? null;
    while (node && node !== ref.current) {
      if (node.nodeType === 1 && (node as Element).tagName === "A") return node as HTMLAnchorElement;
      node = node.parentNode;
    }
    return null;
  };
  const closeLink = useCallback(() => {
    setLink(CLOSED_LINK);
    linkAnchor.current = null;
    savedRange.current = null;
  }, []);

  const openLinkEditor = () => {
    if (disabled) return;
    if (link.open) {
      closeLink();
      return;
    }
    saveSelection();
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString() : "";
    const existing = anchorUnderCursor();
    linkAnchor.current = existing;
    setLink({
      open: true,
      url: existing?.getAttribute("href") ?? "",
      text: existing ? existing.textContent ?? "" : selectedText,
      editing: !!existing,
      hasSelection: !!selectedText || !!existing,
      error: null,
    });
  };

  const applyLink = () => {
    const url = normalizeUrl(link.url);
    if (!url) {
      setLink((s) => ({ ...s, error: "Enter a valid URL (https://…) or email." }));
      linkInputRef.current?.focus();
      return;
    }
    ref.current?.focus();

    if (link.editing && linkAnchor.current) {
      linkAnchor.current.setAttribute("href", url);
      linkAnchor.current.setAttribute("rel", "noopener noreferrer nofollow");
      linkAnchor.current.setAttribute("target", "_blank");
      const t = link.text.trim();
      if (t) linkAnchor.current.textContent = t;
      sync();
      refreshActive();
      closeLink();
      return;
    }

    restoreSelection();
    const sel = window.getSelection();
    const collapsed = !sel || sel.isCollapsed;

    if (collapsed) {
      const text = escapeHtml(link.text.trim() || url);
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${escapeHtml(url)}" rel="noopener noreferrer nofollow" target="_blank">${text}</a>`,
      );
    } else {
      document.execCommand("createLink", false, url);
      const a = anchorUnderCursor();
      if (a) {
        a.setAttribute("rel", "noopener noreferrer nofollow");
        a.setAttribute("target", "_blank");
      }
    }
    sync();
    refreshActive();
    closeLink();
  };

  const removeLink = () => {
    ref.current?.focus();
    if (link.editing && linkAnchor.current) {
      const range = document.createRange();
      range.selectNodeContents(linkAnchor.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    } else {
      restoreSelection();
    }
    document.execCommand("unlink");
    sync();
    refreshActive();
    closeLink();
  };

  useEffect(() => {
    if (!link.open) return;
    const id = window.setTimeout(() => {
      linkInputRef.current?.focus();
      linkInputRef.current?.select();
    }, 0);
    return () => window.clearTimeout(id);
  }, [link.open]);

  useEffect(() => {
    if (!link.open) return;
    const onDown = (e: MouseEvent) => {
      if (linkWrapRef.current && !linkWrapRef.current.contains(e.target as Node)) closeLink();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeLink();
        ref.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [link.open, closeLink]);

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const plain = e.clipboardData.getData("text/plain");
    if (html) document.execCommand("insertHTML", false, sanitizeHtml(html));
    else if (plain) document.execCommand("insertText", false, plain);
    sync(); // validates
  };

  const inputCls =
    "mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-800 outline-none focus:border-[#27aae1] focus:ring-2 focus:ring-[#27aae1]";

  const showInvalid = invalid || !!contentError;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <div
        className={cn(
          "rounded-md border bg-white transition-colors",
          showInvalid
            ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500"
            : "border-gray-300 focus-within:border-[#27aae1] focus-within:ring-2 focus-within:ring-[#27aae1]",
          disabled && "opacity-60",
        )}
      >
        {/* toolbar */}
        <div
          role="toolbar"
          aria-label="Text formatting"
          className="flex flex-wrap items-center gap-1 rounded-t-md border-b border-gray-200 bg-gray-50 px-2 py-1.5"
        >
          {BLOCKS.map((b) => (
            <ToolButton key={b.tag} label={b.label} active={block === b.tag} disabled={disabled} onApply={() => applyBlock(b.tag)}>
              {b.short}
            </ToolButton>
          ))}

          <Divider />

          <ToolButton label="Bold" active={active.bold} disabled={disabled} onApply={() => exec("bold")}>
            <span className="font-bold">B</span>
          </ToolButton>
          <ToolButton label="Italic" active={active.italic} disabled={disabled} onApply={() => exec("italic")}>
            <span className="italic">I</span>
          </ToolButton>
          <ToolButton label="Underline" active={active.underline} disabled={disabled} onApply={() => exec("underline")}>
            <span className="underline">U</span>
          </ToolButton>

          <Divider />

          <ToolButton label="Bullet list" active={active.ul} disabled={disabled} onApply={() => exec("insertUnorderedList")}>
            &bull;&nbsp;&equiv;
          </ToolButton>
          <ToolButton label="Numbered list" active={active.ol} disabled={disabled} onApply={() => exec("insertOrderedList")}>
            1.
          </ToolButton>
          <ToolButton label="Quote" active={block === "blockquote"} disabled={disabled} onApply={() => applyBlock("blockquote")}>
            &ldquo;
          </ToolButton>

          <Divider />

          {/* link button + anchored popover */}
          <div ref={linkWrapRef} className="relative">
            <ToolButton label={link.editing ? "Edit link" : "Add link"} active={link.open} disabled={disabled} onApply={openLinkEditor}>
              Link
            </ToolButton>

            {link.open && (
              <div
                role="dialog"
                aria-label="Insert link"
                className="absolute right-0 top-[calc(100%+8px)] z-30 w-72 rounded-md border border-gray-200 bg-white p-3 shadow-lg"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col gap-2.5">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                    URL
                    <input
                      ref={linkInputRef}
                      type="text"
                      inputMode="url"
                      value={link.url}
                      placeholder="https://example.com"
                      onChange={(e) => setLink((s) => ({ ...s, url: e.target.value, error: null }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          applyLink();
                        }
                      }}
                      className={cn(inputCls, "normal-case tracking-normal")}
                    />
                  </label>

                  {!link.hasSelection && (
                    <label className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                      Link text
                      <input
                        type="text"
                        value={link.text}
                        placeholder="Text to display"
                        onChange={(e) => setLink((s) => ({ ...s, text: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            applyLink();
                          }
                        }}
                        className={cn(inputCls, "normal-case tracking-normal")}
                      />
                    </label>
                  )}

                  {link.error && <p className="text-xs text-red-600">{link.error}</p>}

                  <div className="flex items-center gap-2 pt-0.5">
                    {link.editing && (
                      <button
                        type="button"
                        onClick={removeLink}
                        className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 transition-colors hover:bg-gray-100"
                      >
                        Remove
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        closeLink();
                        ref.current?.focus();
                      }}
                      className="ml-auto rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 transition-colors hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={applyLink}
                      className="rounded bg-[#1d8fc3] px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-[#27aae1]"
                    >
                      {link.editing ? "Update" : "Apply"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <ToolButton label="Clear formatting" disabled={disabled} onApply={() => exec("removeFormat")}>
            Clear
          </ToolButton>
        </div>

        {/* persistent content error — blocks the form until the author removes the media */}
        {contentError && (
          <div
            role="alert"
            className="flex items-start gap-2 border-b border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700"
          >
            <span className="leading-relaxed">{contentError}</span>
          </div>
        )}

        {/* editable region */}
        <div
          ref={ref}
          data-field={name}
          className="fo-editor px-3 py-2.5 text-sm text-gray-800"
          contentEditable={!disabled}
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={label}
          aria-invalid={showInvalid || undefined}
          aria-describedby={hint ? hintId : undefined}
          data-placeholder={placeholder}
          tabIndex={0}
          onInput={sync}
          onKeyUp={refreshActive}
          onMouseUp={refreshActive}
          onPaste={handlePaste}
          style={{ minHeight, maxHeight, overflowY: "auto" }}
        />
      </div>

      {hint && (
        <p id={hintId} className="mt-1 text-xs leading-relaxed text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}

export default RichEditor;