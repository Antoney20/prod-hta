"use client";

import { useCallback, useEffect, useState } from "react";

import {
  bulkMoveToPanel,
  createTopicPriority, deleteTopicPriority, getTopicPriorities,
  undoMoveToPanel,
  updateTopicPriority,
} from "@/app/api/new/tp";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TopicPriority, TopicPriorityWritePayload } from "@/types/new/topic-prioritization";
import { ArrowUpCircle, ClipboardList, MoreHorizontal, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { Column, DataTable } from "../../config/cc/table";
import { ReviewStatusForm } from "./form";

const MAX_SELECTION = 20;

export default function ReviewStatusPage() {
  const [records, setRecords] = useState<TopicPriority[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<TopicPriority | undefined>();
  const [toDelete, setToDelete] = useState<TopicPriority | null>(null);

  // selection keyed by reference_number — guaranteed unique on every row
  const [selectedRefs, setSelectedRefs] = useState<Set<string>>(new Set());
  const [panelItems, setPanelItems] = useState<TopicPriority[]>([]);
  const [panelSubmitting, setPanelSubmitting] = useState(false);


  const [toUndoPanel, setToUndoPanel] = useState<TopicPriority | null>(null);
  const [undoPanelSubmitting, setUndoPanelSubmitting] = useState(false);
  const [undoPanelError, setUndoPanelError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setRecords(await getTopicPriorities());
    setSelectedRefs(new Set());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (r: TopicPriority) => { setSelected(r); setFormOpen(true); };
  const openCreate = () => { setSelected(undefined); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setSelected(undefined); };

  const toggleRow = (refNo: string, alreadyMoved: boolean) => {
    if (alreadyMoved) return;
    setSelectedRefs((prev) => {
      const next = new Set(prev);
      if (next.has(refNo)) {
        next.delete(refNo);
      } else {
        if (next.size >= MAX_SELECTION) {
          toast.warning(`You can select at most ${MAX_SELECTION} interventions at once.`);
          return prev;
        }
        next.add(refNo);
      }
      return next;
    });
  };

  const openPanelConfirm = () => {
    const list = records.filter((r) => selectedRefs.has(r.reference_number));
    if (list.length === 0) {
      toast.warning("No valid interventions selected.");
      return;
    }
    setPanelItems(list);
  };

  const closePanelConfirm = () => {
    if (!panelSubmitting) setPanelItems([]);
  };

  const handleBulkMoveToPanel = async () => {
    setPanelSubmitting(true);
    // send intervention_id for all — scored-only rows have it explicitly,
    // status update rows have it via the serializer
    const interventionIds = panelItems.map((r) => String(r.intervention_id));
    const result = await bulkMoveToPanel(interventionIds);
    setPanelSubmitting(false);
    setPanelItems([]);

    if (result) {
      toast.success(`${result.updated} intervention(s) moved to panel.`);
      setSelectedRefs(new Set());
      await load();
    } else {
      toast.error("Failed to move interventions to panel. Please try again.");
    }
  };

  const handleSubmit = async (values: TopicPriorityWritePayload) => {
    setSubmitting(true);
    const existingId = selected?.id ?? null;
    const result = existingId
      ? await updateTopicPriority(existingId, values)
      : await createTopicPriority(values);
    if (result) {
      toast.success(existingId ? "Status updated." : "Review status created.");
      closeForm();
      await load();
    } else {
      toast.error("Something went wrong.");
    }
    setSubmitting(false);
  };


  const handleUndoMoveToPanel = async () => {
    if (!toUndoPanel?.id) return;
    setUndoPanelSubmitting(true);
    setUndoPanelError(null);

    const result = await undoMoveToPanel(toUndoPanel.id);

    if (result.success) {
      toast.success(`"${result.data.intervention_name}" removed from panel.`);
      setToUndoPanel(null);
      await load();
    } else {
      setUndoPanelError(result.error);
    }

    setUndoPanelSubmitting(false);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const ok = await deleteTopicPriority(toDelete.id!);
    if (ok) {
      toast.success("Record deleted.");
      setRecords((prev) => prev.filter((r) => r.id !== toDelete.id));
    } else {
      toast.error("Failed to delete.");
    }
    setToDelete(null);
  };

  const columns: Column<TopicPriority>[] = [
    {
      header: "",
      width: "w-[48px] min-w-[48px]",
      cell: (row) => {
        // reference_number is always present on every row — safest key
        const refNo = row.reference_number;
        const moved = row.move_to_panel;
        const checked = moved || selectedRefs.has(refNo);

        return (
          <div className="flex justify-center">
            <Checkbox
              checked={checked}
              disabled={moved}
              onCheckedChange={() => toggleRow(refNo, moved)}
              aria-label={moved ? "Already moved to panel" : `Select ${row.intervention_name}`}
              className={moved ? "opacity-50 cursor-not-allowed" : ""}
            />
          </div>
        );
      },
    },
    {
      header: "Reference",
      width: "w-[160px] min-w-[140px]",
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
          {row.reference_number}
        </span>
      ),
    },
    {
      header: "Intervention",
      width: "min-w-[220px]",
      cell: (row) => (
        <span className="font-medium whitespace-nowrap">{row.intervention_name}</span>
      ),
    },
   {
      header: "Package",
      width: "w-[160px] min-w-[140px]",
      cell: (row) =>
        row.package ? (
          <span className="text-sm text-slate-600 whitespace-nowrap">{row.package}</span>
        ) : (
          <span className="text-xs text-muted-foreground italic">Unassigned</span>
        ),
    },
    {
      header: "Phase",
      width: "w-[140px] min-w-[120px]",
      cell: (row) =>
        row.phase ? (
          <Badge variant="outline" className="text-xs whitespace-nowrap">{row.phase}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground italic">—</span>
        ),
    },
    {
      header: "Scored",
      width: "w-[90px] min-w-[80px]",
      cell: (row) =>
        row.is_scored ? (
          <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Yes</Badge>
        ) : (
          <Badge variant="outline" className="text-xs text-muted-foreground">No</Badge>
        ),
    },
    {
      header: "Status",
      width: "w-[130px] min-w-[110px]",
      cell: (row) =>
        row.id === null ? (
          <Badge variant="secondary" className="text-xs">Pending</Badge>
        ) : row.decision ? (
          <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
            {row.decision.name}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            In Review
          </Badge>
        ),
    },
    {
      header: "Panel",
      width: "w-[90px] min-w-[80px]",
      cell: (row) =>
        row.move_to_panel ? (
          <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-200">
            ✓ Panel
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground italic">—</span>
        ),
    },
    {
      header: "Decision Date",
      width: "w-[140px] min-w-[130px]",
      cell: (row) =>
        row.decision_date ? (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {new Date(row.decision_date).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground italic">—</span>
        ),
    },
    {
      header: "Actions",
      width: "w-[60px] min-w-[60px]",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEdit(row)}>
                <Pencil className="h-4 w-4 mr-2" />
                {row.id === null ? "Assign Status" : "Edit"}
              </DropdownMenuItem>


              {row.move_to_panel && (
                <DropdownMenuItem
                  className="text-amber-600"
                  onClick={() => {
                    setUndoPanelError(null);
                    setToUndoPanel(row);
                  }}
                >
                  <ArrowUpCircle className="h-4 w-4 mr-2 rotate-180" />
                  Undo Move
                </DropdownMenuItem>
              )}

              {row.id !== null && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setToDelete(row)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>

          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Review Status</h1>
              <p className="text-sm text-muted-foreground">
                Track HTA review progress and communicate decisions to submitters
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {selectedRefs.size > 0 && (
              <Button
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
                onClick={openPanelConfirm}
              >
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Move to Panel ({selectedRefs.size})
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />New Status
            </Button>
          </div>
        </div>

        {selectedRefs.size > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-purple-50 border border-purple-200 rounded-md px-3 py-2">
            <ArrowUpCircle className="h-4 w-4 text-purple-500 shrink-0" />
            <span>
              <strong className="text-purple-700">{selectedRefs.size}</strong> intervention
              {selectedRefs.size > 1 ? "s" : ""} selected
              {selectedRefs.size === MAX_SELECTION && (
                <span className="ml-1 text-amber-600">(maximum reached)</span>
              )}
            </span>
            <button
              className="ml-auto text-xs text-muted-foreground underline hover:text-foreground"
              onClick={() => setSelectedRefs(new Set())}
            >
              Clear
            </button>
          </div>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Review Records</CardTitle>
            <CardDescription>{records.length} interventions tracked</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-16">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <DataTable
                data={records}
                columns={columns}
                searchPlaceholder="Search by intervention, reference, package or batch no..."
                searchFn={(row, q) =>
  (row.intervention_name ?? "").toLowerCase().includes(q) ||
  (row.reference_number ?? "").toLowerCase().includes(q) ||
  (row.package ?? "").toLowerCase().includes(q) ||
  (row.phase ?? "").toLowerCase().includes(q)
}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Bulk move-to-panel confirmation ── */}
      <AlertDialog
        open={panelItems.length > 0}
        onOpenChange={(v) => !v && closePanelConfirm()}
      >
        <AlertDialogContent className="overflow-hidden">
          <AlertDialogHeader>
            <AlertDialogTitle>Move to panel?</AlertDialogTitle>
            <AlertDialogDescription>
              The following <strong>{panelItems.length}</strong> intervention
              {panelItems.length > 1 ? "s" : ""} will be marked for panel review.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <ul className="max-h-48 overflow-y-auto divide-y divide-border rounded-md border text-sm">
            {panelItems.map((r) => (
              <li
                key={r.reference_number}
                className="flex items-center gap-3 px-3 py-2"
              >
                <span className="font-mono text-xs text-muted-foreground shrink-0">
                  {r.reference_number}
                </span>
                <span className="truncate text-xs text-foreground">
                  {r.intervention_name}
                </span>
              </li>
            ))}
          </ul>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={panelSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={panelSubmitting}
              onClick={(e) => {
                e.preventDefault();
                handleBulkMoveToPanel();
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {panelSubmitting ? "Moving…" : `Confirm (${panelItems.length})`}
            </AlertDialogAction>
          </AlertDialogFooter>

          {panelSubmitting && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-100 overflow-hidden rounded-b-lg">
              <div className="h-full bg-purple-500 animate-[progress_1.2s_ease-in-out_infinite]" />
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!toUndoPanel}
        onOpenChange={(v) => {
          if (!v && !undoPanelSubmitting) {
            setToUndoPanel(null);
            setUndoPanelError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from panel?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{toUndoPanel?.intervention_name}</strong> will be removed from
              panel review. This can be redone at any time as long as no scores have
              been submitted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* inline error — shown when backend returns 409 or any error */}
          {undoPanelError && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <span className="mt-0.5 shrink-0">⚠</span>
              <span>{undoPanelError}</span>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={undoPanelSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={undoPanelSubmitting}
              onClick={(e) => {
                e.preventDefault();
                handleUndoMoveToPanel();
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {undoPanelSubmitting ? "Removing…" : "Remove from Panel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* ── Delete confirmation ── */}
      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete review record?</AlertDialogTitle>
            <AlertDialogDescription>
              The status record for <strong>{toDelete?.intervention_name}</strong> will be
              permanently removed. The submitter will no longer receive status updates for
              this intervention.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReviewStatusForm
        open={formOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        defaultValues={selected}
        isSubmitting={submitting}
      />
    </>
  );
}