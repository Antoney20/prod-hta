"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, ArrowRight, FileStack, Layers, FileText, ExternalLink,
  RefreshCw, Pencil, Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

import { AssessmentEvidence, AssessmentEvidenceDocument } from "@/types/new/assessment";
import { getAssessmentEvidenceById, deleteAssessmentEvidence } from "@/app/api/new/assessment";
import RichText, { htmlToText } from "@/components/shared/text";
import { useAuth } from "@/app/api/auth";

const BLUE = "#27aae1";
const LIST_PATH = "/portal/assessment/evidence";
const UPLOAD_PATH = `${LIST_PATH}/upload`;

function fixUrl(url: string) {
  if (!url) return "#";
  return url.includes("localhost")
    ? url.replace(/http:\/\/localhost\/media/, "https://bptap.health.go.ke/media")
    : url;
}

const fmt = (s?: string) =>
  s ? new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{children}</h2>;
}

export default function EvidenceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.is_staff;

  const [evidence, setEvidence] = useState<AssessmentEvidence | null>(null);
  const [loading, setLoading]   = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setEvidence(await getAssessmentEvidenceById(id));
    setLoading(false);
  }, [id]);

  useEffect(() => { if (id) load(); }, [id, load]);

  const handleDelete = async () => {
    const { ok, error } = await deleteAssessmentEvidence(id);
    if (ok) { toast.success("Evidence deleted."); router.push(LIST_PATH); }
    else { toast.error(error ?? "Failed to delete."); setConfirmDelete(false); }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!evidence) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-sm text-slate-400">Evidence not found.</p>
        <Button variant="outline" onClick={() => router.push(LIST_PATH)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to evidence
        </Button>
      </div>
    );
  }

  const hasTargets = evidence.interventions.length > 0 || evidence.program_proposals.length > 0;
  const summaryText = htmlToText(evidence.summary || "");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(LIST_PATH)} className="flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-800" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="bg-[#27aae1]/10 p-2 rounded-lg"><FileStack className="h-5 w-5 text-[#27aae1]" /></div>
          <div>
            <h1 className="text-xl font-bold">Evidence</h1>
            <p className="text-sm text-muted-foreground">Created {fmt(evidence.created_at)}</p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`${UPLOAD_PATH}?id=${evidence.id}`)}>
              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        )}
      </div>

      {/* proposals */}
      {hasTargets && (
        <section className="border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3"><SectionLabel>Intervention proposal</SectionLabel></div>
          <div className="divide-y divide-slate-100">
            {evidence.interventions.map((i) => (
              <div key={`i-${i.id}`} className="flex items-center gap-3 px-4 py-3">
                <FileStack className="h-4 w-4 shrink-0 text-[#27aae1]" />
                <span className="font-mono text-xs font-semibold text-[#27aae1] whitespace-nowrap">{i.reference_number}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-700">{i.intervention_name ?? "—"}</p>
                  {i.intervention_type && <p className="truncate text-xs text-slate-400">{i.intervention_type}</p>}
                </div>
                <Link href={`/portal/interventions/${i.id}`} className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#27aae1] hover:underline">
                  See proposal <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
            {evidence.program_proposals.map((p) => (
              <div key={`p-${p.id}`} className="flex items-center gap-3 px-4 py-3">
                <Layers className="h-4 w-4 shrink-0 text-[#27aae1]" />
                <span className="font-mono text-xs font-semibold text-[#27aae1] whitespace-nowrap">{p.reference_number}</span>
                <p className="min-w-0 flex-1 truncate text-sm text-slate-700">{p.title}</p>
                <Link href={`/portal/interventions/${p.id}`} className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#27aae1] hover:underline">
                  See proposal <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Documents */}
      <section className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3"><SectionLabel>Documents ({evidence.documents.length})</SectionLabel></div>
        {evidence.documents.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-400">No documents attached.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {evidence.documents.map((d: AssessmentEvidenceDocument) => (
              <button
                key={d.id}
                onClick={() => window.open(fixUrl(d.file), "_blank", "noopener,noreferrer")}
                className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 group-hover:border-[#27aae1]">
                  <FileText className="h-4 w-4 text-slate-500 group-hover:text-[#27aae1]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700 group-hover:text-[#27aae1]">{d.name || "Document"}</p>
                  {d.description && <p className="truncate text-xs text-slate-400">{d.description}</p>}
                </div>
                <span className="flex shrink-0 items-center gap-1 text-xs text-slate-400 group-hover:text-[#27aae1]">
                  Open <ExternalLink className="h-3 w-3" />
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Summary */}
      {summaryText.length > 0 && (
        <section className="border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3"><SectionLabel>Summary</SectionLabel></div>
          <div className="p-4">
            <RichText html={evidence.summary} className="text-sm leading-relaxed text-slate-800" />
          </div>
        </section>
      )}

      {/* Delete confirm */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this evidence?</AlertDialogTitle>
            <AlertDialogDescription>
              This evidence and its {evidence.documents.length} document(s) will be permanently removed. This cannot be undone.
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