import RoleGuard from "@/app/context/role";


export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (<>
   <RoleGuard minimumRole="secretariat">
      {children}
     </RoleGuard>
    </>
  )
}