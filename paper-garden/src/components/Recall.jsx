import React, { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { BookOpen, Check, CircleHelp, RotateCcw, Sprout } from 'lucide-react'
import { db, QUESTIONS, now } from '../lib/db.js'

function QuestionCard({ paperId, index, question, answerRow }) {
  const [answer, setAnswer] = useState(answerRow?.answer || '')
  const [lastAction, setLastAction] = useState('')
  const timer = useRef(null)
  useEffect(() => { setAnswer(answerRow?.answer || ''); setLastAction('') }, [paperId, index, answerRow?.answer])
  useEffect(() => () => clearTimeout(timer.current), [])
  const save = async (text, nextReview, strength) => {
    const row = { id: `${paperId}:${index}`, paperId, questionId: index, answer: text, lastReviewed: strength ? now() : (answerRow?.lastReviewed || null), nextReview: nextReview ?? answerRow?.nextReview ?? null, strength: strength || answerRow?.strength || '' }
    await db.recall.put(row)
    return row
  }
  const change = value => {
    setAnswer(value); setLastAction('')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => save(value).then(() => setLastAction('Saved')).catch(()=>setLastAction('Could not save')), 400)
  }
  const review = async (days, strength) => {
    clearTimeout(timer.current)
    const d = new Date(); d.setDate(d.getDate() + days)
    try { await save(answer, d.toISOString(), strength); setLastAction(`Next gentle review in ${days} day${days===1?'':'s'}`) }
    catch { setLastAction('Could not save review') }
  }
  return <div className="paper-surface recall-card">
    <div className="flex gap-4 items-start">
      <span className="question-number">{String(index+1).padStart(2,'0')}</span>
      <div className="flex-1 min-w-0"><h3 className="font-semibold text-ink text-[16px] leading-snug mt-1">{question}</h3>
        <textarea value={answer} onChange={e=>change(e.target.value)} className="recall-input" placeholder="Write what you remember, without checking the paper first…" rows={3}/>
        <div className="flex items-center justify-between flex-wrap gap-2 mt-3">
          <div className="flex flex-wrap gap-2">
            <button disabled={!answer.trim()} className="btn-soft small" onClick={()=>review(1,'revisit')}><RotateCcw size={14}/> Revisit tomorrow</button>
            <button disabled={!answer.trim()} className="btn-soft small green" onClick={()=>review(3,'comfortable')}><Check size={14}/> Feels clear</button>
          </div>
          <span className="saved-indicator">{lastAction || (answerRow?.answer ? 'Saved locally' : 'No answer yet')}</span>
        </div>
      </div>
    </div>
  </div>
}

export default function Recall({ paperId }) {
  const rows = useLiveQuery(() => db.recall.where('paperId').equals(paperId).toArray(), [paperId])
  const byQuestion = Object.fromEntries((rows || []).map(row => [row.questionId,row]))
  const complete = Object.values(byQuestion).filter(r=>r.answer?.trim()).length
  return <div className="max-w-4xl mx-auto space-y-5">
    <div className="warm-banner flex items-center gap-4"><div className="p-3 rounded-2xl bg-white/75 text-sage"><Sprout size={24}/></div>
      <div><h2 className="font-display text-xl">A little remembering, at your own pace.</h2><p className="text-sm muted mt-1">Try answering from memory. It's okay not to know yet.</p></div>
      <span className="ml-auto shrink-0 text-sm muted hidden sm:block">{complete}/5 answered</span>
    </div>
    <div className="flex items-center gap-2 text-sm muted"><CircleHelp size={16}/> You can come back and change any answer later. No scores, no pressure.</div>
    {QUESTIONS.map((question,index)=><QuestionCard key={`${paperId}:${index}`} paperId={paperId} index={index} question={question} answerRow={byQuestion[index]}/>)}
    <p className="text-xs muted text-center pb-8"><BookOpen size={13} className="inline mr-1"/> Understanding grows through small revisits.</p>
  </div>
}
