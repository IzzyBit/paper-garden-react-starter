import Dexie from 'dexie'

export const db = new Dexie('paper-garden-v1')
db.version(1).stores({
  papers: 'id, title, year, status, updatedAt, *tags',
  notes: 'paperId',
  recall: 'id, paperId, nextReview',
  graphNodes: 'id, paperId, kind',
  graphEdges: 'id, source, target',
  pdfs: 'paperId',
  settings: 'key',
})

export const QUESTIONS = [
  'What problem does the paper solve?',
  'How does the proposed method work?',
  'What is its strongest supporting result?',
  'What is its biggest limitation?',
  'What would I investigate next?',
]
export const uid = () => crypto.randomUUID()
export const now = () => new Date().toISOString()
export const parseTags = (value = '') => [...new Set(value.split(',').map(x => x.trim()).filter(Boolean))]
export const plainText = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

export async function createPaper(values, pdfFile) {
  const id = uid()
  const stamp = now()
  const paper = {
    id,
    title: values.title.trim(),
    authors: values.authors?.trim() || '',
    year: Number(values.year) || null,
    venue: values.venue?.trim() || '',
    doi: values.doi?.trim() || '',
    url: values.url?.trim() || '',
    abstract: values.abstract?.trim() || '',
    tags: Array.isArray(values.tags) ? values.tags : parseTags(values.tags),
    status: values.status || 'To read',
    createdAt: stamp,
    updatedAt: stamp,
  }
  await db.transaction('rw', db.papers, db.notes, db.pdfs, db.graphNodes, async () => {
    await db.papers.add(paper)
    await db.notes.put({ paperId: id, html: '', updatedAt: stamp })
    await db.graphNodes.put({ id: `paper-${id}`, paperId: id, label: paper.title, kind: 'paper', x: 120 + Math.random() * 300, y: 100 + Math.random() * 260 })
    if (pdfFile) await db.pdfs.put({ paperId: id, name: pdfFile.name, blob: pdfFile, type: pdfFile.type || 'application/pdf' })
  })
  return paper
}

export async function deletePaper(paperId) {
  const nodeId = `paper-${paperId}`
  await db.transaction('rw', db.papers, db.notes, db.recall, db.pdfs, db.graphNodes, db.graphEdges, async () => {
    const edges = await db.graphEdges.toArray()
    const linkedEdges = edges.filter(e => e.source === nodeId || e.target === nodeId).map(e => e.id)
    await Promise.all([
      db.papers.delete(paperId), db.notes.delete(paperId), db.pdfs.delete(paperId),
      db.recall.where('paperId').equals(paperId).delete(), db.graphNodes.delete(nodeId),
      db.graphEdges.bulkDelete(linkedEdges),
    ])
  })
}

export async function savePaperInfo(paperId, values) {
  await db.papers.update(paperId, { ...values, tags: parseTags(values.tags), year: Number(values.year) || null, updatedAt: now() })
  await db.graphNodes.update(`paper-${paperId}`, { label: values.title })
}

export async function seedExampleLibrary() {
  // Only seed the first time the database is opened; demo records are removable.
  const alreadyInitialized = await db.settings.get('initialized')
  if (alreadyInitialized) return
  const count = await db.papers.count()
  if (count !== 0) { await db.settings.put({key:'initialized', value:true}); return }
  const first = await createPaper({
    title: 'Attention Is All You Need', authors: 'Vaswani et al.', year: 2017,
    venue: 'NeurIPS', tags: ['transformers', 'attention', 'deep learning'],
    abstract: 'Introduces the Transformer architecture, replacing recurrence with attention for sequence transduction.',
    status: 'To read',
  })
  const second = await createPaper({
    title: 'Deep Residual Learning for Image Recognition', authors: 'He et al.', year: 2016,
    venue: 'CVPR', tags: ['computer vision', 'deep learning', 'residual networks'],
    abstract: 'Introduces residual learning to make very deep image recognition networks easier to optimise.',
    status: 'To read',
  })
  await db.graphNodes.bulkPut([
    { id: 'concept-deep-learning', paperId: null, label: 'Deep learning', kind: 'concept', x: 510, y: 230 },
    { id: 'concept-attention', paperId: null, label: 'Attention', kind: 'concept', x: 450, y: 35 },
  ])
  await db.graphEdges.bulkPut([
    { id: uid(), source: `paper-${first.id}`, target: 'concept-attention' },
    { id: uid(), source: `paper-${first.id}`, target: 'concept-deep-learning' },
    { id: uid(), source: `paper-${second.id}`, target: 'concept-deep-learning' },
  ])
  await db.settings.put({key:'initialized',value:true})
}

const blobToDataUrl = blob => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = () => reject(reader.error)
  reader.readAsDataURL(blob)
})

export async function exportBackup() {
  const [papers, notes, recall, graphNodes, graphEdges, pdfs] = await Promise.all([
    db.papers.toArray(), db.notes.toArray(), db.recall.toArray(),
    db.graphNodes.toArray(), db.graphEdges.toArray(), db.pdfs.toArray(),
  ])
  const encodedPdfs = await Promise.all(pdfs.map(async ({ paperId, name, type, blob }) => ({
    paperId, name, type, data: await blobToDataUrl(blob),
  })))
  const backup = { format: 'paper-garden-backup', version: 1, exportedAt: now(), papers, notes, recall, graphNodes, graphEdges, pdfs: encodedPdfs }
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `paper-garden-backup-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export async function importBackup(file) {
  const data = JSON.parse(await file.text())
  if (data.format !== 'paper-garden-backup' || data.version !== 1 || !Array.isArray(data.papers)) {
    throw new Error('This is not a supported Paper Garden backup.')
  }
  // Restore metadata and attachments; existing items with the same IDs are updated.
  const pdfs = await Promise.all((data.pdfs || []).map(async p => ({
    paperId: p.paperId, name: p.name, type: p.type,
    blob: await (await fetch(p.data)).blob(),
  })))
  await db.transaction('rw', db.papers, db.notes, db.recall, db.graphNodes, db.graphEdges, db.pdfs, db.settings, async () => {
    await db.settings.put({ key:'initialized', value:true })
    await db.papers.bulkPut(data.papers || [])
    await db.notes.bulkPut(data.notes || [])
    await db.recall.bulkPut(data.recall || [])
    await db.graphNodes.bulkPut(data.graphNodes || [])
    await db.graphEdges.bulkPut(data.graphEdges || [])
    await db.pdfs.bulkPut(pdfs)
  })
}
