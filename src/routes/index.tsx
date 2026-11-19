import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold">kakisashi</h1>
      <p className="mt-4 text-lg">授業の課題をひとこと控えるメモ帳です。</p>
    </main>
  )
}
