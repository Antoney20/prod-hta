"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, RefreshCw, ClipboardCheck, Eye, Layers, Lock, CheckCircle2,
  ChevronLeft, ChevronRight, FileText, ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import {
  CriteriaAppraisalTool, PanelAppraisalScore, PanelScoreCreatePayload,
} from "@/types/new/panel-score";
import { EvidenceTarget } from "@/types/new/decision-template";
import { getTarget } from "@/app/api/new/panel/template";
import {
  getAppraisalCriteria, listPanelScores, bulkCreatePanelScores,
} from "@/app/api/new/panel/panel-scoring";
import { useGlobalUser } from "@/app/context/guard";

import {
  buildScoreMap, collectServices, groupCriteria, groupsScored, serviceKey,
} from "../_lib/scoring";
import PanelScoringWizard from "./_components/wizard";

const SCORE_ROLES = new Set(["admin", "panel"]);

export default function PanelScoringDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedService = searchParams.get("service") ?? "";
  const { user, isInitialized } = useGlobalUser();

  const [target, setTarget] = useState<EvidenceTarget | null>(null);
  const [criteria, setCriteria] = useState<CriteriaAppraisalTool[]>([]);
  const [scores, setScores] = useState<PanelAppraisalScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [service, setService] = useState<string>(""); // "" = general

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, crit] = await Promise.all([getTarget(id), getAppraisalCriteria()]);
      setTarget(t);
      setCriteria(crit);
      const key = t.kind === "national_proposal" ? { national_proposal: id } : { intervention: id };
      setScores(user?.id ? await listPanelScores({ ...key, reviewer: user.id }) : []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load target.");
      setTarget(null);
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    if (isInitialized) load();
  }, [isInitialized, load]);

  const activeCriteria = useMemo(() => criteria.filter((c) => c.active), [criteria]);
  const groups = useMemo(() => groupCriteria(activeCriteria), [activeCriteria]);
  const scoreMap = useMemo(() => buildScoreMap(scores), [scores]);
  const services = useMemo(() => (target ? collectServices(target) : []), [target]);

  useEffect(() => {
    if (!requestedService) return;
    const match = services.find((s) => serviceKey(s) === serviceKey(requestedService));
    if (match) setService(match);
  }, [requestedService, services]);

  const canScore = isInitialized ? !!user?.role && SCORE_ROLES.has(user.role) : false;
  const locked = target ? groupsScored(scoreMap, target.id, service, groups) : false;

  const units = useMemo(() => ["", ...services], [services]);
  const unitIndex = units.indexOf(service);
  const goPrevService = () => setService(units[(unitIndex - 1 + units.length) % units.length]);
  const goNextService = () => setService(units[(unitIndex + 1) % units.length]);

 const handleSubmit = async (payloads: PanelScoreCreatePayload[]) => {
    if (!canScore) {
      toast.error("Your role does not allow appraisal scoring.");
      return;
    }
    if (locked) {
      toast.info("This scope is already scored and cannot be rescored.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await bulkCreatePanelScores(payloads);
      if (res.failed.length) toast.warn(`${res.upserted} saved · ${res.failed.length} failed.`);
      else toast.success(`${res.upserted} score${res.upserted === 1 ? "" : "s"} submitted.`);
      await load();
    } catch {
      toast.error("Submission failed — no scores were saved.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin" style={{ color: "#27aae1" }} />
      </div>
    );
  }

  if (!target) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p>Target not found.</p>
        <Button variant="link" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  const isNational = target.kind === "national_proposal";

  const tab = (value: string, label: string) => {
    const done = groupsScored(scoreMap, target.id, value, groups);
    const active = service === value;
    return (
      <button
        key={value || "__general"}
        onClick={() => setService(value)}
        className={`flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
          active
            ? "border-[#27aae1] bg-[#27aae1]/10 text-[#27aae1]"
            : "border-slate-200 text-slate-600 hover:border-[#27aae1]"
        }`}
      >
        {label}
        {done ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <Lock className="h-3 w-3 text-slate-300" />
        )}
      </button>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mt-0.5 h-8 w-8 text-slate-500">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="mt-0.5 rounded-md bg-[#27aae1]/10 p-1.5">
            <ClipboardCheck className="h-4 w-4 text-[#27aae1]" />
          </div>
          <div>
            <h1 className="flex flex-wrap items-center gap-2 text-lg font-bold leading-tight text-slate-800">
              {isNational ? "National Program Appraisal" : "Intervention Appraisal"}
              <span className="font-mono text-xs text-slate-400">{target.reference_number}</span>
            </h1>
            <p className="mt-0.5 max-w-2xl text-xs text-slate-500">{target.name}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => router.push(`/portal/interventions/${target.id}`)}
          >
            <ExternalLink className="h-3.5 w-3.5" /> Original submission
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => router.push(`/portal/panel/evidence/coverage/${target.id}`)}
          >
            <FileText className="h-3.5 w-3.5" /> Detailed report
          </Button>
          {target.package && (
            <Badge variant="outline" className="gap-1 border-slate-200 text-xs text-slate-600">
              <Layers className="h-3 w-3" /> {target.package}
            </Badge>
          )}
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={load} disabled={loading}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Scope — General + services, with prev/next */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="flex items-center gap-2 p-3">
          <span className="mr-1 shrink-0 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Scope
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={goPrevService}
            disabled={units.length <= 1}
            title="Previous scope"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-1 flex-wrap gap-2 overflow-x-auto">
            {tab("", "General")}
            {services.map((s) => tab(s, s))}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={goNextService}
            disabled={units.length <= 1}
            title="Next scope"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {locked && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          <Eye className="h-4 w-4 shrink-0" />
          You&apos;ve already scored {service ? `service “${service}”` : "the general target"}. Scores are locked and can&apos;t be changed.
        </div>
      )}

      <PanelScoringWizard
        key={service}
        target={target}
        service={service}
        groups={groups}
        scoreMap={scoreMap}
        onSubmit={handleSubmit}
        readOnly={locked || !canScore}
        submitting={submitting}
      />
    </div>
  );
}