"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { getPublicProposals } from "@/app/api/public";
import { getNationalPrograms } from "@/app/api/new/search";
import { TargetType } from "@/types/new/agentic";

const BRAND = "#27aae1";

export interface PickedTarget {
  target_type: TargetType;
  id: string;
  name: string;
  reference_number: string | null;
}

export function TargetPicker({
  value,
  onChange,
  scope = "all",
}: {
  value: PickedTarget | null;
  onChange: (t: PickedTarget | null) => void;
  scope?: "all" | "intervention" | "national_proposal";
}) {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [national, setNational] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getPublicProposals(), getNationalPrograms()])
      .then(([p, n]) => {
        setInterventions(Array.isArray(p) ? p : []);
        setNational(Array.isArray(n) ? n : []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const options: PickedTarget[] = useMemo(() => {
    const iv: PickedTarget[] =
      scope === "national_proposal" ? [] :
      interventions.map((p) => ({
        target_type: "intervention" as const,
        id: String(p.id),
        name: p.intervention_name ?? "Untitled",
        reference_number: p.reference_number ?? null,
      }));
    const np: PickedTarget[] =
      scope === "intervention" ? [] :
      national.filter((p) => p.reference_number).map((p) => ({
        target_type: "national_proposal" as const,
        id: String(p.id),
        name: p.title ?? "Untitled",
        reference_number: p.reference_number ?? null,
      }));
    return [...iv, ...np];
  }, [interventions, national, scope]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.name.toLowerCase().includes(q) || (o.reference_number?.toLowerCase().includes(q) ?? false)
    );
  }, [options, query]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-sm text-left"
      >
        {value ? (
          <>
            <span className="font-mono text-xs" style={{ color: BRAND }}>{value.reference_number ?? "—"}</span>
            <span className="flex-1 truncate font-medium text-slate-800">{value.name}</span>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
              {value.target_type === "national_proposal" ? "National" : "Intervention"}
            </span>
          </>
        ) : (
          <span className="text-slate-400 flex-1">{loading ? "Loading targets…" : "Select a proposal…"}</span>
        )}
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or reference…"
              className="w-full pl-7 pr-2 py-1.5 text-sm outline-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-400">No matches.</div>
            ) : (
              filtered.map((o) => (
                <button
                  key={`${o.target_type}-${o.id}`}
                  onClick={() => { onChange(o); setOpen(false); setQuery(""); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-sky-50 border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs" style={{ color: BRAND }}>{o.reference_number ?? "—"}</span>
                    {o.target_type === "national_proposal" && (
                      <span className="text-[9px] uppercase font-semibold px-1 py-0.5 rounded bg-indigo-50 text-indigo-600">Nat'l</span>
                    )}
                  </div>
                  <div className="text-sm text-slate-700 truncate mt-0.5">{o.name}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ErrorCodeHint({ code }: { code?: string }) {
  if (!code) return null;
  const map: Record<string, string> = {
    config_error: "No API key or model configured. Add one in AI Settings.",
    connection_error: "Couldn't reach the AI provider. Check the key or try again.",
    processing_error: "The model response couldn't be processed. Try again.",
  };
  return (
    <div className="text-xs px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700">
      {map[code] ?? "Something went wrong."}
    </div>
  );
}