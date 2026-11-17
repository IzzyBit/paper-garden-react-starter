import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (!open) return
    const esc = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    const old = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = old }
  }, [open, onClose])
  if (!open) return null
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <section role="dialog" aria-modal="true" aria-label={title} className={`modal-window ${wide ? 'modal-wide' : ''}`}>
      <div className="flex items-center justify-between gap-4 mb-5">
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X size={18}/></button>
      </div>
      {children}
    </section>
  </div>
}
