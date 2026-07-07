"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { DecisionTemplate, DecisionBand } from "@/types/new/decision-template";
import { exportGrid } from "./handler";


const PAGE_SIZE = 15;
const TH = "px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap";
const TD = "px-3 py-3 align-top";

const bandText = (b: DecisionBand): string => {
  if (b.combo) return b.combo.join(" · ");
  if (b.op) {
    const v = Array.isArray(b.value) ? b.value.join("–") : b.value;
    return `${b.op} ${v}`;
  }
  return b.label ?? "—";
};

interface CritCol { key: string; name: string; kind: string; features: string[]; }

export default function DecisionGrid({
  templates, onRefresh,
}: { templates: DecisionTemplate[]; onRefresh: () => void }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<"all" | "intervention" | "national_proposal">("all");
  const [page, setPage] = useState(1);

  const columns: CritCol[] = useMemo(() => {
    const m = new Map<string, CritCol>();
    for (const t of templates) {
      for (const c of t.criteria ?? []) {
        const col = m.get(c.criterion);
        if (col) {
          for (const f of c.target_fields ?? []) if (!col.features.includes(f)) col.features.push(f);
        } else {
          m.set(c.criterion, {
            key: c.criterion, name: c.criterion_name, kind: c.kind,
            features: [...(c.target_fields ?? [])],
          });
        }
      }
    }
    return Array.from(m.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [templates]);

  const cellFor = (t: DecisionTemplate, critId: string) =>
    (t.criteria ?? []).find((c) => c.criterion === critId) ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter((t) => {
      if (kind !== "all" && t.kind !== kind) return false;
      if (!q) return true;
      return (
        (t.reference_number ?? "").toLowerCase().includes(q) ||
        (t.target_name ?? "").toLowerCase().includes(q) ||
        (t.package_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [templates, search, kind]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const colSpanTotal = 2 + columns.reduce((a, c) => a + Math.max(1, c.features.length), 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="pl-9" placeholder="Search ref, name or package…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border border-slate-200 text-xs">
            {(["all", "intervention", "national_proposal"] as const).map((k) => (
              <button key={k} onClick={() => { setKind(k); setPage(1); }}
                className={`px-3 py-1.5 ${kind === k ? "bg-[#27aae1] text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                {k === "national_proposal" ? "programs" : k}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => exportGrid(filtered, columns)} disabled={!filtered.length}>
            <Download className="mr-1.5 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th rowSpan={2} className={`${TH} sticky left-0 z-10 min-w-56 bg-slate-50`}>Intervention / Program</th>
              <th rowSpan={2} className={`${TH} w-24`}>Package</th>
              {columns.map((c) => (
                <th key={c.key} colSpan={Math.max(1, c.features.length)}
                  className={`${TH} border-l border-slate-200 text-center`}>
                  <div className="flex items-center justify-center gap-1.5">
                    {c.name}
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                      c.kind === "quantitative" ? "bg-[#27aae1]/10 text-[#27aae1]" : "bg-amber-50 text-amber-700"
                    }`}>
                      {c.kind?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
            <tr>
              {columns.map((c) =>
                (c.features.length ? c.features : ["score"]).map((f, i) => (
                  <th key={`${c.key}-${f}-${i}`}
                    className={`px-2 py-1 text-left text-[10px] font-medium text-slate-400 ${i === 0 ? "border-l border-slate-200" : ""}`}>
                    {f}
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paged.length === 0 ? (
              <tr><td colSpan={colSpanTotal} className="py-16 text-center">
                <Inbox className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                <p className="text-sm text-slate-400">No targets match this view.</p>
              </td></tr>
            ) : (
              paged.map((t) => (
                <tr key={t.id}
                  onClick={() => router.push(`/portal/panel/decisions/${t.id}`)}
                  className="cursor-pointer transition-colors hover:bg-slate-50/70">
                  <td className={`${TD} sticky left-0 z-10 bg-white`}>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-xs text-[#27aae1]">{t.reference_number || t.name}</span>
                      <span className="line-clamp-1 text-xs font-medium text-slate-700">{t.target_name}</span>
                      <span className={`text-[9px] uppercase ${t.kind === "intervention" ? "text-[#27aae1]" : "text-amber-600"}`}>
                        {t.kind === "intervention" ? "Intervention" : "Program"}
                      </span>
                    </div>
                  </td>
                  <td className={`${TD} text-xs text-slate-500`}>{t.package_name ?? "—"}</td>
                  {columns.map((col) => {
                    const c = cellFor(t, col.key);
                    const feats = col.features.length ? col.features : ["score"];
                    return feats.map((f, i) => (
                      <td key={`${t.id}-${col.key}-${f}-${i}`}
                        className={`${TD} ${i === 0 ? "border-l border-slate-100" : ""}`}>
                        {!c ? <span className="text-xs text-slate-300">—</span> : (
                          <div className="flex flex-col gap-1">
                            {(c.selected_bands ?? [])
                              .filter((b) => !b.field || b.field === f || feats[0] === "score")
                              .map((b, bi) => (
                                <span key={bi} className="inline-flex items-center gap-1">
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#27aae1] text-[10px] font-semibold text-white">
                                    {b.score}
                                  </span>
                                  <span className="line-clamp-1 text-[11px] text-slate-500" title={bandText(b)}>
                                    {b.label ?? bandText(b)}
                                  </span>
                                </span>
                              ))}
                            {(c.selected_bands ?? []).length === 0 && (
                              <span className="text-[11px] text-slate-300">pending</span>
                            )}
                          </div>
                        )}
                      </td>
                    ));
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-slate-600">Page {safePage} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}