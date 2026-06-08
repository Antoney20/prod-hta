"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash2, FileText, ImageIcon } from "lucide-react";
import { Column, DataTable } from "@/app/portal/config/cc/table";
import { AssessmentEvidence } from "@/types/new/assessment";

interface Props {
  data: AssessmentEvidence[];
  onEdit: (row: AssessmentEvidence) => void;
  onDelete: (row: AssessmentEvidence) => void;
}

export function EvidenceTable({ data, onEdit, onDelete }: Props) {
  const columns: Column<AssessmentEvidence>[] = [
    { header: "Criteria", cell: (r) => <Badge variant="outline" className="font-normal">{r.criteria_name}</Badge> },
    { header: "Title",    cell: (r) => <span className="font-medium">{r.title || "—"}</span> },
    { header: "Interventions", cell: (r) => <span className="text-sm text-muted-foreground">{r.interventions.length} linked</span> },
    {
      header: "Notes",
      cell: (r) => (
        <span className="text-sm text-muted-foreground line-clamp-2 max-w-xs"
          dangerouslySetInnerHTML={{ __html: r.notes || "—" }} />
      ),
    },
    {
      header: "Attachments",
      cell: (r) => (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" />{r.documents.length}</span>
          <span className="flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" />{r.images.length}</span>
        </div>
      ),
    },
    { header: "Created", cell: (r) => <span className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span> },
    {
      header: "actions",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 border px-3 text-sm">more actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(row)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      searchPlaceholder="Search evidence…"
      searchFn={(row, q) =>
        (row.title ?? "").toLowerCase().includes(q) ||
        (row.criteria_name ?? "").toLowerCase().includes(q) ||
        row.notes.replace(/<[^>]*>/g, "").toLowerCase().includes(q)
      }
    />
  );
}