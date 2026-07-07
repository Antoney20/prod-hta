"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ClipboardCheck, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminOnly } from "@/app/context/role";

import { DecisionTemplate } from "@/types/new/decision-template";
import { generateTemplates, getAllTemplatesFull } from "@/app/api/new/panel/template";
import DecisionGrid from "./grid";


export default function DecisionTemplatesPage() {
  const [templates, setTemplates] = useState<DecisionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    setLoading(true);
    setTemplates(await getAllTemplatesFull());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onGenerate = async (overwrite = false) => {
    setGenerating(true);
    const res = await generateTemplates({ overwrite });
    setGenerating(false);
    if (res.ok && res.data) {
      const { generated, skipped } = res.data;
      toast.success(`${generated} generated${skipped ? `, ${skipped} already existed` : ""}.`);
      load();
    } else {
      toast.error(res.error ?? "Generation failed");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#27aae1]/10 p-2"><ClipboardCheck className="h-5 w-5 text-[#27aae1]" /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Decision Templates</h1>
            <p className="text-sm text-slate-500">Every intervention and program scored across all criteria.</p>
          </div>
        </div>
        {templates.length > 0 && (
          <div className="flex items-center gap-2">
            <AdminOnly silent>
              <Button variant="outline" size="sm" onClick={() => onGenerate(false)} disabled={generating}>
                <Sparkles className="mr-1.5 h-4 w-4" /> {generating ? "Generating…" : "Generate new"}
              </Button>
              <Button variant="outline" size="sm"
                className="border-[#27aae1]/40 text-[#27aae1]"
                onClick={() => onGenerate(true)} disabled={generating}>
                <RefreshCw className="mr-1.5 h-4 w-4" /> Regenerate all
              </Button>
            </AdminOnly>
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-96 animate-pulse rounded-xl bg-slate-100" />
      ) : templates.length === 0 ? (
        // ── generate-first empty state ──
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-24 text-center shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#27aae1]/10">
            <Sparkles className="h-8 w-8 text-[#27aae1]" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Generate decision templates</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            This reads every intervention’s evidence and applies each criterion’s rule —
            auto-scoring the quantitative criteria and laying out the descriptive ones for the panel to judge.
          </p>
          <AdminOnly silent>
            <Button style={{ backgroundColor: "#27aae1" }} className="mt-6 text-white"
              onClick={() => onGenerate(false)} disabled={generating}>
              <Sparkles className="mr-2 h-4 w-4" />
              {generating ? "Generating…" : "Generate now"}
            </Button>
          </AdminOnly>
          <AdminOnly>
            <p className="mt-4 text-xs text-slate-400">
              Make sure criteria, rules, and evidence are set up first.
            </p>
          </AdminOnly>
        </div>
      ) : (
        <DecisionGrid templates={templates} onRefresh={load} />
      )}
    </div>
  );
}