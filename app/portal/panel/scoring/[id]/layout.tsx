import RoleGuard from "@/app/context/role";

export default function PanelScoringLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={["admin", "panel", ]}>
      {children}
    </RoleGuard>
  );
}