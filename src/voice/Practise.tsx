import { useEffect, useRef, useState } from 'react'
import { Badge, Card, Modal } from '../components/ui'
import { PRACTISE_AS, TEST_SET, unaReplyFor, type Turn } from './data'
import { useTenant } from './tenant'

type Rule = { when: string; say: string }

const SUGGESTIONS: Record<string, string[]> = {
  known: ["Where's job 10498?", 'I need a satchel picked up to 17 Saleyards Road', 'Yes, book it', 'I want to talk about an invoice'],
  unknown: ['How much to send a box to Wiri today?', 'Can I book a pickup?', 'Put me through to someone'],
  driver: ["Goods aren't ready at the pickup", "Nobody's home, have you got a number?"],
}

export default function Practise() {
  const { tenant } = useTenant()
  const greeting = `Hi, you've reached ${tenant.name}. I'm Una, the automated assistant. How can I help?`
  const [as, setAs] = useState('known')
  const [mode, setMode] = useState<'sandbox' | 'staging'>('sandbox')
  const [turns, setTurns] = useState<Turn[]>([{ who: 'una', text: greeting }])
  const [text, setText] = useState('')
  const [listening, setListening] = useState(false)
  const [showTools, setShowTools] = useState(true)
  const [fix, setFix] = useState<number | null>(null)
  const [fixText, setFixText] = useState('')
  const [rules, setRules] = useState<Rule[]>([{ when: 'A driver asks for a phone number and the job has none', say: "Offer the booked-by contact and send it to the driver's app." }])
  const [rated, setRated] = useState<Record<number, 'good' | 'fix'>>({})
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => { setTurns([{ who: 'una', text: greeting }]); setRated({}) }, [as, greeting])
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [turns])

  const say = (t: string) => {
    if (!t.trim()) return
    setTurns((ts) => [...ts, { who: 'caller', text: t.trim() }])
    setText('')
    setTimeout(() => setTurns((ts) => [...ts, ...unaReplyFor(t, as)]), 500)
  }

  // Fake push-to-talk: listening for a moment, then "hears" the first suggestion not yet said.
  const talk = () => {
    if (listening) return
    setListening(true)
    setTimeout(() => {
      setListening(false)
      const said = new Set(turns.filter((x) => x.who === 'caller').map((x) => x.text))
      say(SUGGESTIONS[as].find((s) => !said.has(s)) ?? 'Thanks, that\'s all.')
    }, 1600)
  }

  const passed = TEST_SET.filter((t) => t.pass).length

  return (
    <div className="stack">
      <div>
        <h1>Practise</h1>
        <p className="muted" style={{ marginTop: 4 }}>Talk to Una in your browser before she has a number. Correct her when she gets it wrong; each correction becomes a rule and a test call.</p>
      </div>

      <div className="practise-layout">
        <div className="stack">
          <Card title="Call as">
            <div className="scenario-list">
              {PRACTISE_AS.map((p) => (
                <button key={p.id} className={as === p.id ? 'active' : ''} onClick={() => setAs(p.id)}>{p.label}<span>{p.detail}</span></button>
              ))}
            </div>
          </Card>
          <Card title="Jobs go to">
            <div className="pill-list">
              <button className={mode === 'sandbox' ? 'active' : ''} onClick={() => setMode('sandbox')}>Sandbox</button>
              <button className={mode === 'staging' ? 'active' : ''} onClick={() => setMode('staging')}>Staging</button>
            </div>
            <p className="small muted" style={{ marginTop: 8 }}>{mode === 'sandbox' ? 'Real prices and addresses, but bookings and tasks are pretend.' : 'Bookings and tasks land in your staging DFRNT. Never live.'}</p>
          </Card>
        </div>

        <Card>
          <div className="row between" style={{ marginBottom: 8 }}>
            <div className="state-strip">
              <Badge tone="blue">Practice call</Badge>
              <Badge>{mode === 'sandbox' ? 'Sandbox' : 'Staging'}</Badge>
            </div>
            <label className="row small" style={{ gap: 6 }}><input type="checkbox" checked={showTools} onChange={(e) => setShowTools(e.target.checked)} />Show what Una looked up</label>
          </div>
          <div className="chat">
            {turns.map((t, i) => {
              if (t.who === 'tool') return showTools ? <div key={i} className="chat-tool"><span className="kbd">{t.tool}</span> {t.text}</div> : null
              return (
                <div key={i} className={`chat-turn ${t.who}`}>
                  <div className="chat-bubble">{t.text}</div>
                  {t.who === 'una' && i > 0 && (
                    <div className="chat-rate">
                      {rated[i] === 'good' ? <span className="small muted">Marked good</span>
                        : rated[i] === 'fix' ? <span className="small muted">Correction saved</span>
                        : <>
                          <button className="btn ghost small" onClick={() => setRated((r) => ({ ...r, [i]: 'good' }))}>👍 Good</button>
                          <button className="btn ghost small" onClick={() => { setFix(i); setFixText('') }}>Fix this</button>
                        </>}
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={end} />
          </div>
          <div className="pill-list" style={{ margin: '12px 0' }}>
            {SUGGESTIONS[as].map((s) => <button key={s} onClick={() => say(s)}>{s}</button>)}
          </div>
          <div className="composer">
            <button className={`mic ${listening ? 'on' : ''}`} onClick={talk} aria-label={listening ? 'Listening' : 'Hold to talk'}>
              {listening ? <span className="eq" aria-hidden="true"><i /><i /><i /><i /></span> : '🎙'}
            </button>
            <input placeholder={listening ? 'Listening…' : 'Talk, or type what the caller says'} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') say(text) }} />
            <button className="btn" onClick={() => say(text)} disabled={!text.trim()}>Send</button>
            <button className="btn outline" onClick={() => { setTurns([{ who: 'una', text: greeting }]); setRated({}) }}>Hang up</button>
          </div>
          <p className="small muted" style={{ marginTop: 8 }}>Uses your microphone and Una's real voice. Practice calls are kept for 7 days and are not billed.</p>
        </Card>

        <div className="stack">
          <Card title="Test calls" actions={<Badge tone={passed / TEST_SET.length >= 0.85 ? 'green' : 'orange'}>{passed}/{TEST_SET.length}</Badge>}>
            <p className="small muted" style={{ marginBottom: 10 }}>Rerun after every change. 85% to make test calls on a real number.</p>
            <div className="stack" style={{ gap: 6 }}>
              {TEST_SET.map((t) => (
                <div key={t.id} className="test-row">
                  <span className={`tick ${t.pass ? 'pass' : 'fail'}`}>{t.pass ? '✓' : '✕'}</span>
                  <div>
                    <div className="small">{t.title}</div>
                    {t.why && <div className="small muted">{t.why}</div>}
                  </div>
                </div>
              ))}
            </div>
            <button className="btn outline small" style={{ marginTop: 12 }}>Run all again</button>
          </Card>
          <Card title="Your rules" lead="Corrections you've made. Una follows them on every call.">
            <div className="stack" style={{ gap: 10 }}>
              {rules.map((r, i) => (
                <div key={i} className="rule">
                  <div className="small"><b>When</b> {r.when}</div>
                  <div className="small"><b>Una</b> {r.say}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Modal open={fix !== null} onClose={() => setFix(null)} title="Correct Una">
        {fix !== null && (
          <div className="stack">
            <div className="alert small">Una said: “{turns[fix]?.text}”</div>
            <div className="field">
              <label>What should she have said or done?</label>
              <input autoFocus value={fixText} onChange={(e) => setFixText(e.target.value)} placeholder="e.g. Ask which pickup they mean before quoting" />
            </div>
            <label className="row small" style={{ gap: 8 }}><input type="checkbox" defaultChecked />Add this call to the test set</label>
            <div className="row">
              <button className="btn" disabled={!fixText.trim()} onClick={() => {
                const callerTurn = [...turns.slice(0, fix)].reverse().find((t) => t.who === 'caller')
                setRules((r) => [...r, { when: `A caller says “${callerTurn?.text ?? '…'}”`, say: fixText.trim() }])
                setRated((r) => ({ ...r, [fix]: 'fix' }))
                setFix(null)
              }}>Save correction</button>
              <button className="btn outline" onClick={() => setFix(null)}>Cancel</button>
            </div>
            <p className="small muted">Corrections can change how Una talks, never what she's allowed to do. Permissions are in Settings.</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
