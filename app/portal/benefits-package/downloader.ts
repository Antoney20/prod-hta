
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

/** RFC-4180: quote only when the field contains a comma, quote or newline. */
const escapeCsv = (field: string): string =>
  /[",\n\r]/.test(field) ? `"${field.replace(/"/g, '""')}"` : field;

export function packagesToCsv(packages: BenefitPackage[]): string {
  const extras = new Set<string>();
  for (const p of packages)
    for (const k of Object.keys(p.data ?? {}))
      if (!STD_ORDER.includes(k)) extras.add(k);

  const dataKeys = [...STD_ORDER, ...[...extras].sort()];
  const header = ["Name", "Fund", ...dataKeys.map(label), "Created At", "Updated At", "ID"];

  const rows = packages.map((p) => {
    const d = p.data ?? {};
    return [
      p.name,
      p.fund ?? "",
      ...dataKeys.map((k) => cellValue(d[k])),
      p.created_at ? new Date(p.created_at).toLocaleString() : "",
      p.updated_at ? new Date(p.updated_at).toLocaleString() : "",
      p.id,
    ];
  });

  return [header, ...rows].map((r) => r.map(escapeCsv).join(",")).join("\n");
}

export function downloadPackagesCsv(packages: BenefitPackage[], filename?: string) {
  const csv = packagesToCsv(packages);
  const stamp = new Date().toISOString().slice(0, 10);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `benefit-packages-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}