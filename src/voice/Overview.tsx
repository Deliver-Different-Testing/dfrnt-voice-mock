import { Link } from 'react-router-dom'
import { Badge, Card, Kpi } from '../components/ui'
import { STAGE_LABEL, STAGE_TONE, TENANTS, TRAINING_TOTALS, TEST_SET } from './data'
import { useTenant } from './tenant'

type StepState = 'done' | 'now' | 'todo'
const tone: Record<StepState, 'green' | 'blue' | 'gray'> = { done: 'green', now: 'blue', todo: 'gray' }
const word: Record<StepState, string> = { done: 'Done', now: 'Up next', todo: 'To do' }

export default function Overview() {
  const { tenant } = useTenant()
  const passed = TEST_SET.filter((t) => t.pass).length
  const isUrgent = tenant.id === 5

  const steps: { title: string; text: string; to: string; state: StepState; cta: string }[] = [
    { title: 'Tell Una about your business', text: 'Company name, voice, greeting, hours and who to hand over to.', to: '/app/settings', state: isUrgent ? 'done' : 'now', cta: 'Open settings' },
    { title: 'Upload your calls', text: 'Recordings from your phone system. Una learns what your callers ask for and the place names they use.', to: '/app/training', state: isUrgent ? 'done' : tenant.stage === 'training' ? 'now' : 'todo', cta: 'Upload calls' },
    { title: 'Practise with Una', text: 'Talk to her in the browser as a customer or a driver. Bookings go to a sandbox, never your live job book.', to: '/app/practise', state: isUrgent ? 'done' : 'todo', cta: 'Start practising' },
    { title: 'Connect a number and make test calls', text: 'Get a number or forward from your phone system. Only the numbers you list reach Una until you go live.', to: '/app/number', state: isUrgent ? 'now' : 'todo', cta: 'Set up the number' },
    { title: 'Go live', text: 'Choose which calls Una answers: after hours, when nobody picks up, or all calls.', to: '/app/number', state: 'todo', cta: 'Choose calls' },
  ]

  return (
    <div className="stack">
      <div className="row between">
        <div>
          <h1>DFRNT Voice</h1>
          <p className="muted" style={{ marginTop: 4 }}>Una answers your phone, books and tracks jobs, and helps your drivers. {tenant.name}.</p>
        </div>
        <Badge tone={STAGE_TONE[tenant.stage]}>{STAGE_LABEL[tenant.stage]}{tenant.stage !== 'live' ? ' · not answering real calls' : ''}</Badge>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <Kpi label="Training calls" value={isUrgent ? String(TRAINING_TOTALS.calls) : tenant.stage === 'training' ? '38' : '0'} sub={isUrgent ? `${TRAINING_TOTALS.hours} hours` : undefined} />
        <Kpi label="Una could handle" value={isUrgent ? `${TRAINING_TOTALS.handle.now}%` : '–'} sub={isUrgent ? `${TRAINING_TOTALS.handle.now + TRAINING_TOTALS.handle['with-booking']}% with booking on` : 'after labelling'} />
        <Kpi label="Test calls passed" value={isUrgent ? `${passed} / ${TEST_SET.length}` : '–'} sub="built from your recordings" />
        <Kpi label="Minutes, 30 days" value={String(tenant.minutes30d)} sub={tenant.number ?? 'No number yet'} />
      </div>

      <Card title="Get Una ready" lead="Work down the list. Nothing reaches your customers until the last step.">
        <ol className="setup">
          {steps.map((s, i) => (
            <li key={s.title} className={s.state}>
              <span className="num">{s.state === 'done' ? '✓' : i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row" style={{ gap: 8 }}><strong>{s.title}</strong><Badge tone={tone[s.state]}>{word[s.state]}</Badge></div>
                <p className="small muted" style={{ marginTop: 2 }}>{s.text}</p>
              </div>
              <Link className={`btn small ${s.state === 'now' ? '' : 'outline'}`} to={s.to}>{s.cta}</Link>
            </li>
          ))}
        </ol>
      </Card>

      {isUrgent && (
        <div className="grid-2">
          <Card title="Needs your attention">
            <ul className="small" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
              <li><Link to="/app/practise">2 test calls failing</Link>: driver asks for a number when the job has none; invoice dispute with no accounts email.</li>
              <li><Link to="/app/settings/handoff">Accounts email is empty</Link>. Una can't pass on invoice questions.</li>
              <li><Link to="/app/training/words">3 place names to confirm</Link> from your calls.</li>
              <li><Link to="/app/calls">2 calls flagged</Link> by your test callers.</li>
            </ul>
          </Card>
          <Card title="What Una may do" actions={<Link className="btn ghost small" to="/app/settings/abilities">Change</Link>}>
            <div className="pill-list">
              {['Quote', 'Track', 'Book', 'Change requests', 'Email PODs', 'Driver calls'].map((p) => <Badge key={p} tone="green">{p}</Badge>)}
              {['Cancel', 'Edit jobs'].map((p) => <Badge key={p}>{p} · off</Badge>)}
            </div>
            <p className="small muted" style={{ marginTop: 12 }}>These limits are checked by your DFRNT system on every call, not just by Una.</p>
          </Card>
        </div>
      )}

      <p className="note">Shared service: {TENANTS.length} tenants on DFRNT Voice. Each tenant's settings, calls and recordings are private to that tenant.</p>
    </div>
  )
}
