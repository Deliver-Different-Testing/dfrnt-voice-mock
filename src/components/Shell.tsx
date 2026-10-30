import { NavLink, useLocation, type NavLinkProps } from 'react-router-dom'
import type { ReactNode } from 'react'
import { TENANTS } from '../voice/data'
import { useTenant } from '../voice/tenant'

// DFRNT Voice: the tenant app behind the Hub tile.
const voiceLinks: { to: string; label: string; end?: boolean }[] = [
  { to: '/app', label: 'Overview', end: true },
  { to: '/app/training', label: 'Training' },
  { to: '/app/practise', label: 'Practise' },
  { to: '/app/settings', label: 'Settings' },
  { to: '/app/number', label: 'Phone number' },
  { to: '/app/calls', label: 'Calls' },
]

// The earlier mock of the Integration Manager tab, kept for reference.
const earlierLinks: { to: string; label: string; end?: boolean }[] = [
  { to: '/voice-agent', label: 'IM Voice agent tab' },
  { to: '/3cx', label: 'IM 3CX page' },
  { to: '/simulator', label: 'Call simulator' },
  { to: '/about', label: 'About this mock', end: true },
]

const cls: NavLinkProps['className'] = ({ isActive }) => `nav ${isActive ? 'active' : ''}`

const base = import.meta.env.BASE_URL

const PAGE: Record<string, string> = {
  training: 'Training', practise: 'Practise', settings: 'Settings', number: 'Phone number', calls: 'Calls', tenants: 'Tenants',
}

function Crumbs() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/app')) {
    const page = PAGE[pathname.split('/')[2] ?? '']
    return <><span className="dim hide-sm">Hub</span><span className="hide-sm">›</span>DFRNT Voice{page && <><span>›</span>{page}</>}</>
  }
  if (pathname.startsWith('/voice-agent')) {
    return <><span className="dim hide-sm">Integrations</span><span className="hide-sm">›</span>Voice agent<span>›</span>Setup</>
  }
  if (pathname.startsWith('/3cx')) {
    return <><span className="dim hide-sm">Integrations</span><span className="hide-sm">›</span>3CX<span>›</span>Setup</>
  }
  if (pathname.startsWith('/simulator')) return <>Call simulator</>
  return <>About this mock</>
}

function TenantPicker() {
  const { tenant, setTenantId, viewer, setViewer } = useTenant()
  return (
    <div className="tenant-picker">
      <select aria-label="Viewing as" value={viewer} onChange={(e) => { setViewer(e.target.value as 'staff' | 'tenant-admin'); if (e.target.value === 'tenant-admin') setTenantId(5) }}>
        <option value="staff">DFRNT staff</option>
        <option value="tenant-admin">Tenant admin</option>
      </select>
      {viewer === 'staff'
        ? <select aria-label="Tenant" value={tenant.id} onChange={(e) => setTenantId(Number(e.target.value))}>{TENANTS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
        : <span className="locked-tenant">{tenant.name}</span>}
    </div>
  )
}

export function Shell({ children }: { children: ReactNode }) {
  const { tenant, viewer } = useTenant()
  const links = viewer === 'staff' ? [...voiceLinks, { to: '/app/tenants', label: 'Tenants' }] : voiceLinks
  return (
    <>
      <header className="appbar">
        <img src={`${base}DFRNT_HorizLogo_RGB_dark.png`} alt="DFRNT" />
        <div className="crumbs"><Crumbs /></div>
        <TenantPicker />
        <div className="avatar" aria-hidden="true">SB</div>
      </header>
      <div className="shell">
        <nav className="sidebar" aria-label="Main">
          <div className="section">DFRNT Voice</div>
          {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={cls}><span className="dot" />{l.label}</NavLink>)}
          <div className="section">Earlier mock</div>
          {earlierLinks.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={cls}>{l.label}</NavLink>)}
          <div className="tenant"><strong>{tenant.name}</strong>{viewer === 'staff' ? 'DFRNT staff view' : 'Tenant admin view'} · sample data</div>
        </nav>
        <div style={{ flex: 1, minWidth: 0 }}>
          <nav className="topbar" aria-label="Main (small screens)">
            {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>{l.label}</NavLink>)}
            <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>Earlier mock</NavLink>
          </nav>
          <main className="main">{children}</main>
        </div>
      </div>
    </>
  )
}
