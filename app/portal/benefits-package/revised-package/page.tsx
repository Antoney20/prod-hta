"use client";

import { useEffect, useState } from "react";
import { listRevised } from "@/app/api/new/panel/benefits-package";
import { downloadRevised } from "@/app/portal/benefits-package/_lib/package-excel";
import type { RevisedPackage } from "@/types/panel/benefits-package";

export default function RevisedPackagePage() {
  const [pkgs, setPkgs] = useState<RevisedPackage[]>([]);
  useEffect(() => { listRevised().then(setPkgs); }, []);

  const total = pkgs.reduce((n, p) => n + p.items.length, 0);

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <h1 className="text-lg font-semibold text-slate-800">Revised benefits package</h1>
        <span className="text-xs text-slate-400">{total} included interventions</span>
        <button onClick={() => downloadRevised(pkgs)}
          className="ml-auto rounded border border-slate-200 px-3 py-1.5 text-sm">Download Excel</button>
      </div>

      {!pkgs.length && <p className="text-sm text-slate-500">Nothing promoted yet.</p>}

      <div className="space-y-4">
        {pkgs.map((p) => (
          <section key={p.id} className="rounded-lg border border-slate-200">
            <header className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
              <h2 className="font-semibold text-[#1d70b8]">{p.name}</h2>
              {p.fund && <span className="text-xs text-slate-400">{p.fund}</span>}
              <span className="ml-auto text-xs text-slate-400">{p.items.length} items</span>
            </header>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400">
                  <th className="p-2">Ref</th><th className="p-2">Intervention</th>
                  <th className="p-2">Service</th><th className="p-2">Access</th><th className="p-2">Comment</th>
                </tr>
              </thead>
              <tbody>
                {p.items.map((it) => (
                  <tr key={it.ref} className="border-t border-slate-100">
                    <td className="p-2 font-mono text-xs text-slate-400">{it.ref}</td>
                    <td className="p-2 text-slate-700">{it.name}</td>
                    <td className="p-2 text-slate-500">{it.service_type}</td>
                    <td className="p-2 text-slate-500">{it.package_access}</td>
                    <td className="p-2 text-slate-500">{it.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </div>
  );
}