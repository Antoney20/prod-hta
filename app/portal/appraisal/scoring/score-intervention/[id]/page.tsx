"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowLeft, RefreshCw, ClipboardCheck, Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { CriteriaAppraisalTool, CriteriaAppraisalScore } from "@/types/new/panel-appraisal";
import { PanelIntervention } from "@/types/new/panel-appraisal";
import { AppraisalCriteriaEvidence } from "@/types/new/appraisal-evidence";

import {
  getAppraisalCriteria,
  getMyScores,
  bulkCreateScores,
  getPanelInterventions,
} from "@/app/api/new/panel/scoring";
import { AppraisalDraftScore } from "@/types/new/appraisal-score";
import { getAppraisalEvidence } from "@/app/api/criteria/evidence";
import { AppraisalEvidencePanel, InterventionHeaderPanel, NoEvidencePanel } from "./details";
import { AppraisalScoringWizard } from "./wizard";




export default function PanelScoringPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [intervention, setIntervention] = useState<PanelIntervention | null>(null);
  const [criteria, setCriteria] = useState<CriteriaAppraisalTool[]>([]);
  const [myScores, setMyScores] = useState<CriteriaAppraisalScore[]>([]);
  const [evidence, setEvidence] = useState<AppraisalCriteriaEvidence[]>([]);
  const [drafts, setDrafts] = useState<Record<string, AppraisalDraftScore>>({});
//   const [activeCriteriaId, setActiveCriteriaId] = useState<string>("");
const [activeCriteriaName, setActiveCriteriaName] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const isAlreadyScored = myScores.length > 0;
  const isInProgress = !isAlreadyScored && Object.keys(drafts).length > 0;
const isNotStarted = !isAlreadyScored && !isInProgress;
  const hasEvidence = evidence.length > 0;
  const hasUnsavedDrafts = Object.keys(drafts).length > 0 && !isAlreadyScored;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [allInterventions, criteriaList, scoreList, evidenceList] = await Promise.all([
        getPanelInterventions(),
        getAppraisalCriteria(),
        getMyScores(id),
        getAppraisalEvidence(id),
      ]);
      const found = allInterventions.find((i) => i.intervention_id === id) ?? null;
      setIntervention(found);
      setCriteria(criteriaList);
      setMyScores(scoreList);
      setEvidence(evidenceList);
    } catch {
      toast.error("Failed to load scoring page.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Warn on browser unload
  useEffect(() => {
    if (!hasUnsavedDrafts) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedDrafts]);

  const handleDraftChange = (criteriaId: string, draft: AppraisalDraftScore | null) => {
    setDrafts((prev) => {
      const next = { ...prev };
      if (!draft) delete next[criteriaId];
      else next[criteriaId] = draft;
      return next;
    });
  };

  const handleSubmitAll = async () => {
    setSubmitting(true);
    try {
      const scores = Object.values(drafts).map((d) => ({
        criteria_id: d.criteria_id,
        score: { criteria_id: d.criteria_id, score_value: d.score_value, rationale: d.rationale },
        comment: d.comment,
      }));
      await bulkCreateScores({ intervention_id: id, scores });
      toast.success(`${scores.length} scores submitted successfully.`);
      setDrafts({});
      await load();
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.errors?.length) {
        data.errors.forEach((e: any) => {
          toast.error(`Criteria ${e.index + 1}: ${Object.values(e.errors ?? {}).flat().join(", ")}`, { autoClose: 6000 });
        });
      } else {
        toast.error(data?.detail ?? "Submission failed — no scores were saved.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (hasUnsavedDrafts) setShowLeaveConfirm(true);
    else router.back();
  };

  const confirmLeave = () => {
    setDrafts({});
    setShowLeaveConfirm(false);
    router.back();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-[#27aae1]" />
      </div>
    );
  }

  if (!intervention) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>Intervention not found or not on panel.</p>
        <Button variant="link" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  const draftCount = Object.keys(drafts).length;

  return (
    <div className="space-y-5 p-6 w-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 text-slate-500">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md" style={{ background: "#27aae118" }}>
              {isAlreadyScored
                ? <Eye className="h-4 w-4" style={{ color: "#27aae1" }} />
                : !hasEvidence
                ? <Lock className="h-4 w-4 text-amber-500" />
                : <ClipboardCheck className="h-4 w-4" style={{ color: "#27aae1" }} />
              }
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-none">
                {isAlreadyScored ? "Scored" : "Not Started"}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAlreadyScored
                  ? "You have already submitted your scores"
                  : !hasEvidence
                  ? "Scoring locked — evidence not yet available"
                  : "Score each criterion then submit all at once"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
        {!hasEvidence && !isAlreadyScored ? (
        <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 text-xs gap-1">
            <Lock className="h-3 w-3" /> Locked
        </Badge>
        ) : isAlreadyScored ? (
        <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 text-xs gap-1">
            <ClipboardCheck className="h-3 w-3" /> Scored
        </Badge>
        ) : (
        <Badge variant="outline" className="border-slate-300 text-slate-600 text-xs">
            Not Started
        </Badge>
        )}


          <Button variant="outline" size="icon" className="h-8 w-8" onClick={load} disabled={loading}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Intervention info strip ── */}
      <InterventionHeaderPanel intervention={intervention} />

      {/* ── No evidence lock ── */}
      {!hasEvidence && !isAlreadyScored && <NoEvidencePanel />}

      {/* ── Main scoring layout ── */}
      {(hasEvidence || isAlreadyScored) && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-5 items-start">
          {/* Left — evidence panel */}
          <div className="lg:sticky lg:top-4">
            <AppraisalEvidencePanel
              evidence={evidence}
            //   activeCriteriaId={activeCriteriaId}
            activeCriteriaName={activeCriteriaName} 
              criteria={criteria}
            />
          </div>

          {/* Right — wizard */}
          <div className="lg:sticky lg:top-4">
            <AppraisalScoringWizard
              criteria={criteria}
              drafts={drafts}
              interventionId={id}
              onDraftChange={handleDraftChange}
              onSubmitAll={handleSubmitAll}
              isSubmitting={submitting}
              readOnly={isAlreadyScored}
              savedScores={myScores}
            //   onActiveCriteriaChange={setActiveCriteriaId}
            onActiveCriteriaChange={setActiveCriteriaName}
            />
          </div>
        </div>
      )}

      {/* ── Leave confirm ── */}
      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>
              You have <strong>{draftCount} unsaved draft{draftCount !== 1 ? "s" : ""}</strong> that will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay here</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeave}>Leave & discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}