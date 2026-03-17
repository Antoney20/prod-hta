// "use client";


// import {
//   Table, TableBody, TableCell, TableHead,
//   TableHeader, TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import {
//   Tooltip, TooltipContent, TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { CheckSquare, Square, Layers, MinusCircle } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { EnrichedInterventionScore } from "@/types/new/scoring";
// import { SystemCategory } from "@/types/new/client";

// const BRAND = "#27aae1";

// export interface ScoreListTableProps {

//   rows: EnrichedRowItem[];
//   rowOffset: number;
//   categoryMap: Record<string, SystemCategory[]>;
// }

// export interface EnrichedRowItem extends EnrichedInterventionScore {
//   _unscored?: boolean;
// }

// function ScoreCheckboxes({ value }: { value: number }) {
//   return (
//     <div className="flex items-center gap-1.5">
//       {[1, 2, 3].map((opt) => {
//         const active = opt === value;
//         return (
//           <span
//             key={opt}
//             className={cn(
//               "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border transition-colors",
//               active ? "text-white border-transparent" : "bg-slate-50 text-slate-400 border-slate-200"
//             )}
//             style={active ? { background: BRAND, borderColor: BRAND } : undefined}
//           >
//             {active
//               ? <CheckSquare className="h-3 w-3 shrink-0" />
//               : <Square className="h-3 w-3 shrink-0" />}
//             {opt}
//           </span>
//         );
//       })}
//     </div>
//   );
// }

// function CategoryCell({ categories }: { categories: SystemCategory[] }) {
//   if (!categories || categories.length === 0)
//     return <span className="text-slate-300 text-xs italic">—</span>;

//   const [first, ...rest] = categories;

//   return (
//     <div className="flex flex-wrap gap-1 items-center">
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <span
//             className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border cursor-default leading-tight max-w-[150px] truncate"
//             style={{ background: `${BRAND}10`, borderColor: `${BRAND}30`, color: BRAND }}
//           >
//             <Layers className="h-2.5 w-2.5 shrink-0" />
//             <span className="truncate">{first.name.replace(/\s*\(.*\)$/, "")}</span>
//           </span>
//         </TooltipTrigger>
//         <TooltipContent className="max-w-xs text-xs">{first.name}</TooltipContent>
//       </Tooltip>

//       {rest.length > 0 && (
//         <Tooltip>
//           <TooltipTrigger asChild>
//             <span className="text-[10px] font-medium text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded cursor-default">
//               +{rest.length}
//             </span>
//           </TooltipTrigger>
//           <TooltipContent className="max-w-xs text-xs space-y-0.5">
//             {rest.map((c) => <p key={c.id}>{c.name}</p>)}
//           </TooltipContent>
//         </Tooltip>
//       )}
//     </div>
//   );
// }


// export function ScoreListTable({ rows, rowOffset, categoryMap }: ScoreListTableProps) {
//   return (
//     <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
//       <Table>
//         <TableHeader>
//           <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
//             <TableHead className="w-8 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">#</TableHead>
//             <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Intervention</TableHead>
//             <TableHead className="min-w-[160px] text-[10px] font-semibold uppercase tracking-wider text-slate-400">System Category</TableHead>
//             <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Criteria</TableHead>
//             <TableHead className="w-40 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Reviewer</TableHead>
//             <TableHead className="w-36 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Score (1–3)</TableHead>
//             <TableHead className="w-28 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Date</TableHead>
//           </TableRow>
//         </TableHeader>

//         <TableBody>
//           {rows.length === 0 ? (
//             <TableRow>
//               <TableCell colSpan={7} className="text-center py-12 text-slate-400 text-sm">
//                 No scores found.
//               </TableCell>
//             </TableRow>
//           ) : (
//             rows.map((s, idx) => {
//               const isUnscored = !!s._unscored;
//               const scoreValue = s.score?.score_value ?? 0;
//               const mechanism = s.score?.scoring_mechanism ?? "—";
//               const criteriaLabel = s.score?.criteria_label ?? "—";
//               const categories = categoryMap[s.intervention] ?? [];

//               return (
//                 <TableRow
//                   key={s.id}
//                   className={cn(
//                     "transition-colors border-b border-slate-100 last:border-0",
//                     isUnscored
//                       ? "bg-slate-50/40 hover:bg-slate-50"
//                       : "hover:bg-slate-50/70"
//                   )}
//                 >
//                   {/* # */}
//                   <TableCell className="text-center text-xs text-slate-400 font-mono">
//                     {rowOffset + idx + 1}
//                   </TableCell>

//                   {/* Intervention */}
//                   <TableCell className="align-top pt-3">
//                     <div className="flex flex-col gap-0.5">
//                       {s.intervention_reference && (
//                         <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded w-fit">
//                           {s.intervention_reference}
//                         </span>
//                       )}
//                       <p className="text-sm font-medium text-slate-800 leading-snug">
//                         {s.intervention_name || "—"}
//                       </p>
//                     </div>
//                   </TableCell>

//                   {/* System Category */}
//                   <TableCell className="align-top pt-3">
//                     <CategoryCell categories={categories} />
//                   </TableCell>

//                   {/* Criteria */}
//                   <TableCell className="align-top pt-3">
//                     {isUnscored ? (
//                       <span className="text-xs text-slate-400 italic">No score submitted</span>
//                     ) : (
//                       <>
//                         <p className="text-sm text-slate-700 leading-snug">{criteriaLabel}</p>
//                         <Badge variant="secondary" className="text-xs font-normal mt-1">
//                           {mechanism}
//                         </Badge>
//                         {s.comment && (
//                           <p className="text-xs text-slate-400 mt-1 italic truncate max-w-xs">
//                             {s.comment}
//                           </p>
//                         )}
//                       </>
//                     )}
//                   </TableCell>

//                   {/* Reviewer */}
//                   <TableCell className="align-top pt-3">
//                     {isUnscored ? (
//                       <span className="text-xs text-slate-400 italic">—</span>
//                     ) : (
//                       <>
//                         <p className="text-sm font-medium text-slate-700 leading-none">
//                           {s.reviewer_name || `Reviewer #${s.reviewer}`}
//                         </p>
//                         <p className="text-[11px] text-slate-400 mt-0.5">{s.reviewer_email}</p>
//                       </>
//                     )}
//                   </TableCell>

//                   {/* Score */}
//                   <TableCell className="align-top pt-3">
//                     {isUnscored ? (
//                       <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
//                         <MinusCircle className="h-3 w-3" /> Not scored
//                       </span>
//                     ) : (
//                       <ScoreCheckboxes value={scoreValue} />
//                     )}
//                   </TableCell>

//                   {/* Date */}
//                   <TableCell className="align-top pt-3">
//                     {isUnscored ? (
//                       <span className="text-xs text-slate-300">—</span>
//                     ) : (
//                       <span className="text-xs text-slate-500">
//                         {new Date(s.created_at).toLocaleDateString("en-GB", {
//                           day: "2-digit", month: "short", year: "numeric",
//                         })}
//                       </span>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               );
//             })
//           )}
//         </TableBody>
//       </Table>
//     </div>
//   );
// }