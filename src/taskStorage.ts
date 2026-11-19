import { readTasks, storageKey, type Task } from './tasks'

// null は読み込み失敗。初回の空一覧と区別して、元のデータを上書きしない。
export function loadTasks(): Task[] | null {
  try {
    return readTasks(localStorage.getItem(storageKey))
  } catch {
    return null
  }
}

export function persistTasks(tasks: Task[]) {
  localStorage.setItem(storageKey, JSON.stringify(tasks))
}
