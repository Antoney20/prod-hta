"use client";

import { useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  onConfirm: () => void;
  /** word the user must type to enable the button */
  confirmWord?: string;
}

export function DeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmWord = "delete",
}: DeleteDialogProps) {
  const [text, setText] = useState("");
  const ready = text.trim().toLowerCase() === confirmWord.toLowerCase();

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v) setText("");
  };

  return (
    <AlertDialog open={open} onOpenChange={close}>
      <AlertDialogContent className="backdrop-blur-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            {description && <span className="block">{description}</span>}
            <span className="block text-sm font-medium text-foreground">
              Type <span className="font-mono font-bold text-destructive">{confirmWord}</span> to confirm
            </span>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={confirmWord}
              className="font-mono"
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "Enter" && ready) {
                  onConfirm();
                  setText("");
                }
              }}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setText("")}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            disabled={!ready}
            onClick={() => {
              onConfirm();
              setText("");
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}