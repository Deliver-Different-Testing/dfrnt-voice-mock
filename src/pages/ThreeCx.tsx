import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Card, CopyButton, Modal } from '../components/ui'

// Mirrors pages/ThreeCxSetup/ThreeCxSetup.tsx as built on 20 Oct 2026: the 3CX page is Softphone (caller ID and
// call logging) only. The voice agent moved to its own integration, linked from the card at the bottom.

const KEY_ID = 'k3cx_uc_08a1'
const EXAMPLE_SECRET = 'example-not-a-real-secret-3cx-Q9'

export default function ThreeCx() {
  const [connected, setConnected] = useState(true)
  const [freshSecret, setFreshSecret] = useState(false)
  const [confirm, setConfirm] = useState<'regenerate' | 'disconnect' | null>(null)

  return (
    <div className="stack">
      <div>
        <div className="small muted">Integrations / 3CX</div>
        <h1 style={{ marginTop: 4 }}>3CX integration</h1>
        <p className="small muted" style={{ marginTop: 4 }}>Show Despatch caller ID in 3CX, and log calls back to Despatch</p>
      </div>

      {connected ? (
        <Card>
          <div className="row" style={{ marginBottom: 8 }}>
            <strong>Status</strong>
            <Badge tone="green">Connected</Badge>
          </div>
          <p className="small muted" style={{ marginTop: 0, marginBottom: 16 }}>
            3CX authenticates as key <strong>{KEY_ID}</strong>. Download the template below and upload it in your 3CX
            admin console under <strong>Integrations &gt; CRM</strong>.
          </p>
          {freshSecret && (
            <div className="alert orange" style={{ marginBottom: 16 }}>
              <strong>Copy the secret now — it won't be shown again.</strong>
              <div className="secret" style={{ marginTop: 10 }}>
                <div className="kv"><span className="small muted" style={{ width: 90 }}>Key</span><code>{KEY_ID}</code><CopyButton text={KEY_ID} /></div>
                <div className="kv"><span className="small muted" style={{ width: 90 }}>Secret</span><code>{EXAMPLE_SECRET}</code><CopyButton text={EXAMPLE_SECRET} /></div>
              </div>
            </div>
          )}
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <button className="btn">Download 3CX template</button>
            <button className="btn outline" onClick={() => setConfirm('regenerate')}>Regenerate key</button>
            <button className="btn outline" style={{ color: 'var(--red)' }} onClick={() => setConfirm('disconnect')}>Disconnect</button>
          </div>
        </Card>
      ) : (
        <div className="grid-2">
          <Card title="Connect 3CX">
            <p className="small muted" style={{ marginTop: 0 }}>
              Generate an API key, then download a 3CX integration template pre-filled with your key and this server's
              address. Upload it in your 3CX admin console under <strong>Integrations &gt; CRM</strong>. 3CX will then
              look up callers in Despatch and log calls back automatically.
            </p>
            <button className="btn" onClick={() => { setConnected(true); setFreshSecret(true) }}>Generate connection</button>
          </Card>
          <Card title="How it works">
            <p className="small muted" style={{ marginTop: 0 }}>
              3CX calls Integration Manager whenever a call starts or ends. We match the number to a Despatch contact or
              client and return who's calling.
            </p>
            <p className="small muted" style={{ marginBottom: 0 }}>
              Agents can also search Despatch and create a new contact for an unknown caller straight from the 3CX app.
            </p>
          </Card>
        </div>
      )}

      <Card>
        <div className="row between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <strong>Voice agent has its own page now</strong>
            <div className="small muted">Set up the AI voice agent that answers your clients' calls, on 3CX or any other phone system.</div>
          </div>
          <Link className="btn outline" to="/voice-agent">Go to Voice agent →</Link>
        </div>
      </Card>

      <Modal open={confirm === 'regenerate'} onClose={() => setConfirm(null)} title="Regenerate API key?">
        <p className="small">
          This issues a new key and secret and invalidates the current one. You'll need to download the template again
          and re-upload it to 3CX.
        </p>
        <div className="row">
          <button className="btn" onClick={() => { setConfirm(null); setFreshSecret(true) }}>Regenerate</button>
          <button className="btn outline" onClick={() => setConfirm(null)}>Cancel</button>
        </div>
      </Modal>
      <Modal open={confirm === 'disconnect'} onClose={() => setConfirm(null)} title="Disconnect 3CX?">
        <p className="small">
          Disconnecting immediately stops 3CX from looking up callers and logging calls. Reconnect any time to issue a
          new key.
        </p>
        <div className="row">
          <button className="btn" onClick={() => { setConfirm(null); setConnected(false); setFreshSecret(false) }}>Disconnect</button>
          <button className="btn outline" onClick={() => setConfirm(null)}>Cancel</button>
        </div>
      </Modal>
    </div>
  )
}
