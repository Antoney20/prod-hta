import { useEffect, useRef } from "react";

interface RichEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "");
}

export default function RichEditor({ value, onChange, placeholder, minHeight = 100 }: RichEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (ref.current && !isInternalUpdate.current) {
      if (ref.current.innerHTML !== value) {
        ref.current.innerHTML = value ?? "";
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    ref.current?.focus();
  };

  const handleInput = () => {
    isInternalUpdate.current = true;
    onChange(ref.current?.innerHTML ?? "");
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const plain = e.clipboardData.getData("text/plain");
    if (html) {
      document.execCommand("insertHTML", false, sanitizeHtml(html));
    } else if (plain) {
      document.execCommand("insertText", false, plain);
    }
  };

  const toolBtn = (label: string, style: React.CSSProperties, action: () => void) => (
    <button
      key={label}
      type="button"
      onMouseDown={(e) => { e.preventDefault(); action(); }}
      style={{
        padding: "2px 8px",
        border: "1px solid #d1d5db",
        borderRadius: 4,
        background: "#fff",
        cursor: "pointer",
        fontSize: 12,
        color: "#374151",
        ...style,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ border: "1px solid #d1d5db", borderRadius: 6, overflow: "hidden", background: "#fff" }}>
      <div style={{
        display: "flex", gap: 2, padding: "6px 8px",
        borderBottom: "1px solid #e5e7eb", background: "#f9fafb", flexWrap: "wrap",
      }}>
        {toolBtn("B", { fontWeight: 700 }, () => exec("bold"))}
        {toolBtn("I", { fontStyle: "italic" }, () => exec("italic"))}
        {toolBtn("U", { textDecoration: "underline" }, () => exec("underline"))}
        <div style={{ width: 1, background: "#e5e7eb", margin: "0 4px" }} />
        {toolBtn("• List", {}, () => exec("insertUnorderedList"))}
        {toolBtn("1. List", {}, () => exec("insertOrderedList"))}
        <div style={{ width: 1, background: "#e5e7eb", margin: "0 4px" }} />
        {toolBtn("Link", {}, () => {
          const url = prompt("Enter URL");
          if (url && /^https?:\/\//i.test(url)) exec("createLink", url);
        })}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        style={{
          minHeight,
          maxHeight: 280,
          padding: "10px 12px",
          outline: "none",
          fontSize: 13,
          color: "#111827",
          lineHeight: 1.6,
          overflowY: "auto",
        }}
      />
      <style>{`[contenteditable]:empty:before{content:attr(data-placeholder);color:#9ca3af;pointer-events:none}`}</style>
    </div>
  );
}