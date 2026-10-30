import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Modal } from '../components/ui'
import { useTenant } from './tenant'

// The DFRNT Hub with the DFRNT Voice tile. Other tiles are placeholders.
const TILES = ['Despatch', 'Routed Operations', 'Accounts', 'Settings', 'Integration Manager', 'Reports']

// Example pricing only. Not decided.
const PLAN = { monthly: 199, included: 500, perMinute: 0.35, trialDays: 30 }

export default function Hub() {
  const { tenant, subscribed, subscribe, viewer } = useTenant()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const [agree, setAgree] = useState(false)

  return (
    <div className="stack">
      <div>
        <h1>Hub</h1>
        <p className="muted" style={{ marginTop: 4 }}>{tenant.name}. Switch tenant in the bar above to see the tile before and after upgrading.</p>
      </div>
      <div className="hub-grid">
        {TILES.map((t) => <div key={t} className="tile placeholder"><span className="tile-icon" aria-hidden="true" />{t}</div>)}
        <button className={`tile voice ${subscribed ? '' : 'locked'}`} onClick={() => (subscribed ? nav('/app') : setOpen(true))}>
          <span className="tile-icon voice-icon" aria-hidden="true">◉</span>
          <strong>DFRNT Voice</strong>
          <span className="small">{subscribed ? 'Your AI phone assistant' : 'Answer calls with AI'}</span>
          {subscribed ? <Badge tone="green">Active</Badge> : <Badge tone="blue">Upgrade</Badge>}
        </button>
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
          {viewer === 'tenant-admin' || viewer === 'staff' ? (
            <label className="row small" style={{ gap: 8 }}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              I agree to the DFRNT Voice terms and that charges appear on our DFRNT invoice.
            </label>
          ) : null}
          <div className="row">
            <button className="btn" disabled={!agree} onClick={() => { subscribe(); setOpen(false); nav('/app') }}>Start free trial</button>
            <button className="btn outline" onClick={() => setOpen(false)}>Not now</button>
          </div>
          <p className="small muted">Only a tenant admin can upgrade. Others see “Ask your admin”.</p>
        </div>
      </Modal>
    </div>
  )
}
