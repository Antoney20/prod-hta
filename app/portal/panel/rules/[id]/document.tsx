"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { UploadCloud, LinkIcon } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CriteriaRule } from "@/types/new/criteria-rules";
import { addDocument } from "@/app/api/new/panel/rules";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rule: CriteriaRule | null;
  onSaved: () => void;
}

export default function DocumentDialog({ open, onOpenChange, rule, onSaved }: Props) {
  const [mode, setMode] = useState<"link" | "file">("link");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMode("link"); setLabel(""); setDescription(""); setLink(""); setFile(null);
  }, [open]);

  const submit = async () => {
    if (!rule) return;
    if (!label.trim()) { toast.error("Give the document a label"); return; }
    if (mode === "link" && !link.trim()) { toast.error("Add a link or citation"); return; }
    if (mode === "file" && !file) { toast.error("Choose a file"); return; }

    setSaving(true);
    const res = await addDocument(rule.id, {
      label: label.trim(),
      description,
      link: mode === "link" ? link.trim() : "",
      file: mode === "file" ? file : null,
    });
    setSaving(false);

    if (res.ok) { toast.success("Guide attached"); onOpenChange(false); onSaved(); }
    else toast.error(res.error ?? "Attach failed");
  };

  const inputCls =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#27aae1] focus:outline-none focus:ring-1 focus:ring-[#27aae1]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] min-w-0 sm:max-w-lg backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-[#27aae1]">Attach guide document</DialogTitle>
          <p className="text-sm text-slate-500">
            A reference the panel and AI use when judging this rule — a published paper,
            a guideline, or a link to source data.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* link vs file */}
          <div className="inline-flex rounded-md border border-slate-200 text-sm">
            {(["link", "file"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-4 py-1.5 ${mode === m ? "bg-[#27aae1] text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                {m === "link" ? "Link / citation" : "Upload file"}
              </button>
            ))}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Label</label>
            <input className={inputCls} value={label} onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. IHME Global Burden of Disease 2021" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description (optional)</label>
            <textarea className={`${inputCls} min-h-[60px]`} value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this material covers and how it applies." />
          </div>

          {mode === "link" ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Link or citation</label>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-slate-400" />
                <input className={inputCls} value={link} onChange={(e) => setLink(e.target.value)}
                  placeholder="https://…  or a full citation" />
              </div>
            </div>
          ) : (
            <div
              onClick={() => document.getElementById("rule-doc-file")?.click()}
              className="flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed border-slate-300 px-6 py-8 text-center transition hover:border-[#27aae1] hover:bg-[#27aae1]/5">
              <UploadCloud className="h-7 w-7 text-slate-400" />
              <p className="text-sm text-slate-600">{file ? file.name : "Click to choose a file"}</p>
              <input id="rule-doc-file" type="file" className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button style={{ backgroundColor: "#27aae1" }} className="text-white" disabled={saving} onClick={submit}>
            {saving ? "Attaching…" : "Attach"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}