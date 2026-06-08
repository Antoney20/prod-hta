"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, RefreshCw, FileStack } from "lucide-react";
import { toast } from "react-toastify";

import { AssessmentCriteria, AssessmentEvidence } from "@/types/new/assessment";
import { PublicProposal } from "@/types/new/public";
import { EvidenceTable } from "../cc/table";
import { EvidenceForm, FormValues } from "../cc/form";
import { createAssessmentEvidence, deleteAssessmentEvidence, getAssessmentCriteria, getAssessmentEvidence, updateAssessmentEvidence } from "@/app/api/new/assessment";
import { getSubmittedProposals } from "@/app/api/dashboard/submitted-proposals";
import { SubmittedProposal } from "@/types/dashboard/submittedProposals";




export default function AssessmentEvidencePage() {
  const [evidence, setEvidence]   = useState<AssessmentEvidence[]>([]);
  const [criteria, setCriteria]   = useState<AssessmentCriteria[]>([]);
  const [proposals, setProposals] = useState<SubmittedProposal[]>([]);
  const [loading, setLoading]     = useState(true);
  const [formOpen, setFormOpen]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected]   = useState<AssessmentEvidence | undefined>();
  const [toDelete, setToDelete]   = useState<AssessmentEvidence | null>(null);

const load = useCallback(async () => {
setLoading(true);
const [ev, cr, pr] = await Promise.all([
    getAssessmentEvidence(), getAssessmentCriteria(), getSubmittedProposals(),
]);
setEvidence(ev); setCriteria(cr); setProposals(pr.results);
setLoading(false);
}, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setSelected(undefined); setFormOpen(true); };
  const openEdit   = (row: AssessmentEvidence) => { setSelected(row); setFormOpen(true); };
  const closeForm  = () => { setFormOpen(false); setSelected(undefined); };

  const handleSubmit = async (values: FormValues): Promise<boolean> => {
    setSubmitting(true);
    const { data, error } = selected?.id
      ? await updateAssessmentEvidence(selected.id, values)
      : await createAssessmentEvidence(values);
    setSubmitting(false);

    if (error) { toast.error(error); return false; }
    if (data) {
      toast.success(selected?.id ? "Evidence updated." : "Evidence saved.");
      closeForm();
      await load();
      return true;
    }
    return false;
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const { ok, error } = await deleteAssessmentEvidence(toDelete.id);
    if (ok) {
      toast.success("Evidence deleted.");
      setEvidence((prev) => prev.filter((e) => e.id !== toDelete.id));
    } else toast.error(error ?? "Failed to delete.");
    setToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-teal-100 p-2 rounded-lg"><FileStack className="h-5 w-5 text-teal-600" /></div>
          <div>
            <h1 className="text-xl font-bold">Assessment Evidence</h1>
            <p className="text-sm text-muted-foreground">
              Evidence captured against the assessment criteria, linked to interventions
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Evidence</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            All evidence
            {!loading && <span className="ml-2 text-sm font-normal text-muted-foreground">({evidence.length})</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <EvidenceTable data={evidence} onEdit={openEdit} onDelete={setToDelete} />
          )}
        </CardContent>
      </Card>

      <EvidenceForm
        open={formOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        criteria={criteria}
        proposals={proposals}
        defaultValues={selected}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this evidence?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{toDelete?.title || toDelete?.criteria_name}</strong> and its attachments
              will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}