// @/app/portal/panel/survey/page.tsx
"use client";

import { useMemo, useState } from "react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CRITERIA, type WeightingResponsePayload } from "@/types/panel/survey";
import { submitResponse } from "@/app/api/new/panel/survey";
import { useAuthContext } from "@/app/context/auth";


const BLUE = "#27aae1";
const ORANGE = "#fe7105";
const TOTAL_POINTS = 100;

const today = () => new Date().toISOString().slice(0, 10);

// Part B: killer filter uses its own shorter list (5 named + Other).
const KILLER_CANDIDATES: { slug: string; no: number; name: string; threshold: string }[] = [
  { slug: "clinical_effectiveness", no: 1, name: "Clinical Effectiveness", threshold: "Zero benefit" },
  { slug: "safety", no: 2, name: "Safety", threshold: "Unacceptable toxicity" },
  { slug: "cost_effectiveness", no: 3, name: "Cost-Effectiveness", threshold: "ICER < 0.5x GDP per capita" },
  { slug: "budget_impact", no: 4, name: "Budget Impact", threshold: "Breaks the annual pharmaceutical ceiling" },
  { slug: "feasibility", no: 5, name: "Feasibility", threshold: "Cannot be implemented safely" },
  { slug: "other", no: 6, name: "Other", threshold: "" },
];

// Part C: trade-off scenarios.
const SCENARIOS: {
  key: 1 | 2;
  title: string;
  prompt: string;
  options: { slug: string; label: string }[];
}[] = [
  {
    key: 1,
    title: "Scenario 1: Effectiveness vs. Budget Impact",
    prompt:
      "Technology A has exceptional clinical effectiveness (cures 90%) but imposes a very high budget impact (costs 5% of total health budget). Technology B has moderate clinical effectiveness (cures 50%) but has a negligible budget impact. Based on your weights, which would you lean towards?",
    options: [
      { slug: "tech_a", label: "Technology A: exceptional effectiveness, very high budget impact" },
      { slug: "tech_b", label: "Technology B: moderate effectiveness, negligible budget impact" },
    ],
  },
  {
    key: 2,
    title: "Scenario 2: Rare Disease vs. General Population",
    prompt:
      "Technology C provides a large benefit to a small, rare patient group (low prevalence). Technology D provides a small benefit to the entire general population (high prevalence). Based on your weights, which has greater priority?",
    options: [
      { slug: "tech_c", label: "Technology C: large benefit, rare group (low prevalence)" },
      { slug: "tech_d", label: "Technology D: small benefit, general population (high prevalence)" },
    ],
  },
];

const TABS = ["a", "b", "c"] as const;
type TabKey = (typeof TABS)[number];
type KillerState = { is_killer: boolean; rank: number | null; other_text: string };

export default function PanelWeightingPage() {
  const { user } = useAuthContext();
  const respondentName =
    user?.email ??
    user?.member?.user?.email ??
    user?.username ??
    user?.member?.user?.username ??
    "";

  const [tab, setTab] = useState<TabKey>("a");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Part A header
  const [role, setRole] = useState("");
  const [date, setDate] = useState(today());

  // Part A points (slug -> points)
  const [points, setPoints] = useState<Record<string, string>>(
    () => Object.fromEntries(CRITERIA.map((c) => [c.slug, ""])),
  );
  const num = (v: string) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
  };

  // Part B
  const [killers, setKillers] = useState<Record<string, KillerState>>(
    () =>
      Object.fromEntries(
        KILLER_CANDIDATES.map((k) => [k.slug, { is_killer: false, rank: null, other_text: "" }]),
      ),
  );
  const [sensitivity, setSensitivity] = useState("");

  // Part C
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");

  const total = useMemo(
    () => Object.values(points).reduce((a, b) => a + num(b), 0),
    [points],
  );
  const remaining = TOTAL_POINTS - total;

  // Completion gates per part.
  const aComplete = total === TOTAL_POINTS;
  const bComplete = sensitivity !== "";
  const cComplete = s1 !== "" && s2 !== "";
  const allComplete = aComplete && bComplete && cComplete;

  const setPts = (slug: string, v: string) => {
    const digits = v.replace(/[^0-9]/g, "");
    if (digits === "") {
      setPoints((p) => ({ ...p, [slug]: "" }));
      return;
    }
    const n = Math.max(0, Math.min(TOTAL_POINTS, parseInt(digits, 10)));
    setPoints((p) => ({ ...p, [slug]: String(n) }));
  };

  const toggleKiller = (slug: string, on: boolean) =>
    setKillers((k) => ({
      ...k,
      [slug]: { ...k[slug], is_killer: on, rank: on ? k[slug].rank : null },
    }));

  const setRank = (slug: string, v: string) =>
    setKillers((k) => ({ ...k, [slug]: { ...k[slug], rank: v ? Number(v) : null } }));

  const setOther = (slug: string, v: string) =>
    setKillers((k) => ({ ...k, [slug]: { ...k[slug], other_text: v } }));

  const goNext = () => {
    if (tab === "a" && aComplete) setTab("b");
    else if (tab === "b" && bComplete) setTab("c");
  };
  const goPrev = () => {
    if (tab === "c") setTab("b");
    else if (tab === "b") setTab("a");
  };

  const submit = async () => {
    const payload: WeightingResponsePayload = {
      respondent_name: respondentName,
      respondent_role: role,
      response_date: date || null,
      sensitivity_criterion: sensitivity,
      scenario_1_choice: s1,
      scenario_2_choice: s2,
      allocations: CRITERIA.map((c) => ({ criterion: c.slug, points: num(points[c.slug]) })),
      killer_flags: KILLER_CANDIDATES.filter(
        (k) => killers[k.slug].is_killer || killers[k.slug].rank,
      ).map((k) => ({
        candidate: k.slug,
        is_killer: killers[k.slug].is_killer,
        rank: killers[k.slug].rank,
        other_text: killers[k.slug].other_text,
      })),
    };

    try {
      setSaving(true);
      await submitResponse(payload);
      setConfirmOpen(false);
      setSubmitted(true);
      toast.success("Response submitted. Thank you.");
    } catch {
      toast.error("Could not submit your response. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const tabTrigger = (value: TabKey, label: string, done: boolean) => (
    <TabsTrigger
      value={value}
      className="w-full data-[state=active]:text-white"
      style={tab === value ? { backgroundColor: BLUE } : undefined}
    >
      <span className="flex items-center gap-2">
        {label}
        {done && (
          <span
            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: tab === value ? "#ffffff33" : BLUE }}
          >
            {tab === value ? "" : "✓"}
          </span>
        )}
      </span>
    </TabsTrigger>
  );

  if (submitted) {
    return (
      <div className="w-full p-4 sm:p-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ backgroundColor: BLUE }}
            >
              ✓
            </div>
            <h2 className="text-xl font-semibold" style={{ color: BLUE }}>
              Response submitted
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Thank you. Your weighting has been recorded for aggregation. Each member submits
              once, so this survey is now closed for you.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold" style={{ color: BLUE }}>
          Criteria Weighting Survey
        </h1>
        <p className="text-sm text-muted-foreground">
          Assign a relative weight to the 12 appraisal criteria and answer a short set of
          context questions. There are no right or wrong answers; this reflects your
          professional judgement.
        </p>
      </header>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {tabTrigger("a", "Part A: Weights", aComplete)}
              {tabTrigger("b", "Part B: Must-Have Filter", bComplete)}
              {tabTrigger("c", "Part C: Trade-Offs", cComplete)}
            </TabsList>

            {/* PART A */}
            <TabsContent value="a" className="mt-6 space-y-6">
              <section className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={respondentName}
                    readOnly
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role">Role / Area of Expertise</Label>
                  <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Distribute 100 points across the criteria by relative importance. A criterion
                    may be given 0. Your 12 entries must sum to exactly 100.
                  </p>
                  <div
                    className="shrink-0 rounded-md px-3 py-2 text-center text-sm font-medium"
                    style={{
                      backgroundColor: total === TOTAL_POINTS ? `${BLUE}1a` : `${ORANGE}1a`,
                      color: total === TOTAL_POINTS ? BLUE : ORANGE,
                    }}
                  >
                    <div className="text-lg font-bold">{total}/100</div>
                    <div>
                      {total === TOTAL_POINTS ? "complete" : `${remaining > 0 ? remaining : 0} left`}
                    </div>
                  </div>
                </div>

                {CRITERIA.map((c) => (
                  <div
                    key={c.slug}
                    className="grid grid-cols-[1fr_auto] items-start gap-4 border-b pb-3 last:border-0"
                  >
                    <div>
                      <div className="font-medium">
                        {c.no}. {c.name}
                      </div>
                      <div className="text-sm text-muted-foreground">{c.description}</div>
                    </div>
                    <div className="flex items-center">
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={3}
                        placeholder="0"
                        className="w-20 text-right"
                        value={points[c.slug]}
                        onChange={(e) => setPts(c.slug, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </section>
            </TabsContent>

            {/* PART B */}
            <TabsContent value="b" className="mt-6 space-y-6">
              <section className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Some criteria act as gatekeepers. Flag any criterion that, if a technology
                  scores zero or "unacceptable" on it, would cause you to reject it outright, then
                  rank your top 3 (1 = most critical).
                </p>

                {KILLER_CANDIDATES.map((k) => {
                  const st = killers[k.slug];
                  return (
                    <div
                      key={k.slug}
                      className="flex flex-wrap items-center gap-3 border-b pb-3 last:border-0"
                    >
                      <Checkbox
                        id={`k-${k.slug}`}
                        checked={st.is_killer}
                        onCheckedChange={(v) => toggleKiller(k.slug, Boolean(v))}
                      />
                      <div className="min-w-0 flex-1">
                        <Label htmlFor={`k-${k.slug}`} className="font-medium">
                          {k.name}
                        </Label>
                        {k.threshold ? (
                          <span className="ml-2 text-sm text-muted-foreground">{k.threshold}</span>
                        ) : k.slug === "other" && st.is_killer ? (
                          <Input
                            className="mt-1"
                            placeholder="Describe the killer criterion"
                            value={st.other_text}
                            onChange={(e) => setOther(k.slug, e.target.value)}
                          />
                        ) : null}
                      </div>
                      <Select
                        value={st.rank ? String(st.rank) : ""}
                        onValueChange={(v) => setRank(k.slug, v)}
                        disabled={!st.is_killer}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue placeholder="Rank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </section>

              <section className="space-y-1.5">
                <Label>Most susceptible to uncertain evidence</Label>
                <p className="text-sm text-muted-foreground">
                  Which criterion should we penalise most heavily for low-quality data?
                </p>
                <Select value={sensitivity} onValueChange={setSensitivity}>
                  <SelectTrigger className="w-full sm:w-96">
                    <SelectValue placeholder="Select a criterion" />
                  </SelectTrigger>
                  <SelectContent>
                    {CRITERIA.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>
            </TabsContent>

            {/* PART C */}
            <TabsContent value="c" className="mt-6 space-y-6">
              <p className="text-sm text-muted-foreground">
                Choose your preference in these hypothetical tie-breakers. This sanity-checks the
                weights you gave in Part A.
              </p>
              {SCENARIOS.map((sc) => {
                const value = sc.key === 1 ? s1 : s2;
                const setValue = sc.key === 1 ? setS1 : setS2;
                return (
                  <section key={sc.key} className="space-y-2">
                    <div className="font-medium">{sc.title}</div>
                    <p className="text-sm text-muted-foreground">{sc.prompt}</p>
                    <Select value={value} onValueChange={setValue}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your preference" />
                      </SelectTrigger>
                      <SelectContent>
                        {sc.options.map((o) => (
                          <SelectItem key={o.slug} value={o.slug}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </section>
                );
              })}
            </TabsContent>
          </Tabs>

          {/* Nav */}
          <div className="mt-8 flex items-center justify-between border-t pt-4">
            <Button variant="outline" onClick={goPrev} disabled={tab === "a"}>
              Previous
            </Button>

            {tab === "a" && !aComplete && (
              <span className="text-sm" style={{ color: ORANGE }}>
                Make the weights sum to 100.
              </span>
            )}
            {tab === "b" && !bComplete && (
              <span className="text-sm" style={{ color: ORANGE }}>
                Select the criterion most susceptible to uncertain evidence.
              </span>
            )}
            {tab === "c" && !cComplete && (
              <span className="text-sm" style={{ color: ORANGE }}>
                Answer both scenarios.
              </span>
            )}

            {tab !== "c" ? (
              <Button
                onClick={goNext}
                disabled={tab === "a" ? !aComplete : !bComplete}
                style={{ backgroundColor: BLUE }}
                className="text-white hover:opacity-90"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={!allComplete || saving}
                style={{ backgroundColor: BLUE }}
                className="text-white hover:opacity-90"
              >
                Submit response
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirm submit */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit your response?</DialogTitle>
            <DialogDescription>
              Once submitted, your weighting is recorded for aggregation. Are you sure you want to
              submit?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={saving}>
              No, go back
            </Button>
            <Button
              onClick={submit}
              disabled={saving}
              style={{ backgroundColor: BLUE }}
              className="text-white hover:opacity-90"
            >
              {saving ? "Submitting..." : "Yes, submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}