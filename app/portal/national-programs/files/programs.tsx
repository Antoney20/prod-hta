"use client";

import { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { NationalProgram } from "@/types/new/program";

interface Props {
  programs: NationalProgram[];
  value?: string;                       // selected program id (string)
  onChange: (id: string) => void;
  placeholder?: string;
}

export function ProgramSelect({ programs, value, onChange, placeholder = "Select a program…" }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const selected = useMemo(
    () => programs.find((p) => String(p.id) === String(value)) ?? null,
    [programs, value],
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return programs;
    return programs.filter((p) => p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s));
  }, [programs, q]);

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQ(""); }}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-72 justify-between font-normal">
          <span className={selected ? "" : "text-muted-foreground"}>
            {selected ? `${selected.code} — ${selected.name}` : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="relative border-b">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            className="border-0 pl-9 focus-visible:ring-0"
            placeholder="Search programs…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No programs found.</p>
          ) : (
            filtered.map((p) => {
              const active = String(p.id) === String(value);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { onChange(String(p.id)); setOpen(false); setQ(""); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <Check className={`h-4 w-4 shrink-0 ${active ? "opacity-100 text-[#27aae1]" : "opacity-0"}`} />
                  <span className="font-mono text-xs text-slate-500">{p.code}</span>
                  <span className="truncate">{p.name}</span>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}