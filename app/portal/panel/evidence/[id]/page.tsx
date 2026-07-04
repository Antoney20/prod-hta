"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Layers, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { htmlToText } from "@/components/shared/text";

import { Criterion, CriterionEvidence } from "@/types/new/evidence-panel";
import { ProgramProposal } from "@/types/new/program";
import { getCriterion, getEvidence, bulkDeleteEvidence } from "@/app/api/new/panel/evidence";
import { EvidenceInterventionRef } from "@/types/new/assessment";
import { getInterventions, getNationalPrograms } from "@/app/api/new/search";
import UploadWizard from "./wizard";
import EvidenceTable from "./table";

export interface TargetLabel {
  reference: string;
  name: string;
  kind: "intervention" | "national_proposal";
}

export default function CriterionEvidencePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [criterion, setCriterion] = useState<Criterion | null>(null);
  const [evidence, setEvidence] = useState<CriterionEvidence[]>([]);
  const [interventions, setInterventions] = useState<EvidenceInterventionRef[]>([]);
  const [programs, setPrograms] = useState<ProgramProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [evLoading, setEvLoading] = useState(false);

  const loadEvidence = useCallback(async () => {
    setEvLoading(true);
    setEvidence(await getEvidence({ criterion: id }));
    setEvLoading(false);
  }, [id]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [c, iv, pr] = await Promise.all([getCriterion(id), getInterventions(), getNationalPrograms()]);
    setCriterion(c);
    setInterventions(iv);
    setPrograms(pr);
    setLoading(false);
    await loadEvidence();
  }, [id, loadEvidence]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // id -> readable label, across both sources
  const targetLabels = useMemo(() => {
    const m = new Map<string, TargetLabel>();
    for (const iv of interventions) {
      m.set(String(iv.id), {
        reference: iv.reference_number,
        name: iv.intervention_name ?? iv.reference_number,
        kind: "intervention",
      });
    }
    for (const pr of programs) {
      m.set(String(pr.id), {
        reference: pr.reference_number ?? "",
        name: pr.title ?? pr.reference_number ?? "",
        kind: "national_proposal",
      });
    }
    return m;
  }, [interventions, programs]);

  const resolveTarget = useCallback(
    (row: CriterionEvidence): TargetLabel | null =>
      targetLabels.get(String(row.target ?? row.intervention ?? row.national_proposal)) ?? null,
    [targetLabels],
  );

const onDelete = async (ids: string[]) => {
  const res = await bulkDeleteEvidence(ids);
  if (res.ok) { toast.success(`${res.data?.deleted ?? ids.length} deleted.`); loadEvidence(); }
  else toast.error(res.error ?? "Delete failed");
};

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (!criterion) {
    return (
      <div className="p-6 text-center text-slate-500">
        Criterion not found.
        <Button variant="link" onClick={() => router.push("/portal/panel/evidence")}>Back to criteria</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      <div className="flex items-start gap-3">
        <button onClick={() => router.push("/portal/panel/evidence")}
          className="flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-800" aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="rounded-lg bg-[#27aae1]/10 p-2"><Layers className="h-5 w-5 text-[#27aae1]" /></div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">{criterion.criteria}</h1>
            {!criterion.active && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">inactive</span>}
          </div>
          {criterion.description && (
            <p className="mt-1 max-w-3xl text-sm text-slate-500">{htmlToText(criterion.description)}</p>
          )}
        </div>
        <Button variant="outline" size="icon" onClick={loadEvidence} disabled={evLoading}>
          <RefreshCw className={`h-4 w-4 ${evLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Overview label="Data labels" value={criterion.headers?.length ?? 0} />
        <Overview label="Evidence rows" value={evidence.length} />
        <Overview label="Interventions" value={evidence.filter((e) => e.intervention).length} />
        <Overview label="Programs" value={evidence.filter((e) => e.national_proposal).length} />
      </div>

      <UploadWizard
        criterion={criterion}
        interventions={interventions}
        programs={programs}
        existing={evidence}
        onImported={loadEvidence}
        onCriterionChanged={setCriterion}
      />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Evidence for this criterion
        </h2>
        <EvidenceTable
          criterion={criterion}
          rows={evidence}
          loading={evLoading}
          onDelete={onDelete}
          resolveTarget={resolveTarget}
        />
      </div>
    </div>
  );
}

function Overview({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}