"use client";


import { useEffect, useState } from "react";
import { CheckCircle2, Plus, Trash2, Power, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import { ProtocolGuide } from "@/types/panel/scoring";
import { activateProtocolGuide, deleteProtocolGuide, errMsg, listProtocolGuides } from "@/app/api/panel";
import { ProtocolBuilder } from "./config";


// Placeholder — swap for the project's real role hook.
const isAdmin = true;

export default function ProtocolGuidesPage() {
  const [guides, setGuides] = useState<ProtocolGuide[]>([]);
  const [editing, setEditing] = useState<ProtocolGuide | null>(null);
  const [creating, setCreating] = useState(false);

  const refresh = () =>
    listProtocolGuides()
      .then(setGuides)
      .catch((e) => toast.error(errMsg(e)));

  useEffect(() => {
    refresh();
  }, []);

  const activate = async (g: ProtocolGuide) => {
    try {
      await activateProtocolGuide(g.id);
      toast.success(`"${g.name} v${g.version}" is now active.`);
      refresh();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const remove = async (g: ProtocolGuide) => {
    if (!window.confirm(`Delete "${g.name} v${g.version}"? This cannot be undone.`)) return;
    try {
      await deleteProtocolGuide(g.id);
      toast.success("Protocol deleted.");
      refresh();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const showBuilder = creating || editing;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Protocol guides</h1>
          <p className="text-sm text-slate-500">
            The rule sets that turn evidence into scores. One can be active at a time.
          </p>
        </div>
        {!showBuilder && (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: "#27aae1" }}
          >
            <Plus className="h-4 w-4" /> New protocol
          </button>
        )}
      </header>

      {showBuilder ? (
        <ProtocolBuilder
          initial={editing}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            refresh();
          }}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      ) : (
        <div className="space-y-3">
          {guides.length === 0 && (
            <p className="border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
              No protocol guides yet. Create one or upload a JSON protocol.
            </p>
          )}
          {guides.map((g) => (
            <div key={g.id} className="flex items-center justify-between border border-slate-200 px-4 py-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  {g.name} <span className="text-slate-400">v{g.version}</span>
                  {g.is_active && (
                    <span className="inline-flex items-center gap-1 bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                      <CheckCircle2 className="h-3 w-3" /> active
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400">
                  {Object.keys(g.rules ?? {}).length} criteria
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!g.is_active && (
                  <button onClick={() => activate(g)} title="Make active"
                    className="inline-flex items-center gap-1 text-xs text-[#1d70b8] hover:underline">
                    <Power className="h-3.5 w-3.5" /> Activate
                  </button>
                )}
                <button onClick={() => setEditing(g)} title="Edit"
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:underline">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                {isAdmin && (
                  <button onClick={() => remove(g)} title="Delete"
                    className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}