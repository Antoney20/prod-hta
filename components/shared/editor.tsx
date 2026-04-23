"use client";

import { sanitizeHtml } from "@/app/portal/config/criteria-information/cc/clean";
import { useRef, useEffect, useState } from "react";

export interface RichEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  disabled?: boolean;
}

const FONT_SIZES = [
  { label: "14", value: "3" },
  { label: "16", value: "4" },
  { label: "18", value: "5" },
  { label: "20", value: "6" },
];

const BLOCK_FORMATS = [
  { label: "Paragraph", tag: "p" },
  { label: "Heading 2", tag: "h2" },
  { label: "Heading 3", tag: "h3" },
  { label: "Heading 4", tag: "h4" },
  { label: "Heading 5", tag: "h5" },
];

export function RichEditor({
  value,
  onChange,
  placeholder = "Start typing…",
  minHeight = 120,
  maxHeight = 320,
  disabled = false,
}: RichEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);
  const [blockFormat, setBlockFormat] = useState("p");
  const [fontSize, setFontSize] = useState("3");
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    if (ref.current && !isInternalUpdate.current) {
      if (ref.current.innerHTML !== value) {
        ref.current.innerHTML = value ?? "";
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  const exec = (cmd: string, val?: string) => {
    if (disabled) return;
    document.execCommand(cmd, false, val);
    ref.current?.focus();
  };

  const handleInput = () => {
    isInternalUpdate.current = true;
    onChange(ref.current?.innerHTML ?? "");
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const html  = e.clipboardData.getData("text/html");
    const plain = e.clipboardData.getData("text/plain");
    if (html) {
      document.execCommand("insertHTML", false, sanitizeHtml(html));
    } else if (plain) {
      document.execCommand("insertText", false, plain);
    }
  };

  const applyBlockFormat = (tag: string) => {
    if (disabled) return;
    setBlockFormat(tag);
    document.execCommand("formatBlock", false, tag);
    ref.current?.focus();
  };

  const applyFontSize = (size: string) => {
    if (disabled) return;
    setFontSize(size);
    exec("fontSize", size);
  };

  return (
    <div
      style={{
        border: "1px solid #d1d5db",
        borderRadius: 8,
        overflow: "hidden",
        background: disabled ? "#f9fafb" : "#fff",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {/* ── Toolbar ── */}
      <div
        style={{
          display: "flex",
          gap: 2,
          padding: "6px 10px",
          borderBottom: "1px solid #e5e7eb",
          background: "#f9fafb",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Block format dropdown */}
        <select
          value={blockFormat}
          onChange={(e) => applyBlockFormat(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ ...selectStyle, minWidth: 100 }}
          disabled={disabled}
        >
          {BLOCK_FORMATS.map((f) => (
            <option key={f.tag} value={f.tag}>{f.label}</option>
          ))}
        </select>

        <div style={dividerStyle} />

        {/* Font size dropdown */}
        <select
          value={fontSize}
          onChange={(e) => applyFontSize(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ ...selectStyle, minWidth: 56 }}
          disabled={disabled}
        >
          {FONT_SIZES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <div style={dividerStyle} />

        {/* Bold / Italic / Underline */}
        {[
          { cmd: "bold",      icon: "B", style: { fontWeight: 700 } },
          { cmd: "italic",    icon: "I", style: { fontStyle: "italic" as const } },
          { cmd: "underline", icon: "U", style: { textDecoration: "underline" as const } },
        ].map(({ cmd, icon, style }) => (
          <button
            key={cmd}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
            style={{ ...btnStyle, ...style }}
            disabled={disabled}
          >
            {icon}
          </button>
        ))}

        <div style={dividerStyle} />

        {/* Lists — dropdown */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setListOpen((o) => !o); }}
            style={{ ...btnStyle, display: "flex", alignItems: "center", gap: 4 }}
            disabled={disabled}
          >
            ☰ <span style={{ fontSize: 9, marginTop: 1 }}>▾</span>
          </button>
          {listOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0,
              background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6,
              boxShadow: "0 4px 12px rgba(0,0,0,.1)", zIndex: 100, minWidth: 140,
            }}>
              {[
                { label: "• Bullet list",   cmd: "insertUnorderedList" },
                { label: "1. Ordered list", cmd: "insertOrderedList" },
              ].map(({ label, cmd }) => (
                <button
                  key={cmd}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec(cmd);
                    setListOpen(false);
                    ref.current?.focus();
                  }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "8px 12px", background: "none", border: "none",
                    fontSize: 12, color: "#374151", cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f4ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={dividerStyle} />

        {/* Link */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            const url = prompt("Enter URL");
            if (url && /^https?:\/\//i.test(url)) exec("createLink", url);
          }}
          style={btnStyle}
          disabled={disabled}
        >
          Link
        </button>
      </div>

      {/* ── Editable area ── */}
      <div
        ref={ref}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onClick={() => setListOpen(false)}
        data-placeholder={placeholder}
        style={{
          minHeight,
          maxHeight,
          padding: "10px 12px",
          outline: "none",
          fontSize: 13,
          color: "#111827",
          lineHeight: 1.7,
          overflowY: "auto",
        }}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "2px 8px",
  border: "1px solid #d1d5db",
  borderRadius: 4,
  background: "#fff",
  cursor: "pointer",
  fontSize: 12,
  color: "#374151",
  lineHeight: 1.6,
};

const selectStyle: React.CSSProperties = {
  padding: "2px 6px",
  border: "1px solid #d1d5db",
  borderRadius: 4,
  background: "#fff",
  cursor: "pointer",
  fontSize: 12,
  color: "#374151",
  lineHeight: 1.6,
  height: 26,
};

const dividerStyle: React.CSSProperties = {
  width: 1,
  height: 18,
  background: "#d1d5db",
  margin: "0 4px",
  flexShrink: 0,
};