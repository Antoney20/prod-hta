"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw, Link2, Search, ChevronDown, X, CheckCircle2, Circle, Check,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

import { SubmittedProposal } from "@/types/dashboard/submittedProposals";
import { SystemCategory, InterventionSystemCategory } from "@/types/new/client";
import { getSubmittedProposals } from "@/app/api/dashboard/submitted-proposals";
import {
  getSystemCategories,
  getInterventionCategories,
  createInterventionCategory,
  deleteInterventionCategory,
} from "@/app/api/new/client";

interface InterventionRow {
  proposal: SubmittedProposal;
  linkedCategories: InterventionSystemCategory[];
  saving: boolean;
}

const PAGE_SIZE_OPTIONS = [25, 50, 75, 100];

export default function AssignCategoriesPage() {
  const [rows, setRows] = useState<InterventionRow[]>([]);
  const [allCategories, setAllCategories] = useState<SystemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [proposalsRes, categories, allLinks] = await Promise.all([
        getSubmittedProposals(),
        getSystemCategories(),
        getInterventionCategories(),
      ]);

      const proposals = proposalsRes.results ?? [];
      setAllCategories(categories);

      const linksByIntervention = allLinks.reduce<Record<string, InterventionSystemCategory[]>>(
        (acc, link) => {
          const key = String(link.intervention);
          acc[key] = [...(acc[key] ?? []), link];
          return acc;
        },
        {}
      );

      setRows(
        proposals.map((p) => ({
          proposal: p,
          linkedCategories: linksByIntervention[String(p.id)] ?? [],
          saving: false,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Reset to page 1 on search change
  useEffect(() => { setPage(1); }, [search, pageSize]);

  const assignCategory = async (interventionId: string, categoryId: string) => {
    setRows((prev) =>
      prev.map((r) =>
        String(r.proposal.id) === interventionId ? { ...r, saving: true } : r
      )
    );

    const result = await createInterventionCategory({
      intervention: interventionId as any,
      system_category: categoryId as any,
    });

    if (result) {
      toast.success("Category linked.");
      setRows((prev) =>
        prev.map((r) =>
          String(r.proposal.id) === interventionId
            ? { ...r, saving: false, linkedCategories: [...r.linkedCategories, result] }
            : r
        )
      );
    } else {
      toast.error("Failed to link category.");
      setRows((prev) =>
        prev.map((r) =>
          String(r.proposal.id) === interventionId ? { ...r, saving: false } : r
        )
      );
    }
  };

  const removeCategory = async (interventionId: string, linkId: string) => {
    setRows((prev) =>
      prev.map((r) =>
        String(r.proposal.id) === interventionId ? { ...r, saving: true } : r
      )
    );

    const ok = await deleteInterventionCategory(linkId);
    if (ok) {
      toast.success("Category removed.");
      setRows((prev) =>
        prev.map((r) =>
          String(r.proposal.id) === interventionId
            ? {
                ...r,
                saving: false,
                linkedCategories: r.linkedCategories.filter((l) => l.id !== linkId),
              }
            : r
        )
      );
    } else {
      toast.error("Failed to remove category.");
      setRows((prev) =>
        prev.map((r) =>
          String(r.proposal.id) === interventionId ? { ...r, saving: false } : r
        )
      );
    }
  };

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.proposal.intervention_name?.toLowerCase().includes(q) ||
      r.proposal.reference_number?.toLowerCase().includes(q) ||
      r.linkedCategories.some((l) =>
        allCategories
          .find((c) => c.id === String(l.system_category))
          ?.name.toLowerCase()
          .includes(q)
      )
    );
  });

  // Pagination math
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const totalLinked = rows.filter((r) => r.linkedCategories.length > 0).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-teal-50 p-2 rounded-lg border border-teal-100">
            <Link2 className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Assign System Categories</h1>
            <p className="text-sm text-slate-500">
              Link each intervention to one or more system categories
            </p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
        <span className="text-slate-600">
          <strong className="text-slate-800">{rows.length}</strong> total
        </span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-600">
          <strong className="text-teal-600">{totalLinked}</strong> categorised
        </span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-600">
          <strong className="text-amber-500">{rows.length - totalLinked}</strong> pending
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search interventions or categories…"
          className="pl-9 bg-white"
        />
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        {/* Table header row */}
        <div className="grid grid-cols-[1.5rem_1fr_auto] gap-x-4 items-center px-6 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <span />
          <span>Intervention</span>
          <span className="text-right pr-1">Category</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-300" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No interventions found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginated.map((row) => (
              <InterventionCategoryRow
                key={row.proposal.id}
                row={row}
                allCategories={allCategories}
                onAssign={assignCategory}
                onRemove={removeCategory}
              />
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/60">
            {/* Page size */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Rows</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}
              >
                <SelectTrigger className="h-7 w-20 text-xs border-slate-200 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Page info + nav */}
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span>
                {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)}{" "}
                of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function InterventionCategoryRow({
  row,
  allCategories,
  onAssign,
  onRemove,
}: {
  row: InterventionRow;
  allCategories: SystemCategory[];
  onAssign: (interventionId: string, categoryId: string) => void;
  onRemove: (interventionId: string, linkId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<{
    linkId: string;
    categoryName: string;
  } | null>(null);

  const linkedCategoryIds = new Set(row.linkedCategories.map((l) => String(l.system_category)));
  const interventionId = String(row.proposal.id);
  const isLinked = row.linkedCategories.length > 0;

  const toggleCategory = (categoryId: string) => {
    const existingLink = row.linkedCategories.find(
      (l) => String(l.system_category) === categoryId
    );
    if (existingLink) {
      const cat = allCategories.find((c) => c.id === categoryId);
      setConfirmRemove({ linkId: existingLink.id, categoryName: cat?.name ?? "this category" });
    } else {
      onAssign(interventionId, categoryId);
    }
  };

  const handleConfirmedRemove = () => {
    if (confirmRemove) {
      onRemove(interventionId, confirmRemove.linkId);
      setConfirmRemove(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-[1.5rem_1fr_auto] gap-x-4 items-center px-6 py-3.5 hover:bg-slate-50/70 transition-colors group">
        {/* Status indicator */}
        <div className="flex items-center justify-center">
          {isLinked ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />
          ) : (
            <Circle className="h-3.5 w-3.5 text-slate-200 group-hover:text-slate-300 transition-colors" />
          )}
        </div>

        {/* Left: name + ref + badges */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-slate-400 shrink-0">
              {row.proposal.reference_number}
            </span>
            <span className="font-medium text-sm text-slate-800 truncate">
              {row.proposal.intervention_name ?? "Untitled"}
            </span>
            {row.proposal.intervention_type && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0 font-normal">
                {row.proposal.intervention_type}
              </Badge>
            )}
          </div>

          {/* Linked category badges */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {row.linkedCategories.length === 0 ? (
              <span className="text-[11px] text-slate-300 italic">No categories assigned</span>
            ) : (
              row.linkedCategories.map((link) => {
                const cat = allCategories.find((c) => c.id === String(link.system_category));
                return (
                  <Badge
                    key={link.id}
                    variant="outline"
                    className="text-[11px] gap-1 bg-teal-50 text-teal-700 border-teal-200 pr-1 h-5 font-normal"
                  >
                    {cat?.name ?? "Unknown"}
                    <button
                      onClick={() => {
                        setConfirmRemove({
                          linkId: link.id,
                          categoryName: cat?.name ?? "this category",
                        });
                      }}
                      disabled={row.saving}
                      className="hover:text-red-500 transition-colors ml-0.5 disabled:opacity-40"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                );
              })
            )}
          </div>
        </div>

        {/* Right: assign button */}
        <div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={row.saving}
                className="h-7 text-xs gap-1.5 text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700 font-normal"
              >
                {row.saving ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                Assign
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="end">
              <Command>
                <CommandInput placeholder="Search categories…" className="h-9" />
                <CommandList>
                  <CommandEmpty>No categories found.</CommandEmpty>
                  <CommandGroup>
                    {allCategories.map((cat) => {
                      const selected = linkedCategoryIds.has(cat.id);
                      return (
                        <CommandItem
                          key={cat.id}
                          value={cat.name}
                          onSelect={() => toggleCategory(cat.id)}
                          className="flex items-start gap-2 py-2"
                        >
                          <Check
                            className={cn(
                              "h-4 w-4 mt-0.5 shrink-0 transition-opacity",
                              selected ? "text-teal-600 opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-medium", selected && "text-teal-700")}>
                              {cat.name}
                            </p>
                            {cat.description && (
                              <p className="text-xs text-slate-400 truncate">{cat.description}</p>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Remove confirmation dialog */}
      <AlertDialog open={!!confirmRemove} onOpenChange={(o) => !o && setConfirmRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will unlink{" "}
              <span className="font-medium text-slate-700">
                {confirmRemove?.categoryName}
              </span>{" "}
              from this intervention. You can reassign it at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedRemove}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}