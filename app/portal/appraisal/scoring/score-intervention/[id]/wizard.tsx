"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft, ChevronRight, CheckCircle2, Send,
  Loader2, AlertTriangle, ChevronDown, ChevronUp,
} from "lucide-react";

import { CriteriaAppraisalTool, CriteriaAppraisalScore } from "@/types/new/panel-appraisal";
import { AppraisalDraftScore } from "@/types/new/appraisal-score";

const BRAND = "#27aae1";

// ── Group flat criteria records by name ───────────────────────────────────────

export interface CriteriaGroup {
  name: string;
  description: string; // from first record in group
  options: CriteriaAppraisalTool[]; // sorted high → low score
}

export function groupCriteria(tools: CriteriaAppraisalTool[]): CriteriaGroup[] {
  const map = new Map<string, CriteriaAppraisalTool[]>();
  for (const t of tools) {
    const key = t.criteria.trim();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }
  const groups: CriteriaGroup[] = [];
  map.forEach((items, name) => {
    groups.push({
      name,
      description: items[0].description ?? "",
      options: [...items].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
    });
  });
  return groups;
}

// ── HTML renderer (strips tags for plain text, keeps it safe) ─────────────────

function HtmlText({ html, className }: { html: string; className?: string }) {
  if (!html) return null;
  return (
    <div
      className={[
        "text-sm text-slate-700 leading-relaxed",
        "[&_p]:mb-1 [&_p:last-child]:mb-0",
        "[&_ul]:list-disc [&_ul]:pl-4 [&_li]:leading-relaxed",
        "[&_span]:leading-relaxed [&_div]:leading-relaxed",
        className ?? "",
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ── Progress ring ─────────────────────────────────────────────────────────────

function ProgressRing({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? value / total : 0;
  const r = 26;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg className="rotate-[-90deg]" viewBox="0 0 60 60" width={56} height={56}>
        <circle cx={30} cy={30} r={r} fill="none" stroke="#e2e8f0" strokeWidth={5} />
        <circle
          cx={30} cy={30} r={r} fill="none"
          stroke={pct === 1 ? "#10b981" : BRAND}
          strokeWidth={5}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold text-slate-700 tabular-nums">
          {Math.round(pct * 100)}%
        </span>
      </div>
    </div>
  );
}


interface Props {
  criteria: CriteriaAppraisalTool[];
  drafts: Record<string, AppraisalDraftScore>; // keyed by criteria name
  interventionId: string;
  onDraftChange: (criteriaName: string, draft: AppraisalDraftScore | null) => void;
  onSubmitAll: () => Promise<void>;
  isSubmitting: boolean;
  readOnly?: boolean;
  savedScores?: CriteriaAppraisalScore[];
  onActiveCriteriaChange?: (criteriaName: string) => void;
}

export function AppraisalScoringWizard({
  criteria,
  drafts,
  interventionId,
  onDraftChange,
  onSubmitAll,
  isSubmitting,
  readOnly = false,
  savedScores = [],
  onActiveCriteriaChange,
}: Props) {
  const [step, setStep] = useState(0);
  const [comment, setComment] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showWarnings, setShowWarnings] = useState(false);

  const STORAGE_KEY = `appraisal-drafts:${interventionId}`;

  // Group flat records → criteria groups
  const groups = useMemo(() => groupCriteria(criteria), [criteria]);

  // Restore from localStorage on mount
  useEffect(() => {
    if (readOnly) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, AppraisalDraftScore>;
      Object.entries(parsed).forEach(([name, draft]) => {
        if (groups.some((g) => g.name === name)) onDraftChange(name, draft);
      });
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups.length]);

  // Persist to localStorage
  useEffect(() => {
    if (readOnly || Object.keys(drafts).length === 0) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts)); } catch {}
  }, [drafts, readOnly, STORAGE_KEY]);

  const current = groups[step] ?? null;
  const currentDraft = current ? drafts[current.name] : undefined;

  // Map saved scores by criteria UUID for read-only display
  const savedByCriteriaId = useMemo(() => {
    const map = new Map<string, CriteriaAppraisalScore>();
    for (const s of savedScores) map.set(s.criteria, s);
    return map;
  }, [savedScores]);

  // Get saved score for a group (any option in the group that was scored)
  const getSavedForGroup = (g: CriteriaGroup): CriteriaAppraisalScore | undefined =>
    g.options.map((o) => savedByCriteriaId.get(o.id)).find(Boolean);

  // Notify parent of active criteria name (for evidence panel sync)
  useEffect(() => {
    if (current?.name) onActiveCriteriaChange?.(current.name);
  }, [current?.name, onActiveCriteriaChange]);

  const draftedCount = Object.keys(drafts).length;
  const allScored = draftedCount === groups.length && groups.length > 0;

  const unscoredGroups = useMemo(
    () => groups.filter((g) => !drafts[g.name]),
    [groups, drafts]
  );

  const saveComment = () => {
    if (!current || !currentDraft) return;
    onDraftChange(current.name, { ...currentDraft, comment });
  };

  const goTo = (idx: number) => {
    saveComment();
    setComment(drafts[groups[idx]?.name]?.comment ?? "");
    setStep(idx);
  };

  const selectOption = (group: CriteriaGroup, tool: CriteriaAppraisalTool) => {
    if (readOnly) return;
    const existing = drafts[group.name];
    onDraftChange(group.name, {
      criteria_id: tool.id,
      criteria_name: group.name,
      score_value: tool.score ?? 0,
      rationale: tool.scoring_approach ?? "",
      comment: existing?.comment ?? comment,
    });
  };

  const handleSubmitClick = () => {
    setSubmitAttempted(true);
    if (!allScored) { setShowWarnings(true); return; }
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    try {
      await onSubmitAll();
      localStorage.removeItem(STORAGE_KEY);
      groups.forEach((g) => onDraftChange(g.name, null));
    } catch {}
  };

  if (!current) {
    return (
      <Card className="border-slate-200">
        <CardContent className="py-16 text-center text-slate-400 text-sm">
          No appraisal criteria configured.
        </CardContent>
      </Card>
    );
  }

  const currentIsUnscored = !readOnly && !currentDraft && submitAttempted;
  const savedForCurrent = getSavedForGroup(current);

  return (
    <>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="px-5 pt-5 pb-3 space-y-3">

          {/* Title + progress ring */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                {readOnly ? "Appraisal Review" : "Score Criteria"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {readOnly
                  ? `${savedScores.length} of ${groups.length} criteria scored`
                  : `${draftedCount} of ${groups.length} drafted`}
              </p>
            </div>
            <ProgressRing
              value={readOnly ? savedScores.length : draftedCount}
              total={groups.length}
            />
          </div>

          {/* Dot nav */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {groups.map((g, i) => {
              const isDone = readOnly ? !!getSavedForGroup(g) : !!drafts[g.name];
              const isActive = i === step;
              const isWarn = !readOnly && !drafts[g.name] && submitAttempted;
              return (
                <button
                  key={g.name}
                  onClick={() => goTo(i)}
                  title={g.name}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: isActive ? 24 : 10,
                    height: 10,
                    background: isActive
                      ? BRAND
                      : isDone
                      ? `${BRAND}90`
                      : isWarn
                      ? "#fbbf24"
                      : "#e2e8f0",
                    outline: isWarn ? "1px solid #f59e0b" : undefined,
                  }}
                />
              );
            })}
          </div>

          {/* Unscored warning */}
          {!readOnly && submitAttempted && unscoredGroups.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
              <button
                type="button"
                onClick={() => setShowWarnings((v) => !v)}
                className="flex items-center justify-between w-full gap-2"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="text-xs font-semibold text-amber-700">
                    {unscoredGroups.length} criterion
                    {unscoredGroups.length !== 1 ? "a" : ""} still need
                    {unscoredGroups.length === 1 ? "s" : ""} a score
                  </span>
                </div>
                {showWarnings
                  ? <ChevronUp className="h-3.5 w-3.5 text-amber-500" />
                  : <ChevronDown className="h-3.5 w-3.5 text-amber-500" />}
              </button>
              {showWarnings && (
                <ul className="mt-2 space-y-1 pl-5">
                  {unscoredGroups.map((g) => {
                    const idx = groups.findIndex((x) => x.name === g.name);
                    return (
                      <li key={g.name}>
                        <button
                          type="button"
                          onClick={() => idx >= 0 && goTo(idx)}
                          className="text-xs text-amber-700 underline underline-offset-2 hover:text-amber-900 text-left"
                        >
                          {g.name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="px-5 pb-5 space-y-4">

          {/* Criterion name + description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
                {step + 1} / {groups.length}
              </Badge>
              {!readOnly && currentDraft && (
                <Badge
                  variant="outline"
                  className="text-xs gap-1"
                  style={{ borderColor: `${BRAND}40`, color: BRAND }}
                >
                  <CheckCircle2 className="h-3 w-3" /> Drafted
                </Badge>
              )}
              {readOnly && savedForCurrent && (
                <Badge
                  variant="outline"
                  className="text-xs gap-1 border-emerald-200 text-emerald-700 bg-emerald-50"
                >
                  <CheckCircle2 className="h-3 w-3" /> Scored
                </Badge>
              )}
            </div>

            <h4 className="text-sm font-semibold text-slate-800 leading-snug">
              {current.name}
            </h4>

            {current.description && (
              <div className="bg-slate-50 border border-slate-100 rounded-md px-3 py-2.5">
                <HtmlText html={current.description} className="text-xs text-slate-600" />
              </div>
            )}

            {currentIsUnscored && (
              <div className="flex items-center gap-1.5 text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs font-medium">
                  This criterion requires a score before submitting.
                </span>
              </div>
            )}
          </div>

          <Separator className="bg-slate-100" />

          {/* Scoring options */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              {readOnly ? "Selected option" : "Select one option"}
            </p>

            {readOnly ? (
              <div className="space-y-2">
                {current.options.map((opt) => {
                  const isSelected = savedForCurrent?.criteria === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className="rounded-lg border px-3 py-2.5 transition-all"
                      style={
                        isSelected
                          ? {
                              borderColor: BRAND,
                              background: `${BRAND}0a`,
                              outline: `1px solid ${BRAND}`,
                            }
                          : {
                              borderColor: "#f1f5f9",
                              background: "#f8fafc",
                              opacity: 0.6,
                            }
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Radio indicator + label */}
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <div
                            className="h-3.5 w-3.5 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5"
                            style={
                              isSelected
                                ? { borderColor: BRAND }
                                : { borderColor: "#cbd5e1" }
                            }
                          >
                            {isSelected && (
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ background: BRAND }}
                              />
                            )}
                          </div>
                          <HtmlText
                            html={opt.scoring_approach}
                            className="flex-1 min-w-0 text-sm"
                          />
                        </div>
                        <ScorePill value={opt.score ?? 0} />
                      </div>
                    </div>
                  );
                })}

                {/* Notes — shown below all options if present */}
                {savedForCurrent?.comment && (
                  <div className="mt-1 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Notes
                    </p>
                    <p className="text-xs text-slate-500 italic bg-slate-50 border border-slate-100 rounded-md px-3 py-2 leading-relaxed">
                      "{savedForCurrent.comment}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {current.options.map((opt) => {
                  const isSelected = currentDraft?.criteria_id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => selectOption(current, opt)}
                      className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all ${
                        isSelected
                          ? "ring-1"
                          : currentIsUnscored
                          ? "border-amber-200 hover:border-amber-300 hover:bg-amber-50/50"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                      style={
                        isSelected
                          ? {
                              borderColor: BRAND,
                              background: `${BRAND}0a`,
                              outlineColor: BRAND,
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Radio + label */}
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <div
                            className="h-3.5 w-3.5 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5 transition-colors"
                            style={
                              isSelected
                                ? { borderColor: BRAND }
                                : {
                                    borderColor: currentIsUnscored
                                      ? "#fbbf24"
                                      : "#cbd5e1",
                                  }
                            }
                          >
                            {isSelected && (
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ background: BRAND }}
                              />
                            )}
                          </div>
                          <HtmlText
                            html={opt.scoring_approach}
                            className="flex-1 min-w-0 text-sm"
                          />
                        </div>
                        {/* Score pill */}
                        <ScorePill value={opt.score ?? 0} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          {!readOnly && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Notes{" "}
                <span className="text-slate-400 normal-case font-normal tracking-normal">
                  (optional)
                </span>
              </p>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add justification or context..."
                rows={2}
                className="resize-none text-sm"
              />
            </div>
          )}

          <Separator className="bg-slate-100" />

          {/* Nav row */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline" size="sm"
              onClick={() => goTo(step - 1)}
              disabled={step === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </Button>

            <div className="flex items-center gap-2">
              {!readOnly && (step === groups.length - 1 || draftedCount > 0) && (
                <Button
                  size="sm"
                  onClick={handleSubmitClick}
                  disabled={isSubmitting}
                  variant={allScored ? "default" : "outline"}
                  className="gap-1.5"
                  style={
                    allScored
                      ? { background: BRAND, borderColor: BRAND, color: "#fff" }
                      : undefined
                  }
                >
                  {isSubmitting ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting…</>
                  ) : (
                    <>
                      {!allScored && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                      {allScored && <Send className="h-3.5 w-3.5" />}
                      Submit All
                      {!allScored && (
                        <span className="ml-0.5 text-xs text-amber-600 font-normal">
                          ({draftedCount}/{groups.length})
                        </span>
                      )}
                    </>
                  )}
                </Button>
              )}

              {step < groups.length - 1 && (
                <Button
                  variant="outline" size="sm"
                  onClick={() => goTo(step + 1)}
                  className="gap-1"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirm submit dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Submit all scores?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>
                  You are about to submit{" "}
                  <strong>
                    {draftedCount} score{draftedCount !== 1 ? "s" : ""}
                  </strong>{" "}
                  for this intervention.
                </p>
                <div className="bg-slate-50 border rounded-md px-3 py-2 text-xs space-y-1">
                  {groups.map((g) => {
                    const d = drafts[g.name];
                    const opt = d
                      ? g.options.find((o) => o.id === d.criteria_id)
                      : undefined;
                    return (
                      <div
                        key={g.name}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="truncate text-slate-600">{g.name}</span>
                        <strong className="shrink-0 tabular-nums text-slate-800">
                          {opt ? `${opt.score ?? 0}pt${opt.score !== 1 ? "s" : ""}` : "—"}
                        </strong>
                      </div>
                    );
                  })}
                </div>
                <p className="text-slate-400 text-xs">
                  Scores cannot be changed after submission.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Again</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting}
              onClick={handleConfirm}
              style={{ background: BRAND, borderColor: BRAND }}
            >
              {isSubmitting
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />Submitting…</>
                : "Confirm & Submit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ScorePill({ value }: { value: number }) {
  const color =
    value >= 4 ? "#10b981" : value >= 2 ? "#f59e0b" : "#ef4444";
  return (
    <span
      className="text-xs font-bold shrink-0 px-2 py-0.5 rounded-full border tabular-nums whitespace-nowrap"
      style={{ color, borderColor: `${color}40`, background: `${color}10` }}
    >
      {value}pt{value !== 1 ? "s" : ""}
    </span>
  );
}