"use client";

import { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { ParsedSheet, parseSpreadsheet } from "../cc/file";



interface Props {
  onParsed: (parsed: ParsedSheet, fileName: string) => void;
}

export function UploadStep({ onParsed }: Props) {
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const sheet = await parseSpreadsheet(file);
      if (!sheet.columns.length) {
        toast.error("Could not read any columns from that file.");
        return;
      }
      onParsed(sheet, file.name);
    } catch {
      toast.error("Failed to parse the file. Use .xlsx or .csv.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onClick={() => fileRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files?.[0]);
      }}
      className="flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed border-slate-300 px-6 py-16 text-center hover:border-[#27aae1] hover:bg-[#27aae1]/5"
    >
      {busy ? (
        <Loader2 className="h-8 w-8 animate-spin text-[#27aae1]" />
      ) : (
        <UploadCloud className="h-8 w-8 text-slate-400" />
      )}
      <p className="text-sm font-medium text-slate-700">
        Drop the final evidence template here, or click to browse
      </p>
      <p className="text-xs text-slate-400">
        One column per criterion variable · grouped two-row headers supported
      </p>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}