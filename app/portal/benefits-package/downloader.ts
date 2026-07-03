// downloader.ts
import type { BenefitPackage } from "@/types/new/benefits-package";

const STD_ORDER = ["scope", "access_point", "tariff", "ppm", "access_rules"];
const LABELS: Record<string, string> = {
  scope: "Scope", access_point: "Access Point", tariff: "Tariff", ppm: "PPM", access_rules: "Access Rules",
};
const label = (k: string) =>
  LABELS[k] ?? k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const primitive = (v: unknown): string =>
  v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);

/** Any value -> one readable cell. Arrays -> bullet lines, objects -> "key: value" lines. */
function cellValue(value: unknown): string {
  if (value == null || value === "") return "";
  if (Array.isArray(value)) return value.map((v) => `• ${primitive(v)}`).join("\n");
  if (typeof value === "object")
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${k}: ${primitive(v)}`)
      .join("\n");
  return String(value);
}

/** "620,000" | 620000 -> 620000; non-numeric stays as-is. */
function coerceNumber(v: unknown): number | string {
  if (typeof v === "number") return v;
  const cleaned = String(v ?? "").replace(/[^0-9.]/g, "");
  if (cleaned && !Number.isNaN(Number(cleaned))) return Number(cleaned);
  return String(v ?? "");
}

async function loadExcel() {
  return (await import("exceljs")).default ?? (await import("exceljs"));
}

async function saveWorkbook(wb: any, filename: string) {
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const stamp = () => new Date().toISOString().slice(0, 10);

/** FUNCTION 1 — descriptive packages (data blob). One row per package. */
export async function downloadPackagesXlsx(packages: BenefitPackage[], filename?: string) {
  const ExcelJS: any = await loadExcel();
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Benefit Packages");

  const extras = new Set<string>();
  for (const p of packages)
    for (const k of Object.keys(p.data ?? {}))
      if (!STD_ORDER.includes(k)) extras.add(k);

  const dataKeys = [...STD_ORDER, ...[...extras].sort()];
  const header = ["Name", "Fund", ...dataKeys.map(label), "Created At", "Updated At", "ID"];

  ws.addRow(header);
  ws.getRow(1).font = { bold: true };

  for (const p of packages) {
    const d = p.data ?? {};
    ws.addRow([
      p.name,
      p.fund ?? "",
      ...dataKeys.map((k) => cellValue(d[k])),
      p.created_at ? new Date(p.created_at).toLocaleString() : "",
      p.updated_at ? new Date(p.updated_at).toLocaleString() : "",
      p.id,
    ]);
  }

  ws.columns.forEach((col: any, i: number) => {
    col.width = i < 2 ? 28 : 40;
    col.alignment = { wrapText: true, vertical: "top" };
  });

  await saveWorkbook(wb, filename ?? `benefit-packages-${stamp()}.xlsx`);
}

/** FUNCTION 2 — annex line items (tariff reimbursements). One row per item. */
export async function downloadAnnexXlsx(packages: BenefitPackage[], filename?: string) {
  const ExcelJS: any = await loadExcel();
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Annex Tariffs");

  const PREF = ["specialty", "intervention", "tariff"];
  const keys = new Set<string>();
  for (const p of packages)
    for (const it of p.items ?? [])
      for (const k of Object.keys(it ?? {})) keys.add(k);
  const itemKeys = [...PREF.filter((k) => keys.has(k)), ...[...keys].filter((k) => !PREF.includes(k)).sort()];

  const header = ["#", "Package", "Fund", ...itemKeys.map(label)];
  ws.addRow(header);
  ws.getRow(1).font = { bold: true };

  let n = 0;
  for (const p of packages) {
    for (const it of p.items ?? []) {
      n++;
      ws.addRow([
        n,
        p.name,
        p.fund ?? "",
        ...itemKeys.map((k) => (k === "tariff" ? coerceNumber((it as any)?.[k]) : (it as any)?.[k] ?? "")),
      ]);
    }
  }

  ws.columns.forEach((col: any) => { col.width = 26; col.alignment = { vertical: "top", wrapText: true }; });
  const tariffIdx = header.findIndex((h) => h.toLowerCase() === "tariff");
  if (tariffIdx >= 0) {
    const col = ws.getColumn(tariffIdx + 1);
    col.numFmt = "#,##0";
    col.width = 16;
  }
  ws.getColumn(1).width = 6; // "#"

  await saveWorkbook(wb, filename ?? `annex-tariffs-${stamp()}.xlsx`);
}