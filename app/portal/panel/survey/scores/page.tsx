
"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getScores } from "@/app/api/new/panel/survey";
import { CRITERIA, type WeightingScores } from "@/types/panel/survey";
import { exportScoresToExcel } from "./handler";
import { criterionLabel, killerLabel, scenarioLabel } from "./labels";

const BLUE = "#27aae1";

export default function WeightingScoresPage() {
  const [scores, setScores] = useState<WeightingScores | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getScores()
      .then(setScores)
      .catch(() => toast.error("Could not load scores."))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    if (!scores) return;
    try {
      setExporting(true);
      await exportScoresToExcel(scores);
    } catch {
      toast.error("Export failed.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading scores...</div>;
  }
  if (!scores) {
    return <div className="p-6 text-sm text-muted-foreground">No scores available.</div>;
  }

  const killerRows = Object.entries(scores.killer_criteria).sort(
    (a, b) => b[1].rank_score - a[1].rank_score,
  );
  const sensRows = Object.entries(scores.sensitivity).sort((a, b) => b[1] - a[1]);
  const s1Rows = Object.entries(scores.scenario_1);
  const s2Rows = Object.entries(scores.scenario_2);
  const empty = scores.respondent_count === 0;

  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: BLUE }}>
            Committee Weighting Scores
          </h1>
          <p className="text-sm text-muted-foreground">
            Aggregated across {scores.respondent_count} submitted response
            {scores.respondent_count === 1 ? "" : "s"}.
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={exporting || empty}
          style={{ backgroundColor: BLUE }}
          className="text-white hover:opacity-90"
        >
          <Download className="mr-2 h-4 w-4" />
          {exporting ? "Exporting..." : "Export to Excel"}
        </Button>
      </div>

      {empty ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No submitted responses yet.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Criteria weights */}
          <Card>
            <CardHeader>
              <CardTitle>Criteria Weights</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Criterion</TableHead>
                    <TableHead className="text-right">Total Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scores.criteria.map((c, i) => (
                    <TableRow key={c.criterion}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{criterionLabel(c.criterion)}</TableCell>
                      <TableCell className="text-right">{c.total_points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Per-response scores */}
          <Card>
            <CardHeader>
              <CardTitle>Responses</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background">Respondent</TableHead>
                    {CRITERIA.map((c) => (
                      <TableHead key={c.slug} className="text-right whitespace-nowrap">
                        {c.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scores.responses.map((r, i) => (
                    <TableRow key={`${r.respondent_name}-${i}`}>
                      <TableCell className="sticky left-0 bg-background font-medium whitespace-nowrap">
                        {r.respondent_name || "Unknown"}
                      </TableCell>
                      {CRITERIA.map((c) => (
                        <TableCell key={c.slug} className="text-right">
                          {r.points[c.slug] ?? 0}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Killer criteria */}
          <Card>
            <CardHeader>
              <CardTitle>Killer Criteria</CardTitle>
            </CardHeader>
            <CardContent>
              {killerRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No killer criteria flagged.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Criterion</TableHead>
                      <TableHead className="text-right">Killer Votes</TableHead>
                      <TableHead className="text-right">Rank Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {killerRows.map(([slug, v]) => (
                      <TableRow key={slug}>
                        <TableCell className="font-medium">{killerLabel(slug)}</TableCell>
                        <TableCell className="text-right">{v.votes}</TableCell>
                        <TableCell className="text-right">{v.rank_score}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Evidence sensitivity */}
          <Card>
            <CardHeader>
              <CardTitle>Most Susceptible to Uncertain Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              {sensRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No selections.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Criterion</TableHead>
                      <TableHead className="text-right">Votes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sensRows.map(([slug, count]) => (
                      <TableRow key={slug}>
                        <TableCell className="font-medium">{criterionLabel(slug)}</TableCell>
                        <TableCell className="text-right">{count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Trade-offs */}
          <Card>
            <CardHeader>
              <CardTitle>Trade-Off Scenarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="mb-2 text-sm font-medium">Scenario 1: Effectiveness vs. Budget Impact</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Option</TableHead>
                      <TableHead className="text-right">Votes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {s1Rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-sm text-muted-foreground">
                          No selections.
                        </TableCell>
                      </TableRow>
                    ) : (
                      s1Rows.map(([slug, count]) => (
                        <TableRow key={slug}>
                          <TableCell>{scenarioLabel(slug)}</TableCell>
                          <TableCell className="text-right">{count}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">Scenario 2: Rare Disease vs. General Population</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Option</TableHead>
                      <TableHead className="text-right">Votes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {s2Rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-sm text-muted-foreground">
                          No selections.
                        </TableCell>
                      </TableRow>
                    ) : (
                      s2Rows.map(([slug, count]) => (
                        <TableRow key={slug}>
                          <TableCell>{scenarioLabel(slug)}</TableCell>
                          <TableCell className="text-right">{count}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}