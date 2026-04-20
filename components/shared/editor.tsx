"use client";

import { sanitizeHtml } from "@/app/portal/config/criteria-information/cc/clean";
import { useRef, useEffect } from "react";


export interface RichEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  disabled?: boolean;
}

type ToolbarItem =
  | { type: "button"; cmd: string; icon: string; style?: React.CSSProperties }
  | { type: "divider" }
  | { type: "link" };

const TOOLBAR: ToolbarItem[] = [
  { type: "button", cmd: "bold",      icon: "B", style: { fontWeight: 700 } },
  { type: "button", cmd: "italic",    icon: "I", style: { fontStyle: "italic" } },
  { type: "button", cmd: "underline", icon: "U", style: { textDecoration: "underline" } },
  { type: "divider" },
  { type: "button", cmd: "insertUnorderedList", icon: "• List" },
  { type: "button", cmd: "insertOrderedList",   icon: "1. List" },
  { type: "divider" },
  { type: "link" },
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

  // sync external value → DOM (only when value changes externally)
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
        {TOOLBAR.map((item, i) => {
          if (item.type === "divider") {
            return (
              <div
                key={`div-${i}`}
                style={{ width: 1, height: 18, background: "#d1d5db", margin: "0 4px" }}
              />
            );
          }
          if (item.type === "link") {
            return (
              <button
                key="link"
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const url = prompt("Enter URL");
                  if (url && /^https?:\/\//i.test(url)) exec("createLink", url);
                }}
                style={btnStyle}
              >
                Link
              </button>
            );
          }
          return (
            <button
              key={item.cmd}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); exec(item.cmd); }}
              style={{ ...btnStyle, ...item.style }}
            >
              {item.icon}
            </button>
          );
        })}
      </div>

      {/* ── Editable area ── */}
      <div
        ref={ref}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
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