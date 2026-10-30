import { createContext, useContext, useState, type ReactNode } from 'react'
import { TENANTS, type Tenant } from './data'

// Who is looking. A tenant admin is locked to their tenant; DFRNT staff can switch.
type Viewer = 'staff' | 'tenant-admin'
type Ctx = { tenant: Tenant; setTenantId: (id: number) => void; viewer: Viewer; setViewer: (v: Viewer) => void }

const TenantContext = createContext<Ctx | null>(null)

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState(5)
  const [viewer, setViewer] = useState<Viewer>('staff')
  const tenant = TENANTS.find((t) => t.id === tenantId) ?? TENANTS[0]
  return <TenantContext.Provider value={{ tenant, setTenantId, viewer, setViewer }}>{children}</TenantContext.Provider>
}

export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant outside TenantProvider')
  return ctx
}
