import { useState } from 'react'
import { Badge, Card, Drawer } from '../components/ui'
import { CALL_LOG, type CallLog } from './data'

const OUTCOME_TONE: Record<CallLog['outcome'], 'green' | 'blue' | 'orange' | 'gray'> = {
  Booked: 'green', Answered: 'green', 'Dispatch task': 'blue', 'Emailed accounts': 'blue', Transferred: 'orange', 'Hung up': 'gray',
}

export default function Calls() {
  const [open, setOpen] = useState<CallLog | null>(null)
  return (
    <div className="stack">
      <div>
        <h1>Calls</h1>
        <p className="muted" style={{ marginTop: 4 }}>Every call Una took, with what she did. Flag a call to review it, or turn it into a test call.</p>
      </div>
      <Card>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>When</th><th>Caller</th><th>Length</th><th>Outcome</th><th>Job</th><th></th></tr></thead>
            <tbody>
              {CALL_LOG.map((c) => (
                <tr key={c.id} className="clickable" onClick={() => setOpen(c)}>
                  <td className="small">{c.when}</td>
                  <td><div className="small">{c.who}</div><div className="small muted">{c.from}</div></td>
                  <td className="small">{c.duration}</td>
                  <td><Badge tone={OUTCOME_TONE[c.outcome]}>{c.outcome}</Badge></td>
                  <td className="small mono">{c.job ?? '–'}</td>
                  <td>{c.flagged && <Badge tone="orange">Flagged</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Drawer open={!!open} onClose={() => setOpen(null)} title={open ? `${open.who} · ${open.when}` : ''}>
        {open && (
          <div className="stack">
            <div className="player">
              <button className="btn small" aria-label="Play">▶</button>
              <div className="wave" aria-hidden="true">{Array.from({ length: 48 }, (_, i) => <span key={i} style={{ height: `${20 + ((i * 53) % 60)}%` }} />)}</div>
              <span className="small mono">{open.duration}</span>
            </div>
            {open.flagged && <div className="alert orange small">Flagged by the caller: “She couldn't give me the customer's number.”</div>}
            <div className="transcript small">
              <p><b className="agent-c">Una</b> Hi Marcus, is this about job E10440?</p>
              <p><b className="caller-c">Caller</b> Yeah, I'm at the pickup and they're not ready. Have you got a number for them?</p>
              <p className="tool-line">report_issue · not_ready → dispatch task</p>
              <p className="tool-line">get_job_contacts · pickup phone empty</p>
              <p><b className="agent-c">Una</b> I've let dispatch know. I don't have a number for the pickup, sorry.</p>
            </div>
            <div className="row">
              <button className="btn small">Add to test calls</button>
              <a className="btn outline small" href="#/app/practise">Practise this call</a>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
