// "use client";

// import { useMemo, useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Search, Download, ChevronLeft, ChevronRight, Inbox,
// } from "lucide-react";
// import { DecisionTemplate, DecisionBand } from "@/types/new/decision-template";



// const SIZES = [10, 20, 30];
// const TH = "px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap";
// const TD = "px-3 py-3 align-top";

// const bandText = (b: DecisionBand): string => {
//   if (b.combo) return b.combo.join(" · ");
//   if (b.op) {
//     const v = Array.isArray(b.value) ? b.value.join("–") : b.value;
//     return `${b.op} ${v}`;
//   }
//   return b.label ?? "—";
// };

// export default function DecisionTable({ template }: { template: DecisionTemplate }) {
//   const [search, setSearch] = useState("");
//   const [kind, setKind] = useState<"all" | "descriptive" | "quantitative">("all");
//   const [size, setSize] = useState(10);
//   const [page, setPage] = useState(1);

//   const rows = template.criteria ?? [];

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return rows.filter((c) => {
//       if (kind !== "all" && c.kind !== kind) return false;
//       if (!q) return true;
//       return (
//         c.criterion_name.toLowerCase().includes(q) ||
//         (c.target_fields ?? []).some((f) => f.toLowerCase().includes(q))
//       );
//     });
//   }, [rows, search, kind]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / size));
//   const safePage = Math.min(page, totalPages);
//   const paged = filtered.slice((safePage - 1) * size, safePage * size);

//   return (
//     <div className="space-y-3">
//       <div className="flex flex-wrap items-center justify-between gap-2">
//         <div className="relative max-w-xs flex-1">
//           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//           <Input className="pl-9" placeholder="Search criterion or feature…" value={search}
//             onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
//         </div>
//         <div className="flex items-center gap-2">
//           {/* kind filter */}
//           <div className="inline-flex rounded-md border border-slate-200 text-xs">
//             {(["all", "descriptive", "quantitative"] as const).map((k) => (
//               <button key={k} onClick={() => { setKind(k); setPage(1); }}
//                 className={`px-3 py-1.5 ${kind === k ? "bg-[#27aae1] text-white" : "text-slate-600 hover:bg-slate-50"}`}>
//                 {k}
//               </button>
//             ))}
//           </div>
//           <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}
//             className="border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#27aae1]">
//             {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
//           </select>
//           <Button variant="outline" size="sm" onClick={() => exportDecision(template)}>
//             <Download className="mr-1.5 h-4 w-4" /> Export
//           </Button>
//         </div>
//       </div>

//       <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
//         <table className="w-full text-sm">
//           <thead className="border-b border-slate-200 bg-slate-50">
//             <tr>
//               <th className={`${TH} min-w-48`}>Criterion</th>
//               <th className={`${TH} w-28`}>Type</th>
//               <th className={`${TH} min-w-44`}>Decision features</th>
//               <th className={`${TH} min-w-72`}>Selected band(s)</th>
//               <th className={`${TH} w-16 text-center`}>Score</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100">
//             {paged.length === 0 ? (
//               <tr><td colSpan={5} className="py-16 text-center">
//                 <Inbox className="mx-auto mb-2 h-8 w-8 text-slate-300" />
//                 <p className="text-sm text-slate-400">No criteria match this view.</p>
//               </td></tr>
//             ) : (
//               paged.map((c) => (
//                 <tr key={c.id} className="transition-colors hover:bg-slate-50/70">
//                   <td className={`${TD} font-medium text-slate-800`}>{c.criterion_name}</td>
//                   <td className={TD}>
//                     <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
//                       c.kind === "quantitative" ? "bg-[#27aae1]/10 text-[#27aae1]" : "bg-amber-50 text-amber-700"
//                     }`}>
//                       {c.kind || "—"}
//                     </span>
//                   </td>
//                   <td className={TD}>
//                     <div className="flex flex-wrap gap-1">
//                       {(c.target_fields ?? []).length
//                         ? c.target_fields.map((f) => (
//                             <span key={f} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">{f}</span>
//                           ))
//                         : <span className="text-xs text-slate-300">—</span>}
//                     </div>
//                   </td>
//                   <td className={TD}>
//                     {/* solid multi-band cell — one chip per selected band */}
//                     <div className="flex flex-col gap-1.5">
//                       {(c.selected_bands ?? []).length
//                         ? c.selected_bands.map((b, i) => (
//                             <div key={i} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
//                               <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#27aae1] text-[10px] font-semibold text-white">
//                                 {b.score}
//                               </span>
//                               <span className="min-w-0 flex-1 text-xs text-slate-600">
//                                 {b.label ? b.label : <code className="text-slate-500">{bandText(b)}</code>}
//                               </span>
//                               {b.field && (
//                                 <span className="rounded bg-white px-1 font-mono text-[10px] text-slate-400">{b.field}</span>
//                               )}
//                             </div>
//                           ))
//                         : <span className="text-xs text-slate-300">No band selected</span>}
//                     </div>
//                   </td>
//                   <td className={`${TD} text-center text-sm font-semibold text-slate-700`}>{c.score ?? "—"}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {filtered.length > size && (
//         <div className="flex items-center justify-between text-sm">
//           <span className="text-slate-500">
//             {(safePage - 1) * size + 1}–{Math.min(safePage * size, filtered.length)} of {filtered.length}
//           </span>
//           <div className="flex items-center gap-2">
//             <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}>
//               <ChevronLeft className="h-4 w-4" />
//             </Button>
//             <span className="text-slate-600">Page {safePage} of {totalPages}</span>
//             <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage((p) => p + 1)}>
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }