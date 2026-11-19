import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { TaskRow } from '../components/TaskRow'
import { readTasks, storageKey, type Task } from '../tasks'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [now, setNow] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const composing = useRef(false)

  useEffect(() => {
    try {
      setTasks(readTasks(localStorage.getItem(storageKey)))
    } catch {
      setError('保存した課題を読み込めませんでした。元のデータを守るため、書き込みを停止しています。')
    }
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const ready = tasks !== null
  useEffect(() => {
    if (ready && document.activeElement === document.body && window.matchMedia('(pointer: fine)').matches) {
      input.current?.focus({ preventScroll: true })
    }
  }, [ready])

  function save(next: Task[]) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
      setTasks(next)
      setError('')
      return true
    } catch {
      setError('変更を保存できませんでした。ブラウザの保存設定と空き容量を確認してください。')
      return false
    }
  }

  function row(task: Task) {
    return <TaskRow key={task.id} task={task} now={now}
      onChange={updated => tasks !== null && save(tasks.map(t => t.id === task.id ? updated : t))}
      onDelete={() => tasks !== null && save(tasks.filter(t => t.id !== task.id))} />
  }
  const pending = tasks?.filter(t => !t.done) ?? []
  const done = tasks?.filter(t => t.done) ?? []

  return (
    <main className="notebook">
      <header><h1>kakisashi<span aria-hidden="true">.</span></h1><p>授業の課題を、ひとこと。</p></header>
      <form className="capture" aria-label="課題の登録" onSubmit={e => {
        e.preventDefault()
        if (!tasks || composing.current || !title.trim()) return
        if (save([{ id: crypto.randomUUID(), title: title.trim(), done: false, subject: '', date: '', time: '', notes: '' }, ...tasks])) {
          setTitle('')
          if (window.matchMedia('(pointer: fine)').matches) input.current?.focus()
        }
      }}>
        <input aria-label="課題名" placeholder="課題をひとこと入力" ref={input} value={title} disabled={!ready}
          onCompositionStart={() => { composing.current = true }} onCompositionEnd={() => { composing.current = false }}
          onKeyDown={e => {
            if (e.key === 'Enter' && (composing.current || e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229)) e.preventDefault()
          }} onChange={e => setTitle(e.target.value)} />
        <button className="primary" disabled={!tasks || !title.trim()}>追加</button>
      </form>
      {error && <p role="alert" className="late">{error}</p>}
      <section aria-labelledby="pending-heading">
        <h2 id="pending-heading">未完了 {tasks && <span className="count">{pending.length}</span>}</h2>
        {pending.length > 0 ? <ul>{pending.map(row)}</ul> : <p className="empty">{tasks ? '未完了の課題はありません。' : error ? '一覧を表示できません。' : '読み込み中…'}</p>}
      </section>
      {done.length > 0 && <details className="completed">
        <summary>完了済み <span className="count">{done.length}</span></summary>
        <ul>{done.map(row)}</ul>
      </details>}
      <datalist id="subjects">{[...new Set(tasks?.map(t => t.subject).filter(Boolean))].map(s => <option key={s} value={s} />)}</datalist>
    </main>
  )
}
