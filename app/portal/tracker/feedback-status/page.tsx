"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, RefreshCw, Download, UploadCloud } from "lucide-react";

import type { TopicPriority, DecisionType } from "@/types/new/topic-prioritization";
import { getTopicPriorities, getDecisionTypes } from "@/app/api/new/tp";

import { Column, DataTable } from "../../config/cc/table";
import { BulkFeedbackDialog } from "./bulk";
import { AdminOnly } from "@/app/context/role";
import { downloadFeedbackXlsx } from "./handler";

function stripHtml(html: string): string {
  return String(html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function FeedbackStatusPage() {
  const [records, setRecords] = useState<TopicPriority[]>([]);
  const [decisions, setDecisions] = useState<DecisionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkOpen, setBulkOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [recs, decs] = await Promise.all([
        getTopicPriorities(),
        getDecisionTypes(),
      ]);
      setRecords(recs);
      setDecisions(decs);
    } finally {
      setLoading(false);   // always clears — page can never hang on a rejected fetch
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const columns: Column<TopicPriority>[] = useMemo(() => [
    {
      header: "Reference",
      width: "w-[160px] min-w-[140px]",
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">{row.reference_number}</span>
      ),
    },
    {
      header: "Intervention",
      width: "min-w-[220px]",
      cell: (row) => <span className="font-medium">{row.intervention_name}</span>,
    },
    {
      header: "Phase",
      width: "w-[130px] min-w-[110px]",
      cell: (row) =>
        row.phase ? <Badge variant="outline" className="text-xs">{row.phase}</Badge>
          : <span className="text-xs text-muted-foreground italic">—</span>,
    },
    {
      header: "Status",
      width: "w-[130px] min-w-[110px]",
      cell: (row) =>
        row.decision
          ? <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">{row.decision.name}</Badge>
          : row.is_scored
            ? <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Scored</Badge>
            : <Badge variant="secondary" className="text-xs">Pending</Badge>,
    },
    {
      header: "Routing Decision",
      width: "min-w-[180px] max-w-[240px]",
      cell: (row) =>
        row.routing_decision
          ? <p className="text-xs text-slate-600 line-clamp-2">{stripHtml(row.routing_decision)}</p>
          : <span className="text-xs text-muted-foreground italic">—</span>,
    },
    {
      header: "Feedback",
      width: "min-w-[200px] max-w-[280px]",
      cell: (row) => {
        const plain = stripHtml(row.feedback ?? "");
        return plain
          ? <p className="text-xs text-muted-foreground line-clamp-2">{plain}</p>
          : <span className="text-xs text-muted-foreground italic">—</span>;
      },
    },
  ], []);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-[#27aae1]/10 p-2 rounded-lg">
              <MessageSquare className="h-5 w-5 text-[#27aae1]" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Feedback Status</h1>
              <p className="text-sm text-muted-foreground">
                Decisions, routing and submitter feedback across all interventions
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" size="sm"
              onClick={() => downloadFeedbackXlsx(records)}
              disabled={loading || records.length === 0}>
              <Download className="h-4 w-4 mr-2" /> Export Excel
            </Button>
            <AdminOnly silent>
              <Button size="sm" style={{ backgroundColor: "#27aae1" }} className="text-white"
                onClick={() => setBulkOpen(true)}>
                <UploadCloud className="h-4 w-4 mr-2" /> Bulk upload
              </Button>
            </AdminOnly>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Feedback Records</CardTitle>
            <CardDescription>{records.length} interventions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-16">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <DataTable
                data={records}
                columns={columns}
                searchPlaceholder="Search by intervention, reference, phase, routing or feedback..."
                searchFn={(row, q) =>
                  row.intervention_name.toLowerCase().includes(q) ||
                  row.reference_number.toLowerCase().includes(q) ||
                  (row.phase ?? "").toLowerCase().includes(q) ||
                  stripHtml(row.routing_decision ?? "").toLowerCase().includes(q) ||
                  stripHtml(row.feedback ?? "").toLowerCase().includes(q)
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      <AdminOnly silent>
        <BulkFeedbackDialog
          open={bulkOpen}
          onClose={() => setBulkOpen(false)}
          onComplete={load}
          records={records}
          decisions={decisions}
        />
      </AdminOnly>
    </>
  );
}