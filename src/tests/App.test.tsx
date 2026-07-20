import { act, render, screen, waitFor } from '@testing-library/react'
import App from '../App'
import { MemoryRouter } from 'react-router-dom'

test('renders brand in header', () => {
  render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>
  )
  const brand = screen.getByText(/ITX Shop/i)
  expect(brand).toBeTruthy()
})

test('updates cart count when storage event is fired', async () => {
  localStorage.setItem('cartCount', '2')
  render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>
  )

  const before = screen.getByText('2')
  expect(before).toBeTruthy()

  await act(async () => {
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'cartCount', newValue: '7' })
    )
  })

  await waitFor(() => {
    const after = screen.getByText('7')
    expect(after).toBeTruthy()
  })
})
