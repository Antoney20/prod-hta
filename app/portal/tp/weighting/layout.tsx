import RoleGuard from "@/app/context/role";


export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={['admin', 'secretariat', 'swg']}>
      {children}
    </RoleGuard>
  )
}
