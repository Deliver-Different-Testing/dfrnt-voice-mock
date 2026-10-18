import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Card } from '../components/ui'
import { scenarios, stateAfter, type Step } from '../data/scenarios'

export default function Simulator() {
  const { scenario } = useParams()
  const nav = useNavigate()
  const sc = scenarios.find((s) => s.id === scenario) ?? scenarios[0]
  const [shown, setShown] = useState(1)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setShown(1) }, [sc.id])
  useEffect(() => { if (shown > 1) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [shown])

  const visible = sc.steps.slice(0, shown)
  const st = stateAfter(visible)
  const done = shown >= sc.steps.length

  return (
    <div className="stack">
      <div>
        <h1>Call simulator</h1>
        <p className="muted" style={{ marginTop: 4 }}>Scripted calls against the real tool API shape. Nothing here calls a server.</p>
      </div>
      <div className="sim-layout">
        <div className="scenario-list" role="list">
          {scenarios.map((s) => (
            <button key={s.id} className={s.id === sc.id ? 'active' : ''} onClick={() => nav(`/simulator/${s.id}`)}>
              {s.title}<span>{s.blurb}</span>
            </button>
          ))}
        </div>
        <div className="stack">
          <Card>
            <div className="row between">
              <div className="state-strip">
                <Badge tone={st.identified ? 'green' : 'gray'}>{st.identified ? 'Caller identified' : 'Caller not identified'}</Badge>
                <Badge tone={st.session ? 'green' : 'gray'}>{st.session ? 'Session active' : 'No session'}</Badge>
                <Badge tone={st.transferred ? 'blue' : 'gray'}>{st.transferred ? 'Transferred' : 'With the agent'}</Badge>
                <Badge>{st.tools.length} tool{st.tools.length === 1 ? '' : 's'} used</Badge>
              </div>
              <span className="small muted">Step {shown} of {sc.steps.length}</span>
            </div>
          </Card>
          <Card>
            {visible.map((s, i) => <StepView key={i} step={s} />)}
            <div ref={endRef} />
            <div className="row" style={{ marginTop: 16 }}>
              <button className="btn" disabled={done} onClick={() => setShown((n) => n + 1)}>Next step</button>
              <button className="btn outline" disabled={done} onClick={() => setShown(sc.steps.length)}>Show whole call</button>
              <button className="btn outline" disabled={shown === 1} onClick={() => setShown(1)}>Restart</button>
              {done && <span className="small muted">End of call.</span>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StepView({ step }: { step: Step }) {
  if (step.kind === 'tool') {
    const r = step.response
    return (
      <div className="turn">
        <div className="who tool">Tool call</div>
        <div className="toolcall">
          <div className="head">
            <strong>{step.tool}</strong>
            <span className="kbd">{step.method} {step.path}</span>
          </div>
          {step.request && <pre>{JSON.stringify(step.request, null, 2)}</pre>}
          <div className="resp">
            <div className="head">
              <span>Integration Manager</span>
              <Badge tone={r.ok ? 'green' : r.code === 'not_allowed' || r.code === 'not_verified' ? 'red' : 'orange'}>{r.ok ? 'ok' : r.code}</Badge>
            </div>
            <pre>{JSON.stringify({ ok: r.ok, code: r.code ?? null, say: r.say, data: r.data ?? null }, null, 2)}</pre>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="turn">
      <div className={`who ${step.kind}`}>{step.kind === 'caller' ? 'Caller' : 'Agent says'}</div>
      <div><span className={`bubble ${step.kind}`}>{step.text}</span></div>
    </div>
  )
}
