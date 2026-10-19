import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Card, CopyButton, Drawer, Field, Kpi, Modal, Switch, Tabs } from '../components/ui'
import {
  actions, calls, defaultSettings, pricing, promptVersions as seedPrompts, speeds,
  toolSchemaSummary, usageMinutes, type CallRow, type PromptVersion, type Settings,
} from '../data/mock'
import {
  ACCENTS, defaultVoiceFor, exampleProviderRef, exampleSip, METHOD_LABEL, METHOD_ORDER, METHOD_TONE, PHONE_SYSTEMS,
  spokenGreeting, STANDARD_GREETING, toE164, voiceLabel, VOICES, type PhoneSystemId, type PhoneSystemPreset,
} from '../data/phone'

/** The tenant's phone system row, as GET admin/threecx/agent/phone returns it (example values). */
type PhoneState = {
  phoneSystem: PhoneSystemId
  connected: boolean
  numberE164: string | null
  sipDomain?: string
  sipUsername?: string
  providerResourceRef?: string
}

const PLATFORM_NOT_READY = "The voice platform isn't set up on this deployment yet. Contact support."

type TabId = 'settings' | 'prompts' | 'activity' | 'telephony' | 'usage'
const TABS: { id: TabId; label: string }[] = [
  { id: 'settings', label: 'Settings' },
  { id: 'prompts', label: 'Prompt versions' },
  { id: 'activity', label: 'Activity' },
  { id: 'telephony', label: 'Phone system' },
  { id: 'usage', label: 'Usage' },
]

function Proposed() {
  return <Badge tone="orange">Proposed</Badge>
}

function Future({ children = 'Future' }: { children?: string }) {
  return <Badge tone="orange">{children}</Badge>
}

export default function VoiceAgent() {
  const { tab } = useParams()
  const nav = useNavigate()
  const current: TabId = TABS.some((t) => t.id === tab) ? (tab as TabId) : 'settings'
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [phone, setPhone] = useState<PhoneState | null>(null)
  const [platformReady, setPlatformReady] = useState(true)

  return (
    <div className="stack">
      <div>
        <div className="small muted">Integrations / Voice agent</div>
        <h1 style={{ marginTop: 4 }}>Voice agent</h1>
        <p className="small muted" style={{ marginTop: 4 }}>
          An AI voice agent that answers your clients' calls on your phone system. Caller pop-ups for 3CX stay
          under Integrations / 3CX.
        </p>
      </div>

      <StatusCard settings={settings} phone={phone} onOpenPhone={() => nav('/voice-agent/telephony')} />

      <Tabs tabs={TABS} value={current} onChange={(t) => nav(`/voice-agent/${t}`)} />

      {current === 'settings' && <SettingsSection settings={settings} onChange={setSettings} />}
      {current === 'prompts' && <PromptsSection />}
      {current === 'activity' && <ActivitySection />}
      {current === 'telephony' && (
        <PhoneSystemSection phone={phone} onChange={setPhone} platformReady={platformReady} onPlatformReady={setPlatformReady} />
      )}
      {current === 'usage' && <UsageSection />}
    </div>
  )
}

/** Readiness, as GET admin/threecx/agent/readiness works it out (tenant link and session signing assumed fine). */
function blockers(settings: Settings, phone: PhoneState | null) {
  const b: string[] = []
  if (!phone?.connected) b.push('Connect your phone system.')
  if (!settings.enabled) b.push("Turn on 'Let the voice agent take calls'.")
  return b
}

function StatusCard({ settings, phone, onOpenPhone }: { settings: Settings; phone: PhoneState | null; onOpenPhone: () => void }) {
  const [confirm, setConfirm] = useState<'regenerate' | 'disconnect' | null>(null)
  const b = blockers(settings, phone)
  return (
    <Card>
      <div className="row" style={{ marginBottom: 8 }}>
        <strong>Status</strong>
        <Badge tone="green">Connected</Badge>
      </div>
      <p className="small muted" style={{ marginTop: 0 }}>
        The voice agent signs in with key <strong>vak_uc_51f2</strong>. Download the tool definitions and load them into
        your voice agent platform, along with the key and secret.
      </p>
      {b.length === 0 ? (
        <div className="alert green" style={{ marginBottom: 16 }}>Ready to take calls.</div>
      ) : (
        <div className="alert orange" style={{ marginBottom: 16 }}>
          <strong>Not taking calls yet</strong>
          <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
            {b.map((x) => (
              <li key={x}>
                {x}
                {x.startsWith('Connect your phone') && <> <button type="button" className="btn ghost small" onClick={onOpenPhone}>Go to Phone system</button></>}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <button className="btn">Download tool definitions</button>
        <button className="btn outline" onClick={() => setConfirm('regenerate')}>Regenerate key</button>
        <button className="btn outline" style={{ color: 'var(--red)' }} onClick={() => setConfirm('disconnect')}>Disconnect</button>
      </div>
      <Modal open={confirm === 'regenerate'} onClose={() => setConfirm(null)} title="Regenerate the voice agent key?">
        <p className="small">This issues a new key and secret and stops the current one working. You'll need to give the new one to whoever runs your voice agent.</p>
        <div className="row"><button className="btn" onClick={() => setConfirm(null)}>Regenerate</button><button className="btn outline" onClick={() => setConfirm(null)}>Cancel</button></div>
      </Modal>
      <Modal open={confirm === 'disconnect'} onClose={() => setConfirm(null)} title="Disconnect the voice agent?">
        <p className="small">The voice agent stops working straight away and callers go to your normal phone routing. Create a new key any time to turn it back on.</p>
        <p className="note">In this mock nothing is disconnected.</p>
        <div className="row"><button className="btn" onClick={() => setConfirm(null)}>Disconnect</button><button className="btn outline" onClick={() => setConfirm(null)}>Cancel</button></div>
      </Modal>
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
            <Switch on={settings.enabled} onChange={(v) => set('enabled', v)} label="Let the voice agent take calls" hint="When this is off, every tool except handing over to a person is refused." />
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

      <Card title="How it sounds" lead="Read by the voice runtime at the start of every call.">
        <div className="grid-2">
          <div className="stack">
            <Field label="Company name" hint="Your company name the way the agent should say it.">
              <input maxLength={100} value={settings.companyName} onChange={(e) => set('companyName', e.target.value)} />
            </Field>
            <Field label="Greeting" hint="The first thing callers hear. {company} becomes your company name. Leave empty for the standard greeting.">
              <input value={settings.greeting} placeholder={STANDARD_GREETING} onChange={(e) => set('greeting', e.target.value)} />
            </Field>
            <div className="small muted">Callers will hear: “{spokenGreeting(settings.greeting, settings.companyName)}”</div>
            <Field label="Personality" hint="A sentence or two on tone, for example: friendly, brief, uses first names.">
              <textarea style={{ minHeight: 70, fontFamily: 'inherit', fontSize: 14 }} value={settings.persona} onChange={(e) => set('persona', e.target.value)} />
            </Field>
          </div>
          <div className="stack">
            <Field label="Accent" hint="Also sets how dates, times and prices are read out.">
              <select
                value={settings.locale}
                onChange={(e) => {
                  const locale = e.target.value
                  if (locale === settings.locale) return
                  // Voices belong to an accent, so a new accent starts on its default voice.
                  onChange({ ...settings, locale, voiceId: defaultVoiceFor(locale)?.id ?? '' })
                }}
              >
                {ACCENTS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </Field>
            <Field label="Voice" hint="The voices available for this accent.">
              <select value={settings.voiceId} onChange={(e) => set('voiceId', e.target.value)}>
                {VOICES.filter((v) => v.locale === settings.locale).map((v) => <option key={v.id} value={v.id}>{voiceLabel(v)}</option>)}
              </select>
            </Field>
            <div className="row">
              <button type="button" className="btn outline small" disabled title="Not built yet (N2)">Play a sample</button>
              <Future>Future (N2)</Future>
            </div>
          </div>
        </div>
      </Card>

      <Card title="When it answers" lead="Your local time. Outside these hours the agent takes a message or transfers straight away.">
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

// ── Phone system (mirrors pages/VoiceAgent/PhoneSystemCard.tsx) ───────────────

function Steps({ preset }: { preset: PhoneSystemPreset }) {
  return (
    <div>
      <h4 style={{ margin: '0 0 10px' }}>{preset.name} steps</h4>
      <ol className="steps">
        {preset.steps.map((s) => <li key={s}>{s}</li>)}
      </ol>
      <p className="note" style={{ marginBottom: 0 }}>{preset.transferBack}</p>
    </div>
  )
}

function NumberField({ value, onChange, label = 'Phone number the agent answers' }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <Field label={label} hint="The number your callers ring, in international format, for example +64 9 300 1234.">
      <input inputMode="tel" placeholder="+64…" value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  )
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="kv"><span className="small muted" style={{ width: 90 }}>{label}</span><code>{value}</code><CopyButton text={value} /></div>
  )
}

function ComingSoonNumber() {
  return (
    <div className="alert orange">
      <div className="row" style={{ marginBottom: 6 }}><strong>Your DFRNT number</strong><Badge tone="orange">Number coming soon</Badge></div>
      Forwarding needs a local number for the agent, and we're still setting those up. Your choice is saved and the
      number will show here when it's ready. Your customers keep calling your normal number; you forward the calls you
      want answered to this one.
    </div>
  )
}

function SipTrunkForm({ preset, disabled, onConnect }: { preset: PhoneSystemPreset; disabled: boolean; onConnect: (n: string) => void }) {
  const [number, setNumber] = useState('')
  return (
    <div className="stack">
      <p className="small muted" style={{ margin: 0 }}>
        We create a SIP trunk for your company and show the domain, username and password to enter in
        {preset.id === '3cx' ? ' 3CX' : ' your phone system'}.
      </p>
      <NumberField value={number} onChange={setNumber} />
      <div className="row"><button className="btn" disabled={disabled || !number.trim()} onClick={() => onConnect(toE164(number))}>Create trunk</button></div>
    </div>
  )
}

function TwilioForm({ disabled, onConnect }: { disabled: boolean; onConnect: (n: string) => void }) {
  const [sid, setSid] = useState('')
  const [token, setToken] = useState('')
  const [number, setNumber] = useState('')
  return (
    <div className="stack">
      <Field label="Account SID"><input placeholder="AC…" value={sid} onChange={(e) => setSid(e.target.value)} /></Field>
      <Field label="Auth token"><input type="password" value={token} onChange={(e) => setToken(e.target.value)} /></Field>
      <NumberField label="Twilio number the agent answers" value={number} onChange={setNumber} />
      <p className="note" style={{ margin: 0 }}>Used once to set up the connection. We don't store it or use it for anything else.</p>
      <div className="row">
        <button className="btn" disabled={disabled || !sid.trim() || !token.trim() || !number.trim()} onClick={() => onConnect(toE164(number))}>Connect Twilio</button>
      </div>
    </div>
  )
}

function TelnyxForm({ disabled, onConnect }: { disabled: boolean; onConnect: (n: string) => void }) {
  const [key, setKey] = useState('')
  const [number, setNumber] = useState('')
  return (
    <div className="stack">
      <Field label="API key"><input type="password" placeholder="KEY…" value={key} onChange={(e) => setKey(e.target.value)} /></Field>
      <NumberField label="Telnyx number the agent answers" value={number} onChange={setNumber} />
      <p className="note" style={{ margin: 0 }}>Used once to set up the connection. We don't store it or use it for anything else.</p>
      <div className="row">
        <button className="btn" disabled={disabled || !key.trim() || !number.trim()} onClick={() => onConnect(toE164(number))}>Connect Telnyx</button>
      </div>
    </div>
  )
}

function ConnectedPhoneSystem({ phone, preset, sipPassword, onDisconnect }: {
  phone: PhoneState
  preset: PhoneSystemPreset
  sipPassword: string | null
  onDisconnect: () => void
}) {
  const forwarding = preset.method === 'forwarding'
  return (
    <div className="stack">
      <div className="row">
        <strong>{preset.name}</strong>
        <Badge tone={METHOD_TONE[preset.method]}>{METHOD_LABEL[preset.method]}</Badge>
        {phone.connected && <Badge tone="green">Connected</Badge>}
      </div>
      {phone.numberE164 && <div className="small">Calls to <strong>{phone.numberE164}</strong> go to the voice agent.</div>}
      {preset.method === 'setup' && phone.providerResourceRef && (
        <div className="small muted">We created <strong>{phone.providerResourceRef}</strong> in your {preset.name} account.</div>
      )}
      {preset.method === 'sip' && sipPassword && (
        <div className="alert orange">
          <strong>Copy the trunk password now — it won't be shown again. Store it in your phone system.</strong>
          <div className="secret" style={{ marginTop: 10 }}>
            <CopyRow label="Domain" value={phone.sipDomain ?? ''} />
            <CopyRow label="Username" value={phone.sipUsername ?? ''} />
            <CopyRow label="Password" value={sipPassword} />
          </div>
        </div>
      )}
      {preset.method === 'sip' && !sipPassword && (
        <div className="stack" style={{ gap: 8 }}>
          <div className="secret">
            <CopyRow label="Domain" value={phone.sipDomain ?? ''} />
            <CopyRow label="Username" value={phone.sipUsername ?? ''} />
          </div>
          <p className="note" style={{ margin: 0 }}>The password was shown once, when the trunk was created. If it's lost, disconnect and create the trunk again.</p>
        </div>
      )}
      {forwarding && <ComingSoonNumber />}
      <Steps preset={preset} />
      <div className="row">
        {forwarding && !phone.connected
          ? <button className="btn outline" onClick={onDisconnect}>Choose a different phone system</button>
          : <button className="btn outline" style={{ color: 'var(--red)' }} onClick={onDisconnect}>Disconnect</button>}
      </div>
    </div>
  )
}

function PhoneSystemSection({ phone, onChange, platformReady, onPlatformReady }: {
  phone: PhoneState | null
  onChange: (p: PhoneState | null) => void
  platformReady: boolean
  onPlatformReady: (v: boolean) => void
}) {
  const [picked, setPicked] = useState<PhoneSystemId | ''>('')
  const [sipPassword, setSipPassword] = useState<string | null>(null)
  const [confirm, setConfirm] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const current = phone ? PHONE_SYSTEMS.find((p) => p.id === phone.phoneSystem) : undefined
  const preset = PHONE_SYSTEMS.find((p) => p.id === picked)
  const notReady = !platformReady

  const disconnect = () => {
    setConfirm(false)
    if (phone?.connected && current) {
      setMessage(current.method === 'setup'
        ? `Disconnected. The trunk in your ${current.name} account (${phone.providerResourceRef}) is still there; remove it in ${current.name} if you no longer need it.`
        : 'Disconnected. Remove the trunk from your phone system too.')
    } else setMessage(null)
    setSipPassword(null)
    setPicked('')
    onChange(null)
  }

  const connectSip = (numberE164: string) => {
    setSipPassword(exampleSip.password)
    onChange({ phoneSystem: preset!.id, connected: true, numberE164, sipDomain: exampleSip.domain, sipUsername: exampleSip.username })
  }
  const connectSetup = (id: 'twilio' | 'telnyx') => (numberE164: string) =>
    onChange({ phoneSystem: id, connected: true, numberE164, providerResourceRef: exampleProviderRef[id] })

  return (
    <div className="stack">
      <Card title="Phone system" lead="Pick what you use. We fill in everything we can and show the few steps left for you.">
        {current ? (
          <ConnectedPhoneSystem phone={phone!} preset={current} sipPassword={sipPassword} onDisconnect={() => (phone!.connected ? setConfirm(true) : disconnect())} />
        ) : (
          <div className="stack">
            {notReady && <div className="alert orange">{PLATFORM_NOT_READY}</div>}
            {message && <div className="alert blue small">{message}</div>}
            <div className="grid-2">
              <Field label="Phone system">
                <select value={picked} onChange={(e) => { setPicked(e.target.value as PhoneSystemId); setMessage(null) }}>
                  <option value="" disabled>Pick your phone system</option>
                  {METHOD_ORDER.map((m) => (
                    <optgroup key={m} label={METHOD_LABEL[m]}>
                      {PHONE_SYSTEMS.filter((p) => p.method === m).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </optgroup>
                  ))}
                </select>
              </Field>
              {preset && (
                <div className="stack" style={{ gap: 6 }}>
                  <div className="row"><span className="small muted">How it connects</span><Badge tone={METHOD_TONE[preset.method]}>{METHOD_LABEL[preset.method]}</Badge></div>
                  <div className="small muted">{preset.needs}</div>
                </div>
              )}
            </div>

            {preset?.method === 'sip' && <SipTrunkForm key={preset.id} preset={preset} disabled={notReady} onConnect={connectSip} />}
            {preset?.id === 'twilio' && <TwilioForm disabled={notReady} onConnect={connectSetup('twilio')} />}
            {preset?.id === 'telnyx' && <TelnyxForm disabled={notReady} onConnect={connectSetup('telnyx')} />}
            {preset?.method === 'forwarding' && (
              <>
                <ComingSoonNumber />
                <div className="row">
                  <button className="btn" onClick={() => onChange({ phoneSystem: preset.id, connected: false, numberE164: null })}>Save choice</button>
                </div>
              </>
            )}
            {preset && <Steps preset={preset} />}
          </div>
        )}
      </Card>

      <div className="note row" style={{ gap: 8 }}>
        <span>Mock only:</span>
        <label className="row" style={{ gap: 6 }}>
          <input type="checkbox" checked={notReady} onChange={(e) => onPlatformReady(!e.target.checked)} />
          show the "voice platform isn't set up" state (connect buttons disabled until LiveKit is configured)
        </label>
      </div>

      <Modal open={confirm} onClose={() => setConfirm(false)} title={`Disconnect ${current?.name ?? ''}?`}>
        <p className="small">
          Calls stop reaching the voice agent straight away. We remove the trunk we created; anything set up in
          {' '}{current?.name} itself stays until you remove it there.
        </p>
        <div className="row"><button className="btn" onClick={disconnect}>Disconnect</button><button className="btn outline" onClick={() => setConfirm(false)}>Cancel</button></div>
      </Modal>
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
