"use client";

import { useState, useEffect } from "react";
import type { SelectionTool } from "@/types/new/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2 } from "lucide-react";

export interface CriteriaGroup {
  criteria: string;
  description: string;
  options: SelectionTool[];
}

export function groupTools(tools: SelectionTool[]): CriteriaGroup[] {
  const map = new Map<string, CriteriaGroup>();
  for (const tool of tools) {
    if (!map.has(tool.criteria)) {
      map.set(tool.criteria, { criteria: tool.criteria, description: tool.description, options: [] });
    }
    map.get(tool.criteria)!.options.push(tool);
  }
  return Array.from(map.values());
}

export interface ScorePayload {
  criteria: string;          
  score: Record<string, unknown>;
  comment: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: ScorePayload) => Promise<void>;
  group: CriteriaGroup | null;
  isSubmitting: boolean;
}

export function ScoreDialog({ open, onClose, onSubmit, group, isSubmitting }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const [comment, setComment] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (open) { setSelectedId(""); setComment(""); }
  }, [open, group]);

  const selected = group?.options.find((o) => o.id === selectedId);

  const handleConfirm = async () => {
    if (!selectedId || !group || !selected) return;
    setConfirmOpen(false);
    await onSubmit({
      criteria: selectedId,
      score: {
        tool_id: selectedId,
        scoring_mechanism: selected.scoring_mechanism,
        score_value: selected.scores,
        criteria_label: group.criteria,
      },
      comment,
    });
  };

  if (!group) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-xl max-h-[82vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-800 leading-snug text-base">{group.criteria}</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm leading-relaxed">
              {group.description}
            </DialogDescription>
          </DialogHeader>

          <Separator />

          {/* Options */}
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-widest text-teal-600">
              Select one option
            </Label>
            {[...group.options]
              .sort((a, b) => Number(b.scores) - Number(a.scores))
              .map((opt) => {
                const isSelected = selectedId === opt.id;
                const val = Number(opt.scores);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedId(opt.id)}
                    className={`w-full text-left rounded-lg border px-4 py-3 transition-all ${
                      isSelected
                        ? "border-teal-500 bg-teal-50 ring-1 ring-teal-400"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                          isSelected ? "border-teal-500" : "border-slate-300"
                        }`}>
                          {isSelected && <div className="h-2 w-2 rounded-full bg-teal-500" />}
                        </div>
                        <span className="text-sm text-slate-700 leading-snug">{opt.scoring_mechanism}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 font-bold tabular-nums ${
                          val >= 3 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : val === 2 ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {val} pt{val !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </button>
                );
              })}
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-widest text-teal-600">
              Reviewer Notes <span className="text-slate-400 normal-case font-normal tracking-normal">(optional)</span>
            </Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add context or justification for this score..."
              rows={3}
              className="resize-none text-sm"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={!selectedId || isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isSubmitting
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                : <><CheckCircle2 className="h-4 w-4 mr-2" />Save Score</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit this score?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">You are about to submit the following score:</span>
              {selected && (
                <span className="block bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700">
                  <strong>{group?.criteria}</strong><br />
                  <span className="text-slate-500">{selected.scoring_mechanism}</span>
                  {" · "}
                  <Badge variant="outline" className="text-xs">{Number(selected.scores)} pts</Badge>
                </span>
              )}
              <span className="block text-slate-500 text-xs">This cannot be changed after submission.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleConfirm}
            >
              Yes, Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}