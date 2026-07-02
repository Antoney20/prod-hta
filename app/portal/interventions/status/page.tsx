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
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Plus, RefreshCw, MoreHorizontal, Pencil, Trash2, ClipboardList, Eye } from "lucide-react";
import { toast } from "react-toastify";
import { TopicPriority, TopicPriorityWritePayload } from "@/types/new/topic-prioritization";
import {
  createTopicPriority,
  deleteTopicPriority,
  getTopicPriorities,
  updateTopicPriority,
} from "@/app/api/new/tp";
import { Column, DataTable } from "../../config/cc/table";
import { ReviewStatusForm } from "../../tracker/review-status/form";
import Link from "next/link";


function formatDate(str: string | null): string {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return str; }
}

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function StatusBadge({ row }: { row: TopicPriority }) {
  if (row.decision) {
    return (
      <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200 whitespace-nowrap">
        {row.decision.name}
      </Badge>
    );
  }
  if (row.is_scored) {
    return (
      <Badge className="text-xs bg-green-100 text-green-700 border-green-200 whitespace-nowrap">
        Scored
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs text-slate-500 whitespace-nowrap">
      Pending
    </Badge>
  );
}


function DetailDrawer({
  row,
  open,
  onClose,
}: {
  row: TopicPriority | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!row) return null;

  const Field = ({
    label,
    children,
    internal,
  }: {
    label: string;
    children: React.ReactNode;
    internal?: boolean;
  }) => (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {internal && (
          <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 font-semibold uppercase tracking-wide rounded">
            Internal
          </span>
        )}
      </div>
      <div>{children}</div>
    </div>
  );

  const RichContent = ({ html }: { html: string }) => {
    const plain = stripHtml(html);
    if (!plain) return <p className="text-sm text-muted-foreground italic">—</p>;
    return (
      <div
        className="text-sm text-foreground leading-relaxed prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="max-w-lg lg:max-w-2xl overflow-y-auto px-6">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-base leading-snug pr-6">
            {row.intervention_name}
          </SheetTitle>
          <SheetDescription className="font-mono text-xs">
            {row.reference_number}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">

          {/* Status */}
          <Field label="Decision / Status">
            <StatusBadge row={row} />
          </Field>

          {/* Decision date */}
          <Field label="Decision Date">
            <p className="text-sm">{formatDate(row.decision_date)}</p>
          </Field>

          {/* System categories */}
          <Field label="System Categories">
            {row.system_categories.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">None assigned</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {row.system_categories.map((sc, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{sc}</Badge>
                ))}
              </div>
            )}
          </Field>

          <hr />

          {/* Feedback — visible to submitter */}
          <Field label="Feedback">
            <RichContent html={row.feedback ?? ""} />
          </Field>

          {/* Notes — internal */}
          {"notes" in row && (
            <Field label="Notes" internal>
              <RichContent html={(row as TopicPriority & { notes?: string }).notes ?? ""} />
            </Field>
          )}

          {/* Additional info — internal */}
          {"additional_info" in row && (
            <Field label="Additional Info" internal>
              <RichContent html={(row as TopicPriority & { additional_info?: string }).additional_info ?? ""} />
            </Field>
          )}

          <hr />

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Created">
              <p className="text-xs text-muted-foreground">{formatDate(row.created_at)}</p>
            </Field>
            <Field label="Last Updated">
              <p className="text-xs text-muted-foreground">{formatDate(row.updated_at)}</p>
            </Field>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}

function SummaryCard({
  label, value, color,
}: {
  label: string; value: number; color: "slate" | "blue" | "green" | "amber";
}) {
  const styles = {
    slate: "bg-slate-50 border-slate-200 text-slate-700",
    blue:  "bg-blue-50  border-blue-200  text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
  };
  return (
    <div className={`rounded-lg border px-4 py-3 ${styles[color]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

export default function PortalStatusPage() {
  const [records, setRecords] = useState<TopicPriority[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<TopicPriority | undefined>();
  const [toDelete, setToDelete] = useState<TopicPriority | null>(null);
  const [detailRow, setDetailRow] = useState<TopicPriority | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTopicPriorities();
      // Public: only show rows with a decision or that are scored
      setRecords(data.filter((r) => r.decision !== null || r.is_scored));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
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
        <span className="font-mono text-xs  bg-slate-100 hover:bg-[#27aae1]/10 hover:text-[#27aae1] px-2 py-1 rounded transition-colors text-[#27aae1] whitespace-nowrap">
            <Link href = {`/portal/interventions/${row.intervention_id}`}>
          {row.reference_number}
          </Link>
        </span>
      ),
    },
    {
      header: "Intervention",
      width: "min-w-[200px]",
      cell: (row) => (
        <span className="font-medium text-sm leading-snug">{row.intervention_name}</span>
      ),
    },
{
      header: "Package",
      width: "w-[150px] min-w-[130px]",
      cell: (row) =>
        row.package ? (
          <span className="text-xs text-slate-600">{row.package}</span>
        ) : (
          <span className="text-xs text-muted-foreground italic">Unassigned</span>
        ),
    },
    {
      header: "Phase",
      width: "w-[130px] min-w-[110px]",
      cell: (row) =>
        row.phase ? (
          <Badge variant="outline" className="text-xs whitespace-nowrap">{row.phase}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground italic">—</span>
        ),
    },
    {
      header: "Scored",
      width: "w-[85px] min-w-[75px]",
      cell: (row) =>
        row.is_scored ? (
          <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Yes</Badge>
        ) : (
          <Badge variant="outline" className="text-xs text-muted-foreground">No</Badge>
        ),
    },
    {
      header: "Decision / Status",
      width: "w-[150px] min-w-[130px]",
      cell: (row) => <StatusBadge row={row} />,
    },
    {
      header: "Decision Date",
      width: "w-[130px] min-w-[110px]",
      cell: (row) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(row.decision_date)}
        </span>
      ),
    },
    {
      header: "Feedback",
      width: "min-w-[180px] max-w-[240px]",
      cell: (row) => {
        const plain = stripHtml(row.feedback ?? "");
        return plain ? (
          <p className="text-xs text-muted-foreground line-clamp-2">{plain}</p>
        ) : (
          <span className="text-xs text-muted-foreground italic">—</span>
        );
      },
    },

  ];

  const total = records.length;
  const withDecision = records.filter((r) => r.decision !== null).length;
  const scored = records.filter((r) => r.is_scored).length;
  const pending = records.filter((r) => !r.is_scored && !r.decision).length;

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <ClipboardList className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Intervention Status</h1>
            <p className="text-sm text-muted-foreground">
              Full committee view — decisions, scores, internal notes and feedback
            </p>
          </div>
        </div>
        
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Total" value={total} color="slate" />
        <SummaryCard label="With Decision" value={withDecision} color="blue" />
        <SummaryCard label="Scored" value={scored} color="green" />
        <SummaryCard label="Pending" value={pending} color="amber" />
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Intervention Records</CardTitle>
          <CardDescription>{total} interventions — includes all scored and pending</CardDescription>
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
              searchPlaceholder="Search by intervention name, reference, package or phase..."
      searchFn={(row, q) =>
                row.intervention_name.toLowerCase().includes(q) ||
                row.reference_number.toLowerCase().includes(q) ||
                (row.package ?? "").toLowerCase().includes(q) ||
                (row.phase ?? "").toLowerCase().includes(q) ||
                stripHtml(row.feedback ?? "").toLowerCase().includes(q)
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Detail drawer */}
      <DetailDrawer
        row={detailRow}
        open={!!detailRow}
        onClose={() => setDetailRow(null)}
      />

      {/* Edit / create form */}
      <ReviewStatusForm
        open={formOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        defaultValues={selected}
        isSubmitting={submitting}
      />

      {/* Delete confirmation */}
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