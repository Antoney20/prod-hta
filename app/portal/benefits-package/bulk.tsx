"use client";

import { useRef, useState } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, Loader2, FileSpreadsheet } from "lucide-react";
import { toast } from "react-toastify";

import { createBenefitPackage } from "@/app/api/new/benefits-package";
import type { BenefitPackageInput, BenefitPackageItem } from "@/types/new/benefits-package";

const norm = (s: unknown) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const slug = (s: unknown) =>
  String(s ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

function splitCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (ch !== "\r") field += ch;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

async function toMatrix(file: File): Promise<string[][]> {
  if (file.name.toLowerCase().endsWith(".csv")) return splitCsv(await file.text());
  const ExcelJS: any = (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await file.arrayBuffer());
  const ws = wb.worksheets[0];
  const out: string[][] = [];
  ws?.eachRow({ includeEmpty: false }, (row: any) => {
    const cells: string[] = [];
    row.eachCell({ includeEmpty: true }, (c: any) => cells.push(String(c.text ?? c.value ?? "").trim()));
    out.push(cells);
  });
  return out;
}

function toPackages(matrix: string[][]): BenefitPackageInput[] {
  if (matrix.length < 2) return [];
  const headers = matrix[0].map((h) => h.trim());
  const nameIdx = headers.findIndex((h) => norm(h) === "name" || norm(h) === "package");
  const fundIdx = headers.findIndex((h) => norm(h) === "fund");
  return matrix.slice(1).map((r) => {
    const data: Record<string, string> = {};
    headers.forEach((h, i) => {
      if (i === nameIdx || i === fundIdx || !h) return;
      const v = (r[i] ?? "").trim();
      if (v) data[slug(h)] = v;
    });
    return {
      name: (r[nameIdx] ?? "").trim(),
      fund: fundIdx >= 0 ? (r[fundIdx] ?? "").trim() : "",
      data,
    };
  }).filter((p) => p.name);
}

/** Split a raw package object into { fund, data, items }, lifting an `items` array out. */
function splitObject(obj: any): { fund: string; data: Record<string, any>; items: BenefitPackageItem[] } {
  const items: BenefitPackageItem[] = Array.isArray(obj?.items) ? obj.items : [];
  const fund = String(obj?.fund ?? "").trim();

  let data: Record<string, any> = {};
  if (obj?.data && typeof obj.data === "object") {
    data = obj.data;
  } else if (obj && typeof obj === "object") {
    Object.entries(obj).forEach(([k, v]) => {
      const nk = norm(k);
      if (nk === "name" || nk === "fund" || nk === "package" || nk === "items") return;
      data[slug(k)] = v;
    });
  }
  return { fund, data, items };
}

function jsonToPackages(text: string): BenefitPackageInput[] {
  let parsed: any;
  try { parsed = JSON.parse(text); } catch { return []; }

  // Shape C (annex): { annex: { name, fund, items: [...] } } — or annex as an array of such
  if (parsed?.annex) {
    const list = Array.isArray(parsed.annex) ? parsed.annex : [parsed.annex];
    return list.map((a: any) => {
      const { fund, data, items } = splitObject(a);
      return { name: String(a?.name ?? "").trim(), fund, data, items };
    }).filter((p: BenefitPackageInput) => p.name);
  }

  // Shape A: { funds: { CODE: { name, packages: { PackageName: {...fields} } } } }
  if (parsed?.funds && typeof parsed.funds === "object") {
    const out: BenefitPackageInput[] = [];
    for (const fundObj of Object.values<any>(parsed.funds)) {
      const fund = String(fundObj?.name ?? "").trim();
      const packages = fundObj?.packages ?? {};
      for (const [name, pkg] of Object.entries<any>(packages)) {
        const items: BenefitPackageItem[] = Array.isArray(pkg?.items) ? pkg.items : [];
        // data verbatim, minus items
        const data = pkg && typeof pkg === "object"
          ? Object.fromEntries(Object.entries(pkg).filter(([k]) => norm(k) !== "items"))
          : {};
        out.push({ name: String(name).trim(), fund, data, items });
      }
    }
    return out.filter((p) => p.name);
  }

  // Shape B: array / { packages: [...] } / single object
  const list: any[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.packages)
      ? parsed.packages
      : parsed && typeof parsed === "object"
        ? [parsed]
        : [];

  return list.map((it) => {
    const name = String(it?.name ?? it?.package ?? "").trim();
    const { fund, data, items } = splitObject(it);
    return { name, fund, data, items };
  }).filter((p) => p.name);
}

interface Props { open: boolean; onClose: () => void; onDone: () => void; }

export function BulkUploadPackages({ open, onClose, onDone }: Props) {
  const [rows, setRows] = useState<BenefitPackageInput[]>([]);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    try {
      const isJson = file.name.toLowerCase().endsWith(".json");
      const pkgs = isJson
        ? jsonToPackages(await file.text())
        : toPackages(await toMatrix(file));
      if (!pkgs.length) {
        toast.error("No packages found (each needs a 'name').");
        return;
      }
      setFileName(file.name);
      setRows(pkgs);
    } catch {
      toast.error("Failed to parse. Use .xlsx, .csv, or .json.");
    }
  };

  const run = async () => {
    setBusy(true);
    let ok = 0, fail = 0;
    for (const p of rows) {
      const res = await createBenefitPackage(p);
      res.ok ? ok++ : fail++;
    }
    setBusy(false);
    if (ok) toast.success(`${ok} package${ok !== 1 ? "s" : ""} imported.`);
    if (fail) toast.error(`${fail} row${fail !== 1 ? "s" : ""} failed.`);
    setRows([]); setFileName("");
    onDone();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-xl backdrop-blur-sm">
        <DialogHeader><DialogTitle>Bulk import packages</DialogTitle></DialogHeader>

        {rows.length === 0 ? (
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
            className="flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed border-slate-300 px-6 py-12 text-center hover:border-[#27aae1] hover:bg-[#27aae1]/5"
          >
            <UploadCloud className="h-8 w-8 text-slate-400" />
            <p className="text-sm font-medium text-slate-700">Drop a CSV / XLSX / JSON file, or click to browse</p>
            <p className="text-xs text-slate-400">CSV/XLSX: name, fund, then fields · JSON: funds→packages, an array, or an annex with items[]</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.json" className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <FileSpreadsheet className="h-4 w-4 text-[#27aae1]" /> {fileName} · {rows.length} packages
            </p>
            <div className="max-h-56 overflow-auto border border-slate-200 text-xs">
              {rows.slice(0, 50).map((p, i) => (
                <div key={i} className="flex justify-between border-b border-slate-100 px-2 py-1">
                  <span className="font-medium text-slate-700">{p.name}</span>
                  <span className="text-slate-400">
                    {p.items?.length ? `${p.items.length} items` : (p.fund || "—")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
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