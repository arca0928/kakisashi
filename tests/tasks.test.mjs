import assert from 'node:assert/strict'
import test from 'node:test'
import { overdue, readTasks } from '../src/tasks.ts'

const task = { id: '1', title: 'PG3 レポート', subject: '', notes: '', date: '2026-11-19', time: '', done: false }

test('初回・全削除後は空、保存済みなら内容を復元する', () => {
  assert.deepEqual(readTasks(null), [])
  assert.deepEqual(readTasks('[]'), [])
  assert.deepEqual(readTasks(JSON.stringify([task])), [task])
})

test('壊れたデータを空の一覧として扱わない', () => {
  for (const raw of ['{', '{}', '[null]', JSON.stringify([{ ...task, title: ' ' }]), JSON.stringify([task, task])]) {
    assert.throws(() => readTasks(raw))
  }
})

test('日付だけなら当日中は期限内、時刻があれば指定した時刻を使う', () => {
  const at = s => new Date(s).getTime()
  assert.equal(overdue(task, at('2026-11-19T23:59:59.999')), false)
  assert.equal(overdue(task, at('2026-11-20T00:00')), true)
  assert.equal(overdue({ ...task, time: '18:00' }, at('2026-11-19T17:59')), false)
  assert.equal(overdue({ ...task, time: '18:00' }, at('2026-11-19T18:01')), true)
  assert.equal(overdue({ ...task, done: true }, at('2026-11-20T00:00')), false)
  assert.equal(overdue({ ...task, date: '' }, at('2026-11-20T00:00')), false)
})
