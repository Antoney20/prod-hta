"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ClipboardCheck, Package, Layers, ArrowRight, User, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { DecisionTemplate } from "@/types/new/decision-template";
import DecisionCriteriaTable from "./table";
import { getTemplate } from "@/app/api/new/panel/template";

export default function DecisionTemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [t, setT] = useState<DecisionTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setT(await getTemplate(id));
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (!t) {
    return (
      <div className="p-6 text-center text-slate-500">
        Template not found.
        <Button variant="link" onClick={() => router.push("/portal/panel/decisions")}>Back</Button>
      </div>
    );
  }

  const targetHref = t.kind === "intervention"
    ? `/portal/interventions/${t.target_id}`
    : `/portal/national-programs/${t.target_id}`;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start gap-3">
        <button onClick={() => router.push("/portal/panel/decisions")}
          className="flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-800" aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="rounded-lg bg-[#27aae1]/10 p-2"><ClipboardCheck className="h-5 w-5 text-[#27aae1]" /></div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-[#27aae1]">{t.name}</span>
            {t.reference_number && (
              <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-500">{t.reference_number}</span>
            )}
            <span className={`text-[10px] uppercase tracking-wide ${
              t.kind === "intervention" ? "text-[#27aae1]" : "text-amber-600"
            }`}>
              {t.kind === "intervention" ? "Intervention" : "National Program"}
            </span>
          </div>
          <h1 className="mt-1 text-xl font-bold text-slate-800">{t.target_name || "Untitled"}</h1>

          <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Package className="h-4 w-4 text-slate-400" /> {t.package_name ?? "—"}</span>
            <span className="inline-flex items-center gap-1.5"><Layers className="h-4 w-4 text-slate-400" /> {t.phase_name ?? "—"}</span>
            {t.generated_by_name && (
              <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4 text-slate-400" /> {t.generated_by_name}</span>
            )}
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4 text-slate-400" /> {new Date(t.created_at).toLocaleDateString("en-GB")}</span>
          </div>

          {t.target_id && (
            <Link href={targetHref}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#27aae1] hover:underline">
              See original proposal <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Criteria & selected features
        </h2>
        <DecisionCriteriaTable template={t} />
      </div>
    </div>
  );
}