"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, RefreshCw, MoreHorizontal, Pencil, Trash2, PenSquare } from "lucide-react";
import { toast } from "react-toastify";

import { CriteriaAppraisalTool } from "@/types/new/appraisal";
import {
  getAppraisalCriteria,
  createAppraisalCriteria,
  updateAppraisalCriteria,
  deleteAppraisalCriteria,
} from "@/app/api/criteria/appraisal";

import { AppraisalToolForm } from "./form";
import { Column, DataTable } from "@/app/portal/config/cc/table";




export default function AppraisalToolPage() {
  const [criteria, setCriteria]   = useState<CriteriaAppraisalTool[]>([]);
  const [loading, setLoading]     = useState(true);
  const [formOpen, setFormOpen]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected]   = useState<CriteriaAppraisalTool | undefined>();
  const [toDelete, setToDelete]   = useState<CriteriaAppraisalTool | null>(null);
 

  const load = useCallback(async () => {
    setLoading(true);
    setCriteria(await getAppraisalCriteria());
    setLoading(false);
  }, []);
 
  useEffect(() => { load(); }, [load]);
 
 
  const openEdit   = (item: CriteriaAppraisalTool) => { setSelected(item); setFormOpen(true); };
  const openCreate = () => { setSelected(undefined); setFormOpen(true); };
  const closeForm  = () => { setFormOpen(false); setSelected(undefined); };
 
  const handleSubmit = async (values: Partial<CriteriaAppraisalTool>) => {
    setSubmitting(true);
 
    const { data, error } = selected?.id
      ? await updateAppraisalCriteria(selected.id, values)
      : await createAppraisalCriteria(values);
 
    if (error) {
      toast.error(error);
    } else if (data) {
      toast.success(selected?.id ? "Criteria updated." : "Criteria created.");
      closeForm();
      await load();
    }
 
    setSubmitting(false);
  };
 
  const handleDelete = async () => {
    if (!toDelete) return;
    const { ok, error } = await deleteAppraisalCriteria(toDelete.id);
    if (ok) {
      toast.success("Criteria deleted.");
      setCriteria((prev) => prev.filter((c) => c.id !== toDelete.id));
    } else {
      toast.error(error ?? "Failed to delete.");
    }
    setToDelete(null);
  };
 
  const columns: Column<CriteriaAppraisalTool>[] = [
    {
      header: "Criteria",
      cell: (row) => <span className="font-medium">{row.criteria}</span>,
    },
 {
  header: "Description",
  cell: (row) => (
    <div
      className="text-sm text-muted-foreground line-clamp-2 max-w-xs prose prose-sm"
      dangerouslySetInnerHTML={{ __html: row.description || "—" }}
    />
  ),
},
{
  header: "Scoring Approach",
  cell: (row) => (
    <div
      className="text-sm text-muted-foreground line-clamp-2 max-w-xs prose prose-sm"
      dangerouslySetInnerHTML={{ __html: row.scoring_approach || "—" }}
    />
  ),
},
{
  header: "Score",
  cell: (row) => row.score != null         
    ? <Badge variant="secondary">{row.score}</Badge>
    : <span className="text-muted-foreground text-sm">—</span>,
},
    {
      header: "Score",
      cell: (row) => row.score != null
        ? <Badge variant="secondary">{row.score}</Badge>
        : <span className="text-muted-foreground text-sm">—</span>,
    },
    {
      header: "Created",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "actions",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 border bg-[#27aae1]/1 px-3 text-sm">
               more actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(row)}>
              <Pencil className="h-4 w-4 mr-2" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setToDelete(row)}
            >
              <Trash2 className="h-4 w-4 mr-2" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
 
  return (
    <div className="space-y-6">
 
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-teal-100 p-2 rounded-lg">
            <PenSquare className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Appraisal Tool</h1>
            <p className="text-sm text-muted-foreground">
              Scoring criteria used to appraise intervention proposals
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />Add Criteria
          </Button>
        </div>
      </div>
 
      {/* Table card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            All appraisal criteria
            {!loading && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({criteria.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable
              data={criteria}
              columns={columns}
              searchPlaceholder="Search criteria..."
              searchFn={(row, q) =>
                row.criteria.toLowerCase().includes(q) ||
                row.description.replace(/<[^>]*>/g, "").toLowerCase().includes(q)
              }
            />
          )}
        </CardContent>
      </Card>
 
   <AppraisalToolForm
        open={formOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        defaultValues={selected}
        isSubmitting={submitting}
        onReload={load}
        existing={criteria}
      />
 
      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete appraisal criteria?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{toDelete?.criteria}</strong> and all its score options will be
              permanently removed. This cannot be undone.
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