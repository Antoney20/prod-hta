export interface ScalePreview {
  columns: string[];
  rows: { term: string; definition: string; cells: string[] }[];
}

export async function parseScaleFile(file: File): Promise<unknown> {
  const text = await file.text();
  return JSON.parse(text);
}

export function toPreviewGrid(data: any): ScalePreview | null {
  if (!data || typeof data !== "object") return null;
  const columns: string[] = Array.isArray(data.columns) ? data.columns.map(String) : [];
  const terms = Array.isArray(data.terms) ? data.terms : null;
  if (!columns.length || !terms) return null;

  const rows = terms.map((t: any) => {
    const grades = t?.grades ?? {};
    // grades keyed "1".."n" OR by full column label — try both.
    const cells = columns.map((col, i) => String(grades[String(i + 1)] ?? grades[col] ?? ""));
    return { term: String(t?.term ?? ""), definition: String(t?.definition ?? ""), cells };
  });

  return { columns, rows };
}