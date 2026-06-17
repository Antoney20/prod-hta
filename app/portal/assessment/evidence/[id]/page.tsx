"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/app/portal/national-programs/cc/delete";
import {
  ArrowLeft, ArrowRight, FileStack, Layers, FileText, ExternalLink,
  RefreshCw, Pencil, Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

import { AssessmentEvidence, AssessmentEvidenceDocument } from "@/types/new/assessment";
import { getAssessmentEvidenceGroup, deleteAssessmentEvidence } from "@/app/api/new/assessment";
import RichText, { htmlToText } from "@/components/shared/text";
import { useAuth } from "@/app/api/auth";

const LIST_PATH = "/portal/assessment/evidence";
const UPLOAD_PATH = `${LIST_PATH}/upload`;
const NONE_KEY = "__unlinked__";

function fixUrl(url: string) {
  if (!url) return "#";
  return url.includes("localhost")
    ? url.replace(/http:\/\/localhost\/media/, "https://bptap.health.go.ke/media")
    : url;
}

const fmt = (s?: string) =>
  s ? new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";


type RefGroup = {
  key: string;
  kind: "intervention" | "program" | "none";
  refNumber: string;
  title: string;
  subtitle?: string;
  proposalId?: string;
  items: AssessmentEvidence[];
};

function buildGroups(list: AssessmentEvidence[]): RefGroup[] {
  const map = new Map<string, RefGroup>();
  const push = (g: Omit<RefGroup, "items">, ev: AssessmentEvidence) => {
    const existing = map.get(g.key);
    if (existing) existing.items.push(ev);
    else map.set(g.key, { ...g, items: [ev] });
  };

  for (const ev of list) {
    const targets = ev.interventions.length + ev.program_proposals.length;

    ev.interventions.forEach((i) =>
      push(
        {
          key: `i:${i.reference_number}`,
          kind: "intervention",
          refNumber: i.reference_number,
          title: i.intervention_name ?? "—",
          subtitle: i.intervention_type ?? undefined,
          proposalId: String(i.id),
        },
        ev,
      ),
    );
    ev.program_proposals.forEach((p) =>
      push(
        {
          key: `p:${p.reference_number}`,
          kind: "program",
          refNumber: p.reference_number,
          title: p.title,
          proposalId: String(p.id),
        },
        ev,
      ),
    );

    if (targets === 0) {
      push({ key: NONE_KEY, kind: "none", refNumber: "", title: "Unlinked evidence" }, ev);
    }
  }
  return [...map.values()];
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{children}</h2>;
}

function EvidenceCard({
  ev, isCurrent, isAdmin, onEdit, onDelete,
}: {
  ev: AssessmentEvidence;
  isCurrent: boolean;
  isAdmin: boolean;
  onEdit: (id: string) => void;
  onDelete: (ev: AssessmentEvidence) => void;
}) {
  const summaryText = htmlToText(ev.summary || "");
  const empty = ev.documents.length === 0 && summaryText.length === 0;

  return (
    <div className={`border bg-white ${isCurrent ? "border-[#27aae1] ring-1 ring-[#27aae1]/30" : "border-slate-200"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Created {fmt(ev.created_at)}</span>
          {isCurrent && (
            <span className="bg-[#27aae1]/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#27aae1]">
              Opened
            </span>
          )}
        </div>
        {isAdmin && (
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => onEdit(ev.id)}>
              <Pencil className="mr-1.5 h-3 w-3" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-red-600 hover:text-red-700" onClick={() => onDelete(ev)}>
              <Trash2 className="mr-1.5 h-3 w-3" /> Delete
            </Button>
          </div>
        )}
      </div>

      {ev.documents.length > 0 && (
        <div className="divide-y divide-slate-100">
          {ev.documents.map((d: AssessmentEvidenceDocument) => (
            <button
              key={d.id}
              onClick={() => window.open(fixUrl(d.file), "_blank", "noopener,noreferrer")}
              className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 group-hover:border-[#27aae1]">
                <FileText className="h-3.5 w-3.5 text-slate-500 group-hover:text-[#27aae1]" />
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

      {summaryText.length > 0 && (
        <div className="border-t border-slate-100 p-4">
          <RichText html={ev.summary} className="text-sm leading-relaxed text-slate-800" />
        </div>
      )}

      {empty && <p className="px-4 py-3 text-xs text-slate-400">No documents or summary.</p>}
    </div>
  );
}

export default function EvidenceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.is_staff;

  const [items, setItems] = useState<AssessmentEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<AssessmentEvidence | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setItems(await getAssessmentEvidenceGroup(id));
    setLoading(false);
  }, [id]);

  useEffect(() => { if (id) load(); }, [id, load]);

  const groups = useMemo(() => buildGroups(items), [items]);
  const refCount = groups.filter((g) => g.kind !== "none").length;

  const handleDelete = async () => {
    if (!pendingDelete) return;
    const { ok, error } = await deleteAssessmentEvidence(pendingDelete.id);
    if (ok) {
      toast.success("Evidence deleted.");
      if (pendingDelete.id === id) {
        router.push(LIST_PATH);            // deleted the one we opened → leave
      } else {
        setPendingDelete(null);
        load();                            // deleted a sibling → refresh the group
      }
    } else {
      toast.error(error ?? "Failed to delete.");
      setPendingDelete(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-sm text-slate-400">Evidence not found.</p>
        <Button variant="outline" onClick={() => router.push(LIST_PATH)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to evidence
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* header — no edit/delete here; those live per record */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => router.push(LIST_PATH)} className="flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-800" aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="bg-[#27aae1]/10 p-2 rounded-lg"><FileStack className="h-5 w-5 text-[#27aae1]" /></div>
        <div>
          <h1 className="text-xl font-bold">Evidence</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} record{items.length === 1 ? "" : "s"} · {refCount} reference{refCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {groups.map((g) => (
        <section key={g.key} className="space-y-3">
          {g.kind === "none" ? (
            <div className="border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3">
              <SectionLabel>Unlinked evidence</SectionLabel>
            </div>
          ) : (
            <div className="flex items-center gap-3 border border-slate-200 bg-white px-4 py-3">
              {g.kind === "intervention"
                ? <FileStack className="h-4 w-4 shrink-0 text-[#27aae1]" />
                : <Layers className="h-4 w-4 shrink-0 text-[#27aae1]" />}
              <span className="font-mono text-xs font-semibold text-[#27aae1] whitespace-nowrap">{g.refNumber}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-700">{g.title}</p>
                {g.subtitle && <p className="truncate text-xs text-slate-400">{g.subtitle}</p>}
              </div>
              <span className="shrink-0 text-[11px] text-slate-400">{g.items.length} record{g.items.length === 1 ? "" : "s"}</span>
              {g.proposalId && (
                <Link href={`/portal/interventions/${g.proposalId}`} className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#27aae1] hover:underline">
                  See proposal <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          )}

          <div className="space-y-3 sm:pl-3">
            {g.items.map((ev) => (
              <EvidenceCard
                key={`${g.key}-${ev.id}`}
                ev={ev}
                isCurrent={ev.id === id}
                isAdmin={!!isAdmin}
                onEdit={(eid) => router.push(`${UPLOAD_PATH}?id=${eid}`)}
                onDelete={setPendingDelete}
              />
            ))}
          </div>
        </section>
      ))}

      <DeleteDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Delete this evidence?"
        description={`This evidence and its ${pendingDelete?.documents.length ?? 0} document(s) will be permanently removed. This cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}