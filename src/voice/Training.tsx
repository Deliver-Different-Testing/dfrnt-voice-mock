import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Card, Drawer, Tabs } from '../components/ui'
import { HANDLE_LABEL, HANDLE_TONE, INTENTS, KEYTERMS, TRAINING_CALLS, TRAINING_TOTALS, type Handle, type Keyterm, type Processing, type TrainingCall } from './data'

type Tab = 'calls' | 'words' | 'how'
const TABS: { id: Tab; label: string }[] = [
  { id: 'calls', label: 'Calls' },
  { id: 'words', label: 'Words and place names' },
  { id: 'how', label: 'What training does' },
]

const STATUS: Record<Processing, { label: string; tone: 'gray' | 'blue' | 'green' | 'red' }> = {
  uploaded: { label: 'Queued', tone: 'gray' },
  transcribing: { label: 'Transcribing', tone: 'blue' },
  redacting: { label: 'Removing card numbers', tone: 'blue' },
  labelling: { label: 'Labelling', tone: 'blue' },
  done: { label: 'Ready', tone: 'green' },
  failed: { label: 'No speech', tone: 'red' },
}
const PIPELINE: Processing[] = ['uploaded', 'transcribing', 'redacting', 'labelling', 'done']

export default function Training() {
  const { tab } = useParams()
  const nav = useNavigate()
  const current = (TABS.find((t) => t.id === tab)?.id ?? 'calls') as Tab
  return (
    <div className="stack">
      <div>
        <h1>Training</h1>
        <p className="muted" style={{ marginTop: 4 }}>Upload recordings of your calls. Una learns what your callers ask for, how they say your place names, and gets a test call for each kind of request.</p>
      </div>
      <Tabs tabs={TABS} value={current} onChange={(t) => nav(`/app/training/${t}`)} />
      {current === 'calls' && <Calls />}
      {current === 'words' && <Words />}
      {current === 'how' && <How />}
    </div>
  )
}

function Calls() {
  const [rows, setRows] = useState<TrainingCall[]>(TRAINING_CALLS)
  const [drag, setDrag] = useState(false)
  const [consent, setConsent] = useState(true)
  const [open, setOpen] = useState<TrainingCall | null>(null)
  const [filter, setFilter] = useState<'all' | Handle>('all')
  const input = useRef<HTMLInputElement>(null)

  // Walk queued uploads through the pipeline so the mock feels alive.
  useEffect(() => {
    const busy = rows.some((r) => r.status !== 'done' && r.status !== 'failed')
    if (!busy) return
    const t = setTimeout(() => setRows((rs) => rs.map((r) => {
      if (r.status === 'done' || r.status === 'failed') return r
      const next = PIPELINE[PIPELINE.indexOf(r.status) + 1]
      return next === 'done'
        ? { ...r, status: 'done', intent: r.intent || 'Where is my job', summary: r.summary || 'Asks for an ETA on tonight\'s delivery.', include: true }
        : { ...r, status: next }
    })), 1400)
    return () => clearTimeout(t)
  }, [rows])

  const addFiles = (names: string[]) => {
    const now = new Date()
    const when = `Today ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    setRows((rs) => [
      ...names.map((file, i): TrainingCall => ({ id: `u${Date.now()}${i}`, file, when, duration: '1:2' + i, caller: 'customer', intent: '', handle: 'now', status: 'uploaded', include: false, summary: '' })),
      ...rs,
    ])
  }

  const shown = rows.filter((r) => filter === 'all' || r.handle === filter)
  const update = (id: string, patch: Partial<TrainingCall>) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    setOpen((o) => (o && o.id === id ? { ...o, ...patch } : o))
  }

  return (
    <>
      <Card>
        <div
          className={`dropzone ${drag ? 'over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(Array.from(e.dataTransfer.files).map((f) => f.name)) }}
          onClick={() => input.current?.click()}
          role="button"
          tabIndex={0}
        >
          <div className="dz-icon" aria-hidden="true">↑</div>
          <strong>Drop call recordings here, or click to choose</strong>
          <span className="small muted">WAV or MP3, or a ZIP from your phone system's recordings export. Up to 2 GB at a time.</span>
          <input ref={input} type="file" multiple accept=".wav,.mp3,.zip" hidden onChange={(e) => addFiles(Array.from(e.target.files ?? []).map((f) => f.name))} />
        </div>
        <label className="row small" style={{ marginTop: 12, gap: 8 }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          Our callers are told calls are recorded. Card numbers and passwords are removed from transcripts before anyone, including Una, reads them.
        </label>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn outline small" onClick={() => addFiles(['3cx-recordings-oct.zip'])}>Try a sample upload</button>
          <span className="small muted">Or connect your phone system's recordings: <a href="#/app/training/how">3CX, Twilio</a>.</span>
        </div>
      </Card>

      <div className="grid-2">
        <Card title="What your callers ask for" lead={`${TRAINING_TOTALS.calls} calls, ${TRAINING_TOTALS.hours} hours.`}>
          <div className="stack" style={{ gap: 8 }}>
            {TRAINING_TOTALS.intents.map((i) => (
              <div key={i.label} className="hbar">
                <span className="small">{i.label}</span>
                <div className="track"><div className="fill" style={{ width: `${i.pct * 2}%` }} /></div>
                <span className="small mono">{i.pct}%</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="How many Una could take" lead="Labelled from the transcripts against what Una is allowed to do today.">
          <div className="stack-bar" aria-label="Share of calls">
            {(Object.keys(TRAINING_TOTALS.handle) as Handle[]).map((h) => (
              <div key={h} className={`seg ${HANDLE_TONE[h]}`} style={{ width: `${TRAINING_TOTALS.handle[h]}%` }}>{TRAINING_TOTALS.handle[h]}%</div>
            ))}
          </div>
          <div className="stack small" style={{ gap: 6, marginTop: 16 }}>
            {(Object.keys(TRAINING_TOTALS.handle) as Handle[]).map((h) => (
              <div key={h} className="row" style={{ gap: 8 }}><Badge tone={HANDLE_TONE[h]}>{HANDLE_LABEL[h]}</Badge><span className="muted">{h === 'now' ? 'tracking, quotes, PODs, driver problems' : h === 'with-booking' ? 'turn on Book and Change requests in settings' : 'accounts disputes, new business, complaints'}</span></div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Calls" actions={
        <div className="pill-list">
          {(['all', 'now', 'with-booking', 'person'] as const).map((f) => (
            <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : HANDLE_LABEL[f]}</button>
          ))}
        </div>
      }>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Call</th><th>Caller</th><th>Asking for</th><th>Una</th><th>Status</th><th>Use</th></tr></thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className="clickable" onClick={() => r.status === 'done' && setOpen(r)}>
                  <td><div>{r.when}</div><div className="small muted">{r.duration}{r.file.startsWith('[Afterhours') ? ' · after hours' : ''}</div></td>
                  <td className="small">{r.caller === 'driver' ? 'Driver' : r.caller === 'customer' ? 'Customer' : 'Unknown'}</td>
                  <td className="small">{r.intent || <span className="muted">…</span>}</td>
                  <td>{r.status === 'done' ? <Badge tone={HANDLE_TONE[r.handle]}>{HANDLE_LABEL[r.handle]}</Badge> : <span className="muted small">…</span>}</td>
                  <td><Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" aria-label="Use this call" disabled={r.status !== 'done'} checked={r.include} onChange={(e) => update(r.id, { include: e.target.checked })} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted" style={{ marginTop: 12 }}>Showing the latest {shown.length} of {TRAINING_CALLS.length > shown.length ? shown.length : TRAINING_TOTALS.calls}. Untick a call to leave it out of the test set and the summary.</p>
      </Card>

      <Drawer open={!!open} onClose={() => setOpen(null)} title={open ? `Call · ${open.when}` : ''}>
        {open && (
          <div className="stack">
            <div className="player">
              <button className="btn small" aria-label="Play">▶</button>
              <div className="wave" aria-hidden="true">{Array.from({ length: 48 }, (_, i) => <span key={i} style={{ height: `${20 + ((i * 37) % 60)}%` }} />)}</div>
              <span className="small mono">{open.duration}</span>
            </div>
            <p className="small">{open.summary}</p>
            <div className="field">
              <label>Asking for</label>
              <select value={open.intent} onChange={(e) => update(open.id, { intent: e.target.value })}>
                {INTENTS.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Could Una handle it?</label>
              <div className="pill-list">
                {(Object.keys(HANDLE_LABEL) as Handle[]).map((h) => (
                  <button key={h} className={open.handle === h ? 'active' : ''} onClick={() => update(open.id, { handle: h })}>{HANDLE_LABEL[h]}</button>
                ))}
              </div>
            </div>
            <div className="transcript small">
              <p><b className="caller-c">Caller</b> Hi, it's Sam from 214, I'm at the Penrose pickup and they say the stuff's not ready.</p>
              <p><b className="agent-c">Staff</b> No worries Sam, how long did they say?</p>
              <p><b className="caller-c">Caller</b> Twenty minutes maybe. Can you let them know at dispatch?</p>
              <p><b className="agent-c">Staff</b> Yep, I'll put a note on it. Hang tight.</p>
            </div>
            <div className="row">
              <button className="btn small" onClick={() => setOpen(null)}>Save labels</button>
              <a className="btn outline small" href="#/app/practise">Replay this call with Una</a>
            </div>
          </div>
        )}
      </Drawer>
    </>
  )
}

function Words() {
  const [terms, setTerms] = useState<Keyterm[]>(KEYTERMS)
  const [add, setAdd] = useState('')
  return (
    <Card title="Words Una needs to hear right" lead="Place names, products and service names the speech model got wrong in your calls. Confirm what was meant and Una listens for it on every call.">
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Heard as</th><th>Meant</th><th>Calls</th><th></th></tr></thead>
          <tbody>
            {terms.map((t, i) => (
              <tr key={t.heard}>
                <td className="muted">“{t.heard}”</td>
                <td><input className="inline-input" value={t.meant} onChange={(e) => setTerms((ts) => ts.map((x, j) => (j === i ? { ...x, meant: e.target.value } : x)))} /></td>
                <td className="small">{t.count}</td>
                <td>{t.confirmed
                  ? <Badge tone="green">Confirmed</Badge>
                  : <button className="btn small" onClick={() => setTerms((ts) => ts.map((x, j) => (j === i ? { ...x, confirmed: true } : x)))}>Confirm</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row" style={{ marginTop: 16 }}>
        <div className="field" style={{ flex: 1, minWidth: 220 }}>
          <input placeholder="Add a word, e.g. Wairau Valley" value={add} onChange={(e) => setAdd(e.target.value)} />
        </div>
        <button className="btn outline" disabled={!add.trim()} onClick={() => { setTerms((ts) => [...ts, { heard: '(added by you)', meant: add.trim(), count: 0, confirmed: true }]); setAdd('') }}>Add</button>
      </div>
    </Card>
  )
}

function How() {
  return (
    <div className="grid-2">
      <Card title="What training does">
        <ul className="small" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
          <li><b>Finds what your callers ask for</b>, so you can see how many calls Una could take before you switch anything on.</li>
          <li><b>Builds test calls</b> from real requests. Every change to Una's settings reruns them before it reaches a caller.</li>
          <li><b>Learns your words</b>: suburbs, street names, product and service names.</li>
          <li><b>Picks up your phrasing</b>: how your team greets, confirms an address, reads back a price.</li>
        </ul>
      </Card>
      <Card title="What it does not do">
        <ul className="small" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
          <li>Your recordings never train a shared model and are never seen by another tenant.</li>
          <li>Una doesn't copy your staff's voices. She uses the voice you pick in settings.</li>
          <li>Recordings are kept 90 days, then only the redacted transcript stays. Delete any call at any time.</li>
        </ul>
        <h3 style={{ marginTop: 20 }}>Getting recordings out</h3>
        <ul className="small" style={{ margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.8 }}>
          <li><b>3CX</b>: Recordings, select, Download. After-hours calls are under the forwarding queue.</li>
          <li><b>Twilio</b>: connect once and we pull new recordings each night.</li>
          <li><b>Anything else</b>: export WAV or MP3 and drop them above.</li>
        </ul>
      </Card>
    </div>
  )
}
