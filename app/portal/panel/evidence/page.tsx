"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Plus, FileText, Trash2, Pencil, MoreVertical, Upload } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Criterion } from "@/types/new/evidence-panel";
import { deleteCriterion, getCriteria } from "@/app/api/new/panel/evidence";
import { AdminOnly } from "@/app/context/role";
import CriterionForm from "./form";

const stripHtml = (s: string) =>
  s?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ?? "";

interface Group {
  key: string;              
  name: string;            
  description: string;
  primary: Criterion;      
  ids: string[];
}

export default function EvidencePanelPage() {
  const router = useRouter();
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Criterion | null>(null);

  const load = async () => {
    setLoading(true);
    setCriteria(await getCriteria());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const groups: Group[] = useMemo(() => {
    const m = new Map<string, Group>();
    for (const c of criteria) {
      const key = c.criteria.trim().toLowerCase();
      const g = m.get(key);
      if (g) {
        g.ids.push(c.id);
      } else {
        m.set(key, {
          key,
          name: c.criteria.trim(),
          description: c.description ?? "",
          primary: c,
          ids: [c.id],
        });
      }
    }
    return Array.from(m.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [criteria]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (c: Criterion) => { setEditing(c); setFormOpen(true); };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this criterion?")) return;
    const res = await deleteCriterion(id);
    if (res.ok) { toast.success("Deleted"); load(); }
    else toast.error(res.error ?? "Delete failed");
  };

  const goUpload = (id: string) => router.push(`/portal/panel/evidence/${id}`);

  return (
    <div className="p-2">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#27aae1]">Appraisal Criteria - (Upload evidence )</h1>
          <p className="text-sm text-gray-500">Open a criterion to upload and manage its evidence.</p>
        </div>
        <AdminOnly silent>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-md bg-[#27aae1] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d8fc3]"
          >
            <Plus size={16} /> New criterion
          </button>
        </AdminOnly>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((g) => (
            <div
              key={g.key}
              onClick={() => goUpload(g.primary.id)}
              className="group relative flex cursor-pointer flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#27aae1] hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#27aae1]/10 text-[#27aae1]">
                  <FileText size={20} />
                </div>
                <div className="flex items-center gap-2">
                  {!g.primary.active && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      inactive
                    </span>
                  )}
                  <AdminOnly silent>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        onClick={(e) => e.stopPropagation()}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <MoreVertical size={18} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem 
                        // onClick={() => openEdit(g.primary)}
                        >
                          <Pencil size={14} className="mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
  onClick={() => onDelete(g.primary.id)}
  className="text-red-600 focus:text-red-600"
>
  <Trash2 size={14} className="mr-2" /> Delete
</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </AdminOnly>
                </div>
              </div>

              <p className="line-clamp-1 font-semibold text-gray-800">{g.name}</p>
              <p className="mt-1 line-clamp-2 flex-1 text-sm text-gray-500">
                {stripHtml(g.description) || "No description"}
              </p>

              <div className="mt-3 border-t border-gray-100 pt-3">
                <button
                  onClick={(e) => { e.stopPropagation(); goUpload(g.primary.id); }}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-[#27aae1] hover:bg-[#27aae1]/10"
                >
                  <Upload size={14} /> Upload evidence
                </button>
              </div>
            </div>
          ))}

          <AdminOnly silent>
            <button
              onClick={openCreate}
              className="flex min-h-44 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-[#27aae1] hover:text-[#27aae1]"
            >
              <Plus size={28} />
              <span className="mt-2 text-sm font-medium">Add Criterion</span>
            </button>
          </AdminOnly>
        </div>
      )}

      <CriterionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        onSaved={load}
      />
    </div>
  );
}