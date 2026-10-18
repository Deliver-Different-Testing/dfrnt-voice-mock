import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Card, CopyButton, Drawer, Field, Kpi, Modal, Switch, Tabs } from '../components/ui'
import {
  actions, calls, defaultSettings, pricing, promptVersions as seedPrompts, speeds, telephony,
  toolSchemaSummary, usageMinutes, voices, type CallRow, type PromptVersion, type Settings,
} from '../data/mock'

type TabId = 'settings' | 'prompts' | 'activity' | 'telephony' | 'usage'
const TABS: { id: TabId; label: string }[] = [
  { id: 'settings', label: 'Settings' },
  { id: 'prompts', label: 'Prompt versions' },
  { id: 'activity', label: 'Activity' },
  { id: 'telephony', label: 'Telephony' },
  { id: 'usage', label: 'Usage' },
]

function Proposed() {
  return <Badge tone="orange">Proposed</Badge>
}

export default function VoiceAgent() {
  const { tab } = useParams()
  const nav = useNavigate()
  const current: TabId = TABS.some((t) => t.id === tab) ? (tab as TabId) : 'settings'
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [testOpen, setTestOpen] = useState(false)

  return (
    <div className="stack">
      <div>
        <div className="small muted">Integrations / 3CX</div>
        <h1 style={{ marginTop: 4 }}>3CX</h1>
        <Tabs tabs={[{ id: 'softphone', label: 'Softphone' }, { id: 'voice', label: 'Voice agent' }]} value="voice" onChange={() => {}} />
      </div>

      <StatusCard settings={settings} onToggle={(v) => setSettings({ ...settings, enabled: v })} onTestCall={() => setTestOpen(true)} />

      <Tabs tabs={TABS} value={current} onChange={(t) => nav(`/voice-agent/${t}`)} />

      {current === 'settings' && <SettingsSection settings={settings} onChange={setSettings} />}
      {current === 'prompts' && <PromptsSection />}
      {current === 'activity' && <ActivitySection />}
      {current === 'telephony' && <TelephonySection />}
      {current === 'usage' && <UsageSection />}

      <TestCallModal open={testOpen} onClose={() => setTestOpen(false)} greeting={settings.greeting} />
    </div>
  )
}

function StatusCard({ settings, onToggle, onTestCall }: { settings: Settings; onToggle: (v: boolean) => void; onTestCall: () => void }) {
  return (
    <Card>
      <div className="grid-3">
        <Kpi label="Agent key" value="Connected" sub="Key id vak_uc_51f2 · created 7 Oct" />
        <Kpi label="Agent" value={settings.enabled ? 'On' : 'Off'} sub={settings.enabled ? 'Answering calls routed to it' : 'Every call goes to the transfer number'} />
        <Kpi label="Last call" value="16:40" sub="Fri 17 Oct · transferred" />
      </div>
      <div className="row between" style={{ marginTop: 16 }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <Switch on={settings.enabled} onChange={onToggle} label="Answer calls with the voice agent" hint="Handoff always works, even when this is off." />
        </div>
        <div className="row">
          <button className="btn outline" onClick={onTestCall}>Place a test call</button>
          <button className="btn outline">Download tool definitions</button>
        </div>
      </div>
    </Card>
  )
}

function SettingsSection({ settings, onChange }: { settings: Settings; onChange: (s: Settings) => void }) {
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => onChange({ ...settings, [k]: v })
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const [saved, setSaved] = useState(false)
  return (
    <div className="stack">
      <div className="grid-2">
        <Card title="What the agent may do" lead="Writes are off until you turn them on. Tools the agent can't use return not_allowed and it hands over.">
          <div className="stack">
            <Switch on={settings.allowLookup} onChange={(v) => set('allowLookup', v)} label="Look up jobs" hint="list_jobs and get_job, for the caller's own account only" />
            <Switch on={settings.allowQuote} onChange={(v) => set('allowQuote', v)} label="Give prices" hint="get_quote, through the rate engine as the caller's client" />
            <Switch on={settings.allowBook} onChange={(v) => set('allowBook', v)} label="Book jobs" hint="book_job. Retries on the same call never book twice." />
            <Switch on={settings.allowUpdate && settings.allowChangeRequest} onChange={(v) => onChange({ ...settings, allowUpdate: v, allowChangeRequest: v })} label="Ask dispatch for changes" hint="update_job raises a change request. It never edits the job." />
            <Switch on={settings.allowCancel} onChange={(v) => set('allowCancel', v)} label="Cancel jobs" hint="cancel_job, only inside the cancel cutoff" />
          </div>
        </Card>
        <Card title="Checks and limits">
          <div className="stack">
            <Field label="How callers are checked">
              <select value={settings.verificationMode} onChange={(e) => set('verificationMode', e.target.value as Settings['verificationMode'])}>
                <option value="CallerIdOnly">Caller ID only</option>
                <option value="CallerIdPlusAccountCode">Caller ID and account code</option>
                <option value="CallerIdPlusJobNumber">Caller ID and job number</option>
              </select>
            </Field>
            <Field label="Services the agent may quote and book">
              <div className="pill-list">
                {speeds.map((s) => {
                  const on = settings.allowedSpeedIds.includes(s.id)
                  return (
                    <button key={s.id} type="button" className={on ? 'active' : ''} onClick={() => set('allowedSpeedIds', on ? settings.allowedSpeedIds.filter((x) => x !== s.id) : [...settings.allowedSpeedIds, s.id])}>
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </Field>
            <Field label="Default service">
              <select value={settings.defaultSpeedId ?? ''} onChange={(e) => set('defaultSpeedId', e.target.value ? Number(e.target.value) : null)}>
                <option value="">None</option>
                {speeds.filter((s) => settings.allowedSpeedIds.includes(s.id)).map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <div className="grid-2" style={{ gap: 12 }}>
              <Field label="Same-day booking cutoff" hint="After this, same-day bookings go to a person">
                <input type="time" value={settings.bookingCutoffLocalTime ?? ''} onChange={(e) => set('bookingCutoffLocalTime', e.target.value || null)} />
              </Field>
              <Field label="Transfer to" hint="Number or queue for handoff">
                <input value={settings.handoffNumber ?? ''} onChange={(e) => set('handoffNumber', e.target.value || null)} />
              </Field>
            </div>
            <Field label="Cancel allowed while the job is" hint="Default: no driver assigned and not yet processed">
              <input value={settings.cancelCutoffStatuses} onChange={(e) => set('cancelCutoffStatuses', e.target.value)} />
            </Field>
          </div>
        </Card>
      </div>

      <Card title="How the agent sounds" actions={<Proposed />} lead="Read by the voice runtime at the start of every call.">
        <div className="grid-2">
          <div className="stack">
            <Field label="Persona"><input value={settings.persona} onChange={(e) => set('persona', e.target.value)} /></Field>
            <Field label="Greeting" hint="First thing the caller hears">
              <textarea style={{ minHeight: 90, fontFamily: 'inherit', fontSize: 14 }} value={settings.greeting} onChange={(e) => set('greeting', e.target.value)} />
            </Field>
            <Field label="Language">
              <select value={settings.locale} onChange={(e) => set('locale', e.target.value as Settings['locale'])}>
                <option value="en-NZ">English (New Zealand)</option>
                <option value="en-AU">English (Australia)</option>
                <option value="en-US">English (United States)</option>
              </select>
            </Field>
          </div>
          <Field label="Voice">
            <div className="scenario-list">
              {voices.map((v) => (
                <button key={v.id} type="button" className={settings.voiceId === v.id ? 'active' : ''} onClick={() => set('voiceId', v.id)}>
                  {v.label}<span>{v.note}</span>
                </button>
              ))}
            </div>
          </Field>
        </div>
      </Card>

      <Card title="Business hours" actions={<Proposed />} lead="Outside these hours the agent takes a message or transfers straight away.">
        <div className="stack">
          <div className="pill-list">
            {days.map((d, i) => (
              <button key={d} type="button" className={settings.hoursDays[i] ? 'active' : ''} onClick={() => set('hoursDays', settings.hoursDays.map((x, j) => (j === i ? !x : x)))}>{d}</button>
            ))}
          </div>
          <div className="grid-3">
            <Field label="Opens"><input type="time" value={settings.hoursStart} onChange={(e) => set('hoursStart', e.target.value)} /></Field>
            <Field label="Closes"><input type="time" value={settings.hoursEnd} onChange={(e) => set('hoursEnd', e.target.value)} /></Field>
            <Field label="Outside hours">
              <select value={settings.outsideHours} onChange={(e) => set('outsideHours', e.target.value as Settings['outsideHours'])}>
                <option value="transfer">Transfer to a person</option>
                <option value="message">Take a message</option>
              </select>
            </Field>
          </div>
        </div>
      </Card>

      <div className="row">
        <button className="btn" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 2500) }}>Save settings</button>
        {saved && <span className="small muted">Saved. The next call uses these settings.</span>}
      </div>
    </div>
  )
}

function diffLines(a: string, b: string) {
  const al = a.split('\n')
  const bl = b.split('\n')
  const aset = new Set(al)
  const bset = new Set(bl)
  return {
    left: al.map((l) => ({ text: l, kind: bset.has(l) ? 'same' : 'del' })),
    right: bl.map((l) => ({ text: l, kind: aset.has(l) ? 'same' : 'add' })),
  }
}

function PromptsSection() {
  const [versions, setVersions] = useState<PromptVersion[]>(seedPrompts)
  const [selected, setSelected] = useState<number>(seedPrompts[0].id)
  const [compareA, setCompareA] = useState<number>(seedPrompts[1].id)
  const [compareB, setCompareB] = useState<number>(seedPrompts[0].id)
  const sel = versions.find((v) => v.id === selected)!
  const published = versions.find((v) => v.publishedAt)
  const a = versions.find((v) => v.id === compareA)!
  const b = versions.find((v) => v.id === compareB)!
  const d = useMemo(() => diffLines(a.body, b.body), [a.body, b.body])

  const publish = (id: number) => {
    setVersions((vs) => vs.map((v) => ({ ...v, publishedAt: v.id === id ? '2026-10-18 just now' : null, label: v.id === id ? v.label.replace(' draft', '') : v.label })))
  }
  const newDraft = () => {
    const id = Math.max(...versions.map((v) => v.id)) + 1
    const base = published ?? versions[0]
    setVersions([{ id, label: `v${id} draft`, createdBy: 'You', createdAt: '2026-10-18 just now', publishedAt: null, body: base.body }, ...versions])
    setSelected(id)
  }

  return (
    <div className="stack">
      <Card title="Prompt versions" actions={<div className="row"><Proposed /><button className="btn small" onClick={newDraft}>New draft</button></div>} lead="The runtime reads the published version. Tool permissions are set in Settings, not here: a prompt can make the agent more careful, never less.">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Version</th><th>By</th><th>Created</th><th>State</th><th /></tr></thead>
            <tbody>
              {versions.map((v) => (
                <tr key={v.id} className="clickable" onClick={() => setSelected(v.id)} style={v.id === selected ? { outline: '2px solid var(--border)' } : undefined}>
                  <td><strong>{v.label}</strong></td>
                  <td>{v.createdBy}</td>
                  <td className="muted">{v.createdAt}</td>
                  <td>{v.publishedAt ? <Badge tone="green">Published</Badge> : <Badge>Not published</Badge>}</td>
                  <td style={{ textAlign: 'right' }}>
                    {!v.publishedAt && (
                      <button className="btn outline small" onClick={(e) => { e.stopPropagation(); publish(v.id) }}>
                        {published && v.id < published.id ? 'Roll back to this' : 'Publish'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title={`Edit ${sel.label}`} lead={sel.publishedAt ? 'Published versions are read only. Start a new draft to change it.' : 'Drafts are saved as you type and do nothing until published.'}>
        <Field label="Prompt">
          <textarea
            readOnly={!!sel.publishedAt}
            value={sel.body}
            onChange={(e) => setVersions((vs) => vs.map((v) => (v.id === sel.id ? { ...v, body: e.target.value } : v)))}
          />
        </Field>
      </Card>

      <Card title="Compare versions">
        <div className="row" style={{ marginBottom: 12 }}>
          <select value={compareA} onChange={(e) => setCompareA(Number(e.target.value))} aria-label="Older version">
            {versions.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
          <span className="muted">compared with</span>
          <select value={compareB} onChange={(e) => setCompareB(Number(e.target.value))} aria-label="Newer version">
            {versions.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
        </div>
        <div className="diff">
          <pre>{d.left.map((l, i) => <div key={i} className={`line ${l.kind}`}>{l.text || ' '}</div>)}</pre>
          <pre>{d.right.map((l, i) => <div key={i} className={`line ${l.kind}`}>{l.text || ' '}</div>)}</pre>
        </div>
      </Card>
    </div>
  )
}

const codeTone = (c: string) => (c === 'ok' ? 'green' : c === 'not_allowed' || c === 'not_verified' ? 'red' : 'orange') as 'green' | 'red' | 'orange'
const outcomeTone = (o: CallRow['outcome']) => (o === 'contained' ? 'green' : o === 'transferred' ? 'blue' : o === 'message' ? 'orange' : 'gray') as 'green' | 'blue' | 'orange' | 'gray'
const fmtDur = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

function ActivitySection() {
  const [tab, setTab] = useState<'calls' | 'tools'>('calls')
  const [open, setOpen] = useState<CallRow | null>(null)
  return (
    <Card>
      <Tabs tabs={[{ id: 'calls', label: 'Calls' }, { id: 'tools', label: 'Tool calls' }]} value={tab} onChange={setTab} />
      {tab === 'calls' ? (
        <>
          <div className="row between" style={{ marginBottom: 12 }}>
            <span className="small muted">One row per call, posted by the voice runtime at hang-up. Select a row for the transcript.</span>
            <Proposed />
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Started</th><th>Length</th><th>Outcome</th><th>Client</th><th>Intents</th><th>Cost</th></tr></thead>
              <tbody>
                {calls.map((c) => (
                  <tr key={c.id} className="clickable" onClick={() => setOpen(c)}>
                    <td>{c.startedAt}</td>
                    <td>{fmtDur(c.durationSec)}</td>
                    <td><Badge tone={outcomeTone(c.outcome)}>{c.outcome}</Badge></td>
                    <td>{c.client}</td>
                    <td className="muted">{c.intents.join(', ') || '—'}</td>
                    <td>US${c.costUsd.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <p className="small muted" style={{ marginTop: 0 }}>Every tool call the agent made, newest first. Request and response bodies are not shown here.</p>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Time</th><th>Call</th><th>Tool</th><th>Client</th><th>Job</th><th>Result</th></tr></thead>
              <tbody>
                {actions.map((a) => (
                  <tr key={a.id}>
                    <td>{a.at}</td>
                    <td><span className="kbd">{a.callId}</span></td>
                    <td><span className="kbd">{a.tool}</span></td>
                    <td>{a.client}</td>
                    <td>{a.job ?? '—'}</td>
                    <td><Badge tone={codeTone(a.code)}>{a.code}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <Drawer open={!!open} onClose={() => setOpen(null)} title={open ? `Call ${open.id}` : ''}>
        {open && (
          <div className="stack">
            <div className="row">
              <Badge tone={outcomeTone(open.outcome)}>{open.outcome}</Badge>
              <span className="small muted">{open.startedAt} · {fmtDur(open.durationSec)} · US${open.costUsd.toFixed(2)}</span>
            </div>
            <div className="row">
              <button className="btn outline small">Play recording</button>
              <span className="note">Recordings are kept 90 days in the tenant's region.</span>
            </div>
            <div>
              {open.transcript.map((t, i) => (
                <div key={i} className="turn">
                  <div className={`who ${t.who}`}>{t.who === 'caller' ? 'Caller' : 'Agent'}</div>
                  <div><span className={`bubble ${t.who}`}>{t.text}</span></div>
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ margin: '8px 0' }}>Tool calls on this call</h4>
              {actions.filter((a) => a.callId === open.id).reverse().map((a) => (
                <div key={a.id} className="row small" style={{ padding: '4px 0' }}>
                  <span className="kbd">{a.tool}</span><Badge tone={codeTone(a.code)}>{a.code}</Badge><span className="muted">{a.at.slice(11)}</span>
                </div>
              ))}
              {actions.every((a) => a.callId !== open.id) && <span className="small muted">None</span>}
            </div>
          </div>
        )}
      </Drawer>
    </Card>
  )
}

function TelephonySection() {
  const [path, setPath] = useState<'trunk' | 'number'>('trunk')
  const [revealed, setRevealed] = useState(false)
  const [number, setNumber] = useState(telephony.numbers[0])
  return (
    <div className="stack">
      <Card title="How calls reach the agent" actions={<Proposed />} lead="Pick one. Both send calls to the same agent with the same settings.">
        <div className="pill-list">
          <button type="button" className={path === 'trunk' ? 'active' : ''} onClick={() => setPath('trunk')}>Trunk from your phone system</button>
          <button type="button" className={path === 'number' ? 'active' : ''} onClick={() => setPath('number')}>Use a DFRNT number</button>
        </div>
      </Card>

      {path === 'trunk' ? (
        <div className="grid-2">
          <Card title="SIP trunk details" lead="Add these as a generic SIP trunk in your phone system.">
            <div className="secret">
              <div className="kv"><span className="small muted" style={{ width: 90 }}>Domain</span><code>{telephony.sipDomain}</code><CopyButton text={telephony.sipDomain} /></div>
              <div className="kv"><span className="small muted" style={{ width: 90 }}>Username</span><code>{telephony.sipUsername}</code><CopyButton text={telephony.sipUsername} /></div>
              <div className="kv">
                <span className="small muted" style={{ width: 90 }}>Password</span>
                {revealed ? <><code>{telephony.sipPassword}</code><CopyButton text={telephony.sipPassword} /></> : <button className="btn outline small" onClick={() => setRevealed(true)}>Show once</button>}
              </div>
            </div>
            {revealed && <div className="alert orange" style={{ marginTop: 12 }}>This password won't be shown again. Store it in your phone system now. Regenerate it here if it's lost.</div>}
          </Card>
          <Card title="3CX steps">
            <ol className="steps">
              <li>In the 3CX Admin Console, open Voice &amp; Chat and add a generic SIP trunk.</li>
              <li>Enter the domain, username and password from this page. Registration: outbound.</li>
              <li>Add an outbound rule that sends calls for the agent to this trunk.</li>
              <li>Point a ring group or an IVR option at that rule, for example option 1 during business hours.</li>
              <li>Set the transfer number in Settings to the queue the agent hands over to.</li>
              <li>Place a test call from this page.</li>
            </ol>
          </Card>
        </div>
      ) : (
        <div className="grid-2">
          <Card title="Choose a number" lead="Billed at cost on your monthly invoice.">
            <div className="scenario-list">
              {telephony.numbers.map((n) => (
                <button key={n} type="button" className={number === n ? 'active' : ''} onClick={() => setNumber(n)}>
                  {n}<span>Auckland local number</span>
                </button>
              ))}
            </div>
            <button className="btn" style={{ marginTop: 12 }}>Use {number.replace(' (example)', '')}</button>
          </Card>
          <Card title="Forward your calls">
            <ol className="steps">
              <li>Keep your existing number. Nothing changes for your customers.</li>
              <li>In your phone system, forward the calls you want answered to {number.replace(' (example)', '')}.</li>
              <li>Set the transfer number in Settings to a line the agent can hand back to.</li>
              <li>Place a test call from this page.</li>
            </ol>
          </Card>
        </div>
      )}
    </div>
  )
}

function UsageSection() {
  const total = usageMinutes.reduce((s, d) => s + d.minutes, 0)
  const max = Math.max(...usageMinutes.map((d) => d.minutes))
  const c = pricing.costPerMinuteUsd
  const perMin = c.platform + c.stt + c.tts + c.llm + c.telephony
  const rows: [string, number][] = [['Voice platform', c.platform], ['Speech to text', c.stt], ['Text to speech', c.tts], ['Language model', c.llm], ['Telephony', c.telephony]]
  const W = 600
  const H = 140
  const bw = W / usageMinutes.length
  const charge = Math.max(total * pricing.perMinuteNzd, pricing.monthlyMinimumNzd)
  return (
    <div className="stack">
      <div className="grid-3">
        <Kpi label="Minutes, last 30 days" value={total.toLocaleString()} sub="612 calls" />
        <Kpi label="Our cost" value={`US$${(total * perMin).toFixed(2)}`} sub={`US$${perMin.toFixed(3)} per minute`} />
        <Kpi label="Your charge" value={`NZ$${charge.toFixed(2)}`} sub={`NZ$${pricing.perMinuteNzd.toFixed(2)} per minute, NZ$${pricing.monthlyMinimumNzd} minimum`} />
      </div>
      <Card title="Minutes per day" actions={<Proposed />}>
        <svg viewBox={`0 0 ${W} ${H + 20}`} width="100%" role="img" aria-label="Minutes per day for the last 30 days">
          {usageMinutes.map((d, i) => {
            const h = (d.minutes / max) * H
            return (
              <g key={d.day}>
                <rect x={i * bw + 2} y={H - h} width={bw - 4} height={h} rx={2} fill="var(--accent)" opacity={d.minutes < 15 ? 0.35 : 0.85}>
                  <title>{`${d.day}: ${d.minutes} min`}</title>
                </rect>
                {i % 7 === 0 && <text x={i * bw + 2} y={H + 14} fontSize="10" fill="var(--muted)">{d.day.slice(5)}</text>}
              </g>
            )
          })}
        </svg>
        <p className="note">Weekends are low because the agent only answers in business hours.</p>
      </Card>
      <Card title="Where the cost goes" lead="Per minute of call, US dollars. Telephony is zero when you trunk from your own phone system.">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Part</th><th style={{ textAlign: 'right' }}>Per minute</th><th style={{ textAlign: 'right' }}>Last 30 days</th></tr></thead>
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k}><td>{k}</td><td style={{ textAlign: 'right' }}>{v.toFixed(3)}</td><td style={{ textAlign: 'right' }}>{(v * total).toFixed(2)}</td></tr>
              ))}
              <tr><td><strong>Total</strong></td><td style={{ textAlign: 'right' }}><strong>{perMin.toFixed(3)}</strong></td><td style={{ textAlign: 'right' }}><strong>{(perMin * total).toFixed(2)}</strong></td></tr>
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Tools the agent can call" lead="From the tool definitions download. These are built and live in Integration Manager.">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Tool</th><th>Method</th><th>Path</th><th>Needs caller session</th></tr></thead>
            <tbody>
              {toolSchemaSummary.map((t) => (
                <tr key={t.name}><td><span className="kbd">{t.name}</span></td><td>{t.method}</td><td className="muted small">{t.path}</td><td>{t.session ? 'Yes' : 'No'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

const testSteps = ['Dialling', 'Ringing', 'Connected', 'Playing greeting', 'Hung up']

function TestCallModal({ open, onClose, greeting }: { open: boolean; onClose: () => void; greeting: string }) {
  const [num, setNum] = useState('')
  const [step, setStep] = useState(-1)
  const timer = useRef<number | null>(null)
  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current) }, [])
  const start = () => {
    setStep(0)
    let i = 0
    timer.current = window.setInterval(() => {
      i += 1
      setStep(i)
      if (i >= testSteps.length - 1 && timer.current) window.clearInterval(timer.current)
    }, 1100)
  }
  const close = () => {
    if (timer.current) window.clearInterval(timer.current)
    setStep(-1)
    onClose()
  }
  return (
    <Modal open={open} onClose={close} title="Place a test call">
      <div className="stack">
        <p className="small muted" style={{ margin: 0 }}>The agent calls this number using the current draft settings, so you can hear a change before publishing it. Staff numbers only.</p>
        <Field label="Your number"><input value={num} onChange={(e) => setNum(e.target.value)} placeholder="021 000 0000" /></Field>
        {step >= 0 && (
          <div className="stack">
            <div className="state-strip">
              {testSteps.map((s, i) => <Badge key={s} tone={i < step ? 'green' : i === step ? 'blue' : 'gray'}>{s}</Badge>)}
            </div>
            {step >= 3 && <div className="alert blue small">“{greeting}”</div>}
            {step >= testSteps.length - 1 && <div className="alert green small">Test call finished. It shows in Activity as a test.</div>}
          </div>
        )}
        <div className="row">
          <button className="btn" disabled={!num.trim() || (step >= 0 && step < testSteps.length - 1)} onClick={start}>{step >= testSteps.length - 1 ? 'Call again' : 'Call me'}</button>
          <button className="btn outline" onClick={close}>Close</button>
        </div>
      </div>
    </Modal>
  )
}
