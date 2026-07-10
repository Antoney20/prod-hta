"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles, FileText, Table2, Scale, Award, Settings, ChevronRight, Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BRAND = "#27aae1";
const BASE = "/portal/panel/agentic";

const PAGES = [
  { slug: "run",       label: "Appraisal Run",         icon: Sparkles },
  { slug: "appraisal", label: "Appraisal",             icon: FileText },
  { slug: "results",   label: "Appraisal Results",     icon: Table2 },
  { slug: "ranking",   label: "Weighting & Ranking",   icon: Scale },
  { slug: "final",     label: "Final Recommendations", icon: Award },
  { slug: "settings",  label: "Settings",              icon: Settings },
] as const;

export default function AgenticLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = PAGES.find((p) => pathname.startsWith(`${BASE}/${p.slug}`)) ?? PAGES[0];

  return (
    <div className=" px-4 py-4 space-y-5">
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/portal" className="flex items-center gap-1 hover:text-slate-600">
          <Home className="h-3 w-3" /> Portal
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/portal/panel" className="hover:text-slate-600">Panel</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`${BASE}/run`} className="hover:text-slate-600">Agentic Appraisal</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-slate-600">{current.label}</span>
      </nav>

      {/* Section tabs */}
      <div className="overflow-x-auto border-b border-slate-200">
        <div className="flex min-w-max items-center gap-1">
          {PAGES.map((p) => {
            const active = p.slug === current.slug;
            const Icon = p.icon;
            return (
              <Link
                key={p.slug}
                href={`${BASE}/${p.slug}`}
                className={cn(
                  "-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                  active ? "border-current" : "border-transparent text-slate-500 hover:text-slate-700"
                )}
                style={active ? { color: BRAND, borderColor: BRAND } : undefined}
              >
                <Icon className="h-4 w-4" /> {p.label}
              </Link>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}