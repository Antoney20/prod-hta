"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { deleteFeedbackEmailLog } from "@/app/api/feedback";
import type { FeedbackEmailLog } from "@/types/new/feedback";

interface DeleteDialogProps {
  open:      boolean;
  log:       FeedbackEmailLog | null;
  onClose:   () => void;
  onDeleted: () => void;
}

export function DeleteDialog({ open, log, onClose, onDeleted }: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handle = async () => {
    if (!log) return;
    setIsDeleting(true);
    try {
      const res = await deleteFeedbackEmailLog(log.id);
      if (res.success) {
        toast.success("Log deleted");
        onDeleted();
        onClose();
      } else {
        toast.error(res.message || "Failed to delete");
      }
    } catch { toast.error("Failed to delete log"); }
    finally { setIsDeleting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm bg-white rounded-xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-gray-900">Delete Email Log</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            Delete the log for{" "}
            <strong className="text-gray-700">{log?.intervention_name}</strong>?
            This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-5 flex gap-2 justify-end">
          <DialogClose asChild>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={handle}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}