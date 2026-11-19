import { useState } from 'react'
import { overdue, type Task, type TaskFields } from '../tasks'

type RowProps = {
  task: Task
  now: number
  onChange: (task: Task) => boolean
  onDelete: () => void
}

export function TaskRow({ task, now, onChange, onDelete }: RowProps) {
  const [editing, setEditing] = useState(false)
  return (
    <li className="task">
      <div className="task-line">
        <label className="check-target">
          <input type="checkbox" checked={task.done} aria-label={`${task.title}を${task.done ? '未完了' : '完了'}にする`}
            onChange={() => onChange({ ...task, done: !task.done })} />
        </label>
        <button className="task-title" type="button" aria-expanded={editing} onClick={() => setEditing(!editing)}>
          <span>{task.title}</span>
          {(task.subject || task.date) && <span className="metadata">
            {task.subject && <span className="subject">{task.subject}</span>}
            {task.date && <span>締切 <time dateTime={task.time ? `${task.date}T${task.time}` : task.date}>{task.date.replaceAll('-', '/')} {task.time}</time></span>}
            {overdue(task, now) && <strong className="late">期限超過</strong>}
          </span>}
        </button>
      </div>
      {editing && <TaskEditor task={task} onCancel={() => setEditing(false)} onDelete={onDelete}
        onSave={fields => { if (onChange({ ...task, ...fields })) setEditing(false) }} />}
    </li>
  )
}

function TaskEditor({ task, onCancel, onDelete, onSave }: {
  task: Task; onCancel: () => void; onDelete: () => void; onSave: (fields: TaskFields) => void
}) {
  const [draft, setDraft] = useState<TaskFields>(task)
  function field(key: keyof TaskFields, value: string) {
    setDraft(prev => ({ ...prev, [key]: value, ...(key === 'date' && !value ? { time: '' } : {}) }))
  }
  return (
    <form className="editor" onSubmit={e => {
      e.preventDefault()
      if (draft.title.trim()) onSave({ ...draft, title: draft.title.trim(), subject: draft.subject.trim() })
    }}>
      <label>タイトル<input value={draft.title} required onChange={e => field('title', e.target.value)} /></label>
      <label>科目<input list="subjects" value={draft.subject} onChange={e => field('subject', e.target.value)} /></label>
      <div className="deadline-fields">
        <label>締切日<input type="date" value={draft.date} onChange={e => field('date', e.target.value)} /></label>
        <label>時刻（任意）<input type="time" disabled={!draft.date} value={draft.time} onChange={e => field('time', e.target.value)} /></label>
      </div>
      <label>詳細<textarea rows={3} value={draft.notes} onChange={e => field('notes', e.target.value)} /></label>
      <div className="actions">
        <button className="primary" disabled={!draft.title.trim()}>保存</button>
        <button type="button" onClick={onCancel}>キャンセル</button>
        <button type="button" className="delete" onClick={() => {
          if (window.confirm(`「${task.title}」を削除しますか？ この操作は元に戻せません。`)) onDelete()
        }}>削除</button>
      </div>
    </form>
  )
}
