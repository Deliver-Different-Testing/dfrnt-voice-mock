import { NavLink, type NavLinkProps } from 'react-router-dom'
import type { ReactNode } from 'react'

const links: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'About this mock', end: true },
  { to: '/voice-agent', label: 'Voice agent' },
  { to: '/simulator', label: 'Call simulator' },
]

const cls: NavLinkProps['className'] = ({ isActive }) => `nav ${isActive ? 'active' : ''}`

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <nav className="sidebar" aria-label="Main">
        <div className="brand"><span className="logo">IM</span> Integration Manager</div>
        <div className="section">Mock</div>
        {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={cls}>{l.label}</NavLink>)}
        <div className="section">Integrations (not mocked)</div>
        <span className="nav muted" style={{ padding: '8px 10px', fontSize: 14 }}>FedEx</span>
        <span className="nav muted" style={{ padding: '8px 10px', fontSize: 14 }}>Shopify</span>
        <span className="nav muted" style={{ padding: '8px 10px', fontSize: 14 }}>Agent access</span>
        <div className="tenant"><strong>Urgent Couriers</strong>staging · ap-southeast-2</div>
      </nav>
      <div style={{ flex: 1, minWidth: 0 }}>
        <nav className="topbar" aria-label="Main">
          {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>{l.label}</NavLink>)}
        </nav>
        <main className="main">{children}</main>
      </div>
    </div>
  )
}
