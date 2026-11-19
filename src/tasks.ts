export type TaskFields = {
  title: string
  subject: string
  date: string
  time: string
  notes: string
}
export type Task = TaskFields & { id: string; done: boolean }

export const storageKey = 'kakisashi:tasks:v1'

export function readTasks(raw: string | null): Task[] {
  if (raw === null) return []
  const data: unknown = JSON.parse(raw)
  const valid = (t: unknown): t is Task =>
    typeof t === 'object' && t !== null &&
    'id' in t && typeof t.id === 'string' &&
    'title' in t && typeof t.title === 'string' && t.title.trim() !== '' &&
    'subject' in t && typeof t.subject === 'string' &&
    'notes' in t && typeof t.notes === 'string' &&
    'date' in t && typeof t.date === 'string' &&
    'time' in t && typeof t.time === 'string' &&
    'done' in t && typeof t.done === 'boolean'
  if (!Array.isArray(data) || !data.every(valid) || new Set(data.map(t => t.id)).size !== data.length) {
    throw new Error('Invalid task list')
  }
  return data
}

export function overdue(task: Task, now: number) {
  if (task.done || !task.date) return false
  const deadline = new Date(`${task.date}T${task.time || '23:59:59.999'}`)
  return now > deadline.getTime()
}
