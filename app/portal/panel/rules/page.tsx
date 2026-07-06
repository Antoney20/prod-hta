"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Scale, FileText, ChevronRight, BookOpen, ListChecks, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminOnly } from "@/app/context/role";

import { CriteriaRule, RuleInput } from "@/types/new/criteria-rules";
import { getRules, bulkUploadRules } from "@/app/api/new/panel/rules";

export default function CriteriaRulesPage() {
  const router = useRouter();
  const [rules, setRules] = useState<CriteriaRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    setRules(await getRules());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // one card per rule (already one rule per criterion)
  const cards = useMemo(
    () =>
      [...rules].sort((a, b) =>
        (a.criterion_name ?? "").localeCompare(b.criterion_name ?? ""),
      ),
    [rules],
  );

  const onUpload = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const list: RuleInput[] = Array.isArray(parsed) ? parsed : parsed.rules ?? [];
      if (!list.length) { toast.error("No rules found in that file."); return; }

      const res = await bulkUploadRules(list);
      if (res.ok && res.data) {
        const { created, updated, failed } = res.data;
        if (created || updated) toast.success(`${created} created · ${updated} updated.`);
        if (failed?.length) toast.error(`${failed.length} rule${failed.length !== 1 ? "s" : ""} failed.`);
        load();
      } else {
        toast.error(res.error ?? "Upload failed");
      }
    } catch {
      toast.error("Couldn't read that file — expecting valid JSON.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-[#27aae1]/10 p-2"><Scale className="h-5 w-5 text-[#27aae1]" /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Criteria Rules, Guides and Mapping for the evidence </h1>
            <p className="max-w-2xl text-sm text-slate-500">
              Rules define how each criterion’s score is assigned. Helps define and pick out the data fields
              that carry the values worth appraising - like disease rankings or budget share — and
              map those values to a score. Where a criterion is judged rather than computed, attach
              guide materials where a criteria requires a supporting evidence.
            </p>
          </div>
        </div>
        <AdminOnly silent>
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="mr-2 h-4 w-4" /> {uploading ? "Uploading…" : "Upload rules (JSON)"}
          </Button>
          <input ref={fileRef} type="file" accept=".json,application/json" className="hidden"
            onChange={(e) => onUpload(e.target.files?.[0])} />
        </AdminOnly>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <BookOpen className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No rules yet</p>
          <p className="text-xs text-slate-400">Upload a rules JSON file to set up the framework.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((r) => (
            <button
              key={r.id}
              onClick={() => router.push(`/portal/panel/rules/${r.id}`)}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-[#27aae1] hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#27aae1]/10 text-[#27aae1]">
                  <FileText size={20} />
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-[#27aae1]" />
              </div>

              <div className="flex items-center gap-2">
                <p className="line-clamp-1 font-semibold text-slate-800">{r.criterion_name}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  {r.kind}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500">
                {r.description || "No description"}
              </p>

              <div className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs">
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <ListChecks className="h-3.5 w-3.5 text-slate-400" />
                   categories
                </span>
                <span className={`inline-flex items-center gap-1.5 ${r.documents?.length ? "font-medium text-[#27aae1]" : "text-slate-400"}`}>
                  <BookOpen className="h-3.5 w-3.5" />
                view more 
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}