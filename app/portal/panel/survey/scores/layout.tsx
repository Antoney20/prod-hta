
import RoleGuard from "@/app/context/role";

export default function WeightingScoresLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard roles={["admin"]}>{children}</RoleGuard>;
}