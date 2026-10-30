import { useNavigate } from 'react-router-dom'
import { Badge, Card } from '../components/ui'
import { STAGE_LABEL, STAGE_TONE, TENANTS } from './data'
import { useTenant } from './tenant'

export default function Tenants() {
  const { setTenantId, viewer } = useTenant()
  const nav = useNavigate()
  if (viewer !== 'staff') return <Card title="Not available">Only DFRNT staff can see other tenants.</Card>
  return (
    <div className="stack">
      <div>
        <h1>Tenants</h1>
        <p className="muted" style={{ marginTop: 4 }}>DFRNT staff only. Tenants with DFRNT Voice switched on in Master Controller. Open one to set it up or support it.</p>
      </div>
      <Card>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Tenant</th><th>Stage</th><th>Number</th><th>Answering</th><th>Test calls</th><th>Minutes, 30 days</th></tr></thead>
            <tbody>
              {TENANTS.map((t) => (
                <tr key={t.id} className="clickable" onClick={() => { setTenantId(t.id); nav('/app') }}>
                  <td><strong className="small">{t.name}</strong><div className="small muted">{t.region} · tenant {t.id}</div></td>
                  <td><Badge tone={STAGE_TONE[t.stage]}>{STAGE_LABEL[t.stage]}</Badge></td>
                  <td className="small">{t.number ?? '–'}</td>
                  <td className="small">{t.routing}</td>
                  <td className="small">{t.readiness == null ? '–' : `${t.readiness}%`}</td>
                  <td className="small">{t.minutes30d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Shared across tenants">
        <ul className="small" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
          <li>The voice service, speech, voices and the base way Una handles a call.</li>
          <li>Built-in test calls (cutoffs, rule-breaking callers, unknown callers).</li>
          <li>Billing: minutes go to Master Controller billing each night.</li>
        </ul>
        <p className="small muted" style={{ marginTop: 8 }}>Everything else (settings, recordings, words, rules, calls, numbers) belongs to one tenant.</p>
      </Card>
    </div>
  )
}
