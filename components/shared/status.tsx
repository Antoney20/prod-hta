import { CellStatus, OverallStatus } from "@/types/new/evidence-coverage";

export const CELL_STYLE: Record<CellStatus, { label: string; dot: string; bg: string; text: string }> = {
  complete:   { label: "Complete",   dot: "bg-emerald-500", bg: "bg-emerald-50",  text: "text-emerald-700" },
  incomplete: { label: "Incomplete", dot: "bg-amber-500",   bg: "bg-amber-50",    text: "text-amber-700" },
  empty:      { label: "Empty",      dot: "bg-red-400",     bg: "bg-red-50",      text: "text-red-600" },
  missing:    { label: "No evidence",dot: "bg-slate-300",   bg: "bg-slate-50",    text: "text-slate-400" },
};

export const OVERALL_STYLE: Record<OverallStatus, { label: string; cls: string }> = {
  complete:   { label: "Complete",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  partial:    { label: "Partial",    cls: "bg-[#27aae1]/10 text-[#27aae1] border-[#27aae1]/30" },
  incomplete: { label: "Incomplete", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  missing:    { label: "No evidence",cls: "bg-slate-100 text-slate-500 border-slate-200" },
};