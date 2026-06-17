"use client";



import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Database, FileSpreadsheet, Plus, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { ScoringModel } from "@/types/panel/scoring";
import { buildScoringRows, ColumnPlan, defaultPlan, ParsedSheet, planFields, validRows } from "./cc/file";
import { errMsg, listScoringModels } from "@/app/api/panel";
import { SaveStep } from "./steps/save";
import { MapStep } from "./steps/map-step";
import { UploadStep } from "./steps/upload";


type Step = "pick" | "upload" | "map" | "save";

export default function ScoringPage() {
  const [step, setStep] = useState<Step>("pick");
  const [models, setModels] = useState<ScoringModel[]>([]);
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedSheet | null>(null);
  const [plan, setPlan] = useState<ColumnPlan>({ refKey: "", kindKey: "", fields: [] });

  const refresh = () =>
    listScoringModels()
      .then(setModels)
      .catch((e) => toast.error(errMsg(e)));

  useEffect(() => {
    refresh();
  }, []);

  const rows = useMemo(
    () => (parsed ? validRows(buildScoringRows(parsed, plan)) : []),
    [parsed, plan],
  );
  const fields = useMemo(() => planFields(plan), [plan]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Evidence scoring models</h1>
          <p className="text-sm text-slate-500">
            Upload a final evidence template, map its fields, and save a model to score.
          </p>
        </div>
        {step === "pick" && (
          <button
            onClick={() => setStep("upload")}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: "#27aae1" }}
          >
            <Plus className="h-4 w-4" /> New model
          </button>
        )}
      </header>

      {/* PICK — list of existing models + entry to the wizard */}
      {step === "pick" && (
        <div className="space-y-3">
          {models.length === 0 && (
            <p className="border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
              No scoring models yet. Create one to get started.
            </p>
          )}
          {models.map((m) => (
            <div key={m.id} className="flex items-center justify-between border border-slate-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-[#27aae1]" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{m.title}</p>
                  <p className="text-xs text-slate-400">
                    {m.row_count} interventions · {m.status ?? "draft"}
                    {m.version ? ` · v${m.version}` : ""}
                  </p>
                </div>
              </div>
              <Link
                href={`/portal/appraisal?model=${m.id}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#27aae1] hover:underline"
              >
                Appraise <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
          <div className="pt-2 text-right">
            <Link href="/portal/protocol-guides" className="text-xs font-medium text-[#1d70b8] hover:underline">
              Manage protocol guides →
            </Link>
          </div>
        </div>
      )}

      {/* WIZARD steps */}
      {step !== "pick" && (
        <div className="space-y-5 border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {(["upload", "map", "save"] as Step[]).map((s, i) => (
              <span key={s} className="flex items-center gap-2">
                <span className={step === s ? "font-semibold text-[#27aae1]" : ""}>
                  {i + 1}. {s === "upload" ? "Upload" : s === "map" ? "Map & edit fields" : "Save"}
                </span>
                {i < 2 && <ChevronRight className="h-3 w-3" />}
              </span>
            ))}
            <span className="ml-auto inline-flex items-center gap-1 text-slate-400">
              <Database className="h-3.5 w-3.5" /> {fileName || "no file"}
            </span>
          </div>

          {step === "upload" && (
            <UploadStep
              onParsed={(p, name) => {
                setParsed(p);
                setPlan(defaultPlan(p));
                setFileName(name);
                setStep("map");
              }}
            />
          )}

          {step === "map" && parsed && (
            <MapStep
              parsed={parsed}
              plan={plan}
              setPlan={setPlan}
              onBack={() => setStep("upload")}
              onNext={() => setStep("save")}
            />
          )}

          {step === "save" && (
            <SaveStep
              rows={rows}
              fields={fields}
              onBack={() => setStep("map")}
              onSaved={() => {
                setStep("pick");
                setParsed(null);
                setFileName("");
                refresh();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}