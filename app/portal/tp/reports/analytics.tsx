// "use client";

// import { useMemo } from "react";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   ArcElement,
//   LineElement,
//   PointElement,
//   Tooltip as ChartTooltip,
//   Legend,
//   Filler,
//   Title,
// } from "chart.js";
// import { Bar, Doughnut, Line } from "react-chartjs-2";
// import { TrendingUp, PieChart, Users, Layers } from "lucide-react";
// import { ScoringReportResult } from "@/types/new/scoring";


// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   ArcElement,
//   LineElement,
//   PointElement,
//   ChartTooltip,
//   Legend,
//   Filler,
//   Title
// );

// const BRAND      = "#27aae1";
// const BRAND_SOFT = "#27aae120";
// const EMERALD    = "#10b981";
// const AMBER      = "#f59e0b";
// const SLATE      = "#94a3b8";
// const ROSE       = "#f43f5e";

// const PALETTE = [
//   BRAND, EMERALD, AMBER, ROSE, "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
// ];

// const BASE_FONT = {
//   family: "'DM Sans', 'Segoe UI', sans-serif",
//   size: 11,
// };

// /** Shared Chart.js options used as a base for all charts */
// const sharedOptions = {
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: {
//     legend: {
//       labels: {
//         font: BASE_FONT,
//         color: "#64748b",
//         boxWidth: 10,
//         padding: 14,
//       },
//     },
//     tooltip: {
//       backgroundColor: "#0f172a",
//       titleColor: "#f1f5f9",
//       bodyColor: "#cbd5e1",
//       padding: 10,
//       cornerRadius: 8,
//       bodyFont: BASE_FONT,
//     },
//   },
// };

// // ── Types ──────────────────────────────────────────────────────────────────────

// export interface ScoringAnalyticsProps {
//   report: ScoringReportResult;
// }

// // ── Helpers ────────────────────────────────────────────────────────────────────

// function ChartCard({
//   title,
//   subtitle,
//   icon,
//   children,
//   height = 260,
//   wide = false,
// }: {
//   title: string;
//   subtitle: string;
//   icon: React.ReactNode;
//   children: React.ReactNode;
//   height?: number;
//   wide?: boolean;
// }) {
//   return (
//     <div
//       className={`bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col gap-3 ${
//         wide ? "md:col-span-2" : ""
//       }`}
//     >
//       {/* Card header */}
//       <div className="flex items-center gap-2.5">
//         <div
//           className="p-1.5 rounded-lg"
//           style={{ background: BRAND_SOFT, color: BRAND }}
//         >
//           {icon}
//         </div>
//         <div>
//           <p className="text-sm font-semibold text-slate-800 leading-none">{title}</p>
//           <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
//         </div>
//       </div>

//       {/* Chart area */}
//       <div style={{ height }}>
//         {children}
//       </div>
//     </div>
//   );
// }



// export function ScoringAnalytics({ report }: ScoringAnalyticsProps) {
//   const { interventions } = report;

//   const scoreDistData = useMemo(() => {
//     const sorted = [...interventions]
//       .sort((a, b) => b.overall_total_score - a.overall_total_score);

//     return {
//       labels: sorted.map((i) => i.reference_number),
//       datasets: [
//         {
//           label: "Total Score",
//           data: sorted.map((i) => i.overall_total_score),
//           backgroundColor: sorted.map((i) => {
//             const pct = i.max_possible_score > 0
//               ? i.overall_total_score / i.max_possible_score
//               : 0;
//             return pct >= 0.75 ? `${EMERALD}cc`
//               : pct >= 0.4 ? `${BRAND}cc`
//               : `${AMBER}cc`;
//           }),
//           borderColor: "transparent",
//           borderRadius: 6,
//           barThickness: 18,
//         },
//         {
//           label: "Max Possible",
//           data: sorted.map((i) => i.max_possible_score),
//           backgroundColor: "#f1f5f9",
//           borderColor: "transparent",
//           borderRadius: 6,
//           barThickness: 18,
//         },
//       ],
//       _meta: sorted.map((i) => i.intervention_name),
//     };
//   }, [interventions]);

//   const scoreDistOptions = useMemo(() => ({
//     ...sharedOptions,
//     indexAxis: "y" as const,
//     plugins: {
//       ...sharedOptions.plugins,
//       legend: { display: false },
//       tooltip: {
//         ...sharedOptions.plugins.tooltip,
//         callbacks: {
//           title: (items: { dataIndex: number }[]) =>
//             scoreDistData._meta[items[0].dataIndex] ?? "",
//           label: (item: any) =>
//             ` ${item.dataset.label ?? ""}: ${item.formattedValue}`,
//         },
//       },
//     },
//     scales: {
//       x: {
//         grid: { color: "#f1f5f9" },
//         ticks: { font: BASE_FONT, color: "#94a3b8" },
//         border: { display: false },
//         stacked: false,
//       },
//       y: {
//         grid: { display: false },
//         ticks: {
//           font: { ...BASE_FONT, family: "'DM Mono', monospace", size: 10 },
//           color: "#64748b",
//         },
//         border: { display: false },
//       },
//     },
//   }), [scoreDistData]);

//   // ── 2. Scoring Progress (Doughnut) ────────────────────────────────────────
//   const doughnutData = useMemo(() => ({
//     labels: ["Fully Scored", "Partially Scored", "Not Scored"],
//     datasets: [
//       {
//         data: [report.fully_scored, report.partially_scored, report.not_scored],
//         backgroundColor: [`${EMERALD}dd`, `${AMBER}dd`, `${SLATE}55`],
//         borderColor: ["#fff", "#fff", "#fff"],
//         borderWidth: 3,
//         hoverOffset: 8,
//       },
//     ],
//   }), [report]);

//   const doughnutOptions = useMemo(() => ({
//     ...sharedOptions,
//     cutout: "72%",
//     plugins: {
//       ...sharedOptions.plugins,
//       legend: {
//         position: "bottom" as const,
//         labels: {
//           ...sharedOptions.plugins.legend.labels,
//           padding: 16,
//         },
//       },
//       tooltip: {
//         ...sharedOptions.plugins.tooltip,
//         callbacks: {
//           label: (item: any) =>
//             ` ${item.label}: ${item.raw} (${
//               Math.round(((item.raw as number) / report.total_interventions) * 100)
//             }%)`,
//         },
//       },
//     },
//   }), [report]);

//   // ── 3. Reviewer Participation (Grouped Bar) ───────────────────────────────
//   const reviewerData = useMemo(() => {
//     // Aggregate per reviewer: how many interventions they scored vs total
//     const map = new Map<string, { name: string; scored: number; total: number }>();

//     interventions.forEach((inv) => {
//       inv.reviewer_statuses.forEach((r) => {
//         const key = String(r.user_id);
//         const existing = map.get(key) ?? { name: r.full_name, scored: 0, total: 0 };
//         existing.total += 1;
//         if (r.scored) existing.scored += 1;
//         map.set(key, existing);
//       });
//     });

//     const entries = Array.from(map.values());

//     return {
//       labels: entries.map((e) => e.name),
//       datasets: [
//         {
//           label: "Scored",
//           data: entries.map((e) => e.scored),
//           backgroundColor: `${EMERALD}cc`,
//           borderColor: "transparent",
//           borderRadius: 6,
//           barThickness: 28,
//         },
//         {
//           label: "Pending",
//           data: entries.map((e) => e.total - e.scored),
//           backgroundColor: `${SLATE}33`,
//           borderColor: "transparent",
//           borderRadius: 6,
//           barThickness: 28,
//         },
//       ],
//     };
//   }, [interventions]);

//   const reviewerOptions = useMemo(() => ({
//     ...sharedOptions,
//     plugins: {
//       ...sharedOptions.plugins,
//       legend: {
//         position: "top" as const,
//         align: "end" as const,
//         labels: { ...sharedOptions.plugins.legend.labels },
//       },
//     },
//     scales: {
//       x: {
//         grid: { display: false },
//         ticks: { font: BASE_FONT, color: "#64748b" },
//         border: { display: false },
//       },
//       y: {
//         grid: { color: "#f8fafc" },
//         ticks: { font: BASE_FONT, color: "#94a3b8", stepSize: 1 },
//         border: { display: false },
//         title: {
//           display: true,
//           text: "Interventions",
//           font: BASE_FONT,
//           color: "#94a3b8",
//         },
//       },
//     },
//   }), []);

//   // ── 4. Avg Score per System Category (Bar) ────────────────────────────────
//   const categoryScoreData = useMemo(() => {
//     const catMap = new Map<string, number[]>();

//     interventions.forEach((inv) => {
//       const cats = inv.system_categories?.length
//         ? inv.system_categories
//         : ["No Category"];

//       cats.forEach((cat) => {
//         const short = cat.replace(/\s*\(.*\)$/, ""); // strip parenthetical
//         const arr = catMap.get(short) ?? [];
//         arr.push(inv.overall_total_score);
//         catMap.set(short, arr);
//       });
//     });

//     const labels = Array.from(catMap.keys());
//     const avgs = labels.map((cat) => {
//       const vals = catMap.get(cat)!;
//       return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
//     });

//     return {
//       labels,
//       datasets: [
//         {
//           label: "Avg Score",
//           data: avgs,
//           backgroundColor: labels.map((_, i) => `${PALETTE[i % PALETTE.length]}cc`),
//           borderColor: "transparent",
//           borderRadius: 8,
//           barThickness: 32,
//         },
//       ],
//     };
//   }, [interventions]);

//   const categoryOptions = useMemo(() => ({
//     ...sharedOptions,
//     plugins: {
//       ...sharedOptions.plugins,
//       legend: { display: false },
//     },
//     scales: {
//       x: {
//         grid: { display: false },
//         ticks: {
//           font: { ...BASE_FONT, size: 10 },
//           color: "#64748b",
//           maxRotation: 30,
//         },
//         border: { display: false },
//       },
//       y: {
//         grid: { color: "#f8fafc" },
//         ticks: { font: BASE_FONT, color: "#94a3b8", stepSize: 1 },
//         border: { display: false },
//         title: {
//           display: true,
//           text: "Avg Score",
//           font: BASE_FONT,
//           color: "#94a3b8",
//         },
//       },
//     },
//   }), []);


//   // ── Render ────────────────────────────────────────────────────────────────
//   return (
//     <section className="space-y-4">
//       {/* Section header */}
//       <div className="flex items-center gap-2.5">
//         <div className="p-1.5 rounded-lg" style={{ background: BRAND_SOFT, color: BRAND }}>
//           <TrendingUp className="h-4 w-4" />
//         </div>
//         <div>
//           <h2 className="text-base font-semibold text-slate-800">Analytics</h2>
//           <p className="text-xs text-slate-400">
//             Visual breakdown of scores, reviewer activity, and category distribution
//           </p>
//         </div>
//       </div>

//       {/* Grid layout: 2 columns on md+ */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//         {/* 1 ── Score Distribution (wide, full row) */}
//         <ChartCard
//           title="Score Distribution"
//           subtitle="Total vs max possible score per intervention, ranked highest first"
//           icon={<TrendingUp className="h-3.5 w-3.5" />}
//           height={Math.max(200, interventions.length * 34 + 40)}
//           wide
//         >
//           <Bar data={scoreDistData} options={scoreDistOptions} />
//         </ChartCard>

//         {/* 2 ── Scoring Progress (doughnut) */}
//         <ChartCard
//           title="Scoring Progress"
//           subtitle="Proportion of interventions by completion status"
//           icon={<PieChart className="h-3.5 w-3.5" />}
//           height={260}
//         >
//           <Doughnut data={doughnutData} options={doughnutOptions} />
//         </ChartCard>

//         {/* 3 ── Reviewer Participation */}
//         <ChartCard
//           title="Reviewer Participation"
//           subtitle="Scored vs pending interventions per reviewer"
//           icon={<Users className="h-3.5 w-3.5" />}
//           height={240}
//         >
//           <Bar data={reviewerData} options={reviewerOptions} />
//         </ChartCard>

//         {/* 4 ── Avg Score by System Category */}
//         <ChartCard
//           title="Avg Score by System Category"
//           subtitle="Mean total score for interventions in each system category"
//           icon={<Layers className="h-3.5 w-3.5" />}
//           height={240}
//         >
//           <Bar data={categoryScoreData} options={categoryOptions} />
//         </ChartCard>

//       </div>
//     </section>
//   );
// }