"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Columns3, GripVertical, ChevronUp, ChevronDown, Plus, Loader2, Save, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/app/api/auth";
import { Criterion, CriterionHeader } from "@/types/new/evidence-panel";
import { updateCriterion } from "@/app/api/new/panel/evidence";
import { isFormula } from "./formulas";
import { slugKey } from "./handler";

const EDIT_ROLES = new Set(["admin", "secretariat", "assessment"]);
const TYPE_OPTIONS: { value: CriterionHeader["type"]; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
];

export default function ColumnManager({
  criterion,
  onCriterionChanged,
}: {
  criterion: Criterion;
  onCriterionChanged: (c: Criterion) => void;
}) {
  const { user } = useAuth();
  const canEdit = !!user?.role && EDIT_ROLES.has(user.role);

  const headers = criterion.headers ?? [];
  const sig = headers.map((h) => h.key).join("|");

  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState<CriterionHeader[]>(headers);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<CriterionHeader["type"]>("text");
  const [adding, setAdding] = useState(false);

  // Re-sync local order whenever the header SET changes upstream (a column
  // added/removed elsewhere, or a refetch). Keyed on the key-signature so an
  // unsaved reorder of the SAME set isn't clobbered by an unrelated re-render.
  useEffect(() => {
    setOrder(criterion.headers ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  if (!canEdit) return null;

  const orderSig = order.map((h) => h.key).join("|");
  const dirty = orderSig !== sig;

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length || from === to) return;
    setOrder((list) => {
      const next = [...list];
      const [x] = next.splice(from, 1);
      next.splice(to, 0, x);
      return next;
    });
  };

  const persist = async (next: CriterionHeader[], okMsg: string): Promise<boolean> => {
    const res = await updateCriterion(criterion.id, { headers: next });
    if (res.ok && res.data) {
      onCriterionChanged(res.data);
      toast.success(okMsg);
      return true;
    }
    toast.error(res.error ?? "Could not save columns.");
    return false;
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    await persist(order, "Column order saved.");
    setSavingOrder(false);
  };

  const addColumn = async () => {
    const label = newLabel.trim();
    if (!label) return;
    const key = slugKey(label);
    if (!key) { toast.error("Enter a valid column name."); return; }
    if (order.some((h) => h.key === key)) {
      toast.error("A column with that name already exists.");
      return;
    }
    setAdding(true);
    // append to the CURRENT visual order, so a pending reorder commits too
    const ok = await persist([...order, { key, label, type: newType }], `Column “${label}” added.`);
    setAdding(false);
    if (ok) { setNewLabel(""); setNewType("text"); }
  };

  return (
    <div className="border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="rounded-lg bg-[#27aae1]/10 p-1.5"><Columns3 className="h-4 w-4 text-[#27aae1]" /></span>
          <span className="text-sm font-semibold text-slate-800">Manage columns</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{headers.length}</span>
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>

      {open && (
        <div className="space-y-4 border-t border-slate-100 p-4">
          {/* add column */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Add a column</p>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !adding) addColumn(); }}
                placeholder="Column name (e.g. Number Needed to Treat)"
                className="max-w-xs flex-1"
              />
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as CriterionHeader["type"])}
                className="border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]"
              >
                {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <Button
                className="text-white"
                style={{ backgroundColor: "#27aae1" }}
                disabled={!newLabel.trim() || adding}
                onClick={addColumn}
              >
                {adding ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Plus className="mr-1.5 h-4 w-4" />}
                Add column
              </Button>
            </div>
            {newLabel.trim() && (
              <p className="text-xs text-slate-400">
                Saved as key{" "}
                <code className="rounded bg-slate-100 px-1 font-mono text-[11px]">{slugKey(newLabel) || "—"}</code>.
                Existing rows show “—” until filled.
              </p>
            )}
          </div>

          {/* reorder */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Order (drag, or use arrows)
              </p>
              {dirty && (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm" variant="ghost" className="h-7 text-xs text-slate-500"
                    onClick={() => setOrder(headers)} disabled={savingOrder}
                  >
                    <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
                  </Button>
                  <Button
                    size="sm" className="h-7 text-xs text-white" style={{ backgroundColor: "#27aae1" }}
                    onClick={saveOrder} disabled={savingOrder}
                  >
                    {savingOrder ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1 h-3.5 w-3.5" />}
                    Save order
                  </Button>
                </div>
              )}
            </div>

            {order.length === 0 ? (
              <p className="text-sm text-slate-400">No columns yet — add one above.</p>
            ) : (
              <ul className="divide-y divide-slate-100 border border-slate-200">
                {order.map((h, i) => (
                  <li
                    key={h.key}
                    draggable
                    onDragStart={() => setDragIdx(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => { if (dragIdx != null) { move(dragIdx, i); setDragIdx(null); } }}
                    onDragEnd={() => setDragIdx(null)}
                    className={`flex items-center gap-2 px-3 py-2 ${dragIdx === i ? "bg-[#27aae1]/5" : "bg-white"}`}
                  >
                    <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-slate-300" />
                    <span className="w-6 text-center font-mono text-xs text-slate-400">{i + 1}</span>
                    <span className="flex-1 truncate text-sm text-slate-700">{h.label}</span>
                    {isFormula(h) && (
                      <span className="rounded bg-[#27aae1]/10 px-1 font-mono text-[10px] text-[#27aae1]">ƒ</span>
                    )}
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                      {isFormula(h) ? "formula" : h.type ?? "text"}
                    </span>
                    <div className="flex items-center">
                      <button
                        type="button" onClick={() => move(i, i - 1)} disabled={i === 0}
                        className="p-1 text-slate-400 hover:text-[#27aae1] disabled:opacity-30" title="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button" onClick={() => move(i, i + 1)} disabled={i === order.length - 1}
                        className="p-1 text-slate-400 hover:text-[#27aae1] disabled:opacity-30" title="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {dirty && <p className="text-xs text-amber-600">Unsaved order — click “Save order” to apply.</p>}
          </div>
        </div>
      )}
    </div>
  );
}