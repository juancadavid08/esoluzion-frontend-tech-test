import { render, screen } from '@testing-library/react'
import App from '../App'
import { MemoryRouter } from 'react-router-dom'

test('renders brand in header', ()=>{
  render(<MemoryRouter><App /></MemoryRouter>)
  const brand = screen.getByText(/ITX Shop/i)
  expect(brand).toBeTruthy()
})
