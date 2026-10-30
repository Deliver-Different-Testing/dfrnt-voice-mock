import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Modal } from '../components/ui'
import { TENANTS } from './data'
import { useTenant } from './tenant'

// The tenant-branded App Hub, laid out like the real one (screenshot 31 Oct 2026).
// Tiles are alphabetical; DFRNT Voice slots in between Customer Success Platform and Dispatch.
const TILES = [
  'Accounts', 'Admin Manager', 'Booking/Job List', 'Bulk Import', 'Client Manager', 'Courier Manager',
  'Courier Portal', 'Customer Success Platform', 'DFRNT Voice', 'Dispatch', 'Fuel Surcharge', 'Integration Manager', 'Job Search',
]

/** Hub colours follow the tenant's brand, not DFRNT's. */
const BRAND: Record<number, { bar: string; ink: string; tint: string }> = {
  5: { bar: '#f2c230', ink: '#1a1a1a', tint: '#fdf3d9' },
}
const DEFAULT_BRAND = { bar: '#0d0c2c', ink: '#ffffff', tint: '#e8f7fd' }

// Example pricing only. Not decided.
const PLAN = { monthly: 199, included: 500, perMinute: 0.35, trialDays: 30 }

function Icon({ name }: { name: string }): ReactNode {
  if (name === 'DFRNT Voice') {
    return (
      <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
        <path d="M9 6h4l2 6-3 2a14 14 0 0 0 6 6l2-3 6 2v4a2 2 0 0 1-2 2A20 20 0 0 1 7 8a2 2 0 0 1 2-2Z" />
        <path d="M20 6v6M23 8v2M17 8v2M26 7v4" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <rect x="7" y="7" width="18" height="18" rx="3" />
      <path d="M11 13h10M11 17h10M11 21h6" strokeLinecap="round" />
    </svg>
  )
}

export default function Hub() {
  const { tenant, setTenantId, subscribed, subscribe } = useTenant()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const [agree, setAgree] = useState(false)
  const brand = BRAND[tenant.id] ?? DEFAULT_BRAND
  const date = new Date().toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="hub-page" style={{ ['--brand' as string]: brand.bar, ['--brand-ink' as string]: brand.ink, ['--brand-tint' as string]: brand.tint }}>
      <header className="hub-bar">
        <div className="hub-logo-chip"><span className="wordmark">{tenant.name.split(' ')[0].toUpperCase()}</span></div>
        <div className="hub-bar-right">
          <span className="org-label">Organizations:</span>
          <select className="org-select" value={tenant.id} onChange={(e) => setTenantId(Number(e.target.value))} aria-label="Organization">
            {TENANTS.map((t) => <option key={t.id} value={t.id}>{t.name.split(' ')[0]}</option>)}
          </select>
          <span className="hub-user">Steve Bonnici ⌄</span>
          <button className="btn ghost small" onClick={() => nav('/app/tenants')} style={{ color: 'inherit' }}>Mock: staff view</button>
        </div>
      </header>

      <div className="hub-card">
        <div className="hub-title">
          <span className="wordmark big">{tenant.name.toUpperCase()}</span>
          <span className="divider" />
          <span className="app-hub">APP HUB</span>
        </div>
        <hr />
        <p className="hub-date">{date}</p>
        <div className="hub-tiles">
          {TILES.map((t) => {
            if (t !== 'DFRNT Voice') return <div key={t} className="hub-tile placeholder"><span className="hub-icon"><Icon name={t} /></span>{t}</div>
            return (
              <button key={t} className={`hub-tile voice ${subscribed ? '' : 'locked'}`} onClick={() => (subscribed ? nav('/app') : setOpen(true))}>
                <span className="corner">{subscribed ? <Badge tone="green">Active</Badge> : <Badge tone="blue">Upgrade</Badge>}</span>
                <span className="hub-icon"><Icon name={t} /></span>
                DFRNT Voice
                <span className="sub">{subscribed ? 'Your AI phone assistant' : 'Answer calls with AI'}</span>
              </button>
            )
          })}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add DFRNT Voice">
        <div className="stack">
          <p className="small">Una answers your phone: tracks and books jobs, quotes, emails PODs, and takes driver problems straight to Dispatch. She hands over to your team when she should.</p>
          <ul className="small" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
            <li>Train her on your own call recordings</li>
            <li>Practise with her before any customer hears her</li>
            <li>You choose which calls she answers: after hours, overflow or all</li>
          </ul>
          <div className="price">
            <div><span className="big">NZ${PLAN.monthly}</span><span className="muted small"> / month</span></div>
            <div className="small muted">Includes {PLAN.included} minutes, then NZ${PLAN.perMinute.toFixed(2)} a minute. Number NZ$6 a month. Plus GST.</div>
            <Badge tone="orange">Example price, not decided</Badge>
          </div>
          <div className="alert blue small">First {PLAN.trialDays} days free. You aren't charged while Una is only taking test calls.</div>
          <label className="row small" style={{ gap: 8 }}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              I agree to the DFRNT Voice terms and that charges appear on our DFRNT invoice.
          </label>
          <div className="row">
            <button className="btn" disabled={!agree} onClick={() => { subscribe(); setOpen(false); nav('/app') }}>Start free trial</button>
            <button className="btn outline" onClick={() => setOpen(false)}>Not now</button>
          </div>
          <p className="small muted">Only a tenant admin can upgrade. Other users see “Ask your admin to add DFRNT Voice”.</p>
        </div>
      </Modal>
    </div>
  )
}
