'use client'

import { useState } from 'react'
import { increment, decrement } from '@/lib/counter'

// TDDワークフロー練習用のシンプルなカウンターページ
export default function TestPage() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>テストページ</h1>
      <p>カウント: {count}</p>
      {/* +ボタン: カウントを1増やす */}
      <button onClick={() => setCount(increment(count))}>+</button>
      {/* -ボタン: カウントを1減らす */}
      <button onClick={() => setCount(decrement(count))}>-</button>
    </div>
  )
}
