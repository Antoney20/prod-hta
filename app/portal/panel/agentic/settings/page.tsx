"use client";
import { useEffect, useState } from "react";
import { KeyRound, Plus, Loader2, Star, Power, Pencil, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

import { AIProviderKey } from "@/types/new/agentic";
import { createAIKey, deleteAIKey, getAIKeys, updateAIKey } from "@/app/api/new/panel/agentic";
import { AdminOnly } from "@/app/context/role";
import { DeleteDialog } from "@/app/portal/national-programs/cc/delete";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

const BRAND = "#27aae1";

export default function AISettingsPage() {
  const [keys, setKeys] = useState<AIProviderKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // add form
  const [provider, setProvider] = useState("gemini");
  const [label, setLabel] = useState("");
  const [modelString, setModelString] = useState("");
  const [temperature, setTemperature] = useState("0.3");
  const [keyVal, setKeyVal] = useState("");

  // row-action targets
  const [toDelete, setToDelete] = useState<AIProviderKey | null>(null);
  const [toToggle, setToToggle] = useState<AIProviderKey | null>(null);
  const [editing, setEditing] = useState<AIProviderKey | null>(null);

  // edit form (seeded when a row opens)
  const [eLabel, setELabel] = useState("");
  const [eModel, setEModel] = useState("");
  const [eTemp, setETemp] = useState("0.3");
  const [eSaving, setESaving] = useState(false);

  const load = () => {
    setLoading(true);
    getAIKeys().then(setKeys).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const addKey = async () => {
    if (!keyVal.trim()) { toast.warning("Enter a key."); return; }
    if (!modelString.trim()) { toast.warning("Enter a model string."); return; }
    setSaving(true);
    const res = await createAIKey({
      provider: provider.trim().toLowerCase(),
      label,
      key: keyVal,
      model_string: modelString.trim(),
      temperature: Number(temperature) || 0.3,
      is_default: false,
      is_active: true,
    });
    setSaving(false);
    if (!res) { toast.error("Failed to add key."); return; }
    toast.success("Key added.");
    setKeyVal(""); setLabel(""); setModelString("");
    load();
  };

  const makeDefault = async (k: AIProviderKey) => {
    if (!(await updateAIKey(k.id, { is_default: true }))) { toast.error("Update failed."); return; }
    toast.success("Set as default.");
    load();
  };

  const openEdit = (k: AIProviderKey) => {
    setEditing(k);
    setELabel(k.label || "");
    setEModel(k.model_string);
    setETemp(String(k.temperature));
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!eModel.trim()) { toast.warning("Model string is required."); return; }
    setESaving(true);
    const res = await updateAIKey(editing.id, {
      label: eLabel,
      model_string: eModel.trim(),
      temperature: Number(eTemp) || 0.3,
    });
    setESaving(false);
    if (!res) { toast.error("Update failed."); return; }
    toast.success("Key updated.");
    setEditing(null);
    load();
  };

  const confirmToggle = async () => {
    if (!toToggle) return;
    const k = toToggle;
    setToToggle(null);
    if (!(await updateAIKey(k.id, { is_active: !k.is_active }))) { toast.error("Update failed."); return; }
    toast.success(k.is_active ? "Key deactivated." : "Key activated.");
    load();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const id = toDelete.id;
    setToDelete(null);
    if (!(await deleteAIKey(id))) { toast.error("Delete failed."); return; }
    toast.success("Key deleted.");
    load();
  };

  return (
    <div className=" mx-auto  space-y-6">
      <ToastContainer position="top-right" autoClose={4000} />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ background: `${BRAND}18`, border: `1px solid ${BRAND}30` }}>
          <KeyRound className="h-5 w-5" style={{ color: BRAND }} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">AI Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Provider keys for the appraisal engine.</p>
        </div>
      </div>

      {/* Add key */}
      <AdminOnly silent>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <p className="text-sm font-semibold text-slate-700">Add provider key</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Provider</label>
            <input
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            placeholder="provider (gemini)"
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
        </div>

        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Label</label>
            <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="label (optional)"
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
        </div>

        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Model String</label>
            <input
            value={modelString}
            onChange={(e) => setModelString(e.target.value)}
            placeholder="model string (e.g. google/gemini-2.5-flash)"
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
            />
        </div>

        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Temperature</label>
            <input
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            placeholder="temperature"
            type="number"
            step="0.1"
            min="0"
            max="9"
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
            <label className="text-sm font-medium text-slate-700">API Key</label>
            <input
            value={keyVal}
            onChange={(e) => setKeyVal(e.target.value)}
            placeholder="API key"
            type="password"
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
        </div>
        </div>


          <button onClick={addKey} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
            style={{ background: BRAND }}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add key
          </button>
          <p className="text-xs text-slate-400">
            The secret key is never shown again after saving. Model string and temperature can be edited later without re-entering the key.
          </p>
        </div>
      </AdminOnly>

      {/* Keys table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 text-sm font-semibold text-slate-700">Configured keys</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100">
                <th className="px-5 py-3 font-semibold w-12">#</th>
                <th className="px-5 py-3 font-semibold">Provider</th>
                <th className="px-5 py-3 font-semibold">Label</th>
                <th className="px-5 py-3 font-semibold">Model string</th>
                <th className="px-5 py-3 font-semibold">Temp</th>
                <th className="px-5 py-3 font-semibold">Default</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-6 text-center text-slate-400">Loading…</td></tr>
              ) : keys.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-6 text-center text-slate-400">No keys configured. Add one above to enable appraisals.</td></tr>
              ) : keys.map((k, i) => (
                <tr key={k.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-5 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">{k.provider}</td>
                  <td className="px-5 py-3 text-slate-500">{k.label || <span className="text-slate-300">—</span>}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{k.model_string}</td>
                  <td className="px-5 py-3 text-slate-500">{k.temperature}</td>
                  <td className="px-5 py-3">
                    {k.is_default ? (
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-600">default</span>
                    ) : (
                      <AdminOnly silent>
                        <button onClick={() => makeDefault(k)} title="Set as default"
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-sky-600">
                          <Star className="h-3.5 w-3.5" /> set
                        </button>
                      </AdminOnly>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {k.is_active ? (
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">active</span>
                    ) : (
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">inactive</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <AdminOnly silent>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setToToggle(k)} title={k.is_active ? "Deactivate" : "Activate"}
                          className="p-1.5 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100">
                          <Power className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEdit(k)} title="Edit"
                          className="p-1.5 rounded text-slate-400 hover:text-sky-600 hover:bg-slate-100">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setToDelete(k)} title="Delete"
                          className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </AdminOnly>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Edit key {editing?.provider ? `· ${editing.provider}` : ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-slate-500">Label</label>
              <input value={eLabel} onChange={(e) => setELabel(e.target.value)} placeholder="label (optional)"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Model string</label>
              <input value={eModel} onChange={(e) => setEModel(e.target.value)} placeholder="google/gemini-2.5-flash"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Temperature</label>
              <input value={eTemp} onChange={(e) => setETemp(e.target.value)} type="number" step="0.1" min="0" max="2"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <p className="text-xs text-slate-400">The secret key can't be edited here — delete and re-add to rotate it.</p>
          </div>
          <DialogFooter>
            <button onClick={() => setEditing(null)}
              className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100">Cancel</button>
            <button onClick={saveEdit} disabled={eSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
              style={{ background: BRAND }}>
              {eSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate / deactivate confirm — reuses DeleteDialog as a generic confirm */}
      <DeleteDialog
        open={!!toToggle}
        onOpenChange={(v) => !v && setToToggle(null)}
        title={toToggle?.is_active ? "Deactivate key" : "Activate key"}
        description={
          toToggle?.is_active
            ? `Deactivate the ${toToggle?.provider} key${toToggle?.label ? ` (${toToggle.label})` : ""}? Appraisals will stop using it.`
            : `Activate the ${toToggle?.provider} key${toToggle?.label ? ` (${toToggle.label})` : ""}?`
        }
        confirmWord="confirm"
        onConfirm={confirmToggle}
      />

      {/* Delete confirm */}
      <DeleteDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete provider key"
        description={`This permanently deletes the ${toDelete?.provider} key${toDelete?.label ? ` (${toDelete.label})` : ""}. Appraisals relying on it will fail until another active key exists.`}
        confirmWord={toDelete?.provider || "delete"}
        onConfirm={confirmDelete}
      />
    </div>
  );
}