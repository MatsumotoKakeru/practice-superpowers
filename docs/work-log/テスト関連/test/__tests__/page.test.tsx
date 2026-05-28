import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import TestPage from '@/app/test/page'

describe('TestPage', () => {
  it('初期カウントが0で表示される', () => {
    render(<TestPage />)
    expect(screen.queryByText('カウント: 0')).not.toBeNull()
  })

  it('+ボタンでカウントが1増える', async () => {
    render(<TestPage />)
    await userEvent.click(screen.getByRole('button', { name: '+' }))
    expect(screen.queryByText('カウント: 1')).not.toBeNull()
  })

  it('-ボタンでカウントが1減る', async () => {
    render(<TestPage />)
    await userEvent.click(screen.getByRole('button', { name: '-' }))
    expect(screen.queryByText('カウント: -1')).not.toBeNull()
  })
})
