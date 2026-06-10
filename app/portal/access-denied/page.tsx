"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const BLUE = "#27aae1";

export default function AccessDeniedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#27aae1]/10">
          <ShieldAlert className="h-7 w-7" style={{ color: BLUE }} />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-slate-900">Access denied</h1>
        <p className="mt-2 text-sm text-slate-500">
          You don’t have permission to view this page. If you think this is a mistake,
          contact your administrator.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go back
          </Button>
          <Button className="text-white" style={{ backgroundColor: BLUE }} onClick={() => router.push("/portal")}>
            Go to portal
          </Button>
        </div>
      </div>
    </div>
  );
}