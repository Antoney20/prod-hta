"use client";

import { useEffect, useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, RefreshCw, MoreHorizontal, Pencil, Trash2, Gavel } from "lucide-react";
import { toast } from "react-toastify";
import { DecisionType, DecisionTypeWritePayload } from "@/types/new/topic-prioritization";
import {  createDecisionType, deleteDecisionType, getDecisionTypes, updateDecisionType } from "@/app/api/new/tp";
import { Column, DataTable } from "../../config/cc/table";
import { DecisionTypeForm } from "./form";


export default function DecisionTypesPage() {
  const [decisions, setDecisions] = useState<DecisionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<DecisionType | undefined>();
  const [toDelete, setToDelete] = useState<DecisionType | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setDecisions(await getDecisionTypes());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (d: DecisionType) => { setSelected(d); setFormOpen(true); };
  const openCreate = () => { setSelected(undefined); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setSelected(undefined); };

  const handleSubmit = async (values: Partial<DecisionType>) => {
    setSubmitting(true);
    const result = selected?.id
    ? await updateDecisionType(selected.id, values)
    : await createDecisionType(values as DecisionTypeWritePayload);
    if (result) {
      toast.success(selected?.id ? "Decision type updated." : "Decision type created.");
      closeForm();
      await load();
    } else {
      toast.error("Something went wrong.");
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const ok = await deleteDecisionType(toDelete.id);
    if (ok) {
      toast.success("Decision type deleted.");
      setDecisions((prev) => prev.filter((d) => d.id !== toDelete.id));
    } else {
      toast.error("Failed to delete.");
    }
    setToDelete(null);
  };

  const columns: Column<DecisionType>[] = [
    {
      header: "Name",
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      header: "Description",
      cell: (row) => (
        <span className="text-sm text-muted-foreground line-clamp-2 max-w-sm">
          {row.description || <em className="opacity-50">No description</em>}
        </span>
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
            <DropdownMenuItem onClick={() => openEdit(row)}>
              <Pencil className="h-4 w-4 mr-2" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => setToDelete(row)}>
              <Trash2 className="h-4 w-4 mr-2" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-lg">
            <Gavel className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Decision Types</h1>
            <p className="text-sm text-muted-foreground">
              Configure formal HTA decision outcomes
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />New Decision Type
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Decision Types</CardTitle>
          <CardDescription>{decisions.length} decision types configured</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable
              data={decisions}
              columns={columns}
              searchPlaceholder="Search decision types..."
              searchFn={(row, q) =>
                row.name.toLowerCase().includes(q) ||
                row.description.toLowerCase().includes(q)
              }
            />
          )}
        </CardContent>
      </Card>

      <DecisionTypeForm
        open={formOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        defaultValues={selected}
        isSubmitting={submitting}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete decision type?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{toDelete?.name}</strong> will be permanently removed. Any linked
              review status records referencing this decision will be affected.
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