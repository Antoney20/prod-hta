"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppraisalCriteriaEvidence } from "@/types/new/appraisal-evidence";
import { EvidenceForm, clearDraft } from "./form";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
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
import { deleteAppraisalEvidence, getAppraisalEvidence } from "@/app/api/criteria/evidence";
import { Column, DataTable } from "@/app/portal/config/cc/table";

function Modal({ children, onBackdropClick }: { children: React.ReactNode; onBackdropClick: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center overflow-y-auto pt-12 pb-12"
      onClick={(e) => { if (e.target === e.currentTarget) onBackdropClick(); }}
    >
      <div className="w-full max-w-3xl mx-4" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default function AppraisalEvidencePage() {
  const router = useRouter();
  const [data, setData] = useState<AppraisalCriteriaEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AppraisalCriteriaEvidence | null>(null);

  const [guardOpen, setGuardOpen] = useState(false);
  const pendingClose = useRef<(() => void) | null>(null);
  const formHasChanges = useRef<() => boolean>(() => false);

  const [confirmRow, setConfirmRow] = useState<AppraisalCriteriaEvidence | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getAppraisalEvidence();
    setData(res);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const attemptClose = useCallback((then?: () => void) => {
    const doClose = () => { setModalOpen(false); setEditing(null); then?.(); };
    if (formHasChanges.current()) {
      pendingClose.current = doClose;
      setGuardOpen(true);
    } else {
      doClose();
    }
  }, []);

  const handleGuardDiscard = () => {
    setGuardOpen(false);
    clearDraft(editing?.id);
    pendingClose.current?.();
    pendingClose.current = null;
  };

  const handleGuardContinue = () => {
    setGuardOpen(false);
    pendingClose.current = null;
  };

  const openCreate = () => {
    formHasChanges.current = () => false;
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: AppraisalCriteriaEvidence) => {
    formHasChanges.current = () => false;
    setEditing(row);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    setModalOpen(false);
    setEditing(null);
    load();
  };

  const handleConfirmDelete = async () => {
    if (!confirmRow) return;
    setDeleting(true);
    await deleteAppraisalEvidence(confirmRow.id);
    setDeleting(false);
    setConfirmRow(null);
    load();
  };

  const columns: Column<AppraisalCriteriaEvidence>[] = [
    {
      header: "Ref No.",
      width: "400",
      cell: (row) => (
        <button
          onClick={() => router.push(`/portal/interventions/${row.intervention}`)}
          className="font-mono text-xs bg-slate-100 hover:bg-[#27aae1]/10 hover:text-[#27aae1] px-2 py-1 rounded transition-colors text-[#27aae1]   whitespace-nowrap"
        >
          {(row as any).reference_number ?? "—"}
        </button>
      ),
    },
    {
      header: "Intervention",
      cell: (row) => (
        <div className=" text-slate-900 truncate max-w-3xl">
          {row.intervention_name ?? "—"}
        </div>
      ),
    },
   
    {
      header: "Created By",
      cell: (row) => (
        <span className="text-gray-900 text-xs">{row.created_by_name ?? "—"}</span>
      ),
    },
    {
      header: "Created At",
      cell: (row) => (
        <span className="text-slate-500 text-xs whitespace-nowrap">
          {new Date(row.created_at).toLocaleDateString("en-KE", {
            year: "numeric", month: "short", day: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEdit(row)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-[#27aae1] hover:border-[#27aae1] hover:text-white transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => setConfirmRow(row)}
            className="px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-300 rounded hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen  ">
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} closeOnClick pauseOnHover />

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-serif">Appraisal Evidence</h1>
            <p className="text-sm text-slate-500 mt-1">Criteria-based appraisal evidence per intervention</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#27aae1] hover:bg-[#1e96cc] text-white text-sm font-semibold rounded-lg transition-colors duration-200"
          >
            <span className="text-lg">+</span> Add New
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto  py-6">
        <div className="mb-8">
          <div className="bg-white border border-slate-200 rounded-lg p-6 w-fit">
            <div className="text-3xl font-bold text-slate-900">{loading ? "—" : data.length}</div>
            <div className="text-xs text-slate-500 mt-2 uppercase tracking-wider">Total Records</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden p-4">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-[#27aae1] rounded-full animate-spin" />
              <span className="text-slate-500 text-sm">Loading…</span>
            </div>
          ) : (
            <DataTable
              data={data}
              columns={columns}
              searchPlaceholder="Search by intervention…"
              searchFn={(row, q) =>
                (row.intervention_name?.toLowerCase().includes(q) ?? false) ||
                ((row as any).intervention_reference_number?.toLowerCase().includes(q) ?? false)
              }
              dateFilterFn={(row, from, to) => {
                const d = new Date(row.created_at);
                if (from && d < new Date(from)) return false;
                if (to) {
                  const t = new Date(to);
                  t.setHours(23, 59, 59);
                  if (d > t) return false;
                }
                return true;
              }}
              sortFns={{
                latest: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                az: (a, b) => (a.intervention_name ?? "").localeCompare(b.intervention_name ?? ""),
              }}
            />
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <Modal onBackdropClick={() => attemptClose()}>
          <div className="bg-white rounded-lg shadow-lg">
            <EvidenceForm
              initial={editing}
              onSuccess={handleSuccess}
              onCancel={() => attemptClose()}
              hasChangesRef={formHasChanges}
            />
          </div>
        </Modal>
      )}

      {/* Unsaved-changes guard */}
      <AlertDialog open={guardOpen} onOpenChange={setGuardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Your progress has been saved as a draft and will be available
              the next time you open this form — but if you discard, the draft will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleGuardContinue}>Continue editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleGuardDiscard} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!confirmRow} onOpenChange={(open) => { if (!open) setConfirmRow(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Appraisal Evidence?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the evidence record for{" "}
              <strong>{confirmRow?.intervention_name ?? "this intervention"}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? "Deleting…" : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}