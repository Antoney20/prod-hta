"use client";

import { useEffect, useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, RefreshCw, MoreHorizontal, Pencil, Trash2, ClipboardList } from "lucide-react";
import { toast } from "react-toastify";
import { TopicPriority, TopicPriorityWritePayload } from "@/types/new/topic-prioritization";
import { createTopicPriority, deleteTopicPriority, getTopicPriorities, updateTopicPriority } from "@/app/api/new/tp";
import { Column, DataTable } from "../../config/cc/table";
import { ReviewStatusForm } from "./form";


export default function ReviewStatusPage() {
  const [records, setRecords] = useState<TopicPriority[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<TopicPriority | undefined>();
  const [toDelete, setToDelete] = useState<TopicPriority | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setRecords(await getTopicPriorities());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (r: TopicPriority) => { setSelected(r); setFormOpen(true); };
  const openCreate = () => { setSelected(undefined); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setSelected(undefined); };

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
      header: "System Categories",
      width: "min-w-[220px]",
      cell: (row) =>
        row.system_categories.length === 0 ? (
          <span className="text-xs text-muted-foreground italic">None assigned</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {row.system_categories.map((sc, i) => (
              <Badge key={i} variant="outline" className="text-xs whitespace-nowrap">
                {sc}
              </Badge>
            ))}
          </div>
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
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />New Status
          </Button>
        </div>
      </div>

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
            // DataTable already wraps in its own border/overflow — no extra wrapper needed
            <DataTable
              data={records}
              columns={columns}
              searchPlaceholder="Search by intervention or reference..."
              searchFn={(row, q) =>
                row.intervention_name.toLowerCase().includes(q) ||
                row.reference_number.toLowerCase().includes(q) ||
                row.system_categories.some((sc) => sc.toLowerCase().includes(q))
              }
            />
          )}
        </CardContent>
      </Card>

      <ReviewStatusForm
        open={formOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        defaultValues={selected}
        isSubmitting={submitting}
      />

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
    </div>
  );
}