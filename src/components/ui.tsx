import { useEffect, type ReactNode } from 'react'

export function Card({ title, lead, children, actions }: {
  title?: string
  lead?: string
  children?: ReactNode
  actions?: ReactNode
}) {
  return (
    <section className="card">
      {(title || actions) && (
        <div className="row between" style={{ marginBottom: lead ? 0 : 16 }}>
          {title && <h3>{title}</h3>}
          {actions}
        </div>
      )}
      {lead && <p className="lead">{lead}</p>}
      {children}
    </section>
  )
}

export function Badge({ tone = 'gray', children }: { tone?: 'gray' | 'green' | 'orange' | 'red' | 'blue'; children: ReactNode }) {
  return <span className={`badge ${tone === 'gray' ? '' : tone}`}>{children}</span>
}

export function Switch({ on, onChange, disabled, label, hint }: {
  on: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  label: string
  hint?: string
}) {
  return (
    <div className="switch-row">
      <div className="text">
        <strong>{label}</strong>
        {hint && <span>{hint}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        className={`switch ${on ? 'on' : ''}`}
        disabled={disabled}
        onClick={() => onChange(!on)}
      />
    </div>
  )
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      {hint && <div className="hint">{hint}</div>}
      {children}
    </div>
  )
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  )
}

export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true">
        <div className="row between" style={{ marginBottom: 16 }}>
          <h3>{title}</h3>
          <button className="btn outline small" onClick={onClose}>Close</button>
        </div>
        {children}
      </aside>
    </>
  )
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (t: T) => void }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} className={value === t.id ? 'active' : ''} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="kpi">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  )
}

export function CopyButton({ text }: { text: string }) {
  return (
    <button
      className="btn outline small"
      onClick={() => { try { void navigator.clipboard.writeText(text) } catch { /* not available in previews */ } }}
    >
      Copy
    </button>
  )
}
