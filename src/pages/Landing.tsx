import { Link } from 'react-router-dom'
import { Badge, Card } from '../components/ui'

const SPEC = 'https://github.com/Deliver-Different-Testing/dfrnt-ops/blob/docs/dfrnt-voice-agent-spec/docs/specs/2026-10-18-dfrnt-voice-agent-spec.md'

const HANDOVER = 'https://github.com/Deliver-Different-Testing/integration-manager/blob/feat/voice-agent-setup-phone-systems/docs/voice-agent-setup.md'

type State = 'built' | 'future' | 'proposed'
const parts: { part: string; state: State; where: string }[] = [
  { part: 'Tool API: identify, address, quote, list and get jobs, book, update, cancel, handoff', state: 'built', where: 'Integration Manager, GitLab develop (Jacob, MR !150)' },
  { part: 'Settings: master switch, allowed actions, verification, services, cutoffs, transfer number', state: 'built', where: 'Integration Manager settings row' },
  { part: 'Voice agent as its own integration; 3CX page is Softphone only with a link across (P1)', state: 'built', where: 'IM branch feat/voice-agent-setup-phone-systems, 20 Oct' },
  { part: 'How it sounds: company name, greeting with preview, personality, accent, voice by accent (P2)', state: 'built', where: 'IM branch feat/voice-agent-setup-phone-systems, 20 Oct' },
  { part: 'Phone system: 3CX and other SIP trunks, Twilio and Telnyx set up for you (P3, P4, P6)', state: 'built', where: 'IM branch feat/voice-agent-setup-phone-systems, 20 Oct. Unit-tested, no live call yet' },
  { part: 'Call forwarding presets: choice saved, "Number coming soon" (P5)', state: 'built', where: 'IM branch feat/voice-agent-setup-phone-systems, 20 Oct' },
  { part: 'A DFRNT number to forward calls to (N1)', state: 'future', where: 'Waiting on the number provider decision' },
  { part: 'Voice samples: "Play a sample" (N2)', state: 'future', where: 'Not built' },
  { part: 'Test call from Integration Manager', state: 'future', where: 'Not built. Test by ringing the connected number' },
  { part: 'Usage pricing and per-minute billing', state: 'proposed', where: 'Spec Groups 2 and 4' },
]

const stateBadge: Record<State, { tone: 'green' | 'orange' | 'gray'; label: string }> = {
  built: { tone: 'green', label: 'Built' },
  future: { tone: 'orange', label: 'Future' },
  proposed: { tone: 'gray', label: 'Proposed' },
}

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
        <div className="alert blue small" style={{ marginTop: 16 }}>
          <strong>Updated 20 Oct 2026 to match what was built.</strong> The Voice agent settings, phone system and 3CX
          pages now follow the Integration Manager build (branch feat/voice-agent-setup-phone-systems): same fields,
          presets, steps and wording. Still future: a DFRNT number for the forwarding presets (N1, shown as "Number
          coming soon") and voice samples (N2).
        </div>
        <div className="row" style={{ marginTop: 20, gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn" to="/app">Open the DFRNT Voice app</Link><Link className="btn outline" to="/voice-agent">Open the Voice agent tab</Link>
          <Link className="btn outline" to="/simulator">Try the call simulator</Link>
          <Link className="btn outline" to="/3cx">See the 3CX page</Link>
          <a className="btn ghost" href={SPEC} target="_blank" rel="noreferrer">Read the spec</a>
          <a className="btn ghost" href={HANDOVER} target="_blank" rel="noreferrer">Read the build handover</a>
        </div>
      </div>

      <div className="grid-2">
        <Card title="Voice agent" lead="Per-tenant controls in Integration Manager.">
          <ul className="small" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
            <li><Link to="/voice-agent/settings">Settings</Link>: what the agent may do, how it sounds (company name, greeting, accent, voice) and when it answers</li>
            <li><Link to="/voice-agent/prompts">Prompt versions</Link>: draft, compare, publish, roll back</li>
            <li><Link to="/voice-agent/activity">Activity</Link>: tool calls and call summaries with transcripts</li>
            <li><Link to="/voice-agent/telephony">Phone system</Link>: pick 3CX, Twilio, Telnyx, Teams and others, grouped by how they connect, with the steps filled in</li>
            <li><Link to="/3cx">3CX</Link>: caller ID and call logging only, with a link to the Voice agent</li>
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

      <Card title="What is mocked and what is built" lead="Everything on these pages is fake data. Prompt versions, Activity and Usage are still the earlier design and have not been re-checked against the build.">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Part</th><th>State</th><th>Where</th></tr></thead>
            <tbody>
              {parts.map((p) => (
                <tr key={p.part}>
                  <td>{p.part}</td>
                  <td><Badge tone={stateBadge[p.state].tone}>{stateBadge[p.state].label}</Badge></td>
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
