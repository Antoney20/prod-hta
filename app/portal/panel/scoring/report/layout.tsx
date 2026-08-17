import RoleGuard from "@/app/context/role";

export default function PanelScoreReportLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={["admin"]}>
      {children}
    </RoleGuard>
  );
}