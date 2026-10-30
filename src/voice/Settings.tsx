import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Card, Field, Switch, Tabs } from '../components/ui'
import { ACCENTS, VOICES, defaultVoiceFor, voiceLabel } from '../data/phone'
import { speeds } from '../data/mock'
import { HELP_SOURCES, ISSUE_KINDS } from './data'
import { useTenant } from './tenant'

type Tab = 'business' | 'hours' | 'abilities' | 'callers' | 'handoff' | 'drivers' | 'help' | 'connection'
const TABS: { id: Tab; label: string }[] = [
  { id: 'business', label: 'Business and voice' },
  { id: 'hours', label: 'Hours' },
  { id: 'abilities', label: 'What Una may do' },
  { id: 'callers', label: 'Callers' },
  { id: 'handoff', label: 'Hand-over' },
  { id: 'drivers', label: 'Drivers' },
  { id: 'help', label: 'Help answers' },
  { id: 'connection', label: 'Connection' },
]

/** Marks fields that live in the tenant's DFRNT system (Integration Manager) and are enforced there. */
function Enforced() {
  return <Badge tone="blue">Checked by DFRNT</Badge>
}

export default function Settings() {
  const { tab } = useParams()
  const nav = useNavigate()
  const current = (TABS.find((t) => t.id === tab)?.id ?? 'business') as Tab
  const [saved, setSaved] = useState(false)
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="stack">
      <div className="row between">
        <div>
          <h1>Settings</h1>
          <p className="muted" style={{ marginTop: 4 }}>Changes rerun the test calls before they reach a caller.</p>
        </div>
        <div className="row">
          {saved && <Badge tone="green">Saved · 9 of 10 test calls pass</Badge>}
          <button className="btn" onClick={save}>Save changes</button>
        </div>
      </div>
      <Tabs tabs={TABS} value={current} onChange={(t) => nav(`/app/settings/${t}`)} />
      {current === 'business' && <Business />}
      {current === 'hours' && <Hours />}
      {current === 'abilities' && <Abilities />}
      {current === 'callers' && <Callers />}
      {current === 'handoff' && <Handoff />}
      {current === 'drivers' && <Drivers />}
      {current === 'help' && <Help />}
      {current === 'connection' && <Connection />}
    </div>
  )
}

function Business() {
  const { tenant } = useTenant()
  const [company, setCompany] = useState(tenant.name)
  const [name, setName] = useState('Una')
  const [locale, setLocale] = useState(tenant.region === 'AU' ? 'en-AU' : tenant.region === 'US' ? 'en-US' : 'en-NZ')
  const [voice, setVoice] = useState(defaultVoiceFor(locale)?.id ?? '')
  const [greeting, setGreeting] = useState("Hi, you've reached {company}. I'm {name}, the automated assistant. How can I help?")
  const [persona, setPersona] = useState('Friendly and brief. Uses first names. Reads prices as plus GST.')
  const spoken = greeting.replaceAll('{company}', company || '…').replaceAll('{name}', name || '…')
  return (
    <div className="grid-2">
      <Card title="Who's answering">
        <div className="stack">
          <Field label="Company name" hint="How Una says your name. Leave out Ltd."><input value={company} onChange={(e) => setCompany(e.target.value)} /></Field>
          <Field label="Assistant's name"><input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Greeting" hint="{company} and {name} are filled in. Known callers hear their name instead: “Am I speaking to Priya?”">
            <input value={greeting} onChange={(e) => setGreeting(e.target.value)} />
          </Field>
          <div className="alert blue small">“{spoken}”</div>
          <Field label="Personality" hint="Tone only. It can't change what Una is allowed to do.">
            <textarea style={{ minHeight: 80, fontFamily: 'inherit' }} value={persona} onChange={(e) => setPersona(e.target.value)} />
          </Field>
        </div>
      </Card>
      <Card title="How she sounds">
        <div className="stack">
          <Field label="Accent">
            <select value={locale} onChange={(e) => { setLocale(e.target.value); setVoice(defaultVoiceFor(e.target.value)?.id ?? '') }}>
              {ACCENTS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </Field>
          <div className="field">
            <label>Voice</label>
            <div className="stack" style={{ gap: 6 }}>
              {VOICES.filter((v) => v.locale === locale).map((v) => (
                <label key={v.id} className={`voice-opt ${voice === v.id ? 'active' : ''}`}>
                  <input type="radio" name="voice" checked={voice === v.id} onChange={() => setVoice(v.id)} />
                  <span style={{ flex: 1 }}>{voiceLabel(v)}{v.isDefault ? <span className="muted small"> · default</span> : null}</span>
                  <button type="button" className="btn ghost small" onClick={(e) => e.preventDefault()}>▶ Play greeting</button>
                </label>
              ))}
            </div>
          </div>
          <Field label="Speaking speed">
            <input type="range" min={0} max={4} defaultValue={2} />
          </Field>
        </div>
      </Card>
    </div>
  )
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
function Hours() {
  const [days, setDays] = useState([true, true, true, true, true, false, false])
  const [outside, setOutside] = useState<'message' | 'transfer' | 'answer'>('answer')
  return (
    <div className="grid-2">
      <Card title="Office hours" lead="Your local time (Pacific/Auckland). Used for transfers and for what Una says about same-day jobs.">
        <div className="stack">
          <div className="pill-list">{DAYS.map((d, i) => <button key={d} className={days[i] ? 'active' : ''} onClick={() => setDays((ds) => ds.map((x, j) => (j === i ? !x : x)))}>{d}</button>)}</div>
          <div className="grid-2" style={{ gap: 12 }}>
            <Field label="Opens"><input type="time" defaultValue="07:00" /></Field>
            <Field label="Closes"><input type="time" defaultValue="20:00" /></Field>
          </div>
          <Field label="Last booking for today" hint="After this Una offers tomorrow."><input type="time" defaultValue="15:30" /></Field>
          <Field label="Public holidays"><select defaultValue="nz"><option value="nz">New Zealand (Auckland)</option><option value="au">Australia (NSW)</option><option value="none">Ignore holidays</option></select></Field>
        </div>
      </Card>
      <Card title="Outside office hours">
        <div className="stack" style={{ gap: 8 }}>
          {([
            ['answer', 'Una answers as normal', 'Tracking, quotes and bookings for tomorrow. Urgent problems go to your after-hours number.'],
            ['message', 'Take a message', 'Una takes details and creates a task for the morning.'],
            ['transfer', 'Transfer straight away', 'To your after-hours number below.'],
          ] as const).map(([v, l, h]) => (
            <label key={v} className={`voice-opt ${outside === v ? 'active' : ''}`}>
              <input type="radio" checked={outside === v} onChange={() => setOutside(v)} />
              <span><strong className="small">{l}</strong><br /><span className="small muted">{h}</span></span>
            </label>
          ))}
          <Field label="After-hours number" hint="Urgent calls Una can't sort. Leave empty to take a message."><input defaultValue="04 917 9882" /></Field>
        </div>
      </Card>
    </div>
  )
}

function Abilities() {
  const [s, setS] = useState({ quote: true, lookup: true, pod: true, book: true, change: true, update: false, cancel: false })
  const set = (k: keyof typeof s) => (v: boolean) => setS((x) => ({ ...x, [k]: v }))
  const [allowed, setAllowed] = useState([3, 5, 9])
  return (
    <div className="grid-2">
      <Card title="What Una may do" actions={<Enforced />} lead="Saved in your DFRNT system and checked on every request. If it's off, Una can't do it, whatever she's told.">
        <div className="stack">
          <Switch label="Quote" hint="Prices from your rate cards" on={s.quote} onChange={set('quote')} />
          <Switch label="Track jobs" hint="Status, driver ETA, who signed" on={s.lookup} onChange={set('lookup')} />
          <Switch label="Email proof of delivery" hint="To the caller's own email on file" on={s.pod} onChange={set('pod')} />
          <Switch label="Book jobs" hint="Booked as source “Voice agent”" on={s.book} onChange={set('book')} />
          <Switch label="Change requests" hint="Una notes the change; your team approves it" on={s.change} onChange={set('change')} />
          <Switch label="Edit jobs directly" hint="Changes apply without approval" on={s.update} onChange={set('update')} />
          <Switch label="Cancel jobs" hint="Only before the status below" on={s.cancel} onChange={set('cancel')} />
        </div>
      </Card>
      <Card title="Booking limits" actions={<Enforced />}>
        <div className="stack">
          <div className="field">
            <label>Services Una can book</label>
            <div className="pill-list">{speeds.map((sp) => <button key={sp.id} className={allowed.includes(sp.id) ? 'active' : ''} onClick={() => setAllowed((a) => (a.includes(sp.id) ? a.filter((x) => x !== sp.id) : [...a, sp.id]))}>{sp.label}</button>)}</div>
          </div>
          <Field label="Default service"><select defaultValue={5}>{speeds.filter((sp) => allowed.includes(sp.id)).map((sp) => <option key={sp.id} value={sp.id}>{sp.label}</option>)}</select></Field>
          <Field label="Cancel only before" hint="Jobs past this status go to a person."><select defaultValue="alloc"><option value="alloc">Allocated to a driver</option><option value="pickup">Picked up</option></select></Field>
          <Field label="Biggest job Una can book" hint="Bigger needs a person, e.g. trucks and pallets."><select defaultValue="van"><option value="car">Car</option><option value="van">Van</option><option value="truck">Truck</option></select></Field>
        </div>
      </Card>
    </div>
  )
}

function Callers() {
  const [mode, setMode] = useState('CallerIdPlusAccountCode')
  return (
    <div className="grid-2">
      <Card title="Checking who's calling" actions={<Enforced />} lead="Before Una shares job details or books on an account.">
        <div className="stack" style={{ gap: 8 }}>
          {([
            ['CallerIdOnly', 'Phone number only', 'The number is on a contact for the account.'],
            ['CallerIdPlusAccountCode', 'Phone number and account code', 'Recommended for booking.'],
            ['CallerIdPlusJobNumber', 'Phone number and a job number', 'For callers who track but don\'t book.'],
          ] as const).map(([v, l, h]) => (
            <label key={v} className={`voice-opt ${mode === v ? 'active' : ''}`}>
              <input type="radio" checked={mode === v} onChange={() => setMode(v)} />
              <span><strong className="small">{l}</strong><br /><span className="small muted">{h}</span></span>
            </label>
          ))}
        </div>
      </Card>
      <Card title="Unknown callers">
        <div className="stack">
          <Switch label="Quote for anyone" hint="Prices from your standard card" on onChange={() => {}} />
          <Switch label="Track by job number" hint="Status only, no names or addresses" on onChange={() => {}} />
          <Switch label="Take new-customer details" hint="Emailed to customer service" on onChange={() => {}} />
        </div>
      </Card>
    </div>
  )
}

function Handoff() {
  return (
    <div className="grid-2">
      <Card title="Transfers" lead="Where Una puts callers through. These must not route back to Una.">
        <div className="stack">
          <Field label="Office" hint="Customers who want a person."><input defaultValue="09 307 3555" /></Field>
          <Field label="Dispatch" hint="Drivers Una can't help. Empty uses the office number."><input defaultValue="09 307 3550" /></Field>
          <Row><button className="btn outline small">Test both numbers</button><span className="small muted">Una rings each and checks a person or queue answers.</span></Row>
        </div>
      </Card>
      <Card title="Questions Una passes on by email" lead="Una takes the caller's details and question and emails them. She never resets passwords.">
        <div className="stack">
          <Field label="Accounts email" hint="Invoices, statements, credit."><input placeholder="accounts@yourcompany.co.nz" /></Field>
          <div className="alert orange small">Empty: Una says someone will call back and creates a task instead.</div>
          <Field label="Customer service email" hint="Logins, complaints, new customers."><input defaultValue="cs@urgent.co.nz" /></Field>
          <Field label="Call summaries to" hint="A summary of every transferred call."><input defaultValue="dispatch@urgent.co.nz" /></Field>
        </div>
      </Card>
    </div>
  )
}

function Drivers() {
  const [on, setOn] = useState(true)
  const [showPhone, setShowPhone] = useState(true)
  const [bookedBy, setBookedBy] = useState(true)
  return (
    <div className="grid-2">
      <Card title="Driver calls" actions={<Enforced />} lead="Drivers are recognised by their mobile number on the courier file.">
        <div className="stack">
          <Switch label="Answer drivers" hint="Their own jobs only" on={on} onChange={setOn} />
          <Switch label="Give drivers customer phone numbers" hint="Follows Show Client Phone on each courier" on={showPhone} onChange={setShowPhone} disabled={!on} />
          <Switch label="Fall back to the booked-by contact" hint="When the pickup or delivery has no phone" on={bookedBy} onChange={setBookedBy} disabled={!on || !showPhone} />
          <Field label="Send contacts to the driver's app as" hint="A note on the job, pushed to the handset.">
            <select defaultValue="1102"><option value="1102">Driver Message</option><option value="0">Don't send</option></select>
          </Field>
        </div>
      </Card>
      <Card title="Problems drivers report" lead="Each becomes an open task in Dispatch. Una tells the driver it's done.">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Problem</th><th>Dispatch task type</th></tr></thead>
            <tbody>
              {ISSUE_KINDS.map((k) => (
                <tr key={k.kind}><td className="small">{k.label}</td><td><select className="inline-input" defaultValue={k.eventTypeId}><option value={66}>Driver issue</option><option value={67}>Customer follow-up</option></select></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function Help() {
  return (
    <Card title="Answers from your help centre" actions={<Badge tone="orange">Coming later</Badge>} lead="For “how do I” questions, like logging in or booking online. Una reads the article you pick and explains it in a sentence or two, then offers to email the link.">
      <div className="stack" style={{ gap: 6 }}>
        {HELP_SOURCES.map((h) => (
          <label key={h.title} className="voice-opt">
            <input type="checkbox" defaultChecked={h.on} disabled />
            <span style={{ flex: 1 }} className="small">{h.title}</span>
            <span className="small muted">{h.from}</span>
          </label>
        ))}
      </div>
    </Card>
  )
}

function Connection() {
  const { tenant } = useTenant()
  return (
    <div className="grid-2">
      <Card title="Your DFRNT system" lead="Una books, tracks and creates tasks through this connection.">
        <div className="stack small">
          <Row><Badge tone="green">Connected</Badge><span>{tenant.name} · staging</span></Row>
          <div className="secret">
            <div className="kv"><span className="muted">Tenant</span><code>{tenant.id}</code></div>
            <div className="kv"><span className="muted">Jobs are booked as</span><code>Voice agent</code></div>
            <div className="kv"><span className="muted">Agent key</span><code>••••••••4f2a</code><button className="btn ghost small">Rotate</button></div>
          </div>
          <Row><button className="btn outline small">Test connection</button><button className="btn outline small">Switch to production</button></Row>
        </div>
      </Card>
      <Card title="Recordings and privacy">
        <div className="stack">
          <Field label="Keep call audio for"><select defaultValue="90"><option value="30">30 days</option><option value="90">90 days</option><option value="365">1 year</option></select></Field>
          <Switch label="Record Una's calls" hint="Callers hear “calls are recorded” in the greeting" on onChange={() => {}} />
          <Field label="Data region" hint="Where audio and transcripts are stored."><select defaultValue="syd"><option value="syd">Sydney (NZ and AU tenants)</option><option value="us">United States</option></select></Field>
        </div>
      </Card>
    </div>
  )
}

function Row({ children }: { children: ReactNode }) {
  return <div className="row">{children}</div>
}
