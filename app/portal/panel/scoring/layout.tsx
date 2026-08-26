import RoleGuard from "@/app/context/role";

export default function panelSurveyLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={["admin", "panel", "secretariat"]}>
      {children}
    </RoleGuard>
  );
}