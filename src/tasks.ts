export type TaskFields = {
  title: string
  subject: string
  date: string
  time: string
  notes: string
}
export type Task = TaskFields & { id: string; done: boolean }

export const storageKey = 'kakisashi:tasks:v1'

export function createTask(title: string): Task {
  return { id: crypto.randomUUID(), title, subject: '', date: '', time: '', notes: '', done: false }
}

function isSavedTask(task: Partial<Task> | null): task is Task {
  return task != null &&
    typeof task.id === 'string' &&
    typeof task.title === 'string' && task.title.trim() !== '' &&
    typeof task.subject === 'string' && typeof task.notes === 'string' &&
    typeof task.date === 'string' && typeof task.time === 'string' &&
    typeof task.done === 'boolean'
}

export function readTasks(raw: string | null): Task[] {
  if (raw === null) return []
  const tasks: unknown = JSON.parse(raw)
  if (!Array.isArray(tasks) || !tasks.every(isSavedTask)) throw new Error('Invalid task list')

  const ids = tasks.map(task => task.id)
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate task ID')
  return tasks
}

export function overdue(task: Task, now: number) {
  if (task.done || !task.date) return false
  const deadline = new Date(`${task.date}T${task.time || '23:59:59.999'}`)
  return now > deadline.getTime()
}
