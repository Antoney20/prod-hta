"use client";

import { useEffect, useState } from "react";
import { Clock, Calendar, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { ScoringWindow } from "@/types/new/manage-scoring";


interface Props {
  scoringWindow: ScoringWindow | null;
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const days  = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const mins  = totalMinutes % 60;

  if (days > 0)  return `${days} day${days === 1 ? "" : "s"} ${hours} hr${hours === 1 ? "" : "s"}`;
  if (hours > 0) return `${hours} hr${hours === 1 ? "" : "s"} ${mins} min${mins === 1 ? "" : "s"}`;
  if (mins > 0)  return `${mins} min${mins === 1 ? "" : "s"}`;
  return "less than a minute";
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

export function ScoringWindowStatus({ scoringWindow }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(tick);
  }, []);

  // No window scheduled — informational, non-blocking
  if (!scoringWindow) {
    return (
      <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
        <Info className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1 text-sm">
          <p className="font-medium text-slate-800">No scoring window set</p>
          <p className="text-xs text-slate-600 mt-0.5">
            Scoring time has not been scheduled for this intervention — you can continue scoring.
          </p>
        </div>
      </div>
    );
  }

  const startsAt = new Date(scoringWindow.starts_at).getTime();
  const endsAt   = new Date(scoringWindow.ends_at).getTime();
  const closeAt  = new Date(scoringWindow.effective_close_at).getTime();

  let tone: "info" | "success" | "warning" | "danger" = "info";
  let icon: React.ReactNode = <Clock className="h-4 w-4" />;
  let title = "";
  let detail = "";

  if (!scoringWindow.is_active) {
    tone = "danger";
    icon = <AlertTriangle className="h-4 w-4" />;
    title = "Scoring window not enabled ";
    detail = "The scoring window for this interventions is not currently active.";
  } else if (now < startsAt) {
    tone = "info";
    icon = <Calendar className="h-4 w-4" />;
    title = `Scoring opens in ${formatDuration(startsAt - now)}`;
    detail = `Starts ${fmt(scoringWindow.starts_at)} · Ends ${fmt(scoringWindow.ends_at)}`;
  } else if (now <= endsAt) {
    tone = "success";
    icon = <CheckCircle2 className="h-4 w-4" />;
    title = `Scoring open — ${formatDuration(endsAt - now)} remaining`;
    detail = `Closes ${fmt(scoringWindow.ends_at)}`;
  } else if (now <= closeAt) {
    tone = "warning";
    icon = <AlertTriangle className="h-4 w-4" />;
    title = `Grace period — ${formatDuration(closeAt - now)} remaining`;
    detail = `Final close ${fmt(scoringWindow.effective_close_at)}`;
  } else {
    tone = "danger";
    icon = <AlertTriangle className="h-4 w-4" />;
    title = "Scoring window closed";
    detail = `Closed ${fmt(scoringWindow.effective_close_at)}`;
  }

  const tones = {
    info:    "border-blue-200 bg-blue-50 text-blue-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger:  "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <div className={`flex items-start gap-3 rounded-md border px-4 py-3 ${tones[tone]}`}>
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 text-sm">
        <p className="font-medium">{title}</p>
        <p className="text-xs opacity-80 mt-0.5">
          {detail}
         
        </p>
      </div>
    </div>
  );
}