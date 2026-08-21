"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft, ChevronRight, Send, Loader2, FileText, AlertTriangle, CheckCircle2,
  Sparkles, ZapOff, RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { PanelAppraisalScore, PanelScoreCreatePayload } from "@/types/new/panel-score";
import { EvidenceTarget } from "@/types/new/decision-template";
import {
  CriterionGroup, CriterionOption, evidenceForService, norm, scoreForGroup, scoreValueOf,
  serviceKey,
} from "../../_lib/scoring";
import { AutoPick, AutoFailReason, failMessage } from "../../_lib/autoscore";
import { EvidenceValue, HtmlContent } from "./prose";

interface Draft {
  optionId: string;
  value: number;
  comment: string;
}

// ── local draft persistence ──────────────────────────────────────────────
// Autosave the in-progress drafts so an interrupt (refresh, crash, nav away)
// doesn't lose scoring work. Keyed per target + scope; cleared on submit.
const DRAFT_VERSION = 1;
const draftStorageKey = (targetId: string, service: string) =>
  `bptap:panel-draft:v${DRAFT_VERSION}:${targetId}:${serviceKey(service)}`;

function loadStoredDrafts(targetId: string, service: string): Record<string, Draft> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(draftStorageKey(targetId, service));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, Draft>) : null;
  } catch {
    return null;
  }
}

function saveStoredDrafts(targetId: string, service: string, drafts: Record<string, Draft>) {
  if (typeof window === "undefined") return;
  try {
    if (Object.keys(drafts).length === 0) {
      window.localStorage.removeItem(draftStorageKey(targetId, service));
    } else {
      window.localStorage.setItem(draftStorageKey(targetId, service), JSON.stringify(drafts));
    }
  } catch {
    /* storage full / disabled — autosave is best-effort, never blocks scoring */
  }
}

function clearStoredDrafts(targetId: string, service: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(draftStorageKey(targetId, service));
  } catch {
    /* ignore */
  }
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return null;
  return (
    <Badge
      variant="outline"
      className={`shrink-0 font-bold tabular-nums ${
        score >= 4
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : score >= 2
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {score} pt{score === 1 ? "" : "s"}
    </Badge>
  );
}

const humanizeKey = (key: string): string =>
  key
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function PanelScoringWizard({
  target,
  service,
  groups,
  scoreMap,
  autoPicks = {},
  autoFails = {},
  onSubmit,
  readOnly = false,
  submitting = false,
}: {
  target: EvidenceTarget;
  service: string;
  groups: CriterionGroup[];
  scoreMap: Map<string, PanelAppraisalScore>;
  autoPicks?: Record<string, AutoPick>;
  autoFails?: Record<string, AutoFailReason>;
  onSubmit: (payloads: PanelScoreCreatePayload[]) => Promise<void>;
  readOnly?: boolean;
  submitting?: boolean;
}) {
  const isNational = target.kind === "national_proposal";

  const evByName = useMemo(
    () => new Map(target.criteria.map((ec) => [norm(ec.criterion), ec] as const)),
    [target]
  );

  // Seed drafts: existing submitted scores + auto-picks win; then, for anything
  // still empty, restore a locally-saved draft from a prior interrupted session.
  // Locked/read-only scopes never restore — those are already committed.
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() => {
    const init: Record<string, Draft> = {};
    for (const g of groups) {
      const existing = scoreForGroup(scoreMap, target.id, g, service);
      if (existing) {
        init[g.key] = {
          optionId: existing.criteria,
          value: scoreValueOf(existing),
          comment: existing.comment ?? "",
        };
        continue;
      }
      const auto = autoPicks[g.key];
      if (auto?.optionId) {
        init[g.key] = { optionId: auto.optionId, value: auto.score, comment: "" };
      }
    }
    if (!readOnly) {
      const stored = loadStoredDrafts(target.id, service);
      if (stored) {
        const validKeys = new Set(groups.map((g) => g.key));
        for (const [k, d] of Object.entries(stored)) {
          if (validKeys.has(k) && !init[k] && d && typeof d === "object") init[k] = d;
        }
      }
    }
    return init;
  });

  const [restored, setRestored] = useState(false);
  const skipFirstSave = useRef(true);

  // Note the restore once, so we can surface a small "draft recovered" hint.
  useEffect(() => {
    if (readOnly) return;
    const stored = loadStoredDrafts(target.id, service);
    if (stored && Object.keys(stored).length) setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave on every draft change (best-effort). Skips the very first run so
  // the seed pass above doesn't immediately rewrite storage.
  useEffect(() => {
    if (readOnly) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    saveStoredDrafts(target.id, service, drafts);
  }, [drafts, target.id, service, readOnly]);

  const [step, setStep] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const group = groups[step];
  const currentDraft = group ? drafts[group.key] : undefined;

  const autoPick = group ? autoPicks[group.key] : undefined;
  const autoFailReason = group ? autoFails[group.key] : undefined;
  // Locked only when auto SUCCEEDED. A failed auto-score falls back to manual.
  const groupAutoLocked = !!autoPick && !readOnly;

  const goPrev = () => setStep((s) => Math.max(0, s - 1));
  const goNext = () => setStep((s) => Math.min(groups.length - 1, s + 1));

  const selectOption = (opt: CriterionOption) => {
    if (!group || readOnly || groupAutoLocked) return;
    const wasDrafted = !!drafts[group.key];
    setDrafts((prev) => ({
      ...prev,
      [group.key]: { optionId: opt.id, value: opt.score ?? 0, comment: prev[group.key]?.comment ?? "" },
    }));
    if (!wasDrafted && step < groups.length - 1) setStep(step + 1);
  };

  const setComment = (comment: string) => {
    if (!group) return;
    setDrafts((prev) => ({
      ...prev,
      [group.key]: { optionId: prev[group.key]?.optionId ?? "", value: prev[group.key]?.value ?? 0, comment },
    }));
  };

  const discardDrafts = () => {
    clearStoredDrafts(target.id, service);
    // keep only committed/auto-locked entries; drop restored manual drafts
    setDrafts(() => {
      const kept: Record<string, Draft> = {};
      for (const g of groups) {
        const existing = scoreForGroup(scoreMap, target.id, g, service);
        if (existing) {
          kept[g.key] = {
            optionId: existing.criteria,
            value: scoreValueOf(existing),
            comment: existing.comment ?? "",
          };
          continue;
        }
        const auto = autoPicks[g.key];
        if (auto?.optionId) kept[g.key] = { optionId: auto.optionId, value: auto.score, comment: "" };
      }
      return kept;
    });
    setRestored(false);
  };

  const drafted = (g: CriterionGroup) => !!drafts[g.key];
  const draftedCount = groups.filter(drafted).length;
  const allScored = draftedCount === groups.length;

  const handleSubmitClick = () => {
    setSubmitAttempted(true);
    if (allScored) setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    const payloads: PanelScoreCreatePayload[] = groups.map((g) => {
      const d = drafts[g.key];
      const auto = autoPicks[g.key];
      return {
        ...(isNational ? { national_proposal: target.id } : { intervention: target.id }),
        criteria: d.optionId,
        ...(service ? { service } : {}), // service name sent only when scoped to one
        score: {
          value: d.value,
          criteria_label: g.name,
          option_id: d.optionId,
          ...(auto ? { auto: true, auto_value: auto.value } : {}),
        },
        ...(d.comment ? { comment: d.comment } : {}),
      };
    });
    await onSubmit(payloads);
    // scores are now committed server-side — the local draft is no longer needed
    clearStoredDrafts(target.id, service);
    setRestored(false);
  };

  if (!group) {
    return (
      <Card className="border-slate-200">
        <CardContent className="py-16 text-center text-sm text-slate-400">
          No active appraisal criteria configured.
        </CardContent>
      </Card>
    );
  }

  const ec = evByName.get(group.key);
  const ev = ec ? evidenceForService(ec, service) : {};
  const evKeys = Object.keys(ev);
  const missing = submitAttempted && !readOnly && !drafted(group);

  return (
    <>
      {restored && !readOnly && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-md border border-[#27aae1]/20 bg-[#27aae1]/5 px-4 py-2.5 text-sm text-slate-600">
          <span className="flex items-center gap-1.5">
            <RotateCcw className="h-4 w-4 shrink-0 text-[#27aae1]" />
            Recovered an unsaved draft for {service ? `service “${service}”` : "the general target"}.
          </span>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500" onClick={discardDrafts}>
            Discard draft
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-2 lg:grid-cols-[48fr_52fr]">
        {/* Evidence — full data, HTML rendered */}
        <Card className="border-slate-200 shadow-sm lg:sticky lg:top-4">
          <CardHeader className="space-y-1 px-5 pb-2 pt-5">
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-[#27aae1]" />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#27aae1]">Evidence</p>
              {service ? (
                <Badge variant="outline" className="border-[#27aae1]/30 bg-[#27aae1]/10 text-[10px] text-[#27aae1]">
                  {service}
                </Badge>
              ) : (
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-[10px] text-slate-500">
                  General
                </Badge>
              )}
            </div>
            <h4 className="text-sm font-semibold text-slate-800">{group.name}</h4>
          </CardHeader>
          <CardContent className="space-y-3 pb-5">
            {evKeys.length === 0 || !ec ? (
              <p className="text-xs italic text-slate-400">No evidence recorded for this criterion.</p>
            ) : (
              <div className="divide-y divide-slate-100 rounded-md border border-slate-200">
                {evKeys.map((f) => (
                  <div key={f} className="grid grid-cols-1 gap-1 px-3 py-2.5 text-xs sm:grid-cols-[180px_1fr]">
                    <span className="break-words font-medium text-slate-500">{humanizeKey(f)}</span>
                    <div className="min-w-0">
                      <EvidenceValue value={ev[f]} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scoring — criterion description + options */}
        <Card className="border-slate-200 shadow-sm lg:sticky lg:top-4">
          <CardHeader className="space-y-3 px-5 pb-3 pt-5">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-slate-200 text-xs text-slate-500">
                {step + 1} / {groups.length}
              </Badge>
              <span className="text-xs font-semibold text-slate-600">
                {draftedCount}/{groups.length} scored
              </span>
            </div>
            <h4 className="text-base font-semibold leading-snug text-slate-800">{group.name}</h4>
            {group.description && <HtmlContent html={group.description} />}
            {groupAutoLocked && (
              <div className="flex items-center gap-1.5 rounded-md border border-[#27aae1]/20 bg-[#27aae1]/5 px-3 py-2">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#27aae1]" />
                <span className="text-xs text-slate-600">
                  Auto-scored from evidence
                  {autoPick?.value != null && !Array.isArray(autoPick.value) && (
                    <> (value <strong className="tabular-nums">{autoPick.value}</strong>)</>
                  )}{" "}
                  → <strong>{autoPick?.score} pt{autoPick?.score === 1 ? "" : "s"}</strong>. This
                  criterion can&apos;t be changed manually.
                </span>
              </div>
            )}
            {autoFailReason && !readOnly && (
              <div className="flex items-start gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                <ZapOff className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                <span className="text-xs text-amber-700">
                  <strong>Auto-score couldn&apos;t be applied.</strong> {failMessage(autoFailReason)}{" "}
                  Please score this criterion manually.
                </span>
              </div>
            )}
            {missing && (
              <div className="flex items-center gap-1.5 text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs font-medium">Pick an option before submitting.</span>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-4 px-5 pb-5">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#27aae1]">
                {readOnly
                  ? "Options — your selection highlighted"
                  : groupAutoLocked
                  ? "Auto-selected option"
                  : "Select one option"}
              </p>
              {group.options.map((opt) => {
                const selected = currentDraft?.optionId === opt.id;
                const frozen = readOnly || groupAutoLocked;
                const dimmed = frozen && !selected;
                return (
                  <div
                    key={opt.id}
                    role="button"
                    aria-disabled={frozen}
                    aria-pressed={selected}
                    tabIndex={frozen ? -1 : 0}
                    onClick={() => selectOption(opt)}
                    onKeyDown={(e) => {
                      if (!frozen && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        selectOption(opt);
                      }
                    }}
                    className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
                      selected
                        ? "border-[#27aae1] bg-[#27aae1]/5 ring-1 ring-[#27aae1]/40"
                        : missing
                        ? "border-amber-200 hover:border-amber-300 hover:bg-amber-50"
                        : frozen
                        ? "border-slate-200"
                        : "border-slate-200 hover:border-[#27aae1] hover:bg-slate-50"
                    } ${frozen ? "cursor-default" : "cursor-pointer"} ${dimmed ? "opacity-55" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-1 items-start gap-2.5">
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                            selected ? "border-[#27aae1]" : "border-slate-300"
                          }`}
                        >
                          {selected && <span className="h-2 w-2 rounded-full bg-[#27aae1]" />}
                        </span>
                        <HtmlContent html={opt.scoring_approach} className="text-sm leading-relaxed text-slate-700" />
                      </div>
                      <ScoreBadge score={opt.score} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#27aae1]">
                Notes{" "}
                <span className="font-normal normal-case tracking-normal text-slate-400">(optional)</span>
              </p>
              {readOnly ? (
                currentDraft?.comment ? (
                  <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm italic text-slate-600">
                    “{currentDraft.comment}”
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">No notes added.</p>
                )
              ) : (
                <Textarea
                  value={currentDraft?.comment ?? ""}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Justification for this score…"
                  rows={2}
                  className="resize-none text-sm"
                />
              )}
            </div>

            <Separator className="bg-slate-100" />

            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" size="sm" onClick={goPrev} disabled={step === 0} className="gap-1">
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </Button>
              <div className="flex items-center gap-2">
                {!readOnly && (
                  <Button
                    size="sm"
                    className={`gap-1.5 ${allScored ? "text-white" : "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
                    style={allScored ? { backgroundColor: "#27aae1" } : undefined}
                    variant={allScored ? "default" : "outline"}
                    onClick={handleSubmitClick}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting…</>
                    ) : (
                      <>
                        {allScored ? <Send className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                        Submit
                        {!allScored && <span className="font-normal text-amber-600"> ({draftedCount}/{groups.length})</span>}
                      </>
                    )}
                  </Button>
                )}
                {step < groups.length - 1 && (
                  <Button variant="outline" size="sm" onClick={goNext} className="gap-1">
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Submit appraisal scores?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-sm">
              <span className="block">
                Submitting all <strong>{groups.length}</strong> criteria for{" "}
                {service ? `service “${service}”` : "the general target"}.
              </span>
              <span className="block text-xs text-slate-400">
                Once submitted, this scope is locked and cannot be rescored.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review again</AlertDialogCancel>
            <AlertDialogAction
              className="text-white"
              style={{ backgroundColor: "#27aae1" }}
              onClick={handleConfirm}
              disabled={submitting}
            >
              Yes, submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}