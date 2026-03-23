"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, ClipboardCheck, Eye, Lock } from "lucide-react";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { SubmittedProposal } from "@/types/dashboard/submittedProposals";
import { InterventionScore, SelectionTool } from "@/types/new/client";
import { CriteriaInformation } from "@/types/new/criteria-info";
import { DraftScore, groupTools } from "@/types/new/score";
import { getSubmittedProposalById } from "@/app/api/dashboard/submitted-proposals";
import { createInterventionScore, getInterventionScores, getSelectionTools } from "@/app/api/new/client";
import { getCriteriaInfoByIntervention } from "@/app/api/new/criteria-info";

import { ScoringWizard } from "./wizard";
import { ActiveCriteriaPanel, BasicInfoPanel, NoCriteriaPanel } from "./details";
import { useGlobalUser } from "@/app/context/guard";

export default function InterventionScoringPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isInitialized } = useGlobalUser();

  const [proposal, setProposal] = useState<SubmittedProposal | null>(null);
  const [tools, setTools] = useState<SelectionTool[]>([]);
  const [savedScores, setSavedScores] = useState<InterventionScore[]>([]);
  const [criteriaInfoList, setCriteriaInfoList] = useState<CriteriaInformation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, DraftScore>>({});
  const [activeCriteriaLabel, setActiveCriteriaLabel] = useState<string>("");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const STORAGE_KEY = `scoring-drafts:${id}`;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, toolList, scoreList, criteriaList] = await Promise.all([
        getSubmittedProposalById(id),
        getSelectionTools(),
        getInterventionScores(id),
        getCriteriaInfoByIntervention(id),
      ]);
      setProposal(p);
      setTools(toolList);
      setSavedScores(scoreList);
      setCriteriaInfoList(criteriaList);
    } catch {
      toast.error("Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const groups = useMemo(() => groupTools(tools), [tools]);
  const isAlreadyScored = savedScores.length > 0;
  const criteriaInfo = criteriaInfoList[0] ?? null;
  const hasCriteriaInfo = criteriaInfo !== null;

  const hasUnsavedDrafts = Object.keys(drafts).length > 0 && !isAlreadyScored;

  const handleDraftChange = (label: string, draft: DraftScore | null) => {
    setDrafts((prev) => {
      if (!draft) {
        const next = { ...prev };
        delete next[label];
        return next;
      }
      return { ...prev, [label]: draft };
    });
  };


  
  useEffect(() => {
    if (!hasUnsavedDrafts) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; 
    };

    window.addEventListener("beforeunload", handler);
    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [hasUnsavedDrafts]);

  const canScore = isInitialized
    ? user?.role === "admin" || user?.role === "swg"
    : null;

const handleSubmitAll = async () => {
  if (!canScore) {
    toast.error("Your role does not allow scoring. Please contact an admin.");
    return;
  }
  setSubmitting(true);
  try {
    const payload = Object.values(drafts).map((d) => ({
      intervention: id,
      criteria: d.tool_id,
      score: {
        tool_id: d.tool_id,
        scoring_mechanism: d.scoring_mechanism,
        score_value: d.score_value,
        criteria_label: d.criteriaGroupLabel,
      },
      comment: d.comment,
    }));

    const result = await createInterventionScore(payload);

    toast.success(`${result.length} scores submitted successfully.`);
    setDrafts({});
    localStorage.removeItem(STORAGE_KEY);
    await load();

  } catch (err: any) {
    const data = err?.response?.data;

    if (data?.errors?.length) {
      // Per-item validation errors from bulk_create
      data.errors.forEach((e: any) => {
        const field = Object.values(e.errors ?? {}).flat().join(", ");
        toast.error(`Criteria ${e.index + 1}: ${field}`, { autoClose: 6000 });
      });
    } else {
      // Fallback — detail string or generic
      const msg = data?.detail ?? "Submission failed — no scores were saved.";
      toast.error(msg);
    }

  } finally {
    setSubmitting(false);
  }
};


  const handleBack = () => {
    if (hasUnsavedDrafts) {
      setShowLeaveConfirm(true);
    } else {
      router.back();
    }
  };

  const confirmLeave = () => {
    localStorage.removeItem(STORAGE_KEY); // clean up drafts when leaving
    setDrafts({});                        // optional: clear in-memory too
    setShowLeaveConfirm(false);
    router.back();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>Proposal not found.</p>
        <Button variant="link" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 text-slate-500">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-teal-100 p-1.5 rounded-md">
              {isAlreadyScored
                ? <Eye className="h-4 w-4 text-teal-600" />
                : !hasCriteriaInfo
                ? <Lock className="h-4 w-4 text-amber-500" />
                : <ClipboardCheck className="h-4 w-4 text-teal-600" />}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-none">
                {isAlreadyScored ? "Scoring Review" : "Selection Scoring"}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAlreadyScored
                  ? "Your submitted scores for this intervention"
                  : !hasCriteriaInfo
                  ? "Scoring locked — criteria information required"
                  : "Score each criteria using next/prev, then submit all at once"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!hasCriteriaInfo && !isAlreadyScored ? (
            <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 text-xs gap-1">
              <Lock className="h-3 w-3" /> Locked
            </Badge>
          ) : isAlreadyScored ? (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1" variant="outline">
              <ClipboardCheck className="h-3 w-3" /> Scored
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 text-xs">
              {Object.keys(drafts).length}/{groups.length} drafted
            </Badge>
          )}
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={load} disabled={loading}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {!hasCriteriaInfo && <NoCriteriaPanel />}

      {hasCriteriaInfo && (
        <div className="space-y-5">
          <BasicInfoPanel criteriaInfo={criteriaInfo} interventionId={id} />

          <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-5 items-start">
            <div className="lg:sticky lg:top-4">
              <ActiveCriteriaPanel
                criteriaInfo={criteriaInfo}
                activeCriteriaLabel={activeCriteriaLabel}
              />
            </div>
            <div className="lg:sticky lg:top-4">
              <ScoringWizard
                groups={groups}
                drafts={drafts}
                interventionId={id}
                onDraftChange={handleDraftChange}
                onSubmitAll={handleSubmitAll}
                isSubmitting={submitting}
                readOnly={isAlreadyScored}
                savedScores={savedScores}
                onActiveCriteriaChange={setActiveCriteriaLabel}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirm leave dialog */}
      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>
              You have <strong>{Object.keys(drafts).length} unsaved score</strong> 
              that will be lost if you leave this page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay here</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLeave}
            >
              Leave & discard drafts
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}