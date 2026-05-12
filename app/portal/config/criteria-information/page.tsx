"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { CriteriaInformation } from "@/types/new/criteria-info";
import { deleteCriteriaInfo, getAllCriteriaInfo } from "@/app/api/new/criteria-info";
import { CriteriaTable } from "./cc/table";
import { CriteriaForm } from "./cc/form";
import { clearDraft } from "./cc/form";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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


interface ModalProps {
  children: React.ReactNode;
  onBackdropClick: () => void;
}

function Modal({ children, onBackdropClick }: ModalProps) {
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


export default function CriteriaInformationPage() {
  const [data, setData] = useState<CriteriaInformation[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CriteriaInformation | null>(null);
  const [guardOpen, setGuardOpen] = useState(false);
  const pendingClose = useRef<(() => void) | null>(null);
  const formHasChanges = useRef<() => boolean>(() => false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getAllCriteriaInfo();
    setData(res);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const attemptClose = useCallback((then?: () => void) => {
    const doClose = () => {
      setModalOpen(false);
      setEditing(null);
      then?.();
    };

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

  const openEdit = (row: CriteriaInformation) => {
    formHasChanges.current = () => false;
    setEditing(row);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    setModalOpen(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (row: CriteriaInformation) => {
    await deleteCriteriaInfo(row.id);
    await load();
  };

  return (
    <div className="min-h-screen bg-linear-to-b py-12 from-slate-50 to-white">
      <ToastContainer  position="top-right" autoClose={4000} hideProgressBar={false} closeOnClick pauseOnHover />
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-serif">Intervention Criteria Information</h1>
            <p className="text-sm text-slate-500 mt-1">From the word docs, to be transferred here..</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#27aae1] hover:bg-[#27aae1] text-white text-sm font-semibold rounded-lg transition-colors duration-200"
          >
            <span className="text-lg">+</span> Add New
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-1 py-2">
        {/* Stats Card */}
        <div className="mb-8">
          <div className="bg-white border border-slate-200 rounded-lg p-6 w-fit">
            <div className="text-3xl font-bold text-slate-900">{loading ? "—" : data.length}</div>
            <div className="text-xs text-slate-500 mt-2 uppercase tracking-wider">Total Records</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <CriteriaTable data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete} />
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <Modal onBackdropClick={() => attemptClose()}>
          <div className="bg-white rounded-lg shadow-lg">
            <CriteriaForm
              initial={editing}
              onSuccess={handleSuccess}
              
              onCancel={() => attemptClose()}
              hasChangesRef={formHasChanges}
            />
          </div>
        </Modal>
      )}

      {/* Unsaved-changes AlertDialog */}
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
            {/* "Continue editing" — keep the modal open */}
            <AlertDialogCancel onClick={handleGuardContinue}>
              Continue editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGuardDiscard}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}