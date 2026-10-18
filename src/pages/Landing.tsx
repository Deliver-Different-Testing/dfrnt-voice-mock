import { Link } from 'react-router-dom'
import { Badge, Card } from '../components/ui'

const SPEC = 'https://github.com/Deliver-Different-Testing/dfrnt-ops/blob/docs/dfrnt-voice-agent-spec/docs/specs/2026-10-18-dfrnt-voice-agent-spec.md'

const parts: { part: string; state: 'built' | 'proposed'; where: string }[] = [
  { part: 'Tool API: identify, address, quote, list and get jobs, book, update, cancel, handoff', state: 'built', where: 'Integration Manager, GitLab develop (Jacob, MR !150)' },
  { part: 'Settings: master switch, allowed actions, verification, speeds, cutoffs, transfer number', state: 'built', where: 'Integration Manager settings row' },
  { part: 'Tool-call activity log and agent key', state: 'built', where: 'Integration Manager Voice agent tab' },
  { part: 'Persona, greeting, voice, locale, business hours', state: 'proposed', where: 'Spec Group 2' },
  { part: 'Prompt versions with publish and roll back', state: 'proposed', where: 'Spec Group 2' },
  { part: 'Call summaries, transcripts, test call', state: 'proposed', where: 'Spec Groups 1 and 2' },
  { part: 'Telephony onboarding: trunk to DFRNT or a DFRNT number', state: 'proposed', where: 'Spec Group 4' },
  { part: 'Usage and per-minute billing', state: 'proposed', where: 'Spec Groups 2 and 4' },
  { part: 'Voice runtime on the phone line (dfrnt-voice)', state: 'proposed', where: 'Spec Group 1' },
]

export default function Landing() {
  return (
    <div className="stack">
      <div className="hero">
        <Badge tone="blue">Mock · scripted data</Badge>
        <h1 style={{ marginTop: 12 }}>DFRNT Voice</h1>
        <p>
          An AI agent that answers a courier's phone line, identifies the caller, checks jobs, quotes, books, raises
          change requests and hands over to a person when it should. This mock shows what a tenant admin would see in
          Integration Manager, and how a call plays out against the real tool API.
        </p>
        <div className="row" style={{ marginTop: 20, gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn" to="/voice-agent">Open the Voice agent tab</Link>
          <Link className="btn outline" to="/simulator">Try the call simulator</Link>
          <a className="btn ghost" href={SPEC} target="_blank" rel="noreferrer">Read the spec</a>
        </div>
      </div>

      <div className="grid-2">
        <Card title="3CX: Voice agent" lead="Per-tenant controls in Integration Manager.">
          <ul className="small" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
            <li><Link to="/voice-agent/settings">Settings</Link>: what the agent may do, and how it sounds</li>
            <li><Link to="/voice-agent/prompts">Prompt versions</Link>: draft, compare, publish, roll back</li>
            <li><Link to="/voice-agent/activity">Activity</Link>: tool calls and call summaries with transcripts</li>
            <li><Link to="/voice-agent/telephony">Telephony</Link>: connect 3CX or use a DFRNT number</li>
            <li><Link to="/voice-agent/usage">Usage</Link>: minutes, cost and price</li>
          </ul>
        </Card>
        <Card title="Call simulator" lead="Step through scripted calls turn by turn.">
          <p className="small muted" style={{ margin: 0 }}>
            Each step shows what the caller said, which tool the agent called, the Integration Manager response in its
            ok, code, say, data envelope, and what the agent said back. Nine scenarios, including an unknown caller,
            a booking after the cutoff and a caller trying to override the agent's instructions.
          </p>
        </Card>
      </div>

      <Card title="What is mocked and what is built" lead="Everything on these pages is fake data. The tool API and settings already exist; the rest is proposed in the spec.">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Part</th><th>State</th><th>Where</th></tr></thead>
            <tbody>
              {parts.map((p) => (
                <tr key={p.part}>
                  <td>{p.part}</td>
                  <td><Badge tone={p.state === 'built' ? 'green' : 'orange'}>{p.state === 'built' ? 'Built' : 'Proposed'}</Badge></td>
                  <td className="muted">{p.where}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="note">Tenant shown: Urgent Couriers. Client names, numbers and jobs are invented.</p>
    </div>
  )
}
