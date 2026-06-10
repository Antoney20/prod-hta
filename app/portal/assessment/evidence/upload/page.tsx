"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, X, UploadCloud, FileText, Trash2, Loader2, Layers, FileStack, ArrowLeft,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichEditor, isBlankHtml } from "@/components/shared/editor";
import { createAssessmentEvidence } from "@/app/api/new/assessment";
import {
  getInterventions, getNationalPrograms, filterInterventions, filterPrograms,
} from "@/app/api/new/search";
import { EvidenceInterventionRef } from "@/types/new/assessment";
import { ProgramProposal } from "@/types/new/program";

const BLUE = "#27aae1";
type Filter = "all" | "intervention" | "program";

type Selected = {
  type: "intervention" | "program";
  id: number;
  ref: string;
  label: string;
};

type DocRow = { id: string; file: File; name: string };

const uid = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Math.random()));

export default function UploadEvidencePage() {
  const router = useRouter();

  // summary (rich text, optional)
  const [summary, setSummary] = useState("");

  // search / filter
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [allInterventions, setAllInterventions] = useState<EvidenceInterventionRef[]>([]);
  const [allPrograms, setAllPrograms] = useState<ProgramProposal[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  // single selection
  const [selected, setSelected] = useState<Selected | null>(null);

  // documents
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // fetch both lists ONCE, then search them in memory (no per-keystroke DB hits)
  useEffect(() => {
    (async () => {
      setLoadingRefs(true);
      const [iv, pr] = await Promise.all([getInterventions(), getNationalPrograms()]);
      setAllInterventions(iv);
      setAllPrograms(pr);
      setLoadingRefs(false);
    })();
  }, []);

  const interventionMatches = useMemo(
    () => (filter === "program" ? [] : filterInterventions(allInterventions, query).slice(0, 8)),
    [allInterventions, query, filter],
  );

  const programMatches = useMemo(
    () => (filter === "intervention" ? [] : filterPrograms(allPrograms, query).slice(0, 8)),
    [allPrograms, query, filter],
  );

  // selecting replaces — never accumulates; X reopens the search
  const pick = useCallback((s: Selected) => {
    setSelected(s);
    setQuery("");
  }, []);
  const clearSelected = useCallback(() => setSelected(null), []);

  // ---- documents ----
  const addFiles = useCallback((files: FileList | File[]) => {
    const incoming = Array.from(files).map((file) => ({ id: uid(), file, name: "" }));
    if (incoming.length) setDocs((prev) => [...prev, ...incoming]);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeDoc = (id: string) => setDocs((prev) => prev.filter((d) => d.id !== id));
  const renameDoc = (id: string, name: string) =>
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, name } : d)));

  // ---- submit ----
  const handleSubmit = async () => {
    if (!selected) {
      toast.error("Link one intervention or program proposal.");
      return;
    }

    setSubmitting(true);
    const { error } = await createAssessmentEvidence({
      summary: isBlankHtml(summary) ? "" : summary,
      intervention_ids: selected.type === "intervention" ? [selected.id] : [],
      program_proposal_ids: selected.type === "program" ? [selected.id] : [],
      documents: docs.map((d) => ({ file: d.file, description: d.name.trim() })),
    });
    setSubmitting(false);

    if (error) { toast.error(error); return; }
    toast.success("Evidence uploaded.");
    router.push("/portal/assessment/evidence");
  };

  const showInterventions = filter !== "program";
  const showPrograms = filter !== "intervention";

  return (
    <div className="mx-auto w-full container py-4">
      <ToastContainer position="top-right" autoClose={4000} newestOnTop />

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-800" aria-label="Back">
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Upload Evidence</h1>
        </div>
      </div>

      {/* 1. Link proposal */}
      <section className="mb-6 border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-700">Link to a proposal</h2>
          <p className="mt-0.5 text-xs text-slate-400">Select one intervention or national program proposal.</p>
        </div>

        <div className="space-y-3 p-4">
          {selected ? (
            /* selected — shown as-is; X reopens the search */
            <div className="flex items-center gap-3 border border-[#27aae1]/30 bg-[#27aae1]/5 px-3 py-2.5">
              {selected.type === "intervention"
                ? <FileStack className="h-4 w-4 shrink-0 text-[#27aae1]" />
                : <Layers className="h-4 w-4 shrink-0 text-[#27aae1]" />}
              <span className="font-mono text-xs font-semibold text-[#27aae1] whitespace-nowrap">{selected.ref}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{selected.label}</span>
              <span className="hidden shrink-0 text-[10px] uppercase tracking-wide text-slate-400 sm:inline">{selected.type}</span>
              <button onClick={clearSelected} className="shrink-0 text-slate-400 hover:text-slate-700" aria-label="Change selection">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              {/* filter pills */}
              <div className="flex items-center gap-1.5">
                {([["all", "All"], ["intervention", "Interventions"], ["program", "Programs"]] as const).map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setFilter(k)}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${filter === k ? "text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    style={filter === k ? { backgroundColor: BLUE } : undefined}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input className="pl-9" placeholder="Search by reference or name…" value={query} onChange={(e) => setQuery(e.target.value)} />
                {loadingRefs && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-300" />}
              </div>

              {/* results */}
              {query.trim() && (
                <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto border border-slate-200">
                  {showInterventions && interventionMatches.map((i, idx) => (
                    <ResultRow
                      key={`intervention:${i.reference_number || idx}`}
                      icon="intervention"
                      ref_={i.reference_number}
                      label={i.intervention_name ?? "—"}
                      meta={i.intervention_type ?? ""}
                      onClick={() => pick({ type: "intervention", id: i.id, ref: i.reference_number, label: i.intervention_name ?? "—" })}
                    />
                  ))}
                  {showPrograms && programMatches.map((p, idx) => (
                    <ResultRow
                      key={`program:${p.reference_number || idx}`}
                      icon="program"
                      ref_={p.reference_number}
                      label={p.title}
                      meta={p.program_name ?? ""}
                      onClick={() => pick({ type: "program", id: p.id, ref: p.reference_number, label: p.title })}
                    />
                  ))}
                  {showInterventions && !interventionMatches.length && showPrograms && !programMatches.length && (
                    <div className="px-3 py-6 text-center text-xs text-slate-400">No matches.</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* 2. Documents */}
      <section className="mb-6 border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-700">Documents</h2>
          <p className="mt-0.5 text-xs text-slate-400">Attach one or more files. Name is optional.</p>
        </div>

        <div className="space-y-3 p-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed py-10 transition-colors ${dragging ? "border-[#27aae1] bg-[#27aae1]/5" : "border-slate-300 hover:border-slate-400"}`}
          >
            <UploadCloud className={`h-7 w-7 ${dragging ? "text-[#27aae1]" : "text-slate-400"}`} />
            <p className="text-sm font-medium text-slate-600">Drag &amp; drop files here, or click to browse</p>
            <p className="text-xs text-slate-400">PDF, images, documents</p>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
          </div>

          {docs.length > 0 && (
            <div className="divide-y divide-slate-100 border border-slate-200">
              {docs.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-slate-200 bg-slate-50">
                    <FileText className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm font-medium text-slate-700">{d.file.name}</p>
                    <Input
                      value={d.name}
                      onChange={(e) => renameDoc(d.id, e.target.value)}
                      placeholder="Document name (optional)"
                      className="h-8 text-xs"
                    />
                  </div>
                  <button onClick={() => removeDoc(d.id)} className="shrink-0 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Summary */}
      <section className="mb-6 border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-700">Summary</h2>
          <p className="mt-0.5 text-xs text-slate-400">Provide a summary description (Optional)</p>
        </div>
        <div className="p-4">
          <RichEditor value={summary} onChange={setSummary} name="summary" placeholder="Add a summary…" />
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()} disabled={submitting}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={submitting} className="text-white" style={{ backgroundColor: BLUE }}>
          {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…</> : "Upload Evidence"}
        </Button>
      </div>
    </div>
  );
}

function ResultRow({
  icon, ref_, label, meta, onClick,
}: {
  icon: "intervention" | "program";
  ref_: string; label: string; meta: string; onClick: () => void;
}) {
  const Icon = icon === "intervention" ? FileStack : Layers;
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      <span className="font-mono text-xs font-semibold text-[#27aae1] whitespace-nowrap">{ref_}</span>
      <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{label}</span>
      {meta && <span className="hidden shrink-0 text-xs text-slate-400 sm:inline">{meta}</span>}
      <span className="shrink-0 text-xs font-medium text-[#27aae1]">Select</span>
    </button>
  );
}