import { NavLink, useLocation, type NavLinkProps } from 'react-router-dom'
import type { ReactNode } from 'react'

const mockLinks: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'About this mock', end: true },
  { to: '/simulator', label: 'Call simulator' },
]

// Integration Manager's sidebar, with Voice agent as its own integration next to 3CX.
const integrations: { label: string; to?: string }[] = [
  { label: '3CX' },
  { label: 'Voice agent', to: '/voice-agent' },
  { label: 'FedEx' },
  { label: 'Shopify' },
]

const cls: NavLinkProps['className'] = ({ isActive }) => `nav ${isActive ? 'active' : ''}`

const base = import.meta.env.BASE_URL

function Crumbs() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/voice-agent')) {
    return <><span className="dim hide-sm">Integrations</span><span className="hide-sm">›</span>Voice agent<span>›</span>Setup</>
  }
  if (pathname.startsWith('/simulator')) return <>Call simulator</>
  return <>About this mock</>
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="appbar">
        <img src={`${base}DFRNT_HorizLogo_RGB_dark.png`} alt="DFRNT" />
        <div className="crumbs"><Crumbs /></div>
        <div className="avatar" aria-hidden="true">SB</div>
      </header>
      <div className="shell">
        <nav className="sidebar" aria-label="Main">
          <div className="section">Integrations</div>
          {integrations.map((i) =>
            i.to ? (
              <NavLink key={i.label} to={i.to} className={cls}><span className="dot" />{i.label}</NavLink>
            ) : (
              <span key={i.label} className="nav" title="Not part of this mock"><span className="dot" />{i.label}</span>
            ),
          )}
          <div className="section">Mock</div>
          {mockLinks.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={cls}>{l.label}</NavLink>)}
          <div className="tenant"><strong>Urgent Couriers</strong>staging · sample data</div>
        </nav>
        <div style={{ flex: 1, minWidth: 0 }}>
          <nav className="topbar" aria-label="Main (small screens)">
            <NavLink to="/voice-agent" className={({ isActive }) => (isActive ? 'active' : '')}>Voice agent</NavLink>
            {mockLinks.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>{l.label}</NavLink>)}
          </nav>
          <main className="main">{children}</main>
        </div>
      </div>
    </>
  )
}
