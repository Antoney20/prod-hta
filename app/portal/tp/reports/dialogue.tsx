// "use client";

// /**
//  * InterventionDetailDialog
//  * ─────────────────────────────────────────────────────────────
//  * Modal drawer that shows detailed scoring breakdown for a single
//  * intervention: score summary, criteria coverage, system categories,
//  * and per-reviewer participation status.
//  */

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";
// import {
//   BarChart3,
//   CheckCircle2,
//   XCircle,
//   Layers,
// } from "lucide-react";
// import { InterventionScoreReport } from "@/types/new/scoring";


// const BRAND = "#27aae1";



// export interface InterventionDetailDialogProps {
//   item: InterventionScoreReport | null;
//   open: boolean;
//   onClose: () => void;
// }

// // ── Helpers ────────────────────────────────────────────────────────────────────

// function pctColor(pct: number) {
//   if (pct >= 75) return "#059669";
//   if (pct >= 40) return BRAND;
//   return "#f59e0b";
// }

// // ── Component ─────────────────────────────────────────────────────────────────

// export function InterventionDetailDialog({
//   item,
//   open,
//   onClose,
// }: InterventionDetailDialogProps) {
//   if (!item) return null;

//   const pct =
//     item.max_possible_score > 0
//       ? Math.round(
//           (item.overall_total_score / item.max_possible_score) * 100
//         )
//       : 0;

//   const scored = item.reviewer_statuses.filter((r) => r.scored);
//   const notScored = item.reviewer_statuses.filter((r) => !r.scored);

//   return (
//     <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
//       <DialogContent className="max-w-lg">
//         <DialogHeader>
//           <div className="flex items-start gap-3">
//             <div
//               className="p-2 rounded-lg mt-0.5 shrink-0"
//               style={{
//                 background: `${BRAND}15`,
//                 border: `1px solid ${BRAND}25`,
//               }}
//             >
//               <BarChart3 className="h-4 w-4" style={{ color: BRAND }} />
//             </div>
//             <div>
//               <DialogTitle className="text-base leading-snug">
//                 {item.intervention_name}
//               </DialogTitle>
//               <DialogDescription className="mt-1 flex items-center gap-2 flex-wrap">
//                 <span className="font-mono text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
//                   {item.reference_number}
//                 </span>
//                 {item.intervention_type && (
//                   <Badge variant="secondary" className="text-xs">
//                     {item.intervention_type}
//                   </Badge>
//                 )}
//               </DialogDescription>
//             </div>
//           </div>
//         </DialogHeader>

//         <div className="space-y-5 pt-1">

//           {/* ── Score Summary ─────────────────────────────────────────────── */}
//           <div className="grid grid-cols-3 gap-3">
//             <SummaryCard label="Total Score" bottom={`of ${item.max_possible_score}`}>
//               <span className="text-2xl font-bold text-slate-800 tabular-nums">
//                 {item.overall_total_score}
//               </span>
//             </SummaryCard>
//             <SummaryCard label="Score %" bottom="of max possible">
//               <span
//                 className="text-2xl font-bold tabular-nums"
//                 style={{ color: pctColor(pct) }}
//               >
//                 {pct}%
//               </span>
//             </SummaryCard>
//             <SummaryCard label="Criteria" bottom={`of ${item.criteria_total} filled`}>
//               <span className="text-2xl font-bold text-slate-800 tabular-nums">
//                 {item.criteria_scored}
//               </span>
//             </SummaryCard>
//           </div>

//           {/* ── Criteria Progress ─────────────────────────────────────────── */}
//           <Section label="Criteria Coverage">
//             <div className="flex items-center gap-1.5 flex-wrap">
//               {Array.from({ length: item.criteria_total }, (_, i) => (
//                 <div
//                   key={i}
//                   className="h-2.5 w-7 rounded-sm transition-colors"
//                   style={{
//                     background: i < item.criteria_scored ? BRAND : "#e2e8f0",
//                   }}
//                 />
//               ))}
//               <span className="text-xs text-slate-500 ml-1">
//                 {item.criteria_scored}/{item.criteria_total} scored
//               </span>
//             </div>
//           </Section>

//           {/* ── System Categories ─────────────────────────────────────────── */}
//           {item.system_categories && item.system_categories.length > 0 && (
//             <Section label="System Categories">
//               <div className="flex flex-wrap gap-1.5">
//                 {item.system_categories.map((cat) => (
//                   <span
//                     key={cat}
//                     className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border leading-tight"
//                     style={{
//                       background: `${BRAND}10`,
//                       borderColor: `${BRAND}30`,
//                       color: BRAND,
//                     }}
//                   >
//                     <Layers className="h-3 w-3 shrink-0" />
//                     {cat}
//                   </span>
//                 ))}
//               </div>
//             </Section>
//           )}

//           {/* ── Reviewers who scored ──────────────────────────────────────── */}
//           <Section
//             label={
//               <span className="flex items-center gap-1.5">
//                 <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
//                 Scored ({scored.length})
//               </span>
//             }
//           >
//             {scored.length === 0 ? (
//               <p className="text-xs text-slate-400 italic">
//                 No reviewers have scored this intervention yet.
//               </p>
//             ) : (
//               <div className="flex flex-wrap gap-2">
//                 {scored.map((r) => (
//                   <ReviewerCard key={r.user_id} variant="scored">
//                     <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
//                     <div>
//                       <p className="text-xs font-medium text-emerald-800 leading-none">
//                         {r.full_name}
//                       </p>
//                       <p className="text-[10px] text-emerald-600 mt-0.5">
//                         {r.score_count} criteria ·{" "}
//                         <strong>{r.user_total_score} pts</strong> · {r.email}
//                       </p>
//                     </div>
//                   </ReviewerCard>
//                 ))}
//               </div>
//             )}
//           </Section>

//           {/* ── Reviewers who have NOT scored ─────────────────────────────── */}
//           {notScored.length > 0 && (
//             <Section
//               label={
//                 <span className="flex items-center gap-1.5">
//                   <XCircle className="h-3.5 w-3.5 text-slate-400" />
//                   Not Yet Scored ({notScored.length})
//                 </span>
//               }
//             >
//               <div className="flex flex-wrap gap-2">
//                 {notScored.map((r) => (
//                   <ReviewerCard key={r.user_id} variant="pending">
//                     <XCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
//                     <div>
//                       <p className="text-xs font-medium text-slate-600 leading-none">
//                         {r.full_name}
//                       </p>
//                       <p className="text-[10px] text-slate-400 mt-0.5">
//                         {r.email}
//                       </p>
//                     </div>
//                   </ReviewerCard>
//                 ))}
//               </div>
//             </Section>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// // ── Local helpers ──────────────────────────────────────────────────────────────

// function SummaryCard({
//   label,
//   bottom,
//   children,
// }: {
//   label: string;
//   bottom: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="rounded-lg border border-slate-200 px-3 py-2.5 text-center">
//       <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
//         {label}
//       </p>
//       {children}
//       <p className="text-[11px] text-slate-400 mt-0.5">{bottom}</p>
//     </div>
//   );
// }

// function Section({
//   label,
//   children,
// }: {
//   label: React.ReactNode;
//   children: React.ReactNode;
// }) {
//   return (
//     <div>
//       <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
//         {label}
//       </p>
//       {children}
//     </div>
//   );
// }

// function ReviewerCard({
//   variant,
//   children,
// }: {
//   variant: "scored" | "pending";
//   children: React.ReactNode;
// }) {
//   const cls =
//     variant === "scored"
//       ? "border-emerald-200 bg-emerald-50"
//       : "border-slate-200 bg-slate-50";
//   return (
//     <div
//       className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${cls}`}
//     >
//       {children}
//     </div>
//   );
// }