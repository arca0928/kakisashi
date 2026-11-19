import { useState, type SubmitEvent } from 'react'
import type { Task } from '../tasks'

type Props = {
  task: Task
  onSave: (task: Task) => void
  onCancel: () => void
  onDelete: () => void
}

const labelStyle = 'grid min-w-0 gap-1 text-sm'
const fieldStyle = 'field text-base notebook:text-sm'

export function TaskEditor({ task, onSave, onCancel, onDelete }: Props) {
  const [draft, setDraft] = useState(task)
  const title = draft.title.trim()

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (title) onSave({ ...draft, title, subject: draft.subject.trim() })
  }

  function confirmDelete() {
    if (window.confirm(`「${task.title}」を削除しますか？ この操作は元に戻せません。`)) onDelete()
  }

  return (
    <form className="mb-4 grid gap-3 rounded-lg bg-editor p-4 notebook:mr-1 notebook:ml-11" onSubmit={submit}>
      <label className={labelStyle}>
        タイトル
        <input className={fieldStyle} required value={draft.title}
          onChange={e => setDraft({ ...draft, title: e.target.value })} />
      </label>
      <label className={labelStyle}>
        科目
        <input className={fieldStyle} list="subjects" value={draft.subject}
          onChange={e => setDraft({ ...draft, subject: e.target.value })} />
      </label>
      <div className="grid gap-3 notebook:grid-cols-2">
        <label className={labelStyle}>
          締切日
          <input className={fieldStyle} type="date" value={draft.date} onChange={e => {
            const date = e.target.value
            setDraft({ ...draft, date, time: date ? draft.time : '' })
          }} />
        </label>
        <label className={labelStyle}>
          時刻（任意）
          <input className={fieldStyle} type="time" disabled={!draft.date} value={draft.time}
            onChange={e => setDraft({ ...draft, time: e.target.value })} />
        </label>
      </div>
      <label className={labelStyle}>
        詳細
        <textarea className={`${fieldStyle} resize-y`} rows={3} value={draft.notes}
          onChange={e => setDraft({ ...draft, notes: e.target.value })} />
      </label>
      <div className="flex flex-wrap items-center gap-1">
        <button className="button button-primary" disabled={!title}>保存</button>
        <button className="button" type="button" onClick={onCancel}>キャンセル</button>
        <button className="button ms-auto text-warning" type="button" onClick={confirmDelete}>削除</button>
      </div>
    </form>
  )
}
