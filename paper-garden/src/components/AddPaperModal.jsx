import React, { useState } from 'react'
import { FileUp, Leaf } from 'lucide-react'
import Modal from './Modal.jsx'
import { createPaper } from '../lib/db.js'

const initial = { title: '', authors: '', year: '', venue: '', doi: '', url: '', tags: '', abstract: '', status: 'To read' }

export default function AddPaperModal({ open, onClose, onAdded }) {
  const [form, setForm] = useState(initial)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const change = (name, value) => setForm(f => ({ ...f, [name]: value }))
  const submit = async e => {
    e.preventDefault()
    if (!form.title.trim()) return
    setBusy(true); setError('')
    try {
      const paper = await createPaper(form, file)
      setForm(initial); setFile(null); onClose(); onAdded?.(paper)
    } catch (err) { setError(err.message || 'Could not add paper.') }
    finally { setBusy(false) }
  }
  return <Modal open={open} onClose={onClose} title="Plant a new paper" wide>
    <p className="text-sm muted mb-5">Just the title is required. Everything else can wait.</p>
    <form onSubmit={submit} className="space-y-4">
      <label className="field-label">Paper title <span className="text-rose">*</span><input autoFocus required className="field mt-1" placeholder="What have you been reading?" value={form.title} onChange={e => change('title', e.target.value)}/></label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="field-label">Authors<input className="field mt-1" placeholder="e.g. Vaswani et al." value={form.authors} onChange={e => change('authors', e.target.value)}/></label>
        <label className="field-label">Year<input className="field mt-1" type="number" min="1800" max="2100" placeholder="2026" value={form.year} onChange={e => change('year', e.target.value)}/></label>
      </div>
      <label className="field-label">Keywords and tags<input className="field mt-1" placeholder="EEG, neuroscience, machine learning" value={form.tags} onChange={e => change('tags', e.target.value)}/><small className="field-help">Separate tags with commas. These become searchable filters.</small></label>
      <label className="field-label">Abstract or a short description<textarea className="field mt-1 min-h-24 resize-y" placeholder="Optional. Add the abstract, or explain the idea in your own words." value={form.abstract} onChange={e => change('abstract', e.target.value)}/></label>
      <label className="field-label">Link or DOI<input className="field mt-1" placeholder="https://… or 10.1234/…" value={form.url || form.doi} onChange={e => { change('url',e.target.value); change('doi','') }}/></label>
      <label className="upload-field cursor-pointer"><FileUp size={21}/><span>{file ? file.name : 'Attach a PDF (optional)'}</span><input className="sr-only" type="file" accept="application/pdf,.pdf" onChange={e => setFile(e.target.files?.[0] || null)}/></label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2 pt-2"><button type="button" className="btn-secondary" onClick={onClose}>Not now</button><button className="btn-primary" type="submit" disabled={busy}><Leaf size={17}/>{busy ? 'Adding…' : 'Add to garden'}</button></div>
    </form>
  </Modal>
}
