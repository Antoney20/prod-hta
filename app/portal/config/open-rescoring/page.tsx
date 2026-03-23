"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LockOpen,
  Lock,
  RefreshCw,
  MoreHorizontal,
  ShieldCheck,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { InterventionProposal } from "@/types/new/client";
import { getInterventionProposals, openRescoreWindow, closeRescoreWindow } from "@/app/api/new/client";
import { Column, DataTable } from "../cc/table";

type RescoreAction = "open" | "close";

interface PendingAction {
  intervention: InterventionProposal;
  action: RescoreAction;
}

export default function RescoreManagementPage() {
  const [interventions, setInterventions] = useState<InterventionProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getInterventionProposals();
    setInterventions(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCount = interventions.filter((i) => i.rescore_open).length;

  const confirmAction = (intervention: InterventionProposal, action: RescoreAction) => {
    setPending({ intervention, action });
  };

  const handleConfirm = async () => {
    if (!pending) return;
    setSubmitting(true);
    const { intervention, action } = pending;

    const result =
      action === "open"
        ? await openRescoreWindow(intervention.id)
        : await closeRescoreWindow(intervention.id);

    if (result) {
      toast.success(
        action === "open"
          ? `Rescore window opened for "${intervention.intervention_name}".`
          : `Rescore window closed for "${intervention.intervention_name}".`
      );
      setInterventions((prev) =>
        prev.map((i) =>
          i.id === intervention.id ? { ...i, rescore_open: action === "open" } : i
        )
      );
    } else {
      toast.error("Action failed. Please try again.");
    }

    setPending(null);
    setSubmitting(false);
  };

  const columns: Column<InterventionProposal>[] = [
    {
      header: "Reference",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="font-mono text-xs font-medium text-muted-foreground">
            {row.reference_number ?? "—"}
          </span>
        </div>
      ),
    },
    {
      header: "Intervention",
      cell: (row) => (
        <span className="font-medium text-sm line-clamp-1 max-w-[220px]">
          {row.intervention_name ?? "Untitled"}
        </span>
      ),
    },
    {
      header: "Profession",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.profession ?? "—"}
        </span>
      ),
    },
    {
      header: "Rescore Status",
      cell: (row) =>
        row.rescore_open ? (
          <Badge
            variant="default"
            className="bg-emerald-100 text-emerald-700 border border-emerald-200 gap-1.5 font-medium"
          >
            <CheckCircle2 className="h-3 w-3" />
            Open
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-muted-foreground gap-1.5 font-medium"
          >
            <XCircle className="h-3 w-3" />
            Closed
          </Badge>
        ),
    },
    {
      header: "",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {row.rescore_open ? (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => confirmAction(row, "close")}
              >
                <Lock className="h-4 w-4 mr-2" />
                Close Rescore
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => confirmAction(row, "open")}>
                <LockOpen className="h-4 w-4 mr-2" />
                Open Rescore
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-lg">
            <ShieldCheck className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Rescore Management</h1>
            <p className="text-sm text-muted-foreground">
              Open or close rescoring windows per intervention
            </p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="border-0 bg-muted/40">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Interventions</p>
            <p className="text-2xl font-bold">{interventions.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-emerald-50">
          <CardContent className="p-4">
            <p className="text-xs text-emerald-600 mb-1">Rescore Open</p>
            <p className="text-2xl font-bold text-emerald-700">{openCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-muted/40">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Rescore Closed</p>
            <p className="text-2xl font-bold">{interventions.length - openCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Open rescore list */}
      {openCount > 0 && (
        <Card className="border border-emerald-200 bg-emerald-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Currently Open for Rescoring ({openCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {interventions
                .filter((i) => i.rescore_open)
                .map((i) => (
                  <Badge
                    key={i.id}
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 bg-white gap-1.5"
                  >
                    <span className="font-mono text-xs opacity-60">
                      {i.reference_number}
                    </span>
                    <span className="font-medium">{i.intervention_name ?? "Untitled"}</span>
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Interventions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable
              data={interventions}
              columns={columns}
              searchPlaceholder="Search by name or reference..."
              searchFn={(row, q) =>
                (row.intervention_name ?? "").toLowerCase().includes(q) ||
                (row.reference_number ?? "").toLowerCase().includes(q) ||
                (row.profession ?? "").toLowerCase().includes(q)
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Confirm dialog */}
      <AlertDialog open={!!pending} onOpenChange={(v) => !v && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.action === "open"
                ? "Open rescore window?"
                : "Close rescore window?"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  {pending?.action === "open"
                    ? "Reviewers will be able to edit their existing scores for this intervention. Each score can only be rescored once."
                    : "Reviewers will no longer be able to edit their scores for this intervention."}
                </p>
                <div className="rounded-md border bg-muted/50 p-3 text-sm space-y-1">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-24 shrink-0">Reference</span>
                    <span className="font-mono font-medium">
                      {pending?.intervention.reference_number ?? "—"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-24 shrink-0">Intervention</span>
                    <span className="font-medium">
                      {pending?.intervention.intervention_name ?? "Untitled"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-24 shrink-0">Profession</span>
                    <span>{pending?.intervention.profession ?? "—"}</span>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={submitting}
              className={
                pending?.action === "close"
                  ? "bg-destructive hover:bg-destructive/90"
                  : ""
              }
              onClick={handleConfirm}
            >
              {submitting ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : pending?.action === "open" ? (
                <LockOpen className="h-4 w-4 mr-2" />
              ) : (
                <Lock className="h-4 w-4 mr-2" />
              )}
              {pending?.action === "open" ? "Open Rescore" : "Close Rescore"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}