"use client";

import { useMemo, useState } from "react";
import { Download, Upload, Plus, Loader2, Save, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { ProtocolGuide, ProtocolRules } from "@/types/panel/scoring";
import { createProtocolGuide, errMsg, updateProtocolGuide } from "@/app/api/panel";
import RichEditor from "@/components/shared/editor";

interface Props {
  initial?: ProtocolGuide | null;
  onSaved: (guide: ProtocolGuide) => void;
  onCancel: () => void;
}

const SKELETON = { conditions: [{ else: true, score: 1, label: "Default" }] };

export function ProtocolBuilder({ initial, onSaved, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [version, setVersion] = useState(initial?.version ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [text, setText] = useState(JSON.stringify(initial?.rules ?? {}, null, 2));
  const [busy, setBusy] = useState(false);

  // live-parse the JSON; surface a parse error without losing what's typed
  const parsed = useMemo(() => {
    try {
      const obj = JSON.parse(text || "{}");
      return { rules: obj as ProtocolRules, error: "" };
    } catch (e: any) {
      return { rules: null, error: e?.message ?? "Invalid JSON" };
    }
  }, [text]);

  const criteria = parsed.rules ? Object.keys(parsed.rules) : [];

  const addCriterion = () => {
    if (!parsed.rules) return;
    const key = window.prompt("Criterion key (e.g. clinical_effectiveness)")?.trim();
    if (!key) return;
    setText(JSON.stringify({ ...parsed.rules, [key]: SKELETON }, null, 2));
  };

  const download = () => {
    const guide = { name, version, description, is_active: false, rules: parsed.rules ?? {} };
    const url = URL.createObjectURL(new Blob([JSON.stringify(guide, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `protocol-${version || "draft"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const upload = async (file?: File | null) => {
    if (!file) return;
    try {
      const guide = JSON.parse(await file.text());
      if (guide.name) setName(guide.name);
      if (guide.version) setVersion(guide.version);
      if (guide.description) setDescription(guide.description);
      setText(JSON.stringify(guide.rules ?? guide ?? {}, null, 2));
      toast.success("Protocol loaded from file.");
    } catch {
      toast.error("That file is not valid protocol JSON.");
    }
  };

  const save = async () => {
    if (!name.trim() || !version.trim()) {
      toast.error("Name and version are required.");
      return;
    }
    if (parsed.error || !parsed.rules) {
      toast.error("Fix the rules JSON before saving.");
      return;
    }
    setBusy(true);
    try {
      const input = { name, version, description, rules: parsed.rules };
      const guide = initial
        ? await updateProtocolGuide(initial.id, input)
        : await createProtocolGuide(input);
      toast.success(`Protocol "${guide.name} v${guide.version}" saved.`);
      onSaved(guide);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 border border-slate-200 p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Name *</span>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Version *</span>
          <input value={version} onChange={(e) => setVersion(e.target.value)}
            className="border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]" />
        </label>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Description</span>
        <RichEditor value={description} onChange={setDescription} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Rules · {criteria.length} criteri{criteria.length === 1 ? "on" : "a"}
        </p>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addCriterion}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add criterion
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={download}>
            <Download className="mr-1 h-3.5 w-3.5" /> Download
          </Button>
          <label className="inline-flex h-7 cursor-pointer items-center gap-1 border border-slate-300 px-2 text-xs hover:bg-slate-50">
            <Upload className="h-3.5 w-3.5" /> Upload JSON
            <input type="file" accept=".json" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
          </label>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        rows={16}
        className="w-full border border-slate-300 p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#27aae1]"
      />
      {parsed.error && (
        <p className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertTriangle className="h-3.5 w-3.5" /> {parsed.error}
        </p>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button onClick={save} disabled={busy || !!parsed.error} style={{ backgroundColor: "#27aae1" }} className="text-white">
          {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
          Save protocol
        </Button>
      </div>
    </div>
  );
}