import { useRef, useState, type SubmitEvent } from 'react'

type Props = {
  onAdd: (title: string) => boolean
}

export function TaskCapture({ onAdd }: Props) {
  const [title, setTitle] = useState('')
  const input = useRef<HTMLInputElement>(null)

  const desktop = matchMedia('(pointer: fine)').matches

  const trimmed = title.trim()
  function addTask(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!trimmed || !onAdd(trimmed)) return
    setTitle('')
    if (desktop) input.current?.focus({ preventScroll: true })
  }

  return (
    <form className="mt-7 mb-10 flex gap-2" aria-label="課題の登録" onSubmit={addTask}>
      <input
        className="field"
        aria-label="課題名"
        placeholder="課題をひとこと入力"
        ref={input}
        autoFocus={desktop}
        value={title}
        onChange={event => setTitle(event.target.value)}
        onKeyDown={event => {
          // Safari では変換確定の Enter で isComposing が先に false になる。
          const { isComposing, keyCode } = event.nativeEvent
          if (event.key === 'Enter' && (isComposing || keyCode === 229)) event.preventDefault()
        }}
      />
      <button className="button button-primary" disabled={!trimmed}>追加</button>
    </form>
  )
}
