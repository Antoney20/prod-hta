"use client";

import { useRef, useState } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, Loader2, FileSpreadsheet } from "lucide-react";
import { toast } from "react-toastify";

import { parse } from "./handler";
import type { AppraisalRow, ImportMode } from "@/types/panel/appraisal-report";

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (rows: AppraisalRow[], mode: ImportMode) => Promise<number | void> | number | void;
  currentCount?: number;
}

export function BulkImportAppraised({ open, onClose, onImport, currentCount = 0 }: Props) {
  const [rows, setRows] = useState<AppraisalRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [mode, setMode] = useState<ImportMode>("replace");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    try {
      const parsed = await parse(file);
      if (!parsed.rows.length) return toast.error("No rows found in file.");
      setRows(parsed.rows);
      setFileName(file.name);
    } catch {
      toast.error("Failed to parse. Use .xlsx, .csv, or .json.");
    }
  };

  const reset = () => { setRows([]); setFileName(""); };

  const run = async () => {
    setBusy(true);
    try {
      const res = await onImport(rows, currentCount ? mode : "replace");
      const n = typeof res === "number" ? res : rows.length;
      const skipped = rows.length - n;
      toast.success(
        `${n} row${n !== 1 ? "s" : ""} imported${skipped > 0 ? ` · ${skipped} duplicate${skipped !== 1 ? "s" : ""} skipped` : ""}.`,
      );
      reset();
      onClose();
    } catch {
      toast.error("Import failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && (reset(), onClose())}>
      <DialogContent className="w-[95vw] sm:max-w-3xl backdrop-blur-sm">
        <DialogHeader><DialogTitle>Import appraised interventions</DialogTitle></DialogHeader>

        {rows.length === 0 ? (
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
            className="flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed border-slate-300 px-6 py-12 text-center hover:border-[#27aae1] hover:bg-[#27aae1]/5"
          >
            <UploadCloud className="h-8 w-8 text-slate-400" />
            <p className="text-sm font-medium text-slate-700">Drop an XLSX / CSV / JSON file, or click to browse</p>
            <p className="text-xs text-slate-400">Columns are read as-is; an intervention may repeat across services</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.json" className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <FileSpreadsheet className="h-4 w-4 text-[#27aae1]" /> {fileName} · {rows.length} rows
            </p>
            <div className="max-h-56 overflow-auto border border-slate-200 text-xs">
              {rows.slice(0, 80).map((r, i) => (
                <div key={i} className="flex items-center gap-2 border-b border-slate-100 px-2 py-1">
                  <span className="font-mono text-[10px] text-slate-400">{String(r.ref ?? "—")}</span>
                  <span className="flex-1 truncate font-medium text-slate-700">{String(r.intervention ?? "—")}</span>
                  {r.service ? (
                    <span className="shrink-0 rounded bg-[#27aae1]/10 px-1.5 py-0.5 text-[10px] text-[#1d70b8]">
                      {String(r.service)}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
            {currentCount > 0 && (
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <label className="flex items-center gap-1">
                  <input type="radio" checked={mode === "replace"} onChange={() => setMode("replace")} />
                  Replace {currentCount} existing
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" checked={mode === "append"} onChange={() => setMode("append")} />
                  Append (skips duplicate ref + service)
                </label>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onClose(); }} disabled={busy}>Cancel</Button>
          {rows.length > 0 && (
            <Button onClick={run} disabled={busy} style={{ backgroundColor: "#27aae1" }} className="text-white">
              {busy && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Import {rows.length}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}