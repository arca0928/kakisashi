import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { TaskCapture } from '../components/TaskCapture'
import { TaskRow } from '../components/TaskRow'
import { createTask, type Task } from '../tasks'
import { loadTasks, persistTasks } from '../taskStorage'

export const Route = createFileRoute('/')({ component: Home })

const listStyle = 'mt-2 divide-y divide-rule'
const countStyle = 'ml-1.5 text-xs font-semibold text-muted tabular-nums'

function Home() {
  return (
    <main className="mx-auto my-[clamp(2rem,8vh,5rem)] w-[calc(100%-2rem)] max-w-[43rem]">
      <header>
        <h1 className="font-[Georgia,serif] text-[2rem] font-bold tracking-[-.04em]">
          kakisashi<span className="text-[#6d9ab6]" aria-hidden="true">.</span>
        </h1>
        <p className="mt-1 text-muted">授業の課題を、ひとこと。</p>
      </header>
      <ClientOnly fallback={<p className="py-4 text-muted">読み込み中…</p>}>
        <Notebook />
      </ClientOnly>
    </main>
  )
}

function Notebook() {
  const [stored, setTasks] = useState(loadTasks)
  const [saveError, setSaveError] = useState('')
  const [now, setNow] = useState(Date.now)

  // 開いたまま締切を過ぎたときも表示を更新する。
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(timer)
  }, [])

  if (stored === null) {
    return <p role="alert" className="py-4 text-warning">保存した課題を読み込めませんでした。元のデータを守るため、書き込みを停止しています。</p>
  }
  const tasks = stored

  function save(next: Task[]) {
    try {
      persistTasks(next)
      setTasks(next)
      setSaveError('')
      return true
    } catch {
      setSaveError('変更を保存できませんでした。ブラウザの保存設定と空き容量を確認してください。')
      return false
    }
  }

  const pending = tasks.filter(task => !task.done)
  const done = tasks.filter(task => task.done)
  const subjects = new Set(tasks.map(task => task.subject).filter(Boolean))

  function renderRow(task: Task) {
    return (
      <TaskRow
        key={task.id}
        task={task}
        now={now}
        onChange={updated => save(tasks.map(t => t.id === updated.id ? updated : t))}
        onDelete={() => save(tasks.filter(t => t.id !== task.id))}
      />
    )
  }

  return (
    <>
      <TaskCapture onAdd={title => save([createTask(title), ...tasks])} />
      {saveError && <p role="alert" className="text-warning">{saveError}</p>}
      <section aria-labelledby="pending-heading">
        <h2 id="pending-heading" className="font-semibold">
          未完了 <span className={countStyle}>{pending.length}</span>
        </h2>
        {pending.length > 0
          ? <ul className={listStyle}>{pending.map(renderRow)}</ul>
          : <p className="py-4 text-muted">未完了の課題はありません。</p>}
      </section>
      {done.length > 0 && (
        <details className="mt-6 text-muted">
          <summary className="py-2.5 font-semibold">完了済み <span className={countStyle}>{done.length}</span></summary>
          <ul className={listStyle}>{done.map(renderRow)}</ul>
        </details>
      )}
      <datalist id="subjects">
        {Array.from(subjects, subject => <option key={subject} value={subject} />)}
      </datalist>
    </>
  )
}
