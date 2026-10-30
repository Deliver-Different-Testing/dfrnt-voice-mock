import { useState } from 'react'
import { Badge, Card, CopyButton, Field } from '../components/ui'
import { TEST_SET } from './data'
import { useTenant } from './tenant'

type How = 'new' | 'forward' | 'sip'
type Which = 'test' | 'after-hours' | 'overflow' | 'all'

const WHICH: { id: Which; label: string; hint: string }[] = [
  { id: 'test', label: 'Test callers only', hint: 'Only the numbers listed below reach Una. Everyone else gets your normal line.' },
  { id: 'after-hours', label: 'After hours', hint: 'Outside office hours, instead of your after-hours service.' },
  { id: 'overflow', label: 'When nobody answers', hint: 'If your team hasn\'t picked up after the set number of seconds.' },
  { id: 'all', label: 'All calls', hint: 'Una answers first and puts callers through when needed.' },
]

export default function Number() {
  const { tenant } = useTenant()
  const [how, setHow] = useState<How>('new')
  const [which, setWhich] = useState<Which>('test')
  const [testers, setTesters] = useState(['+64 21 555 0101 · Steve', '+64 27 555 0177 · Marcus'])
  const [add, setAdd] = useState('')
  const connected = tenant.number
  const passed = TEST_SET.filter((t) => t.pass).length
  const ready = passed / TEST_SET.length >= 0.85

  const request = `Hi,

We're adding DFRNT Voice, an automated assistant that answers some of our calls. Could you please set up the following on our phone system:

1. A destination called "Voice agent" that forwards to ${connected ?? '+64 9 xxx xxxx'}, passing the original caller ID through.
2. For testing: a route only our test numbers use (an internal extension or a hidden menu option).
3. A way to switch which calls go there later (after hours instead of our current after-hours service, or when nobody answers), ideally one we can change ourselves.
4. Make sure transfers back to 09 307 3555 (office) and 09 307 3550 (dispatch) ring our team and don't loop back to the voice agent.
5. Keep recording these calls as now.

Thanks`

  return (
    <div className="stack">
      <div>
        <h1>Phone number</h1>
        <p className="muted" style={{ marginTop: 4 }}>How calls reach Una, and which calls she answers.</p>
      </div>

      <Card title="1. How calls reach Una">
        <div className="grid-3">
          {([
            ['new', 'Get a DFRNT number', 'We buy a local number for you. Point your calls at it, or give it out.', 'Fastest'],
            ['forward', 'Forward from your phone system', '3CX, Teams, RingCentral, Zoom, a mobile. We write the request for your provider.', 'Most common'],
            ['sip', 'SIP trunk', 'For phone systems that can add a trunk. Keeps the call on your system.', 'Advanced'],
          ] as const).map(([v, l, h, tag]) => (
            <button key={v} className={`choice ${how === v ? 'active' : ''}`} onClick={() => setHow(v)}>
              <div className="row between"><strong>{l}</strong><Badge>{tag}</Badge></div>
              <span className="small muted">{h}</span>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          {connected ? (
            <div className="alert green small row between">
              <span>Calls to <b>{connected}</b> reach Una. Connected 27 Oct.</span>
              <button className="btn outline small">Call me now</button>
            </div>
          ) : how === 'new' ? (
            <div className="row">
              <Field label="Area"><select defaultValue="09"><option value="09">Auckland (09)</option><option value="04">Wellington (04)</option><option value="03">Christchurch (03)</option></select></Field>
              <button className="btn" style={{ alignSelf: 'flex-end' }}>Get a number · NZ$6/month</button>
            </div>
          ) : (
            <p className="small muted">Pick your phone system on the next screen.</p>
          )}
        </div>
      </Card>

      {how === 'forward' && (
        <Card title="Ask your phone provider" lead="Send this to whoever looks after your phone system. We filled in your numbers." actions={<CopyButton text={request} />}>
          <div className="field"><select defaultValue="3cx"><option value="3cx">3CX</option><option>Microsoft Teams</option><option>RingCentral</option><option>Zoom Phone</option><option>Mobile</option></select></div>
          <pre className="request">{request}</pre>
        </Card>
      )}

      <Card title="2. Which calls Una answers">
        <div className="stack" style={{ gap: 8 }}>
          {WHICH.map((w) => {
            const locked = w.id !== 'test' && !ready
            return (
              <label key={w.id} className={`voice-opt ${which === w.id ? 'active' : ''} ${locked ? 'locked' : ''}`}>
                <input type="radio" checked={which === w.id} disabled={locked} onChange={() => setWhich(w.id)} />
                <span style={{ flex: 1 }}><strong className="small">{w.label}</strong><br /><span className="small muted">{w.hint}</span></span>
                {locked && <Badge>After test calls</Badge>}
              </label>
            )
          })}
        </div>
        {which === 'overflow' && <Field label="Ring your team for"><select defaultValue="20"><option>10 seconds</option><option value="20">20 seconds</option><option>30 seconds</option></select></Field>}
      </Card>

      <div className="grid-2">
        <Card title="Test callers" lead="While Una is on test, only these numbers reach her.">
          <div className="stack" style={{ gap: 6 }}>
            {testers.map((t) => (
              <div key={t} className="row between small test-row">
                <span>{t}</span>
                <button className="btn ghost small" onClick={() => setTesters((ts) => ts.filter((x) => x !== t))}>Remove</button>
              </div>
            ))}
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <div className="field" style={{ flex: 1, minWidth: 180 }}><input placeholder="+64 21 … · name" value={add} onChange={(e) => setAdd(e.target.value)} /></div>
            <button className="btn outline" disabled={!add.trim()} onClick={() => { setTesters((ts) => [...ts, add.trim()]); setAdd('') }}>Add</button>
          </div>
        </Card>
        <Card title="Before going live">
          <ul className="checklist">
            <li className={ready ? 'ok' : ''}>Test calls passing: {passed} of {TEST_SET.length} (85% needed)</li>
            <li className="ok">Office and dispatch transfer numbers tested</li>
            <li className="">Accounts email set</li>
            <li className="ok">10 calls from test callers, 2 flagged and reviewed</li>
            <li className="">Production connection (now on staging)</li>
          </ul>
          <button className="btn" style={{ marginTop: 12 }} disabled>Go live</button>
        </Card>
      </div>
    </div>
  )
}
