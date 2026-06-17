"use client";


import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, RefreshCw, Pencil, Trash2, Search, Layers, UploadCloud,
  ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown,
} from "lucide-react";
import { toast } from "react-toastify";

import { DeleteDialog } from "@/app/portal/national-programs/cc/delete";
import {
  getBenefitPackages, createBenefitPackage, updateBenefitPackage, deleteBenefitPackage,
} from "@/app/api/new/benefits-package";
import type { BenefitPackage, BenefitPackageInput } from "@/types/new/benefits-package";
import { PackageForm } from "./form";
import { BulkUploadPackages } from "./bulk";

const STD = ["scope", "access_point", "tariff", "ppm", "access_rules"];
const LABELS: Record<string, string> = {
  scope: "Scope", access_point: "Access Point", tariff: "Tariff", ppm: "PPM", access_rules: "Access Rules",
};
const labelFor = (k: string) =>
  LABELS[k] ?? k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Render any value: array -> bullets, object -> label/value pairs, else text. */
function Val({ value }: { value: any }) {
  if (value == null || value === "") return <span className="text-slate-300">—</span>;
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc space-y-1 pl-4">
        {value.map((v, i) => <li key={i}>{String(v)}</li>)}
      </ul>
    );
  }
  if (typeof value === "object") {
    return (
      <div className="space-y-2">
        {Object.entries(value).map(([k, v]) => (
          <div key={k}>
            <p className="font-medium text-slate-700">{k}</p>
            <p className="text-slate-600">{String(v)}</p>
          </div>
        ))}
      </div>
    );
  }
  return <p className="whitespace-pre-line">{String(value)}</p>;
}

function PackageDetail({ data }: { data: Record<string, any> }) {
  const d = data ?? {};
  const extras = Object.keys(d).filter((k) => !STD.includes(k));
  const cell = "border border-slate-200 px-3 py-2 align-top";
  return (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border border-slate-200 text-xs text-slate-700">
        <thead>
          <tr className="bg-slate-100 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <th className={`${cell} w-1/4`}>Scope</th>
            <th className={`${cell} w-[16%]`}>Access Point</th>
            <th className={`${cell} w-1/3`}>Tariff</th>
            <th className={`${cell} w-1/4`}>Access Rules</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={cell}><Val value={d.scope} /></td>
            <td className={cell}><Val value={d.access_point} /></td>
            <td className={cell}>
              <Val value={d.tariff} />
              {d.ppm && (
                <p className="mt-2 text-slate-600">
                  <span className="font-medium">PPM:</span> {String(d.ppm)}
                </p>
              )}
            </td>
            <td className={cell}><Val value={d.access_rules} /></td>
          </tr>
        </tbody>
      </table>

      {extras.length > 0 && (
        <div className="mt-3 space-y-3">
          {extras.map((k) => (
            <div key={k}>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{labelFor(k)}</p>
              <Val value={d[k]} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BenefitPackagesPage() {
  const [packages, setPackages] = useState<BenefitPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BenefitPackage | undefined>();
  const [presetFund, setPresetFund] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [toDelete, setToDelete] = useState<BenefitPackage | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getBenefitPackages();
    setPackages(data);
    setExpanded(new Set(data.map((p) => p.id))); // default all open
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return packages;
    return packages.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.fund.toLowerCase().includes(q) ||
        JSON.stringify(p.data ?? {}).toLowerCase().includes(q),
    );
  }, [packages, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, BenefitPackage[]>();
    filtered.forEach((p) => {
      const k = p.fund || "Unassigned fund";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(p);
    });
    return [...map.entries()];
  }, [filtered]);

  const allIds = useMemo(() => filtered.map((p) => p.id), [filtered]);
  const allOpen = allIds.length > 0 && allIds.every((id) => expanded.has(id));
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () => setExpanded(allOpen ? new Set() : new Set(allIds));

  const openAdd = (fund?: string) => { setEditing(undefined); setPresetFund(fund); setFormOpen(true); };
  const openEdit = (p: BenefitPackage) => { setEditing(p); setPresetFund(undefined); setFormOpen(true); };

  const handleSubmit = async (values: BenefitPackageInput) => {
    setSubmitting(true);
    const res = editing
      ? await updateBenefitPackage(editing.id, values)
      : await createBenefitPackage(values);
    if (res.ok) {
      toast.success(editing ? "Package updated." : `Package '${res.data?.name}' created.`);
      setFormOpen(false);
      await load();
    } else toast.error(res.error ?? "Failed to save.");
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const res = await deleteBenefitPackage(toDelete.id);
    if (res.ok) { toast.success("Package deleted."); await load(); }
    else toast.error(res.error ?? "Failed to delete.");
    setToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#27aae1]/10 p-2">
            <Layers className="h-5 w-5 text-[#27aae1]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Benefit Packages</h1>
            <p className="text-sm text-muted-foreground">Tariffs &amp; access rules grouped by fund</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleAll} disabled={loading || allIds.length === 0}>
            {allOpen ? <ChevronsDownUp className="mr-1.5 h-4 w-4" /> : <ChevronsUpDown className="mr-1.5 h-4 w-4" />}
            {allOpen ? "Collapse all" : "Expand all"}
          </Button>
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" onClick={() => setBulkOpen(true)}>
            <UploadCloud className="mr-2 h-4 w-4" />Bulk upload
          </Button>
          <Button onClick={() => openAdd()}>
            <Plus className="mr-2 h-4 w-4" />Add package
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search packages, funds or scope..." value={search}
          onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : grouped.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">No packages found.</div>
      ) : (
        <div className="overflow-hidden overflow-x-auto rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                <th className="w-8 px-3 py-2.5" />
                <th className="px-4 py-2.5 text-left font-medium">Package</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {grouped.map(([fund, pkgs]) => (
                <Fragment key={fund}>
                  {/* Fund group header */}
                  <tr className="border-b" style={{ backgroundColor: "rgba(39,170,225,0.07)" }}>
                    <td colSpan={2} className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-semibold">{fund}</span>
                        <span className="text-xs text-muted-foreground">
                          {pkgs.length} package{pkgs.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                      <Button size="sm" variant="outline" className="h-7 text-xs"
                        onClick={() => openAdd(fund === "Unassigned fund" ? "" : fund)}>
                        <Plus className="mr-1 h-3 w-3" />Add
                      </Button>
                    </td>
                  </tr>

                  {/* Package rows */}
                  {pkgs.map((p, i) => {
                    const open = expanded.has(p.id);
                    return (
                      <Fragment key={p.id}>
                        <tr className={`border-b hover:bg-muted/20 transition-colors ${i % 2 ? "bg-muted/5" : ""}`}>
                          <td className="px-3 py-3 align-top">
                            <button onClick={() => toggle(p.id)} className="text-slate-400 hover:text-[#27aae1]"
                              aria-label={open ? "Collapse" : "Expand"}>
                              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          </td>
                          <td className="px-4 py-3 align-top font-medium">
                            <button onClick={() => toggle(p.id)} className="text-left hover:text-[#27aae1]">
                              {p.name}
                            </button>
                          </td>
                          <td className="px-4 py-3 align-top text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-7 border bg-[#27aae1]/5 px-3 text-xs">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(p)}>
                                  <Pencil className="mr-2 h-4 w-4" />Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => setToDelete(p)}>
                                  <Trash2 className="mr-2 h-4 w-4" />Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>

                        {/* Expanded detail — organized 4-column table */}
                        {open && (
                          <tr className="border-b bg-slate-50/60">
                            <td />
                            <td colSpan={2} className="px-4 pb-3">
                              <PackageDetail data={p.data} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PackageForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        defaultValues={editing}
        fund={presetFund}
        isSubmitting={submitting}
      />
      <BulkUploadPackages open={bulkOpen} onClose={() => setBulkOpen(false)} onDone={load} />
      <DeleteDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete package?"
        description={<span><strong>{toDelete?.name}</strong> will be permanently removed.</span>}
        onConfirm={handleDelete}
      />
    </div>
  );
}