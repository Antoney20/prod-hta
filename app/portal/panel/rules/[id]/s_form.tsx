"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { UploadCloud, Table2, CheckCircle2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CriteriaRule } from "@/types/new/criteria-rules";
import { parseScaleFile, toPreviewGrid, ScalePreview } from "../handler";
import { addScale } from "@/app/api/new/panel/rules";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rule: CriteriaRule | null;
  onSaved: () => void;
}

export default function ScaleDialog({ open, onOpenChange, rule, onSaved }: Props) {
  const [label, setLabel] = useState("");
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [data, setData] = useState<any>(null);
  const [preview, setPreview] = useState<ScalePreview | null>(null);
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLabel(""); setSource(""); setDescription("");
    setData(null); setPreview(null); setFileName("");
  }, [open]);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    try {
      const parsed: any = await parseScaleFile(file);
      setData(parsed);
      setPreview(toPreviewGrid(parsed));
      setFileName(file.name);
      if (!label.trim() && (parsed?.label || parsed?.source)) {
        setLabel(String(parsed.label ?? parsed.source ?? "").trim());
      }
      if (!source.trim() && parsed?.source) setSource(String(parsed.source));
    } catch {
      toast.error("That file isn't valid JSON.");
    }
  };

  const submit = async () => {
    if (!rule) return;
    if (!label.trim()) { toast.error("Give the guide a label"); return; }
    if (data == null) { toast.error("Upload a JSON file first"); return; }

    setSaving(true);
    const res = await addScale(rule.id, {
      label: label.trim(),
      source: source.trim(),
      description: description.trim(),
      data,
    });
    setSaving(false);

    if (res.ok) { toast.success("Scoring guide added"); onOpenChange(false); onSaved(); }
    else toast.error(res.error ?? "Save failed");
  };

  const inputCls =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#27aae1] focus:outline-none focus:ring-1 focus:ring-[#27aae1]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] min-w-0 sm:max-w-3xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-[#27aae1]">Add guide materials</DialogTitle>
          <p className="text-sm text-slate-500">
            These are all references and useful materials providing more details on a certain criteria or a package. Can be general for all.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Package label or general</label>
            <input className={inputCls} value={label} onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Renal package , General" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Source (optional)</label>
            <input className={inputCls} value={source} onChange={(e) => setSource(e.target.value)}
              placeholder="..." />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Detailed description about the guide</label>
            <textarea className={`${inputCls} min-h-[52px]`} value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A  description about the guide." />
          </div>

          <div
            onClick={() => document.getElementById("scale-json-file")?.click()}
            className="flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed border-slate-300 px-6 py-6 text-center transition hover:border-[#27aae1] hover:bg-[#27aae1]/5">
            <UploadCloud className="h-7 w-7 text-slate-400" />
            <p className="text-sm text-slate-600">{fileName || "Click to choose a JSON file"}</p>
            <input id="scale-json-file" type="file" accept=".json,application/json" className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>

          {data != null && (
            preview ? (
              <div className="border border-slate-200">
                <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
                  <Table2 className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-600">
                    Preview · {preview.rows.length} term{preview.rows.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="max-h-72 overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-50">
                      <tr>
                        <th className="px-2 py-1.5 text-left font-semibold text-slate-500 whitespace-nowrap">Term</th>
                        {preview.columns.map((c) => (
                          <th key={c} className="px-2 py-1.5 text-left font-semibold text-slate-500 whitespace-nowrap">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {preview.rows.map((r, i) => (
                        <tr key={i} className="align-top">
                          <td className="px-2 py-1.5">
                            <p className="font-medium text-slate-700">{r.term}</p>
                            {r.definition && <p className="mt-0.5 text-[11px] text-slate-400">{r.definition}</p>}
                          </td>
                          {r.cells.map((cell, ci) => (
                            <td key={ci} className="px-2 py-1.5 text-slate-600 min-w-40">{cell || "—"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Valid JSON provided — it will be stored as-is.
              </div>
            )
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button style={{ backgroundColor: "#27aae1" }} className="text-white" disabled={saving} onClick={submit}>
            {saving ? "Saving…" : "Save guide"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}