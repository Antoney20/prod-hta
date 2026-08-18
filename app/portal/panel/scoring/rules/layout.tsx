import RoleGuard from "@/app/context/role";

export default function PanelScoringRulesLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={["admin",]}>
      {children}
    </RoleGuard>
  );
}