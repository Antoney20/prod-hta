"use client";

import { useEffect, useState } from "react";
import { Loader2, FileText } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { EvidenceTarget } from "@/types/new/decision-template";
import { getTargetDetailed } from "@/app/api/new/panel/template";
import { EvidenceValue } from "./prose";


export default function DetailedReportDialog({
  id,
  open,
  onOpenChange,
}: {
  id: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [data, setData] = useState<EvidenceTarget | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    getTargetDetailed(id)
      .then((d) => alive && setData(d))
      .catch(() => alive && setData(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [open, id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-[#27aae1]" />
            Detailed evidence report
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#27aae1]" />
          </div>
        ) : !data ? (
          <p className="py-10 text-center text-sm text-slate-400">
            No detailed evidence available.
          </p>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="font-mono text-xs text-[#27aae1]">{data.reference_number}</p>
              <p className="text-sm font-semibold text-slate-800">{data.name}</p>
            </div>

            {data.criteria.length === 0 ? (
              <p className="text-sm italic text-slate-400">No evidence submitted.</p>
            ) : (
              data.criteria.map((c) => (
                <div key={c.id} className="rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2">
                    <span className="text-sm font-semibold text-slate-700">{c.criterion}</span>
                    <Badge variant="outline" className="border-slate-200 text-[10px] text-slate-500">
                      {c.type}
                    </Badge>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {(c.target_fields.length ? c.target_fields : Object.keys(c.evidence)).map((f) => (
                      <div key={f} className="grid grid-cols-1 gap-1 px-4 py-2.5 sm:grid-cols-[200px_1fr]">
                        <span className="text-xs font-medium text-slate-500">{f}</span>
                        <EvidenceValue value={c.evidence[f]} />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}