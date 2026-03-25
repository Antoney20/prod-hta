import { SubmittedProposal } from "@/types/dashboard/submittedProposals";


const esc = (val: string | number | undefined | null): string => {
  if (val === null || val === undefined) return "";
  const s = String(val);

  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const PUBLIC_HEADERS = [
  "Reference Number",
  "Date Submitted",
  "Intervention Name",
  "Intervention Type",
  "Proposed Beneficiary",
  "Documents Count",
  "Document Names",
  "Document Links",
];

const FULL_HEADERS = [
  "Reference Number",
  "Date Submitted",
  "Name",
  "Email",
  "Phone",
  "Profession",
  "Organization",
  "County",
  "Intervention Name",
  "Intervention Type",
  "Proposed Beneficiary",
  "Justification",
  "Expected Impact",
  "Additional Info",
  "Documents Count",
  "Document Names",
  "Document Links",
  "Signature",
];

const publicRow = (p: SubmittedProposal): string[] => {
  const docNames = p.documents?.map((d) => d.original_name).join(" | ") ?? "";
  const docLinks = p.documents?.map((d) => d.document_url).join(" | ") ?? "";
  return [
    esc(p.reference_number),
    esc(p.date ? new Date(p.date).toLocaleDateString() : ""),
    esc(p.intervention_name),
    esc(p.intervention_type),
    esc(p.beneficiary),
    esc(p.documents?.length ?? 0),
    esc(docNames),
    esc(docLinks),
  ];
};

const fullRow = (p: SubmittedProposal): string[] => {
  const docNames = p.documents?.map((d) => d.original_name).join(" | ") ?? "";
  const docLinks = p.documents?.map((d) => d.document_url).join(" | ") ?? "";
  return [
    esc(p.reference_number),
    esc(p.date ? new Date(p.date).toLocaleDateString() : ""),
    esc(p.name),
    esc(p.email),
    esc(p.phone),
    esc(p.profession),
    esc(p.organization),
    esc(p.county),
    esc(p.intervention_name),
    esc(p.intervention_type),
    esc(p.beneficiary),
    esc(p.justification),
    esc(p.expected_impact),
    esc(p.additional_info),
    esc(p.documents?.length ?? 0),
    esc(docNames),
    esc(docLinks),
    esc(p.signature),
  ];
};

export function exportInterventionsToCSV(
  proposals: SubmittedProposal[],
  mode: "public" | "full" = "public"
) {
  const headers = mode === "full" ? FULL_HEADERS : PUBLIC_HEADERS;
  const rowFn = mode === "full" ? fullRow : publicRow;

  const csvContent = [
    headers.join(","),
    ...proposals.map((p) => rowFn(p).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().split("T")[0];
  const suffix = mode === "full" ? "full_export" : "public_export";

  link.setAttribute("href", url);
  link.setAttribute("download", `interventions_${suffix}_${date}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}