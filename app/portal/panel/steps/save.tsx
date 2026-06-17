"use client";


import { useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { ScoringModel, ScoringRow } from "@/types/panel/scoring";
import { createScoringModel, errMsg } from "@/app/api/panel";
import RichEditor from "@/components/shared/editor";

interface Props {
  rows: ScoringRow[];
  fields: string[];
  onBack: () => void;
  onSaved: (model: ScoringModel) => void;
}

export function SaveStep({ rows, fields, onBack, onSaved }: Props) {
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!title.trim()) {
      toast.error("Give the scoring model a title.");
      return;
    }
    setBusy(true);
    try {
      const model = await createScoringModel({ title, version, description, fields, rows });
      toast.success(`Saved "${model.title}" with ${model.row_count} interventions.`);
      onSaved(model);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Title *
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Phase 1 panel — final ranking"
            className="border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Version
          </span>
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="2026.1"
            className="border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]"
          />
        </label>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Description
        </span>
        <RichEditor value={description} onChange={setDescription} />
      </div>

      <p className="text-xs text-slate-400">
        {rows.length} interventions · {fields.length} fields will be stored.
      </p>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={busy}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
        </Button>
        <Button
          onClick={save}
          disabled={busy}
          style={{ backgroundColor: "#27aae1" }}
          className="text-white"
        >
          {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
          Save scoring model
        </Button>
      </div>
    </div>
  );
}