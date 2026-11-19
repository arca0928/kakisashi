import { useState } from 'react'
import { overdue, type Task } from '../tasks'
import { TaskEditor } from './TaskEditor'

type Props = {
  task: Task
  now: number
  onChange: (task: Task) => boolean
  onDelete: () => void
}

export function TaskRow({ task, now, onChange, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const deadline = task.time ? `${task.date}T${task.time}` : task.date

  function saveEdits(updated: Task) {
    if (onChange(updated)) setEditing(false)
  }

  return (
    <li>
      <div className="flex items-start">
        <label className="grid h-12 min-w-11 cursor-pointer place-items-center">
          <input
            className="size-[1.15rem] accent-[#407696]"
            type="checkbox"
            checked={task.done}
            aria-label={`${task.title}を${task.done ? '未完了' : '完了'}にする`}
            onChange={() => onChange({ ...task, done: !task.done })}
          />
        </label>
        <button
          className="group min-h-12 min-w-0 flex-1 px-1 py-3 text-left wrap-anywhere"
          type="button"
          aria-expanded={editing}
          onClick={() => setEditing(!editing)}
        >
          <span className={task.done ? 'line-through' : 'group-hover:underline'}>{task.title}</span>
          {(task.subject || task.date) && (
            <span className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-muted">
              {task.subject && <span className="rounded bg-subject px-1.5">{task.subject}</span>}
              {task.date && <span>締切 <time dateTime={deadline}>{task.date.replaceAll('-', '/')} {task.time}</time></span>}
              {overdue(task, now) && <strong className="text-warning">期限超過</strong>}
            </span>
          )}
        </button>
      </div>
      {editing && (
        <TaskEditor task={task} onSave={saveEdits} onCancel={() => setEditing(false)} onDelete={onDelete} />
      )}
    </li>
  )
}
